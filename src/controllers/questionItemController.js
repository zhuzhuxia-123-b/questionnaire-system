const mongoose = require('mongoose');
const { randomBytes } = require('crypto');

const {
  QuestionItem,
  QuestionVersion,
} = require('../models');

const QUESTION_TYPES = [
  'singleChoice',
  'multipleChoice',
  'text',
  'number',
];

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

const SURVEY_ONLY_FIELDS = [
  'surveyId',
  'order',
  'required',
  'jumpRules',
];

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function hasOwn(object, field) {
  return Object.prototype.hasOwnProperty.call(
    object,
    field
  );
}

function throwHttpError(status, message) {
  throw new HttpError(status, message);
}

function validateRequestBody(body) {
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body)
  ) {
    throwHttpError(400, '请求体必须是对象');
  }
}

function rejectSurveyOnlyFields(body) {
  const invalidField = SURVEY_ONLY_FIELDS.find(
    (field) => hasOwn(body, field)
  );

  if (invalidField) {
    throwHttpError(
      400,
      `${invalidField} 属于问卷题目配置，不能保存到可复用题目版本`
    );
  }
}

function normalizeChangeNote(
  value,
  defaultValue = ''
) {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== 'string') {
    throwHttpError(400, 'changeNote 必须是字符串');
  }

  const changeNote = value.trim();

  if (changeNote.length > 1000) {
    throwHttpError(
      400,
      'changeNote 不能超过 1000 个字符'
    );
  }

  return changeNote;
}

function normalizeOptions(type, inputOptions) {
  if (!Array.isArray(inputOptions)) {
    throwHttpError(400, 'options 必须是数组');
  }

  const isChoice = [
    'singleChoice',
    'multipleChoice',
  ].includes(type);

  if (isChoice && inputOptions.length < 2) {
    throwHttpError(
      400,
      '单选题和多选题至少需要两个选项'
    );
  }

  if (!isChoice && inputOptions.length > 0) {
    throwHttpError(
      400,
      '文本题和数字题不能包含选项'
    );
  }

  const options = inputOptions.map(
    (inputOption) => {
      const option =
        typeof inputOption?.toObject === 'function'
          ? inputOption.toObject()
          : inputOption;

      if (
        !option ||
        typeof option !== 'object' ||
        Array.isArray(option)
      ) {
        throwHttpError(
          400,
          '每个选项都必须是对象'
        );
      }

      if (
        typeof option.label !== 'string' ||
        !option.label.trim()
      ) {
        throwHttpError(
          400,
          '每个选项都必须包含非空的 label'
        );
      }

      const label = option.label.trim();

      if (label.length > 200) {
        throwHttpError(
          400,
          '选项文字不能超过 200 个字符'
        );
      }

      if (
        option.optionId !== undefined &&
        (
          typeof option.optionId !== 'string' ||
          !option.optionId.trim()
        )
      ) {
        throwHttpError(
          400,
          'optionId 必须是非空字符串'
        );
      }

      return {
        optionId:
          option.optionId?.trim() ||
          randomBytes(6).toString('hex'),
        label,
      };
    }
  );

  const optionIds = options.map(
    (option) => option.optionId
  );

  if (
    new Set(optionIds).size !== optionIds.length
  ) {
    throwHttpError(
      400,
      '同一版本中的 optionId 不能重复'
    );
  }

  return options;
}

function normalizeValidation(
  type,
  inputValidation = {}
) {
  const validation =
    typeof inputValidation?.toObject === 'function'
      ? inputValidation.toObject()
      : inputValidation;

  if (
    !validation ||
    typeof validation !== 'object' ||
    Array.isArray(validation)
  ) {
    throwHttpError(
      400,
      'validation 必须是对象'
    );
  }

  const allowedFields =
    VALIDATION_FIELDS_BY_TYPE[type] || [];

  return Object.fromEntries(
    allowedFields
      .filter(
        (field) =>
          validation[field] !== undefined
      )
      .map(
        (field) => [
          field,
          validation[field],
        ]
      )
  );
}

function buildVersionContent(
  body,
  baseVersion = null
) {
  validateRequestBody(body);
  rejectSurveyOnlyFields(body);

  const type = hasOwn(body, 'type')
    ? body.type
    : baseVersion?.type;

  if (!QUESTION_TYPES.includes(type)) {
    throwHttpError(
      400,
      '题型只能是 singleChoice、multipleChoice、text 或 number'
    );
  }

  const titleInput = hasOwn(body, 'title')
    ? body.title
    : baseVersion?.title;

  if (
    typeof titleInput !== 'string' ||
    !titleInput.trim()
  ) {
    throwHttpError(400, '题目内容不能为空');
  }

  const title = titleInput.trim();

  if (title.length > 500) {
    throwHttpError(
      400,
      '题目内容不能超过 500 个字符'
    );
  }

  let optionsInput;

  if (hasOwn(body, 'options')) {
    optionsInput = body.options;
  } else if (baseVersion) {
    const typeChanged =
      type !== baseVersion.type;

    const newTypeIsChoice = [
      'singleChoice',
      'multipleChoice',
    ].includes(type);

    if (typeChanged && !newTypeIsChoice) {
      optionsInput = [];
    } else {
      optionsInput = baseVersion.options || [];
    }
  } else {
    optionsInput = [];
  }

  const validationInput =
    hasOwn(body, 'validation')
      ? body.validation
      : baseVersion?.validation || {};

  return {
    type,
    title,
    options: normalizeOptions(
      type,
      optionsInput
    ),
    validation: normalizeValidation(
      type,
      validationInput
    ),
  };
}

function serializeVersion(version) {
  const document =
    typeof version.toObject === 'function'
      ? version.toObject()
      : version;

  return {
    id: document._id.toString(),
    questionItemId:
      document.questionItemId.toString(),
    versionNumber: document.versionNumber,
    parentVersionId:
      document.parentVersionId?.toString() ||
      null,
    restoredFromVersionId:
      document.restoredFromVersionId?.toString() ||
      null,
    createdByUserId:
      document.createdByUserId.toString(),
    changeNote: document.changeNote,
    type: document.type,
    title: document.title,
    options: (document.options || []).map(
      (option) => ({
        optionId: option.optionId,
        label: option.label,
      })
    ),
    validation: normalizeValidation(
      document.type,
      document.validation || {}
    ),
    schemaVersion: document.schemaVersion,
    createdAt: document.createdAt,
  };
}

function serializeQuestionItem(
  questionItem,
  currentVersion = null
) {
  const document =
    typeof questionItem.toObject === 'function'
      ? questionItem.toObject()
      : questionItem;

  return {
    id: document._id.toString(),
    ownerId: document.ownerId.toString(),
    currentVersionId:
      document.currentVersionId?.toString() ||
      null,
    latestVersionNumber:
      document.latestVersionNumber,
    status: document.status,
    legacyQuestionId:
      document.legacyQuestionId?.toString() ||
      null,
    schemaVersion: document.schemaVersion,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    currentVersion: currentVersion
      ? serializeVersion(currentVersion)
      : null,
  };
}

function parsePositiveInteger(
  value,
  field,
  defaultValue,
  maximum
) {
  if (value === undefined) {
    return defaultValue;
  }

  const number = Number(value);

  if (
    !Number.isInteger(number) ||
    number < 1 ||
    number > maximum
  ) {
    throwHttpError(
      400,
      `${field} 必须是 1 至 ${maximum} 之间的整数`
    );
  }

  return number;
}

async function findOwnedQuestionItem(
  questionItemId,
  ownerId,
  activeOnly = false
) {
  if (
    !mongoose.isValidObjectId(
      questionItemId
    )
  ) {
    return null;
  }

  const filter = {
    _id: questionItemId,
    ownerId,
  };

  if (activeOnly) {
    filter.status = 'active';
  }

  return QuestionItem.findOne(filter);
}

async function findCurrentVersion(
  questionItem
) {
  if (!questionItem.currentVersionId) {
    throwHttpError(
      409,
      '可复用题目缺少当前版本'
    );
  }

  const currentVersion =
    await QuestionVersion.findOne({
      _id: questionItem.currentVersionId,
      questionItemId: questionItem._id,
    });

  if (!currentVersion) {
    throwHttpError(
      409,
      '可复用题目的当前版本不存在'
    );
  }

  return currentVersion;
}

async function createAndAdvanceVersion({
  questionItem,
  ownerId,
  content,
  changeNote,
  restoredFromVersionId = null,
}) {
  const currentVersion =
    await findCurrentVersion(questionItem);

  const versionNumber =
    questionItem.latestVersionNumber + 1;

  const newVersion = new QuestionVersion({
    questionItemId: questionItem._id,
    versionNumber,
    parentVersionId: currentVersion._id,
    restoredFromVersionId,
    createdByUserId: ownerId,
    changeNote,
    ...content,
  });

  await newVersion.validate();

  try {
    await newVersion.save();
  } catch (error) {
    if (error.code === 11000) {
      throwHttpError(
        409,
        '题目版本号发生并发冲突，请重新提交'
      );
    }

    throw error;
  }

  let updatedQuestionItem;

  try {
    updatedQuestionItem =
      await QuestionItem.findOneAndUpdate(
        {
          _id: questionItem._id,
          ownerId,
          status: 'active',
          currentVersionId:
            questionItem.currentVersionId,
          latestVersionNumber:
            questionItem.latestVersionNumber,
        },
        {
          $set: {
            currentVersionId: newVersion._id,
          },
          $inc: {
            latestVersionNumber: 1,
          },
        },
        {
          returnDocument: 'after',
          runValidators: true,
        }
      );
  } catch (error) {
    await QuestionVersion.deleteOne({
      _id: newVersion._id,
    }).catch(() => {});

    throw error;
  }

  if (!updatedQuestionItem) {
    await QuestionVersion.deleteOne({
      _id: newVersion._id,
    }).catch(() => {});

    throwHttpError(
      409,
      '题目版本已被其他操作更新，请刷新后重试'
    );
  }

  return {
    questionItem: updatedQuestionItem,
    version: newVersion,
  };
}

function handleControllerError(
  error,
  res,
  next
) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({
      message: error.message,
    });
  }

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
      message: '数据唯一性冲突，请重新提交',
    });
  }

  return next(error);
}

async function createQuestionItem(
  req,
  res,
  next
) {
  try {
    const body = req.body || {};
    const content = buildVersionContent(
      body
    );

    const changeNote =
      normalizeChangeNote(
        body.changeNote,
        '创建初始版本'
      );

    const questionItemId =
      new mongoose.Types.ObjectId();

    const questionVersionId =
      new mongoose.Types.ObjectId();

    const questionItem = new QuestionItem({
      _id: questionItemId,
      ownerId: req.user.id,
      currentVersionId: questionVersionId,
      latestVersionNumber: 1,
      status: 'active',
      schemaVersion: 1,
    });

    const questionVersion =
      new QuestionVersion({
        _id: questionVersionId,
        questionItemId,
        versionNumber: 1,
        parentVersionId: null,
        restoredFromVersionId: null,
        createdByUserId: req.user.id,
        changeNote,
        ...content,
        schemaVersion: 1,
      });

    await questionItem.validate();
    await questionVersion.validate();

    await questionVersion.save();

    try {
      await questionItem.save();
    } catch (error) {
      await QuestionVersion.deleteOne({
        _id: questionVersion._id,
      }).catch(() => {});

      throw error;
    }

    return res.status(201).json({
      message: '可复用题目创建成功',
      questionItem: serializeQuestionItem(
        questionItem,
        questionVersion
      ),
    });
  } catch (error) {
    return handleControllerError(
      error,
      res,
      next
    );
  }
}

async function listMyQuestionItems(
  req,
  res,
  next
) {
  try {
    const page = parsePositiveInteger(
      req.query.page,
      'page',
      1,
      100000
    );

    const limit = parsePositiveInteger(
      req.query.limit,
      'limit',
      20,
      100
    );

    const status =
      req.query.status || 'active';

    if (
      !['active', 'archived', 'all'].includes(
        status
      )
    ) {
      throwHttpError(
        400,
        'status 只能是 active、archived 或 all'
      );
    }

    const filter = {
      ownerId: req.user.id,
    };

    if (status !== 'all') {
      filter.status = status;
    }

    const [questionItems, total] =
      await Promise.all([
        QuestionItem.find(filter)
          .sort({
            updatedAt: -1,
            _id: -1,
          })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        QuestionItem.countDocuments(filter),
      ]);

    const currentVersionIds =
      questionItems
        .map(
          (item) => item.currentVersionId
        )
        .filter(Boolean);

    const currentVersions =
      await QuestionVersion.find({
        _id: {
          $in: currentVersionIds,
        },
      }).lean();

    const versionMap = new Map(
      currentVersions.map(
        (version) => [
          version._id.toString(),
          version,
        ]
      )
    );

    return res.status(200).json({
      questionItems: questionItems.map(
        (item) =>
          serializeQuestionItem(
            item,
            item.currentVersionId
              ? versionMap.get(
                  item.currentVersionId.toString()
                )
              : null
          )
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages:
          total === 0
            ? 0
            : Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleControllerError(
      error,
      res,
      next
    );
  }
}

async function getQuestionItem(
  req,
  res,
  next
) {
  try {
    const questionItem =
      await findOwnedQuestionItem(
        req.params.questionItemId,
        req.user.id
      );

    if (!questionItem) {
      return res.status(404).json({
        message:
          '可复用题目不存在或不属于当前用户',
      });
    }

    const currentVersion =
      await findCurrentVersion(questionItem);

    return res.status(200).json({
      questionItem: serializeQuestionItem(
        questionItem,
        currentVersion
      ),
    });
  } catch (error) {
    return handleControllerError(
      error,
      res,
      next
    );
  }
}

async function createQuestionItemVersion(
  req,
  res,
  next
) {
  try {
    const questionItem =
      await findOwnedQuestionItem(
        req.params.questionItemId,
        req.user.id,
        true
      );

    if (!questionItem) {
      return res.status(404).json({
        message:
          '可复用题目不存在、已归档或不属于当前用户',
      });
    }

    const body = req.body || {};
    validateRequestBody(body);

    const hasContentField = [
      'type',
      'title',
      'options',
      'validation',
    ].some((field) => hasOwn(body, field));

    if (!hasContentField) {
      throwHttpError(
        400,
        '没有提供需要修改的题目内容'
      );
    }

    const currentVersion =
      await findCurrentVersion(questionItem);

    const content = buildVersionContent(
      body,
      currentVersion
    );

    const changeNote =
      normalizeChangeNote(
        body.changeNote
      );

    const result =
      await createAndAdvanceVersion({
        questionItem,
        ownerId: req.user.id,
        content,
        changeNote,
      });

    return res.status(201).json({
      message: '题目新版本创建成功',
      questionItem: serializeQuestionItem(
        result.questionItem,
        result.version
      ),
      version: serializeVersion(
        result.version
      ),
    });
  } catch (error) {
    return handleControllerError(
      error,
      res,
      next
    );
  }
}

async function listQuestionItemVersions(
  req,
  res,
  next
) {
  try {
    const questionItem =
      await findOwnedQuestionItem(
        req.params.questionItemId,
        req.user.id
      );

    if (!questionItem) {
      return res.status(404).json({
        message:
          '可复用题目不存在或不属于当前用户',
      });
    }

    const page = parsePositiveInteger(
      req.query.page,
      'page',
      1,
      100000
    );

    const limit = parsePositiveInteger(
      req.query.limit,
      'limit',
      20,
      100
    );

    const filter = {
      questionItemId: questionItem._id,
    };

    const [versions, total] =
      await Promise.all([
        QuestionVersion.find(filter)
          .sort({
            versionNumber: -1,
          })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        QuestionVersion.countDocuments(
          filter
        ),
      ]);

    return res.status(200).json({
      questionItemId:
        questionItem._id.toString(),
      currentVersionId:
        questionItem.currentVersionId?.toString() ||
        null,
      latestVersionNumber:
        questionItem.latestVersionNumber,
      versions: versions.map(
        serializeVersion
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages:
          total === 0
            ? 0
            : Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleControllerError(
      error,
      res,
      next
    );
  }
}

async function restoreQuestionItemVersion(
  req,
  res,
  next
) {
  try {
    const questionItem =
      await findOwnedQuestionItem(
        req.params.questionItemId,
        req.user.id,
        true
      );

    if (!questionItem) {
      return res.status(404).json({
        message:
          '可复用题目不存在、已归档或不属于当前用户',
      });
    }

    if (
      !mongoose.isValidObjectId(
        req.params.versionId
      )
    ) {
      return res.status(404).json({
        message: '历史版本不存在',
      });
    }

    const sourceVersion =
      await QuestionVersion.findOne({
        _id: req.params.versionId,
        questionItemId: questionItem._id,
      });

    if (!sourceVersion) {
      return res.status(404).json({
        message:
          '历史版本不存在或不属于当前题目',
      });
    }

    if (
      questionItem.currentVersionId?.toString() ===
      sourceVersion._id.toString()
    ) {
      throwHttpError(
        400,
        '当前版本无需恢复'
      );
    }

    const body = req.body || {};
    validateRequestBody(body);
    rejectSurveyOnlyFields(body);

    const contentFields = [
      'type',
      'title',
      'options',
      'validation',
    ];

    if (
      contentFields.some(
        (field) => hasOwn(body, field)
      )
    ) {
      throwHttpError(
        400,
        '恢复接口不能同时修改历史版本内容'
      );
    }

    const content = {
      type: sourceVersion.type,
      title: sourceVersion.title,
      options: normalizeOptions(
        sourceVersion.type,
        sourceVersion.options || []
      ),
      validation: normalizeValidation(
        sourceVersion.type,
        sourceVersion.validation || {}
      ),
    };

    const changeNote =
      normalizeChangeNote(
        body.changeNote,
        `从版本 ${sourceVersion.versionNumber} 恢复`
      );

    const result =
      await createAndAdvanceVersion({
        questionItem,
        ownerId: req.user.id,
        content,
        changeNote,
        restoredFromVersionId:
          sourceVersion._id,
      });

    return res.status(201).json({
      message: '历史版本恢复成功',
      restoredFromVersionId:
        sourceVersion._id.toString(),
      questionItem: serializeQuestionItem(
        result.questionItem,
        result.version
      ),
      version: serializeVersion(
        result.version
      ),
    });
  } catch (error) {
    return handleControllerError(
      error,
      res,
      next
    );
  }
}

module.exports = {
  createQuestionItem,
  listMyQuestionItems,
  getQuestionItem,
  createQuestionItemVersion,
  listQuestionItemVersions,
  restoreQuestionItemVersion,
};