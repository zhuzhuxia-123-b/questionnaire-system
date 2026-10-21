const mongoose = require('mongoose');

const { Survey, Question } = require('../models');

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

function normalizePublicValidation(
  type,
  validation = {}
) {
  const source =
    typeof validation?.toObject === 'function'
      ? validation.toObject()
      : validation || {};

  const allowedFields =
    VALIDATION_FIELDS_BY_TYPE[type] || [];

  return Object.fromEntries(
    allowedFields
      .filter(
        (field) =>
          source[field] !== undefined
      )
      .map(
        (field) => [
          field,
          source[field],
        ]
      )
  );
}

async function findOwnedSurvey(
  surveyId,
  ownerId
) {
  if (!mongoose.isValidObjectId(surveyId)) {
    return null;
  }

  return Survey.findOne({
    _id: surveyId,
    ownerId,
  });
}

function hasJumpCycle(questions) {
  const graph = new Map();

  for (const question of questions) {
    graph.set(
      question._id.toString(),
      []
    );
  }

  for (const question of questions) {
    const sourceId =
      question._id.toString();

    for (const rule of question.jumpRules) {
      if (
        rule.action === 'goto' &&
        rule.targetQuestionId
      ) {
        graph
          .get(sourceId)
          .push(
            rule.targetQuestionId.toString()
          );
      }
    }
  }

  const states = new Map();

  function visit(questionId) {
    const state =
      states.get(questionId) || 0;

    if (state === 1) {
      return true;
    }

    if (state === 2) {
      return false;
    }

    states.set(questionId, 1);

    for (
      const targetId of
      graph.get(questionId) || []
    ) {
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

function serializeManagedSurvey(survey) {
  return {
    id: survey._id.toString(),
    title: survey.title,
    description: survey.description,
    status: survey.status,
    publicId: survey.publicId,
    deadline: survey.deadline,
    publishedAt: survey.publishedAt,
    closedAt: survey.closedAt,
    schemaVersion: survey.schemaVersion,
    publicPath:
      `/api/public/surveys/${survey.publicId}`,
  };
}

function serializePublicQuestion(question) {
  return {
    id: question._id.toString(),
    order: question.order,
    type: question.type,
    title: question.title,
    required: question.required,
    options: question.options,
    validation:
      normalizePublicValidation(
        question.type,
        question.validation
      ),
    jumpRules: question.jumpRules.map(
      (rule) => ({
        operator: rule.operator,
        value: rule.value,
        action: rule.action,
        targetQuestionId:
          rule.targetQuestionId
            ?.toString() || null,
        priority: rule.priority,
      })
    ),
  };
}

async function publishSurvey(
  req,
  res,
  next
) {
  try {
    const survey =
      await findOwnedSurvey(
        req.params.surveyId,
        req.user.id
      );

    if (!survey) {
      return res.status(404).json({
        message:
          '问卷不存在或不属于当前用户',
      });
    }

    if (survey.status !== 'draft') {
      return res.status(409).json({
        message:
          '只有草稿问卷可以发布',
      });
    }

    if (
      survey.deadline &&
      survey.deadline <= new Date()
    ) {
      return res.status(400).json({
        message:
          '截止时间必须晚于当前时间',
      });
    }

    const questions =
      await Question.find({
        surveyId: survey._id,
      }).sort({ order: 1 });

    if (questions.length === 0) {
      return res.status(400).json({
        message:
          '问卷至少需要一道题才能发布',
      });
    }

    const questionIds = new Set(
      questions.map(
        (question) =>
          question._id.toString()
      )
    );

    for (const question of questions) {
      for (
        const rule of question.jumpRules
      ) {
        if (
          rule.action === 'goto' &&
          (
            !rule.targetQuestionId ||
            !questionIds.has(
              rule.targetQuestionId
                .toString()
            )
          )
        ) {
          return res.status(409).json({
            message:
              '问卷包含无效的跳转目标',
          });
        }
      }
    }

    if (hasJumpCycle(questions)) {
      return res.status(409).json({
        message:
          '问卷跳转规则存在循环，不能发布',
      });
    }

    survey.status = 'published';
    survey.publishedAt = new Date();
    survey.closedAt = null;

    await survey.save();

    return res.status(200).json({
      message: '问卷发布成功',
      survey:
        serializeManagedSurvey(survey),
    });
  } catch (error) {
    return next(error);
  }
}

async function closeSurvey(
  req,
  res,
  next
) {
  try {
    const survey =
      await findOwnedSurvey(
        req.params.surveyId,
        req.user.id
      );

    if (!survey) {
      return res.status(404).json({
        message:
          '问卷不存在或不属于当前用户',
      });
    }

    if (
      survey.status !== 'published'
    ) {
      return res.status(409).json({
        message:
          '只有已发布问卷可以关闭',
      });
    }

    survey.status = 'closed';
    survey.closedAt = new Date();

    await survey.save();

    return res.status(200).json({
      message: '问卷关闭成功',
      survey:
        serializeManagedSurvey(survey),
    });
  } catch (error) {
    return next(error);
  }
}

async function getPublicSurvey(
  req,
  res,
  next
) {
  try {
    const survey =
      await Survey.findOne({
        publicId: req.params.publicId,
      });

    if (
      !survey ||
      survey.status !== 'published'
    ) {
      return res.status(404).json({
        message:
          '公开问卷不存在或尚未发布',
      });
    }

    if (
      survey.deadline &&
      survey.deadline <= new Date()
    ) {
      return res.status(410).json({
        message:
          '问卷已超过截止时间',
      });
    }

    const questions =
      await Question.find({
        surveyId: survey._id,
      })
        .sort({ order: 1 })
        .lean();

    return res.status(200).json({
      survey: {
        publicId: survey.publicId,
        title: survey.title,
        description:
          survey.description,
        allowAnonymous:
          survey.allowAnonymous,
        allowMultipleSubmissions:
          survey.allowMultipleSubmissions,
        deadline: survey.deadline,
        schemaVersion:
          survey.schemaVersion,
        publishedAt:
          survey.publishedAt,
      },
      questions: questions.map(
        serializePublicQuestion
      ),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  publishSurvey,
  closeSurvey,
  getPublicSurvey,
};