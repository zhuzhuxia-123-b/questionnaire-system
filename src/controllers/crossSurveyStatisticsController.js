const mongoose = require('mongoose');

const {
  Survey,
  Question,
  Response,
  QuestionItem,
  QuestionVersion,
} = require('../models');

function buildOptionStatistics(
  version,
  values,
  multiple
) {
  const optionCounts = new Map(
    version.options.map((option) => [
      option.optionId,
      0,
    ])
  );

  const validValues = values.filter((value) =>
    multiple
      ? Array.isArray(value)
      : typeof value === 'string'
  );

  for (const value of validValues) {
    const selectedOptionIds = multiple
      ? value
      : [value];

    for (const optionId of selectedOptionIds) {
      if (!optionCounts.has(optionId)) {
        continue;
      }

      optionCounts.set(
        optionId,
        optionCounts.get(optionId) + 1
      );
    }
  }

  return {
    totalAnswers: validValues.length,
    options: version.options.map((option) => ({
      optionId: option.optionId,
      label: option.label,
      count:
        optionCounts.get(option.optionId) || 0,
    })),
  };
}

function buildVersionStatistics({
  version,
  values,
  questionInstances,
  responseCountBySurvey,
  currentVersionId,
}) {
  const surveyIds = new Set(
    questionInstances.map((question) =>
      question.surveyId.toString()
    )
  );

  const responseCount = [
    ...surveyIds,
  ].reduce(
    (total, surveyId) =>
      total +
      (responseCountBySurvey.get(surveyId) ||
        0),
    0
  );

  const answerOpportunityCount =
    questionInstances.reduce(
      (total, question) =>
        total +
        (
          responseCountBySurvey.get(
            question.surveyId.toString()
          ) || 0
        ),
      0
    );

  const common = {
    questionVersionId:
      version._id.toString(),
    versionNumber: version.versionNumber,
    title: version.title,
    type: version.type,
    isCurrentVersion:
      currentVersionId?.toString() ===
      version._id.toString(),
    surveyCount: surveyIds.size,
    questionInstanceCount:
      questionInstances.length,
    responseCount,
    answerOpportunityCount,
  };

  if (version.type === 'singleChoice') {
    const result = buildOptionStatistics(
      version,
      values,
      false
    );

    return {
      ...common,
      totalAnswers: result.totalAnswers,
      notAnsweredCount: Math.max(
        answerOpportunityCount -
          result.totalAnswers,
        0
      ),
      options: result.options,
    };
  }

  if (version.type === 'multipleChoice') {
    const result = buildOptionStatistics(
      version,
      values,
      true
    );

    return {
      ...common,
      totalAnswers: result.totalAnswers,
      notAnsweredCount: Math.max(
        answerOpportunityCount -
          result.totalAnswers,
        0
      ),
      options: result.options,
    };
  }

  if (version.type === 'text') {
    const textValues = values.filter(
      (value) => typeof value === 'string'
    );

    return {
      ...common,
      totalAnswers: textValues.length,
      notAnsweredCount: Math.max(
        answerOpportunityCount -
          textValues.length,
        0
      ),
      values: textValues,
    };
  }

  if (version.type === 'number') {
    const numberValues = values.filter(
      (value) =>
        typeof value === 'number' &&
        Number.isFinite(value)
    );

    const sum = numberValues.reduce(
      (total, value) => total + value,
      0
    );

    return {
      ...common,
      totalAnswers: numberValues.length,
      notAnsweredCount: Math.max(
        answerOpportunityCount -
          numberValues.length,
        0
      ),
      values: numberValues,
      average:
        numberValues.length === 0
          ? null
          : sum / numberValues.length,
      minimum:
        numberValues.length === 0
          ? null
          : Math.min(...numberValues),
      maximum:
        numberValues.length === 0
          ? null
          : Math.max(...numberValues),
    };
  }

  return {
    ...common,
    totalAnswers: 0,
    notAnsweredCount:
      answerOpportunityCount,
  };
}

async function getCrossSurveyStatistics(
  req,
  res,
  next
) {
  try {
    const { questionItemId } = req.params;
    const requestedVersionId =
      req.query.questionVersionId;

    if (
      !mongoose.isValidObjectId(
        questionItemId
      )
    ) {
      return res.status(404).json({
        message:
          '可复用题目不存在或无权查看统计',
      });
    }

    if (
      requestedVersionId !== undefined &&
      (
        typeof requestedVersionId !==
          'string' ||
        !mongoose.isValidObjectId(
          requestedVersionId
        )
      )
    ) {
      return res.status(400).json({
        message:
          'questionVersionId 格式无效',
      });
    }

    const questionItem =
      await QuestionItem.findById(
        questionItemId
      ).lean();

    if (!questionItem) {
      return res.status(404).json({
        message:
          '可复用题目不存在或无权查看统计',
      });
    }

    const ownedSurveys = await Survey.find({
      ownerId: req.user.id,
    })
      .select(
        '_id title status createdAt'
      )
      .lean();

    const ownedSurveyIds =
      ownedSurveys.map(
        (survey) => survey._id
      );

    const allOwnedQuestionInstances =
      await Question.find({
        questionItemId: questionItem._id,
        surveyId: {
          $in: ownedSurveyIds,
        },
      })
        .select(
          '_id surveyId order required ' +
          'questionVersionId contentSource ' +
          'schemaVersion createdAt'
        )
        .sort({
          surveyId: 1,
          order: 1,
        })
        .lean();

    const ownsQuestionItem =
      questionItem.ownerId.toString() ===
      req.user.id;

    if (
      !ownsQuestionItem &&
      allOwnedQuestionInstances.length === 0
    ) {
      return res.status(404).json({
        message:
          '可复用题目不存在或无权查看统计',
      });
    }

    let requestedVersion = null;

    if (requestedVersionId !== undefined) {
      requestedVersion =
        await QuestionVersion.findOne({
          _id: requestedVersionId,
          questionItemId: questionItem._id,
        }).lean();

      if (!requestedVersion) {
        return res.status(404).json({
          message:
            '题目版本不存在或不属于该题目',
        });
      }

      if (
        !ownsQuestionItem &&
        !allOwnedQuestionInstances.some(
          (question) =>
            question.questionVersionId
              ?.toString() ===
            requestedVersionId
        )
      ) {
        return res.status(404).json({
          message:
            '题目版本不存在或未在本人问卷中使用',
        });
      }
    }

    const selectedQuestionInstances =
      requestedVersionId === undefined
        ? allOwnedQuestionInstances
        : allOwnedQuestionInstances.filter(
            (question) =>
              question.questionVersionId
                ?.toString() ===
              requestedVersionId
          );

    const selectedVersionIdStrings =
      requestedVersion
        ? [requestedVersion._id.toString()]
        : [
            ...new Set(
              selectedQuestionInstances
                .map((question) =>
                  question.questionVersionId
                    ?.toString()
                )
                .filter(Boolean)
            ),
          ];

    const selectedVersionObjectIds =
      selectedVersionIdStrings.map(
        (versionId) =>
          new mongoose.Types.ObjectId(
            versionId
          )
      );

    const versions = requestedVersion
      ? [requestedVersion]
      : await QuestionVersion.find({
          _id: {
            $in: selectedVersionObjectIds,
          },
          questionItemId: questionItem._id,
        })
          .sort({
            versionNumber: 1,
          })
          .lean();

    if (
      versions.length !==
      selectedVersionIdStrings.length
    ) {
      const error = new Error(
        '题目实例引用的版本数据不完整'
      );

      error.status = 500;
      throw error;
    }

    const selectedSurveyIdStrings = [
      ...new Set(
        selectedQuestionInstances.map(
          (question) =>
            question.surveyId.toString()
        )
      ),
    ];

    const selectedSurveyObjectIds =
      selectedSurveyIdStrings.map(
        (surveyId) =>
          new mongoose.Types.ObjectId(
            surveyId
          )
      );

    const selectedQuestionIds =
      selectedQuestionInstances.map(
        (question) => question._id
      );

    let responseCountGroups = [];
    let answerGroups = [];

    if (selectedSurveyObjectIds.length > 0) {
      [
        responseCountGroups,
        answerGroups,
      ] = await Promise.all([
        Response.aggregate([
          {
            $match: {
              surveyId: {
                $in:
                  selectedSurveyObjectIds,
              },
            },
          },
          {
            $group: {
              _id: '$surveyId',
              responseCount: {
                $sum: 1,
              },
            },
          },
        ]),

        selectedQuestionIds.length === 0
          ? []
          : Response.aggregate([
              {
                $match: {
                  surveyId: {
                    $in:
                      selectedSurveyObjectIds,
                  },
                },
              },
              {
                $unwind: '$answers',
              },
              {
                $match: {
                  'answers.questionId': {
                    $in:
                      selectedQuestionIds,
                  },
                  'answers.questionItemId':
                    questionItem._id,
                  'answers.questionVersionId':
                    {
                      $in:
                        selectedVersionObjectIds,
                    },
                },
              },
              {
                $group: {
                  _id:
                    '$answers.questionVersionId',
                  values: {
                    $push:
                      '$answers.value',
                  },
                },
              },
            ]),
      ]);
    }

    const responseCountBySurvey =
      new Map(
        responseCountGroups.map(
          (group) => [
            group._id.toString(),
            group.responseCount,
          ]
        )
      );

    const valuesByVersion = new Map(
      answerGroups.map((group) => [
        group._id.toString(),
        group.values,
      ])
    );

    const instancesByVersion =
      new Map();

    for (
      const question
      of selectedQuestionInstances
    ) {
      const versionId =
        question.questionVersionId
          ?.toString();

      if (!versionId) {
        continue;
      }

      if (
        !instancesByVersion.has(
          versionId
        )
      ) {
        instancesByVersion.set(
          versionId,
          []
        );
      }

      instancesByVersion
        .get(versionId)
        .push(question);
    }

    const versionStatistics =
      versions
        .map((version) =>
          buildVersionStatistics({
            version,
            values:
              valuesByVersion.get(
                version._id.toString()
              ) || [],
            questionInstances:
              instancesByVersion.get(
                version._id.toString()
              ) || [],
            responseCountBySurvey,
            currentVersionId:
              questionItem.currentVersionId,
          })
        )
        .sort(
          (left, right) =>
            left.versionNumber -
            right.versionNumber
        );

    const surveyMap = new Map(
      ownedSurveys.map((survey) => [
        survey._id.toString(),
        survey,
      ])
    );

    const surveyStatisticsMap =
      new Map();

    for (
      const question
      of selectedQuestionInstances
    ) {
      const surveyId =
        question.surveyId.toString();

      if (
        !surveyStatisticsMap.has(
          surveyId
        )
      ) {
        const survey =
          surveyMap.get(surveyId);

        surveyStatisticsMap.set(
          surveyId,
          {
            id: surveyId,
            title: survey?.title || null,
            status:
              survey?.status || null,
            responseCount:
              responseCountBySurvey.get(
                surveyId
              ) || 0,
            questionInstanceCount: 0,
            questionVersionIds: [],
          }
        );
      }

      const summary =
        surveyStatisticsMap.get(
          surveyId
        );

      summary.questionInstanceCount += 1;

      const versionId =
        question.questionVersionId
          ?.toString();

      if (
        versionId &&
        !summary.questionVersionIds
          .includes(versionId)
      ) {
        summary.questionVersionIds.push(
          versionId
        );
      }
    }

    const surveys = [
      ...surveyStatisticsMap.values(),
    ].sort((left, right) =>
      left.id.localeCompare(right.id)
    );

    const responseCount =
      selectedSurveyIdStrings.reduce(
        (total, surveyId) =>
          total +
          (
            responseCountBySurvey.get(
              surveyId
            ) || 0
          ),
        0
      );

    const answerOpportunityCount =
      selectedQuestionInstances.reduce(
        (total, question) =>
          total +
          (
            responseCountBySurvey.get(
              question.surveyId.toString()
            ) || 0
          ),
        0
      );

    const totalAnswers =
      versionStatistics.reduce(
        (total, statistics) =>
          total +
          statistics.totalAnswers,
        0
      );

    return res.status(200).json({
      questionItem: {
        id: questionItem._id.toString(),
        currentVersionId:
          questionItem.currentVersionId
            ?.toString() || null,
        latestVersionNumber:
          questionItem.latestVersionNumber,
        status: questionItem.status,
      },
      filter: {
        questionVersionId:
          requestedVersionId || null,
        ownedSurveysOnly: true,
      },
      summary: {
        surveyCount: surveys.length,
        questionInstanceCount:
          selectedQuestionInstances.length,
        responseCount,
        answerOpportunityCount,
        totalAnswers,
        notAnsweredCount: Math.max(
          answerOpportunityCount -
            totalAnswers,
          0
        ),
        versionCount:
          versionStatistics.length,
      },
      surveys,
      versions: versionStatistics,
    });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return next(error);
  }
}

module.exports = {
  getCrossSurveyStatistics,
};