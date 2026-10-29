const mongoose = require('mongoose');

const {
  QuestionBank,
  QuestionItem,
  QuestionVersion,
} = require('../models');

const {
  createQuestionFromLibrary,
} = require('./questionReuseController');

const CREATE_FIELDS = new Set([
  'name',
  'description',
]);

const UPDATE_FIELDS = new Set([
  'name',
  'description',
]);

const ADD_ITEM_FIELDS = new Set([
  'questionItemId',
  'preferredVersionId',
]);

const SET_VERSION_FIELDS = new Set([
  'preferredVersionId',
]);

const ADD_TO_SURVEY_FIELDS = new Set([
  'surveyId',
  'questionVersionId',
  'required',
]);

function isObjectBody(body) {
  return (
    body &&
    typeof body === 'object' &&
    !Array.isArray(body)
  );
}

function findUnexpectedField(
  body,
  allowedFields
) {
  return Object.keys(body).find(
    (field) => !allowedFields.has(field)
  );
}

function serializeVersion(version) {
  if (!version) {
    return null;
  }

  return {
    id: version._id.toString(),
    versionNumber: version.versionNumber,
    type: version.type,
    title: version.title,
    createdAt: version.createdAt,
  };
}

async function serializeQuestionBank(
  bank,
  includeItems = false
) {
  const document =
    typeof bank.toObject === 'function'
      ? bank.toObject()
      : bank;

  const result = {
    id: document._id.toString(),
    name: document.name,
    description: document.description,
    status: document.status,
    itemCount: (document.items || []).length,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };

  if (!includeItems) {
    return result;
  }

  const bankItems = [...(document.items || [])]
    .sort((left, right) => {
      return left.order - right.order;
    });

  if (bankItems.length === 0) {
    return {
      ...result,
      items: [],
    };
  }

  const questionItemIds = bankItems.map(
    (item) => item.questionItemId
  );

  const questionItems =
    await QuestionItem.find({
      _id: {
        $in: questionItemIds,
      },
      ownerId: document.ownerId,
    }).lean();

  const questionItemMap = new Map(
    questionItems.map((item) => [
      item._id.toString(),
      item,
    ])
  );

  const versionIds = [];

  for (const bankItem of bankItems) {
    const questionItem = questionItemMap.get(
      bankItem.questionItemId.toString()
    );

    if (bankItem.preferredVersionId) {
      versionIds.push(
        bankItem.preferredVersionId
      );
    }

    if (questionItem?.currentVersionId) {
      versionIds.push(
        questionItem.currentVersionId
      );
    }
  }

  const versions =
    versionIds.length > 0
      ? await QuestionVersion.find({
          _id: {
            $in: versionIds,
          },
        }).lean()
      : [];

  const versionMap = new Map(
    versions.map((version) => [
      version._id.toString(),
      version,
    ])
  );

  const items = bankItems.map((bankItem) => {
    const questionItemId =
      bankItem.questionItemId.toString();

    const questionItem =
      questionItemMap.get(questionItemId);

    const preferredVersionId =
      bankItem.preferredVersionId
        ?.toString() || null;

    const currentVersionId =
      questionItem?.currentVersionId
        ?.toString() || null;

    const preferredVersion =
      preferredVersionId
        ? versionMap.get(
            preferredVersionId
          )
        : null;

    const currentVersion =
      currentVersionId
        ? versionMap.get(currentVersionId)
        : null;

    return {
      questionItemId,
      order: bankItem.order,
      addedAt: bankItem.addedAt,
      available:
        Boolean(questionItem) &&
        questionItem.status === 'active',
      preferredVersionId,
      preferredVersion:
        serializeVersion(preferredVersion),
      currentVersionId,
      currentVersion:
        serializeVersion(currentVersion),
      isPreferredCurrent:
        Boolean(preferredVersionId) &&
        preferredVersionId ===
          currentVersionId,
    };
  });

  return {
    ...result,
    items,
  };
}

async function findOwnedQuestionBank(
  bankId,
  ownerId
) {
  if (!mongoose.isValidObjectId(bankId)) {
    return null;
  }

  return QuestionBank.findOne({
    _id: bankId,
    ownerId,
    status: 'active',
  });
}

function handleControllerError(
  error,
  res,
  next
) {
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
      message: '题目库名称已存在',
    });
  }

  return next(error);
}

async function createQuestionBank(
  req,
  res,
  next
) {
  try {
    const body = req.body || {};

    if (!isObjectBody(body)) {
      return res.status(400).json({
        message: '请求体必须是对象',
      });
    }

    const unexpectedField =
      findUnexpectedField(
        body,
        CREATE_FIELDS
      );

    if (unexpectedField) {
      return res.status(400).json({
        message:
          `不支持字段 ${unexpectedField}`,
      });
    }

    if (
      typeof body.name !== 'string' ||
      !body.name.trim()
    ) {
      return res.status(400).json({
        message: '题目库名称不能为空',
      });
    }

    if (
      body.description !== undefined &&
      typeof body.description !== 'string'
    ) {
      return res.status(400).json({
        message: '题目库说明必须是字符串',
      });
    }

    const bank = await QuestionBank.create({
      ownerId: req.user.id,
      name: body.name.trim(),
      description:
        body.description?.trim() || '',
      status: 'active',
      items: [],
    });

    return res.status(201).json({
      message: '题目库创建成功',
      questionBank:
        await serializeQuestionBank(
          bank,
          true
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

async function listMyQuestionBanks(
  req,
  res,
  next
) {
  try {
    const banks = await QuestionBank.find({
      ownerId: req.user.id,
      status: 'active',
    }).sort({
      updatedAt: -1,
      createdAt: -1,
    });

    const serializedBanks =
      await Promise.all(
        banks.map((bank) =>
          serializeQuestionBank(
            bank,
            false
          )
        )
      );

    return res.status(200).json({
      total: serializedBanks.length,
      questionBanks: serializedBanks,
    });
  } catch (error) {
    return next(error);
  }
}

async function getQuestionBank(
  req,
  res,
  next
) {
  try {
    const bank =
      await findOwnedQuestionBank(
        req.params.bankId,
        req.user.id
      );

    if (!bank) {
      return res.status(404).json({
        message:
          '题目库不存在或不属于当前用户',
      });
    }

    return res.status(200).json({
      questionBank:
        await serializeQuestionBank(
          bank,
          true
        ),
    });
  } catch (error) {
    return next(error);
  }
}

async function updateQuestionBank(
  req,
  res,
  next
) {
  try {
    const bank =
      await findOwnedQuestionBank(
        req.params.bankId,
        req.user.id
      );

    if (!bank) {
      return res.status(404).json({
        message:
          '题目库不存在或不属于当前用户',
      });
    }

    const body = req.body || {};

    if (!isObjectBody(body)) {
      return res.status(400).json({
        message: '请求体必须是对象',
      });
    }

    const unexpectedField =
      findUnexpectedField(
        body,
        UPDATE_FIELDS
      );

    if (unexpectedField) {
      return res.status(400).json({
        message:
          `不支持字段 ${unexpectedField}`,
      });
    }

    if (
      body.name === undefined &&
      body.description === undefined
    ) {
      return res.status(400).json({
        message:
          '至少需要提供 name 或 description',
      });
    }

    if (body.name !== undefined) {
      if (
        typeof body.name !== 'string' ||
        !body.name.trim()
      ) {
        return res.status(400).json({
          message: '题目库名称不能为空',
        });
      }

      bank.name = body.name.trim();
    }

    if (body.description !== undefined) {
      if (
        typeof body.description !== 'string'
      ) {
        return res.status(400).json({
          message:
            '题目库说明必须是字符串',
        });
      }

      bank.description =
        body.description.trim();
    }

    await bank.save();

    return res.status(200).json({
      message: '题目库修改成功',
      questionBank:
        await serializeQuestionBank(
          bank,
          true
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

async function addQuestionItemToBank(
  req,
  res,
  next
) {
  try {
    const bank =
      await findOwnedQuestionBank(
        req.params.bankId,
        req.user.id
      );

    if (!bank) {
      return res.status(404).json({
        message:
          '题目库不存在或不属于当前用户',
      });
    }

    const body = req.body || {};

    if (!isObjectBody(body)) {
      return res.status(400).json({
        message: '请求体必须是对象',
      });
    }

    const unexpectedField =
      findUnexpectedField(
        body,
        ADD_ITEM_FIELDS
      );

    if (unexpectedField) {
      return res.status(400).json({
        message:
          `不支持字段 ${unexpectedField}`,
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
      body.preferredVersionId !==
        undefined &&
      !mongoose.isValidObjectId(
        body.preferredVersionId
      )
    ) {
      return res.status(400).json({
        message:
          'preferredVersionId 必须是有效的 ObjectId',
      });
    }

    const questionItem =
      await QuestionItem.findOne({
        _id: body.questionItemId,
        ownerId: req.user.id,
        status: 'active',
      });

    if (!questionItem) {
      return res.status(404).json({
        message:
          '可复用题目不存在或不属于当前用户',
      });
    }

    const alreadyExists =
      bank.items.some((item) => {
        return (
          item.questionItemId.toString() ===
          questionItem._id.toString()
        );
      });

    if (alreadyExists) {
      return res.status(409).json({
        message:
          '该题目已经存在于当前题目库',
      });
    }

    const preferredVersionId =
      body.preferredVersionId ||
      questionItem.currentVersionId;

    if (!preferredVersionId) {
      return res.status(409).json({
        message:
          '该逻辑题目没有可用版本',
      });
    }

    const preferredVersion =
      await QuestionVersion.findOne({
        _id: preferredVersionId,
        questionItemId:
          questionItem._id,
      });

    if (!preferredVersion) {
      return res.status(404).json({
        message:
          '推荐版本不存在或不属于该逻辑题目',
      });
    }

    const nextOrder =
      bank.items.reduce(
        (maximum, item) =>
          Math.max(
            maximum,
            item.order || 0
          ),
        0
      ) + 1;

    bank.items.push({
      questionItemId:
        questionItem._id,
      preferredVersionId:
        preferredVersion._id,
      order: nextOrder,
      addedAt: new Date(),
    });

    await bank.save();

    return res.status(201).json({
      message: '题目加入题目库成功',
      questionBank:
        await serializeQuestionBank(
          bank,
          true
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

async function removeQuestionItemFromBank(
  req,
  res,
  next
) {
  try {
    const bank =
      await findOwnedQuestionBank(
        req.params.bankId,
        req.user.id
      );

    if (!bank) {
      return res.status(404).json({
        message:
          '题目库不存在或不属于当前用户',
      });
    }

    if (
      !mongoose.isValidObjectId(
        req.params.questionItemId
      )
    ) {
      return res.status(400).json({
        message:
          'questionItemId 必须是有效的 ObjectId',
      });
    }

    const itemIndex =
      bank.items.findIndex((item) => {
        return (
          item.questionItemId.toString() ===
          req.params.questionItemId
        );
      });

    if (itemIndex === -1) {
      return res.status(404).json({
        message:
          '该题目不在当前题目库中',
      });
    }

    bank.items.splice(itemIndex, 1);

    bank.items
      .sort((left, right) => {
        return left.order - right.order;
      })
      .forEach((item, index) => {
        item.order = index + 1;
      });

    await bank.save();

    return res.status(200).json({
      message: '题目已从题目库移除',
      questionBank:
        await serializeQuestionBank(
          bank,
          true
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

async function setPreferredQuestionVersion(
  req,
  res,
  next
) {
  try {
    const bank =
      await findOwnedQuestionBank(
        req.params.bankId,
        req.user.id
      );

    if (!bank) {
      return res.status(404).json({
        message:
          '题目库不存在或不属于当前用户',
      });
    }

    if (
      !mongoose.isValidObjectId(
        req.params.questionItemId
      )
    ) {
      return res.status(400).json({
        message:
          'questionItemId 必须是有效的 ObjectId',
      });
    }

    const body = req.body || {};

    if (!isObjectBody(body)) {
      return res.status(400).json({
        message: '请求体必须是对象',
      });
    }

    const unexpectedField =
      findUnexpectedField(
        body,
        SET_VERSION_FIELDS
      );

    if (unexpectedField) {
      return res.status(400).json({
        message:
          `不支持字段 ${unexpectedField}`,
      });
    }

    if (
      !mongoose.isValidObjectId(
        body.preferredVersionId
      )
    ) {
      return res.status(400).json({
        message:
          'preferredVersionId 必须是有效的 ObjectId',
      });
    }

    const bankItem = bank.items.find(
      (item) => {
        return (
          item.questionItemId.toString() ===
          req.params.questionItemId
        );
      }
    );

    if (!bankItem) {
      return res.status(404).json({
        message:
          '该题目不在当前题目库中',
      });
    }

    const version =
      await QuestionVersion.findOne({
        _id: body.preferredVersionId,
        questionItemId:
          bankItem.questionItemId,
      });

    if (!version) {
      return res.status(404).json({
        message:
          '指定版本不存在或不属于该逻辑题目',
      });
    }

    bankItem.preferredVersionId =
      version._id;

    await bank.save();

    return res.status(200).json({
      message: '题库推荐版本修改成功',
      questionBank:
        await serializeQuestionBank(
          bank,
          true
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

async function addBankQuestionToSurvey(
  req,
  res,
  next
) {
  try {
    const bank =
      await findOwnedQuestionBank(
        req.params.bankId,
        req.user.id
      );

    if (!bank) {
      return res.status(404).json({
        message:
          '题目库不存在或不属于当前用户',
      });
    }

    if (
      !mongoose.isValidObjectId(
        req.params.questionItemId
      )
    ) {
      return res.status(400).json({
        message:
          'questionItemId 必须是有效的 ObjectId',
      });
    }

    const body = req.body || {};

    if (!isObjectBody(body)) {
      return res.status(400).json({
        message: '请求体必须是对象',
      });
    }

    const unexpectedField =
      findUnexpectedField(
        body,
        ADD_TO_SURVEY_FIELDS
      );

    if (unexpectedField) {
      return res.status(400).json({
        message:
          `不支持字段 ${unexpectedField}`,
      });
    }

    const bankItem = bank.items.find(
      (item) => {
        return (
          item.questionItemId.toString() ===
          req.params.questionItemId
        );
      }
    );

    if (!bankItem) {
      return res.status(404).json({
        message:
          '该题目不在当前题目库中',
      });
    }

    const ownedQuestionItem =
      await QuestionItem.findOne({
        _id: bankItem.questionItemId,
        ownerId: req.user.id,
        status: 'active',
      });

    if (!ownedQuestionItem) {
      return res.status(404).json({
        message:
          '题库中的逻辑题目不可用',
      });
    }

    if (
      !mongoose.isValidObjectId(
        body.surveyId
      )
    ) {
      return res.status(400).json({
        message:
          'surveyId 必须是有效的 ObjectId',
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

    req.params.surveyId = body.surveyId;

    req.body = {
      questionItemId:
        ownedQuestionItem._id.toString(),
      questionVersionId:
        body.questionVersionId,
      required: body.required,
    };

    return createQuestionFromLibrary(
      req,
      res,
      next
    );
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createQuestionBank,
  listMyQuestionBanks,
  getQuestionBank,
  updateQuestionBank,
  addQuestionItemToBank,
  removeQuestionItemFromBank,
  setPreferredQuestionVersion,
  addBankQuestionToSurvey,
};