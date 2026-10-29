const mongoose = require('mongoose');

const {
  Survey,
  Question,
  QuestionItem,
  QuestionVersion,
} = require('../models');

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
    const error = new Error(
      `${field} 必须是 1 至 ${maximum} 之间的整数`
    );

    error.status = 400;
    throw error;
  }

  return number;
}

async function getQuestionItemUsage(
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
          '可复用题目不存在或不属于当前用户',
      });
    }

    const questionItem =
      await QuestionItem.findOne({
        _id: req.params.questionItemId,
        ownerId: req.user.id,
      }).lean();

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

    const ownedSurveys = await Survey.find({
      ownerId: req.user.id,
    })
      .select(
        '_id title status publicId createdAt'
      )
      .lean();

    const ownedSurveyIds =
      ownedSurveys.map(
        (survey) => survey._id
      );

    const filter = {
      questionItemId: questionItem._id,
      surveyId: {
        $in: ownedSurveyIds,
      },
    };

    const [
      total,
      usages,
      allUsageReferences,
    ] = await Promise.all([
      Question.countDocuments(filter),

      Question.find(filter)
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Question.find(filter)
        .select(
          'surveyId questionVersionId'
        )
        .lean(),
    ]);

    const surveyMap = new Map(
      ownedSurveys.map(
        (survey) => [
          survey._id.toString(),
          survey,
        ]
      )
    );

    const versionIds = [
      ...new Set(
        allUsageReferences
          .map(
            (usage) =>
              usage.questionVersionId
                ?.toString()
          )
          .filter(Boolean)
      ),
    ];

    const versions =
      await QuestionVersion.find({
        _id: {
          $in: versionIds,
        },
        questionItemId: questionItem._id,
      })
        .select(
          '_id versionNumber title createdAt'
        )
        .lean();

    const versionMap = new Map(
      versions.map(
        (version) => [
          version._id.toString(),
          version,
        ]
      )
    );

    const versionUsageCounts = new Map();

    for (const usage of allUsageReferences) {
      const versionId =
        usage.questionVersionId
          ?.toString();

      if (!versionId) {
        continue;
      }

      versionUsageCounts.set(
        versionId,
        (
          versionUsageCounts.get(
            versionId
          ) || 0
        ) + 1
      );
    }

    const surveyCount = new Set(
      allUsageReferences.map(
        (usage) =>
          usage.surveyId.toString()
      )
    ).size;

    const versionSummary = [
      ...versionUsageCounts.entries(),
    ]
      .map(([versionId, usageCount]) => {
        const version =
          versionMap.get(versionId);

        return {
          questionVersionId: versionId,
          versionNumber:
            version?.versionNumber ?? null,
          title: version?.title ?? null,
          usageCount,
          isCurrentVersion:
            questionItem.currentVersionId
              ?.toString() === versionId,
        };
      })
      .sort(
        (left, right) =>
          (left.versionNumber || 0) -
          (right.versionNumber || 0)
      );

    const serializedUsages =
      usages.map((usage) => {
        const survey = surveyMap.get(
          usage.surveyId.toString()
        );

        const version = versionMap.get(
          usage.questionVersionId
            ?.toString()
        );

        return {
          questionId:
            usage._id.toString(),
          order: usage.order,
          required: usage.required,
          snapshot: {
            type: usage.type,
            title: usage.title,
          },
          questionVersion: {
            id:
              usage.questionVersionId
                ?.toString() || null,
            versionNumber:
              version?.versionNumber ?? null,
            title:
              version?.title ?? null,
          },
          contentSource:
            usage.contentSource,
          schemaVersion:
            usage.schemaVersion,
          survey: survey
            ? {
                id: survey._id.toString(),
                title: survey.title,
                status: survey.status,
                publicId: survey.publicId,
              }
            : null,
          createdAt: usage.createdAt,
        };
      });

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
      summary: {
        usageCount: total,
        surveyCount,
        versions: versionSummary,
      },
      usages: serializedUsages,
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
    if (error.status === 400) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return next(error);
  }
}

module.exports = {
  getQuestionItemUsage,
};