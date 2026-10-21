const mongoose = require('mongoose');

const {
  Survey,
  Question,
  Response,
} = require('../models');

function buildOptionStatistics(
  question,
  values,
  multiple
) {
  const counts = new Map(
    question.options.map((option) => [
      option.optionId,
      0,
    ])
  );

  for (const value of values) {
    const selectedOptionIds = multiple
      ? value
      : [value];

    if (!Array.isArray(selectedOptionIds)) {
      continue;
    }

    for (const optionId of selectedOptionIds) {
      if (counts.has(optionId)) {
        counts.set(
          optionId,
          counts.get(optionId) + 1
        );
      }
    }
  }

  return question.options.map((option) => ({
    optionId: option.optionId,
    label: option.label,
    count: counts.get(option.optionId) ?? 0,
  }));
}

function buildQuestionStatistics(
  question,
  values,
  responseCount
) {
  const totalAnswers = values.length;

  const common = {
    questionId: question._id.toString(),
    order: question.order,
    type: question.type,
    title: question.title,
    totalAnswers,
    notAnsweredCount: Math.max(
      responseCount - totalAnswers,
      0
    ),
  };

  if (question.type === 'singleChoice') {
    return {
      ...common,
      options: buildOptionStatistics(
        question,
        values,
        false
      ),
    };
  }

  if (question.type === 'multipleChoice') {
    return {
      ...common,
      options: buildOptionStatistics(
        question,
        values,
        true
      ),
    };
  }

  if (question.type === 'text') {
    const textValues = values.filter(
      (value) => typeof value === 'string'
    );

    return {
      ...common,
      totalAnswers: textValues.length,
      notAnsweredCount: Math.max(
        responseCount - textValues.length,
        0
      ),
      values: textValues,
    };
  }

  if (question.type === 'number') {
    const numberValues = values.filter(
      (value) =>
        typeof value === 'number' &&
        Number.isFinite(value)
    );

    const average =
      numberValues.length === 0
        ? null
        : numberValues.reduce(
            (sum, value) => sum + value,
            0
          ) / numberValues.length;

    return {
      ...common,
      totalAnswers: numberValues.length,
      notAnsweredCount: Math.max(
        responseCount - numberValues.length,
        0
      ),
      values: numberValues,
      average,
    };
  }

  return common;
}

async function getSurveyStatistics(req, res, next) {
  try {
    const { surveyId } = req.params;
    const requestedQuestionId =
      req.query.questionId;

    if (!mongoose.isValidObjectId(surveyId)) {
      return res.status(404).json({
        message: '问卷不存在或不属于当前用户',
      });
    }

    if (
      requestedQuestionId !== undefined &&
      !mongoose.isValidObjectId(
        requestedQuestionId
      )
    ) {
      return res.status(400).json({
        message: 'questionId 格式无效',
      });
    }

    const survey = await Survey.findOne({
      _id: surveyId,
      ownerId: req.user.id,
    }).lean();

    if (!survey) {
      return res.status(404).json({
        message: '问卷不存在或不属于当前用户',
      });
    }

    let questions = await Question.find({
      surveyId: survey._id,
    })
      .sort({ order: 1 })
      .lean();

    if (requestedQuestionId !== undefined) {
      const requestedQuestion = questions.find(
        (question) =>
          question._id.toString() ===
          requestedQuestionId
      );

      if (!requestedQuestion) {
        return res.status(404).json({
          message: '题目不存在或不属于该问卷',
        });
      }

      questions = [requestedQuestion];
    }

    const [responseCount, answerGroups] =
      await Promise.all([
        Response.countDocuments({
          surveyId: survey._id,
        }),
        Response.aggregate([
          {
            $match: {
              surveyId: survey._id,
            },
          },
          {
            $unwind: '$answers',
          },
          {
            $group: {
              _id: '$answers.questionId',
              values: {
                $push: '$answers.value',
              },
            },
          },
        ]),
      ]);

    const valuesByQuestionId = new Map(
      answerGroups.map((group) => [
        group._id.toString(),
        group.values,
      ])
    );

    const questionStatistics = questions.map(
      (question) =>
        buildQuestionStatistics(
          question,
          valuesByQuestionId.get(
            question._id.toString()
          ) ?? [],
          responseCount
        )
    );

    return res.json({
      survey: {
        id: survey._id.toString(),
        title: survey.title,
        status: survey.status,
      },
      responseCount,
      questionCount: questionStatistics.length,
      questions: questionStatistics,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getSurveyStatistics,
};