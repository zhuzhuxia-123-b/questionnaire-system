const mongoose = require('mongoose');

const {
  Survey,
  Question,
  QuestionItem,
  QuestionVersion,
  QuestionShare,
} = require('../models');

const ALLOWED_BODY_FIELDS = new Set([
  'questionItemId',
  'questionVersionId',
  'required',
]);

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

function normalizeValidation(
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

function serializeQuestion(question) {
  const document =
    typeof question.toObject === 'function'
      ? question.toObject()
      : question;

  return {
    id: document._id.toString(),
    surveyId: document.surveyId.toString(),
    order: document.order,
    type: document.type,
    title: document.title,
    required: document.required,
    options: (document.options || []).map(
      (option) => ({
        optionId: option.optionId,
        label: option.label,
      })
    ),
    validation: normalizeValidation(
      document.type,
      document.validation
    ),
    jumpRules: document.jumpRules || [],
    questionItemId:
      document.questionItemId?.toString() ||
      null,
    questionVersionId:
      document.questionVersionId
        ?.toString() || null,
    contentSource:
      document.contentSource || null,
    schemaVersion: document.schemaVersion,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
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

async function findAccessibleQuestionItem(
  questionItemId,
  userId
) {
  if (
    !mongoose.isValidObjectId(
      questionItemId
    )
  ) {
    return null;
  }

  const questionItem =
    await QuestionItem.findOne({
      _id: questionItemId,
      status: 'active',
    });

  if (!questionItem) {
    return null;
  }

  if (
    questionItem.ownerId.toString() ===
    userId
  ) {
    return {
      questionItem,
      accessType: 'owned',
      shareId: null,
    };
  }

  const share = await QuestionShare.findOne({
    questionItemId: questionItem._id,
    sharedWithUserId: userId,
    status: 'active',
    permission: 'use',
  });

  if (!share) {
    return null;
  }

  return {
    questionItem,
    accessType: 'shared',
    shareId: share._id,
  };
}

async function createQuestionFromLibrary(
  req,
  res,
  next
) {
  try {
    const survey = await findOwnedSurvey(
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
          '只有草稿问卷可以复用题目',
      });
    }

    const body = req.body || {};

    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body)
    ) {
      return res.status(400).json({
        message: '请求体必须是对象',
      });
    }

    const unexpectedField =
      Object.keys(body).find(
        (field) =>
          !ALLOWED_BODY_FIELDS.has(field)
      );

    if (unexpectedField) {
      return res.status(400).json({
        message:
          `${unexpectedField} 不能在复用题目时覆盖版本内容`,
      });
    }

    if (
      !mongoose.isValidObjectId(
        body.questionItemId
      )
    ) {
      return res.status(400).json({
        message:
          'questionItemId 必须是有效的 ObjectId',
      });
    }

    if (
      !mongoose.isValidObjectId(
        body.questionVersionId
      )
    ) {
      return res.status(400).json({
        message:
          'questionVersionId 必须是有效的 ObjectId',
      });
    }

    if (
      body.required !== undefined &&
      typeof body.required !== 'boolean'
    ) {
      return res.status(400).json({
        message:
          'required 必须是布尔值',
      });
    }

    const access =
      await findAccessibleQuestionItem(
        body.questionItemId,
        req.user.id
      );

    if (!access) {
      return res.status(404).json({
        message:
          '可复用题目不存在或当前用户没有使用权限',
      });
    }

    const questionVersion =
      await QuestionVersion.findOne({
        _id: body.questionVersionId,
        questionItemId:
          access.questionItem._id,
      });

    if (!questionVersion) {
      return res.status(404).json({
        message:
          '指定题目版本不存在或不属于该逻辑题目',
      });
    }

    const lastQuestion =
      await Question.findOne({
        surveyId: survey._id,
      })
        .sort({
          order: -1,
        })
        .select('order')
        .lean();

    const order = lastQuestion
      ? lastQuestion.order + 1
      : 1;

    const question = await Question.create({
      surveyId: survey._id,
      order,
      type: questionVersion.type,
      title: questionVersion.title,
      required: body.required ?? false,
      options: questionVersion.options.map(
        (option) => ({
          optionId: option.optionId,
          label: option.label,
        })
      ),
      validation: normalizeValidation(
        questionVersion.type,
        questionVersion.validation
      ),
      jumpRules: [],
      questionItemId:
        access.questionItem._id,
      questionVersionId:
        questionVersion._id,
      contentSource: 'library',
      schemaVersion: 2,
    });

    return res.status(201).json({
      message: '可复用题目添加成功',
      source: {
        accessType: access.accessType,
        shareId:
          access.shareId?.toString() ||
          null,
        questionItemId:
          access.questionItem._id.toString(),
        questionVersionId:
          questionVersion._id.toString(),
        versionNumber:
          questionVersion.versionNumber,
        isCurrentVersion:
          access.questionItem.currentVersionId
            ?.toString() ===
          questionVersion._id.toString(),
      },
      question: serializeQuestion(question),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(
        error.errors
      )
        .map((item) => item.message)
        .join('；');

      return res.status(400).json({
        message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          '题目顺序冲突，请重新提交',
      });
    }

    return next(error);
  }
}

module.exports = {
  createQuestionFromLibrary,
};