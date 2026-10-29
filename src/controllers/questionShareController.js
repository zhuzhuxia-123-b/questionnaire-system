const mongoose = require('mongoose');

const {
  User,
  QuestionItem,
  QuestionVersion,
  QuestionShare,
} = require('../models');

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

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function throwHttpError(status, message) {
  throw new HttpError(status, message);
}

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
      document.restoredFromVersionId
        ?.toString() || null,
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
      document.validation
    ),
    createdAt: document.createdAt,
  };
}

function serializeShare(
  share,
  recipient = null
) {
  const document =
    typeof share.toObject === 'function'
      ? share.toObject()
      : share;

  return {
    id: document._id.toString(),
    questionItemId:
      document.questionItemId.toString(),
    sharedWithUser: recipient
      ? {
          id: recipient._id.toString(),
          username: recipient.username,
        }
      : null,
    permission: document.permission,
    status: document.status,
    sharedAt: document.sharedAt,
    revokedAt: document.revokedAt,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
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
      message: '共享关系发生唯一性冲突',
    });
  }

  return next(error);
}

async function shareQuestionItem(
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

    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body)
    ) {
      throwHttpError(
        400,
        '请求体必须是对象'
      );
    }

    const unexpectedField =
      Object.keys(body).find(
        (field) => field !== 'username'
      );

    if (unexpectedField) {
      throwHttpError(
        400,
        `共享请求不能包含 ${unexpectedField}`
      );
    }

    if (
      typeof body.username !== 'string' ||
      !body.username.trim()
    ) {
      throwHttpError(
        400,
        'username 不能为空'
      );
    }

    const username = body.username.trim();

    if (
      username.length < 3 ||
      username.length > 30
    ) {
      throwHttpError(
        400,
        'username 长度必须为 3 至 30 个字符'
      );
    }

    const recipient = await User.findOne({
      username,
    }).select('_id username');

    if (!recipient) {
      return res.status(404).json({
        message: '接收用户不存在',
      });
    }

    if (
      recipient._id.toString() ===
      req.user.id
    ) {
      throwHttpError(
        400,
        '不能把题目共享给自己'
      );
    }

    let share = await QuestionShare.findOne({
      questionItemId: questionItem._id,
      sharedWithUserId: recipient._id,
    });

    let action;

    if (!share) {
      share = await QuestionShare.create({
        questionItemId: questionItem._id,
        sharedWithUserId: recipient._id,
        permission: 'use',
        status: 'active',
        sharedAt: new Date(),
        revokedAt: null,
      });

      action = 'created';
    } else if (share.status === 'revoked') {
      share.status = 'active';
      share.permission = 'use';
      share.sharedAt = new Date();
      share.revokedAt = null;

      await share.save();

      action = 'reactivated';
    } else {
      action = 'alreadyActive';
    }

    const messages = {
      created: '题目共享成功',
      reactivated: '题目共享已重新激活',
      alreadyActive: '题目已经共享给该用户',
    };

    return res
      .status(action === 'created' ? 201 : 200)
      .json({
        message: messages[action],
        action,
        share: serializeShare(
          share,
          recipient
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

async function listQuestionItemShares(
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

    const status =
      req.query.status || 'all';

    if (
      !['active', 'revoked', 'all'].includes(
        status
      )
    ) {
      throwHttpError(
        400,
        'status 只能是 active、revoked 或 all'
      );
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

    if (status !== 'all') {
      filter.status = status;
    }

    const [shares, total] =
      await Promise.all([
        QuestionShare.find(filter)
          .sort({
            updatedAt: -1,
            _id: -1,
          })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),

        QuestionShare.countDocuments(filter),
      ]);

    const recipientIds = shares.map(
      (share) => share.sharedWithUserId
    );

    const recipients = await User.find({
      _id: {
        $in: recipientIds,
      },
    })
      .select('_id username')
      .lean();

    const recipientMap = new Map(
      recipients.map(
        (recipient) => [
          recipient._id.toString(),
          recipient,
        ]
      )
    );

    return res.status(200).json({
      questionItem: {
        id: questionItem._id.toString(),
        status: questionItem.status,
        currentVersionId:
          questionItem.currentVersionId
            ?.toString() || null,
      },
      shares: shares.map(
        (share) =>
          serializeShare(
            share,
            recipientMap.get(
              share.sharedWithUserId.toString()
            )
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

async function revokeQuestionShare(
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

    if (
      !mongoose.isValidObjectId(
        req.params.shareId
      )
    ) {
      return res.status(404).json({
        message: '共享记录不存在',
      });
    }

    const share = await QuestionShare.findOne({
      _id: req.params.shareId,
      questionItemId: questionItem._id,
    });

    if (!share) {
      return res.status(404).json({
        message: '共享记录不存在',
      });
    }

    const recipient = await User.findById(
      share.sharedWithUserId
    ).select('_id username');

    if (share.status === 'revoked') {
      return res.status(200).json({
        message: '共享已经撤销',
        action: 'alreadyRevoked',
        share: serializeShare(
          share,
          recipient
        ),
      });
    }

    share.status = 'revoked';
    share.revokedAt = new Date();

    await share.save();

    return res.status(200).json({
      message: '共享撤销成功',
      action: 'revoked',
      share: serializeShare(
        share,
        recipient
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

async function listReceivedQuestionItems(
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

    const activeShares =
      await QuestionShare.find({
        sharedWithUserId: req.user.id,
        status: 'active',
        permission: 'use',
      })
        .sort({
          updatedAt: -1,
          _id: -1,
        })
        .lean();

    const questionItemIds =
      activeShares.map(
        (share) => share.questionItemId
      );

    const questionItems =
      await QuestionItem.find({
        _id: {
          $in: questionItemIds,
        },
        status: 'active',
      }).lean();

    const questionItemMap = new Map(
      questionItems.map(
        (item) => [
          item._id.toString(),
          item,
        ]
      )
    );

    const visibleShares =
      activeShares.filter(
        (share) =>
          questionItemMap.has(
            share.questionItemId.toString()
          )
      );

    const total = visibleShares.length;

    const pagedShares =
      visibleShares.slice(
        (page - 1) * limit,
        page * limit
      );

    const pagedItems =
      pagedShares.map(
        (share) =>
          questionItemMap.get(
            share.questionItemId.toString()
          )
      );

    const ownerIds = [
      ...new Set(
        pagedItems.map(
          (item) => item.ownerId.toString()
        )
      ),
    ];

    const currentVersionIds =
      pagedItems
        .map(
          (item) => item.currentVersionId
        )
        .filter(Boolean);

    const [owners, currentVersions] =
      await Promise.all([
        User.find({
          _id: {
            $in: ownerIds,
          },
        })
          .select('_id username')
          .lean(),

        QuestionVersion.find({
          _id: {
            $in: currentVersionIds,
          },
        }).lean(),
      ]);

    const ownerMap = new Map(
      owners.map(
        (owner) => [
          owner._id.toString(),
          owner,
        ]
      )
    );

    const versionMap = new Map(
      currentVersions.map(
        (version) => [
          version._id.toString(),
          version,
        ]
      )
    );

    const items = pagedShares.map(
      (share) => {
        const questionItem =
          questionItemMap.get(
            share.questionItemId.toString()
          );

        const owner = ownerMap.get(
          questionItem.ownerId.toString()
        );

        const currentVersion =
          questionItem.currentVersionId
            ? versionMap.get(
                questionItem.currentVersionId
                  .toString()
              )
            : null;

        return {
          share: {
            id: share._id.toString(),
            permission: share.permission,
            status: share.status,
            sharedAt: share.sharedAt,
          },
          owner: owner
            ? {
                id: owner._id.toString(),
                username: owner.username,
              }
            : null,
          questionItem: {
            id:
              questionItem._id.toString(),
            currentVersionId:
              questionItem.currentVersionId
                ?.toString() || null,
            latestVersionNumber:
              questionItem.latestVersionNumber,
            status: questionItem.status,
          },
          currentVersion: currentVersion
            ? serializeVersion(currentVersion)
            : null,
        };
      }
    );

    return res.status(200).json({
      items,
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

async function listReceivedQuestionVersions(
  req,
  res,
  next
) {
  try {
    if (
      !mongoose.isValidObjectId(
        req.params.questionItemId
      )
    ) {
      return res.status(404).json({
        message:
          '有效共享题目不存在',
      });
    }

    const share = await QuestionShare.findOne({
      questionItemId:
        req.params.questionItemId,
      sharedWithUserId: req.user.id,
      status: 'active',
      permission: 'use',
    }).lean();

    if (!share) {
      return res.status(404).json({
        message:
          '有效共享题目不存在',
      });
    }

    const questionItem =
      await QuestionItem.findOne({
        _id: req.params.questionItemId,
        status: 'active',
      }).lean();

    if (!questionItem) {
      return res.status(404).json({
        message:
          '有效共享题目不存在',
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

    const [versions, total, owner] =
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

        User.findById(
          questionItem.ownerId
        )
          .select('_id username')
          .lean(),
      ]);

    return res.status(200).json({
      share: {
        id: share._id.toString(),
        permission: share.permission,
        sharedAt: share.sharedAt,
      },
      owner: owner
        ? {
            id: owner._id.toString(),
            username: owner.username,
          }
        : null,
      questionItem: {
        id: questionItem._id.toString(),
        currentVersionId:
          questionItem.currentVersionId
            ?.toString() || null,
        latestVersionNumber:
          questionItem.latestVersionNumber,
        status: questionItem.status,
      },
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

module.exports = {
  shareQuestionItem,
  listQuestionItemShares,
  revokeQuestionShare,
  listReceivedQuestionItems,
  listReceivedQuestionVersions,
};