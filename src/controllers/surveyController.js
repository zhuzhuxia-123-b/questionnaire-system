const { Survey } = require('../models');

const ALLOWED_STATUSES = ['draft', 'published', 'closed'];

function serializeSurvey(survey) {
  const document =
    typeof survey.toObject === 'function'
      ? survey.toObject()
      : survey;

  const { _id, ownerId, ...rest } = document;

  return {
    id: _id.toString(),
    ownerId: ownerId.toString(),
    ...rest,
  };
}

async function createSurvey(req, res, next) {
  try {
    const body = req.body || {};

    const title =
      typeof body.title === 'string'
        ? body.title.trim()
        : '';

    if (!title) {
      return res.status(400).json({
        message: '问卷标题不能为空',
      });
    }

    if (title.length > 100) {
      return res.status(400).json({
        message: '问卷标题不能超过 100 个字符',
      });
    }

    let description = '';

    if (body.description !== undefined) {
      if (typeof body.description !== 'string') {
        return res.status(400).json({
          message: '问卷说明必须是字符串',
        });
      }

      description = body.description.trim();

      if (description.length > 1000) {
        return res.status(400).json({
          message: '问卷说明不能超过 1000 个字符',
        });
      }
    }

    if (
      body.allowAnonymous !== undefined &&
      typeof body.allowAnonymous !== 'boolean'
    ) {
      return res.status(400).json({
        message: 'allowAnonymous 必须是布尔值',
      });
    }

    if (
      body.allowMultipleSubmissions !== undefined &&
      typeof body.allowMultipleSubmissions !== 'boolean'
    ) {
      return res.status(400).json({
        message: 'allowMultipleSubmissions 必须是布尔值',
      });
    }

    let deadline = null;

    if (
      body.deadline !== undefined &&
      body.deadline !== null &&
      body.deadline !== ''
    ) {
      deadline = new Date(body.deadline);

      if (Number.isNaN(deadline.getTime())) {
        return res.status(400).json({
          message: '截止时间格式无效',
        });
      }

      if (deadline <= new Date()) {
        return res.status(400).json({
          message: '截止时间必须晚于当前时间',
        });
      }
    }

    const survey = await Survey.create({
      ownerId: req.user.id,
      title,
      description,
      allowAnonymous: body.allowAnonymous ?? false,
      allowMultipleSubmissions:
        body.allowMultipleSubmissions ?? false,
      deadline,
    });

    return res.status(201).json({
      survey: serializeSurvey(survey),
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
        message: '问卷公开编号冲突，请重新提交',
      });
    }

    return next(error);
  }
}

async function listMySurveys(req, res, next) {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const status = req.query.status;

    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        message: 'page 必须是大于或等于 1 的整数',
      });
    }

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 50
    ) {
      return res.status(400).json({
        message: 'limit 必须是 1 到 50 之间的整数',
      });
    }

    if (
      status !== undefined &&
      !ALLOWED_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        message: 'status 只能是 draft、published 或 closed',
      });
    }

    const filter = {
      ownerId: req.user.id,
    };

    if (status !== undefined) {
      filter.status = status;
    }

    const [surveys, total] = await Promise.all([
      Survey.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Survey.countDocuments(filter),
    ]);

    return res.status(200).json({
      surveys: surveys.map(serializeSurvey),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createSurvey,
  listMySurveys,
};