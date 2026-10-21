const mongoose = require('mongoose');
const { randomBytes } = require('crypto');

const { Survey, Question } = require('../models');

const QUESTION_TYPES = [
  'singleChoice',
  'multipleChoice',
  'text',
  'number',
];
const OPERATORS_BY_TYPE = {
  singleChoice: ['equals'],
  multipleChoice: ['containsAny', 'containsAll'],
  text: ['equals'],
  number: ['equals', 'gt', 'gte', 'lt', 'lte'],
};

function serializeQuestion(question) {
  const document =
    typeof question.toObject === 'function'
      ? question.toObject()
      : question;

  const { _id, surveyId, ...rest } = document;

  return {
    id: _id.toString(),
    surveyId: surveyId.toString(),
    ...rest,
    validation: normalizeValidation(
      rest.type,
      rest.validation
    ),
  };
}
const VALIDATION_FIELDS_BY_TYPE = {
  singleChoice: [],
  multipleChoice: [
    'minSelections',
    'maxSelections',
  ],
  text: [
    'minLength',
    'maxLength',
  ],
  number: [
    'minValue',
    'maxValue',
    'integerOnly',
  ],
};

function normalizeValidation(type, validation = {}) {
  const source =
    typeof validation?.toObject === 'function'
      ? validation.toObject()
      : validation || {};

  const allowedFields =
    VALIDATION_FIELDS_BY_TYPE[type] || [];

  return Object.fromEntries(
    allowedFields
      .filter((field) => source[field] !== undefined)
      .map((field) => [field, source[field]])
  );
}

async function findOwnedSurvey(surveyId, ownerId) {
  if (!mongoose.isValidObjectId(surveyId)) {
    return null;
  }

  return Survey.findOne({
    _id: surveyId,
    ownerId,
  });
}

function hasJumpCycle(
  questions,
  sourceQuestionId,
  replacementRules
) {
  const graph = new Map();

  for (const question of questions) {
    graph.set(question._id.toString(), []);
  }

  for (const question of questions) {
    const questionId = question._id.toString();

    const rules =
      questionId === sourceQuestionId.toString()
        ? replacementRules
        : question.jumpRules;

    for (const rule of rules) {
      if (
        rule.action === 'goto' &&
        rule.targetQuestionId
      ) {
        const targetId =
          rule.targetQuestionId.toString();

        if (graph.has(targetId)) {
          graph.get(questionId).push(targetId);
        }
      }
    }
  }

  const states = new Map();

  function visit(questionId) {
    const state = states.get(questionId) || 0;

    if (state === 1) {
      return true;
    }

    if (state === 2) {
      return false;
    }

    states.set(questionId, 1);

    for (const targetId of graph.get(questionId) || []) {
      if (visit(targetId)) {
        return true;
      }
    }

    states.set(questionId, 2);
    return false;
  }

  for (const questionId of graph.keys()) {
    if (visit(questionId)) {
      return true;
    }
  }

  return false;
}

async function createQuestion(req, res, next) {
  try {
    const survey = await findOwnedSurvey(
      req.params.surveyId,
      req.user.id
    );

    if (!survey) {
      return res.status(404).json({
        message: '问卷不存在或不属于当前用户',
      });
    }

    if (survey.status !== 'draft') {
      return res.status(409).json({
        message: '只有草稿问卷可以添加题目',
      });
    }

    const body = req.body || {};

    if (!QUESTION_TYPES.includes(body.type)) {
      return res.status(400).json({
        message:
          '题型只能是 singleChoice、multipleChoice、text 或 number',
      });
    }

    const title =
      typeof body.title === 'string'
        ? body.title.trim()
        : '';

    if (!title) {
      return res.status(400).json({
        message: '题目内容不能为空',
      });
    }

    if (title.length > 500) {
      return res.status(400).json({
        message: '题目内容不能超过 500 个字符',
      });
    }

    if (
      body.required !== undefined &&
      typeof body.required !== 'boolean'
    ) {
      return res.status(400).json({
        message: 'required 必须是布尔值',
      });
    }

    const inputOptions =
      body.options === undefined
        ? []
        : body.options;

    if (!Array.isArray(inputOptions)) {
      return res.status(400).json({
        message: 'options 必须是数组',
      });
    }

    const choiceTypes = [
      'singleChoice',
      'multipleChoice',
    ];

    const isChoice = choiceTypes.includes(body.type);

    if (isChoice && inputOptions.length < 2) {
      return res.status(400).json({
        message: '单选题和多选题至少需要两个选项',
      });
    }

    if (!isChoice && inputOptions.length > 0) {
      return res.status(400).json({
        message: '文本题和数字题不能包含选项',
      });
    }

    const options = [];

    for (const option of inputOptions) {
      if (
        !option ||
        typeof option !== 'object' ||
        typeof option.label !== 'string' ||
        !option.label.trim()
      ) {
        return res.status(400).json({
          message: '每个选项都必须包含非空的 label',
        });
      }

      if (option.label.trim().length > 200) {
        return res.status(400).json({
          message: '选项文字不能超过 200 个字符',
        });
      }

      if (
        option.optionId !== undefined &&
        (
          typeof option.optionId !== 'string' ||
          !option.optionId.trim()
        )
      ) {
        return res.status(400).json({
          message: 'optionId 必须是非空字符串',
        });
      }

      options.push({
        optionId:
          option.optionId?.trim() ||
          randomBytes(6).toString('hex'),
        label: option.label.trim(),
      });
    }

    const validation =
      body.validation === undefined
        ? {}
        : body.validation;

    if (
      !validation ||
      typeof validation !== 'object' ||
      Array.isArray(validation)
    ) {
      return res.status(400).json({
        message: 'validation 必须是对象',
      });
    }

    const normalizedValidation =
      normalizeValidation(body.type, validation);

    if (
      body.jumpRules !== undefined &&
      (
        !Array.isArray(body.jumpRules) ||
        body.jumpRules.length > 0
      )
    ) {
      return res.status(400).json({
        message: '请先创建题目，再单独配置跳转规则',
      });
    }

    const lastQuestion = await Question.findOne({
      surveyId: survey._id,
    })
      .sort({ order: -1 })
      .select('order')
      .lean();

    const order = lastQuestion
      ? lastQuestion.order + 1
      : 1;

    const question = await Question.create({
      surveyId: survey._id,
      order,
      type: body.type,
      title,
      required: body.required ?? false,
      options,
      validation: normalizedValidation,
      jumpRules: [],
    });

    return res.status(201).json({
      question: serializeQuestion(question),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((item) => item.message)
        .join('；');

      return res.status(400).json({
        message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: '题目顺序冲突，请重新提交',
      });
    }

    return next(error);
  }
}

async function listQuestions(req, res, next) {
  try {
    const survey = await findOwnedSurvey(
      req.params.surveyId,
      req.user.id
    );

    if (!survey) {
      return res.status(404).json({
        message: '问卷不存在或不属于当前用户',
      });
    }

    const questions = await Question.find({
      surveyId: survey._id,
    })
      .sort({ order: 1 })
      .lean();

    return res.status(200).json({
      questions: questions.map(serializeQuestion),
      total: questions.length,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateQuestion(req, res, next) {
  try {
    const survey = await findOwnedSurvey(
      req.params.surveyId,
      req.user.id
    );

    if (!survey) {
      return res.status(404).json({
        message: '问卷不存在或不属于当前用户',
      });
    }

    if (survey.status !== 'draft') {
      return res.status(409).json({
        message: '只有草稿问卷可以编辑题目',
      });
    }

    if (!mongoose.isValidObjectId(req.params.questionId)) {
      return res.status(404).json({
        message: '题目不存在',
      });
    }

    const question = await Question.findOne({
      _id: req.params.questionId,
      surveyId: survey._id,
    });

    if (!question) {
      return res.status(404).json({
        message: '题目不存在',
      });
    }

    const body = req.body || {};

    if (body.jumpRules !== undefined) {
      return res.status(400).json({
        message: '跳转规则必须通过专用接口配置',
      });
    }

    const editableFields = [
      'type',
      'title',
      'required',
      'options',
      'validation',
    ];

    const hasEditableField = editableFields.some(
      (field) => body[field] !== undefined
    );

    if (!hasEditableField) {
      return res.status(400).json({
        message: '没有提供可编辑的题目字段',
      });
    }

    if (body.type !== undefined) {
      if (!QUESTION_TYPES.includes(body.type)) {
        return res.status(400).json({
          message:
            '题型只能是 singleChoice、multipleChoice、text 或 number',
        });
      }

      question.type = body.type;
    }

    if (body.title !== undefined) {
      if (
        typeof body.title !== 'string' ||
        !body.title.trim()
      ) {
        return res.status(400).json({
          message: '题目内容不能为空',
        });
      }

      if (body.title.trim().length > 500) {
        return res.status(400).json({
          message: '题目内容不能超过 500 个字符',
        });
      }

      question.title = body.title.trim();
    }

    if (body.required !== undefined) {
      if (typeof body.required !== 'boolean') {
        return res.status(400).json({
          message: 'required 必须是布尔值',
        });
      }

      question.required = body.required;
    }

    if (body.options !== undefined) {
      if (!Array.isArray(body.options)) {
        return res.status(400).json({
          message: 'options 必须是数组',
        });
      }

      const normalizedOptions = [];

      for (const option of body.options) {
        if (
          !option ||
          typeof option !== 'object' ||
          typeof option.label !== 'string' ||
          !option.label.trim()
        ) {
          return res.status(400).json({
            message: '每个选项都必须包含非空的 label',
          });
        }

        if (option.label.trim().length > 200) {
          return res.status(400).json({
            message: '选项文字不能超过 200 个字符',
          });
        }

        if (
          option.optionId !== undefined &&
          (
            typeof option.optionId !== 'string' ||
            !option.optionId.trim()
          )
        ) {
          return res.status(400).json({
            message: 'optionId 必须是非空字符串',
          });
        }

        normalizedOptions.push({
          optionId:
            option.optionId?.trim() ||
            randomBytes(6).toString('hex'),
          label: option.label.trim(),
        });
      }

      question.options = normalizedOptions;
    }

    let validationInput = question.validation || {};

    if (body.validation !== undefined) {
      if (
        !body.validation ||
        typeof body.validation !== 'object' ||
        Array.isArray(body.validation)
      ) {
        return res.status(400).json({
          message: 'validation 必须是对象',
        });
      }

      validationInput = body.validation;
    }

    if (
      body.validation !== undefined ||
      body.type !== undefined
    ) {
      question.validation = normalizeValidation(
        question.type,
        validationInput
      );
    }

    await question.save();

    return res.status(200).json({
      question: serializeQuestion(question),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((item) => item.message)
        .join('；');

      return res.status(400).json({
        message,
      });
    }

    return next(error);
  }
}

async function deleteQuestion(req, res, next) {
  try {
    const survey = await findOwnedSurvey(
      req.params.surveyId,
      req.user.id
    );

    if (!survey) {
      return res.status(404).json({
        message: '问卷不存在或不属于当前用户',
      });
    }

    if (survey.status !== 'draft') {
      return res.status(409).json({
        message: '只有草稿问卷可以删除题目',
      });
    }

    if (!mongoose.isValidObjectId(req.params.questionId)) {
      return res.status(404).json({
        message: '题目不存在',
      });
    }

    const question = await Question.findOne({
      _id: req.params.questionId,
      surveyId: survey._id,
    });

    if (!question) {
      return res.status(404).json({
        message: '题目不存在',
      });
    }

    const isReferenced = await Question.exists({
      surveyId: survey._id,
      _id: {
        $ne: question._id,
      },
      'jumpRules.targetQuestionId': question._id,
    });

    if (isReferenced) {
      return res.status(409).json({
        message: '该题目正在被跳转规则引用，不能删除',
      });
    }

    await question.deleteOne();

    const remainingQuestions =
      await Question.countDocuments({
        surveyId: survey._id,
      });

    return res.status(200).json({
      message: '题目删除成功',
      deletedQuestionId: question._id.toString(),
      remainingQuestions,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateJumpRules(req, res, next) {
  try {
    const survey = await findOwnedSurvey(
      req.params.surveyId,
      req.user.id
    );

    if (!survey) {
      return res.status(404).json({
        message: '问卷不存在或不属于当前用户',
      });
    }

    if (survey.status !== 'draft') {
      return res.status(409).json({
        message: '只有草稿问卷可以配置跳转规则',
      });
    }

    if (!mongoose.isValidObjectId(req.params.questionId)) {
      return res.status(404).json({
        message: '题目不存在',
      });
    }

    const questions = await Question.find({
      surveyId: survey._id,
    }).sort({ order: 1 });

    const question = questions.find(
      (item) =>
        item._id.toString() === req.params.questionId
    );

    if (!question) {
      return res.status(404).json({
        message: '题目不存在',
      });
    }

    const body = req.body || {};

    if (!Array.isArray(body.jumpRules)) {
      return res.status(400).json({
        message: 'jumpRules 必须是数组',
      });
    }

    const normalizedRules = [];
    const usedPriorities = new Set();
    const availableOptionIds = new Set(
      question.options.map((option) => option.optionId)
    );

    for (
      let index = 0;
      index < body.jumpRules.length;
      index += 1
    ) {
      const rule = body.jumpRules[index];

      if (
        !rule ||
        typeof rule !== 'object' ||
        Array.isArray(rule)
      ) {
        return res.status(400).json({
          message: `第 ${index + 1} 条跳转规则格式无效`,
        });
      }

      const allowedOperators =
        OPERATORS_BY_TYPE[question.type];

      if (!allowedOperators.includes(rule.operator)) {
        return res.status(400).json({
          message:
            `题型 ${question.type} 不支持操作符 ${rule.operator}`,
        });
      }

      if (!['goto', 'submit'].includes(rule.action)) {
        return res.status(400).json({
          message: 'action 只能是 goto 或 submit',
        });
      }

      if (
        !Object.prototype.hasOwnProperty.call(
          rule,
          'value'
        )
      ) {
        return res.status(400).json({
          message: '跳转规则必须包含 value',
        });
      }

      if (question.type === 'singleChoice') {
        if (
          typeof rule.value !== 'string' ||
          !availableOptionIds.has(rule.value)
        ) {
          return res.status(400).json({
            message: '单选题规则的 value 必须是有效的 optionId',
          });
        }
      }

      if (question.type === 'multipleChoice') {
        if (
          !Array.isArray(rule.value) ||
          rule.value.length === 0 ||
          rule.value.some(
            (value) =>
              typeof value !== 'string' ||
              !availableOptionIds.has(value)
          )
        ) {
          return res.status(400).json({
            message:
              '多选题规则的 value 必须是有效 optionId 数组',
          });
        }

        if (
          new Set(rule.value).size !== rule.value.length
        ) {
          return res.status(400).json({
            message: '多选题规则的 value 不能包含重复项',
          });
        }
      }

      if (question.type === 'text') {
        if (typeof rule.value !== 'string') {
          return res.status(400).json({
            message: '文本题规则的 value 必须是字符串',
          });
        }
      }

      if (question.type === 'number') {
        if (
          typeof rule.value !== 'number' ||
          !Number.isFinite(rule.value)
        ) {
          return res.status(400).json({
            message: '数字题规则的 value 必须是有限数字',
          });
        }
      }

      const priority = rule.priority ?? index;

      if (
        !Number.isInteger(priority) ||
        priority < 0
      ) {
        return res.status(400).json({
          message: 'priority 必须是大于或等于 0 的整数',
        });
      }

      if (usedPriorities.has(priority)) {
        return res.status(400).json({
          message: '同一道题的 priority 不能重复',
        });
      }

      usedPriorities.add(priority);

      let targetQuestionId = null;

      if (rule.action === 'goto') {
        if (
          !mongoose.isValidObjectId(
            rule.targetQuestionId
          )
        ) {
          return res.status(400).json({
            message: 'goto 规则必须包含有效的 targetQuestionId',
          });
        }

        if (
          rule.targetQuestionId ===
          question._id.toString()
        ) {
          return res.status(400).json({
            message: '题目不能跳转到自身',
          });
        }

        const targetQuestion = questions.find(
          (item) =>
            item._id.toString() ===
            rule.targetQuestionId
        );

        if (!targetQuestion) {
          return res.status(400).json({
            message: '跳转目标必须属于同一份问卷',
          });
        }

        if (targetQuestion.order <= question.order) {
           return res.status(400).json({
            message: 'goto 只能跳转到后续题目',
          });
        }
        targetQuestionId = targetQuestion._id;
      } else if (
        rule.targetQuestionId !== undefined &&
        rule.targetQuestionId !== null
      ) {
        return res.status(400).json({
          message: 'submit 规则不能设置 targetQuestionId',
        });
      }

      normalizedRules.push({
        operator: rule.operator,
        value: rule.value,
        action: rule.action,
        targetQuestionId,
        priority,
      });
    }

    normalizedRules.sort(
      (left, right) => left.priority - right.priority
    );

    if (
      hasJumpCycle(
        questions,
        question._id,
        normalizedRules
      )
    ) {
      return res.status(409).json({
        message: '跳转规则不能形成循环',
      });
    }

    question.jumpRules = normalizedRules;
    await question.save();

    return res.status(200).json({
      question: serializeQuestion(question),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((item) => item.message)
        .join('；');

      return res.status(400).json({
        message,
      });
    }

    return next(error);
  }
}
module.exports = {
  createQuestion,
  listQuestions,
  updateQuestion,
  deleteQuestion,
  updateJumpRules,
};
