const {
  Survey,
  Question,
  Response,
} = require('../models');
const {
  buildSubmission,
} = require('../services/responseValidationService');

async function submitResponse(req, res, next) {
  try {
    const survey = await Survey.findOne({
      publicId: req.params.publicId,
    });

    if (!survey || survey.status !== 'published') {
      return res.status(404).json({
        message: '公开问卷不存在或尚未发布',
      });
    }

    if (
      survey.deadline &&
      survey.deadline <= new Date()
    ) {
      return res.status(410).json({
        message: '问卷已超过截止时间',
      });
    }

    const body = req.body || {};

    if (
      body.anonymous !== undefined &&
      typeof body.anonymous !== 'boolean'
    ) {
      return res.status(400).json({
        message: 'anonymous 必须是布尔值',
      });
    }

    const anonymous = body.anonymous ?? false;

    if (anonymous && !survey.allowAnonymous) {
      return res.status(400).json({
        message: '该问卷不允许匿名提交',
      });
    }

    const questions = await Question.find({
      surveyId: survey._id,
    }).sort({ order: 1 });

    const submission = buildSubmission(
      questions,
      body.answers
    );

    if (submission.error) {
      return res.status(400).json({
        message: submission.error,
      });
    }

    const responseData = {
      surveyId: survey._id,
      respondentId: req.user.id,
      anonymous,
      answers: submission.answers,
      visitedQuestionIds:
        submission.visitedQuestionIds,
      surveyVersion: survey.schemaVersion,
    };

    if (!survey.allowMultipleSubmissions) {
      responseData.uniqueSubmissionKey =
        `${survey._id}:${req.user.id}`;
    }

    const response = await Response.create(
      responseData
    );

    return res.status(201).json({
      message: '答卷提交成功',
      response: {
        id: response._id.toString(),
        anonymous: response.anonymous,
        answerCount: response.answers.length,
        visitedQuestionIds:
          response.visitedQuestionIds.map(
            (questionId) => questionId.toString()
          ),
        surveyVersion: response.surveyVersion,
        submittedAt: response.submittedAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: '该用户已经提交过此问卷',
      });
    }

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
  submitResponse,
};