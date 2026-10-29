'use strict';

require('dotenv').config({
  quiet: true,
});

const mongoose = require('mongoose');

const {
  Survey,
  Question,
  Response,
  QuestionItem,
  QuestionVersion,
  QuestionShare,
  QuestionBank,
  SchemaMigration,
} = require('../src/models');

const MIGRATION_NAME =
  'stage2-question-versioning-v1';

const PROTECTED_DATABASES = new Set([
  'admin',
  'config',
  'local',
]);

function getDatabaseNameFromUri(uri) {
  const withoutQuery = uri.split('?')[0];
  const slashIndex = withoutQuery.lastIndexOf('/');

  if (slashIndex < 0) {
    return '';
  }

  return decodeURIComponent(
    withoutQuery.slice(slashIndex + 1).trim()
  );
}

function parseArguments() {
  const args = process.argv.slice(2);

  const applyMode = args.includes('--apply');
  const explicitDryRun =
    args.includes('--dry-run');

  if (applyMode && explicitDryRun) {
    throw new Error(
      '不能同时使用 --apply 和 --dry-run'
    );
  }

  const uriArguments = args.filter((arg) =>
    arg.startsWith('--uri=')
  );

  if (uriArguments.length > 1) {
    throw new Error('只能提供一个 --uri 参数');
  }

  const unknownArguments = args.filter(
    (arg) =>
      arg !== '--apply' &&
      arg !== '--dry-run' &&
      !arg.startsWith('--uri=')
  );

  if (unknownArguments.length > 0) {
    throw new Error(
      `无法识别的参数：${unknownArguments.join(', ')}`
    );
  }

  const argumentUri = uriArguments[0]
    ? uriArguments[0].slice('--uri='.length)
    : '';

  const mongoUri = (
    argumentUri ||
    process.env.MIGRATION_MONGODB_URI ||
    process.env.MONGODB_URI ||
    ''
  ).trim();

  if (!mongoUri) {
    throw new Error(
      '缺少数据库连接，请设置 MONGODB_URI，' +
        '或使用 --uri=...'
    );
  }

  const requestedDatabaseName =
    getDatabaseNameFromUri(mongoUri);

  if (!requestedDatabaseName) {
    throw new Error(
      '连接字符串必须显式包含目标数据库名称'
    );
  }

  if (
    PROTECTED_DATABASES.has(
      requestedDatabaseName
    )
  ) {
    throw new Error(
      `禁止迁移系统数据库：${requestedDatabaseName}`
    );
  }

  return {
    applyMode,
    mongoUri,
    requestedDatabaseName,
  };
}

function idString(value) {
  return value ? value.toString() : '';
}

function normalizeValidation(type, source) {
  const raw = source || {};

  const fieldsByType = {
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

  const result = {};

  for (const field of fieldsByType[type] || []) {
    if (raw[field] !== undefined) {
      result[field] = raw[field];
    }
  }

  return result;
}

function copyOptions(options) {
  return (options || []).map((option) => ({
    optionId: option.optionId,
    label: option.label,
  }));
}

function isQuestionMigrated(question) {
  return Boolean(
    question.questionItemId &&
      question.questionVersionId &&
      question.contentSource &&
      Number(question.schemaVersion) >= 2
  );
}

function isResponseMigrated(response) {
  return Boolean(
    Number(response.schemaVersion) >= 2 &&
      (response.answers || []).every(
        (answer) =>
          answer.questionItemId &&
          answer.questionVersionId
      )
  );
}

function addError(
  errorDetails,
  sourceType,
  sourceId,
  message
) {
  errorDetails.push({
    sourceType,
    sourceId: idString(sourceId),
    message,
  });
}

function createCounters() {
  return {
    questions: {
      processed: 0,
      skipped: 0,
      failed: 0,
    },
    responses: {
      processed: 0,
      skipped: 0,
      failed: 0,
    },
    surveys: {
      processed: 0,
      skipped: 0,
      failed: 0,
    },
  };
}

function sumCounter(counters, field) {
  return Object.values(counters).reduce(
    (total, counter) =>
      total + counter[field],
    0
  );
}

async function inspectMigrationState() {
  const [
    usersCount,
    surveys,
    questions,
    responses,
    questionItemsCount,
    questionVersionsCount,
  ] = await Promise.all([
    mongoose.connection.db
      .collection('users')
      .countDocuments({}),
    Survey.find({}).lean(),
    Question.find({}).lean(),
    Response.find({}).lean(),
    QuestionItem.countDocuments({}),
    QuestionVersion.countDocuments({}),
  ]);

  const surveyById = new Map(
    surveys.map((survey) => [
      idString(survey._id),
      survey,
    ])
  );

  const questionById = new Map(
    questions.map((question) => [
      idString(question._id),
      question,
    ])
  );

  const issues = [];

  for (const question of questions) {
    if (
      !surveyById.has(
        idString(question.surveyId)
      )
    ) {
      addError(
        issues,
        'Question',
        question._id,
        '找不到所属问卷'
      );
    }

    for (const rule of question.jumpRules || []) {
      if (
        rule.action !== 'goto' ||
        !rule.targetQuestionId
      ) {
        continue;
      }

      const targetQuestion =
        questionById.get(
          idString(rule.targetQuestionId)
        );

      if (!targetQuestion) {
        addError(
          issues,
          'Question',
          question._id,
          `跳转目标不存在：${rule.targetQuestionId}`
        );
        continue;
      }

      if (
        idString(targetQuestion.surveyId) !==
        idString(question.surveyId)
      ) {
        addError(
          issues,
          'Question',
          question._id,
          '跳转目标不属于同一问卷'
        );
      }
    }
  }

  for (const response of responses) {
    for (const answer of response.answers || []) {
      if (
        !questionById.has(
          idString(answer.questionId)
        )
      ) {
        addError(
          issues,
          'Response',
          response._id,
          `答案引用的题目不存在：${answer.questionId}`
        );
      }
    }

    for (
      const questionId of
      response.visitedQuestionIds || []
    ) {
      if (
        !questionById.has(
          idString(questionId)
        )
      ) {
        addError(
          issues,
          'Response',
          response._id,
          `填写路径中的题目不存在：${questionId}`
        );
      }
    }
  }

  return {
    baseline: {
      users: usersCount,
      surveys: surveys.length,
      questions: questions.length,
      responses: responses.length,
      questionItems: questionItemsCount,
      questionVersions:
        questionVersionsCount,
    },
    estimatedChanges: {
      questionsToMigrate:
        questions.filter(
          (question) =>
            !isQuestionMigrated(question)
        ).length,
      responsesToMigrate:
        responses.filter(
          (response) =>
            !isResponseMigrated(response)
        ).length,
      surveysToUpgrade:
        surveys.filter(
          (survey) =>
            Number(
              survey.schemaVersion || 1
            ) < 2
        ).length,
    },
    issueCount: issues.length,
    issues,
  };
}

async function ensureIndexes() {
  await Promise.all([
    QuestionItem.init(),
    QuestionVersion.init(),
    QuestionShare.init(),
    QuestionBank.init(),
    SchemaMigration.init(),
    Question.init(),
    Response.init(),
  ]);
}

async function getOrCreateQuestionItem(
  question,
  ownerId
) {
  let item = await QuestionItem.findOne({
    legacyQuestionId: question._id,
  });

  if (!item && question.questionItemId) {
    item = await QuestionItem.findById(
      question.questionItemId
    );
  }

  if (!item) {
    item =
      await QuestionItem.findOneAndUpdate(
        {
          legacyQuestionId: question._id,
        },
        {
          $setOnInsert: {
            ownerId,
            currentVersionId: null,
            latestVersionNumber: 0,
            status: 'active',
            legacyQuestionId:
              question._id,
            schemaVersion: 1,
          },
        },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true,
          runValidators: true,
        }
      );
  }

  if (
    idString(item.ownerId) !==
    idString(ownerId)
  ) {
    throw new Error(
      '逻辑题目所有者与问卷所有者不一致'
    );
  }

  return item;
}

async function getOrCreateVersionOne(
  question,
  item,
  ownerId
) {
  if (question.questionVersionId) {
    const referencedVersion =
      await QuestionVersion.findById(
        question.questionVersionId
      );

    if (referencedVersion) {
      if (
        idString(
          referencedVersion.questionItemId
        ) !== idString(item._id)
      ) {
        throw new Error(
          '现有题目版本不属于当前逻辑题目'
        );
      }

      return referencedVersion;
    }
  }

  return QuestionVersion.findOneAndUpdate(
    {
      questionItemId: item._id,
      versionNumber: 1,
    },
    {
      $setOnInsert: {
        questionItemId: item._id,
        versionNumber: 1,
        parentVersionId: null,
        restoredFromVersionId: null,
        createdByUserId: ownerId,
        changeNote:
          '第一阶段旧题迁移生成的 v1',
        type: question.type,
        title: question.title,
        options: copyOptions(
          question.options
        ),
        validation: normalizeValidation(
          question.type,
          question.validation
        ),
        schemaVersion: 1,
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );
}

async function migrateQuestions(
  counters,
  errorDetails
) {
  const questions = await Question.find({})
    .sort({
      createdAt: 1,
      _id: 1,
    })
    .lean();

  const surveys = await Survey.find({})
    .select('_id ownerId')
    .lean();

  const surveyById = new Map(
    surveys.map((survey) => [
      idString(survey._id),
      survey,
    ])
  );

  const questionMapping = new Map();

  for (const question of questions) {
    if (isQuestionMigrated(question)) {
      counters.questions.skipped += 1;

      questionMapping.set(
        idString(question._id),
        {
          questionItemId:
            question.questionItemId,
          questionVersionId:
            question.questionVersionId,
        }
      );

      continue;
    }

    try {
      const survey = surveyById.get(
        idString(question.surveyId)
      );

      if (!survey) {
        throw new Error(
          '找不到所属问卷'
        );
      }

      const item =
        await getOrCreateQuestionItem(
          question,
          survey.ownerId
        );

      const version =
        await getOrCreateVersionOne(
          question,
          item,
          survey.ownerId
        );

      await QuestionItem.updateOne(
        {
          _id: item._id,
        },
        {
          $max: {
            latestVersionNumber: 1,
          },
        }
      );

      await QuestionItem.updateOne(
        {
          _id: item._id,
          currentVersionId: null,
        },
        {
          $set: {
            currentVersionId:
              version._id,
          },
        }
      );

      await Question.updateOne(
        {
          _id: question._id,
        },
        {
          $set: {
            questionItemId: item._id,
            questionVersionId:
              version._id,
            contentSource: 'legacy',
            schemaVersion: 2,
          },
        },
        {
          runValidators: true,
        }
      );

      questionMapping.set(
        idString(question._id),
        {
          questionItemId: item._id,
          questionVersionId:
            version._id,
        }
      );

      counters.questions.processed += 1;
    } catch (error) {
      counters.questions.failed += 1;

      addError(
        errorDetails,
        'Question',
        question._id,
        error.message
      );
    }
  }

  return questionMapping;
}

async function migrateResponses(
  questionMapping,
  counters,
  errorDetails
) {
  const responses = await Response.find({})
    .sort({
      createdAt: 1,
      _id: 1,
    })
    .lean();

  for (const response of responses) {
    if (isResponseMigrated(response)) {
      counters.responses.skipped += 1;
      continue;
    }

    try {
      const migratedAnswers = [];

      for (
        const answer of
        response.answers || []
      ) {
        let mapping = questionMapping.get(
          idString(answer.questionId)
        );

        if (!mapping) {
          const question =
            await Question.findById(
              answer.questionId
            )
              .select(
                'questionItemId ' +
                  'questionVersionId'
              )
              .lean();

          if (
            question?.questionItemId &&
            question?.questionVersionId
          ) {
            mapping = {
              questionItemId:
                question.questionItemId,
              questionVersionId:
                question.questionVersionId,
            };
          }
        }

        if (!mapping) {
          throw new Error(
            '无法映射答案题目：' +
              answer.questionId
          );
        }

        migratedAnswers.push({
          ...answer,
          questionItemId:
            answer.questionItemId ||
            mapping.questionItemId,
          questionVersionId:
            answer.questionVersionId ||
            mapping.questionVersionId,
        });
      }

      await Response.updateOne(
        {
          _id: response._id,
        },
        {
          $set: {
            answers: migratedAnswers,
            schemaVersion: 2,
          },
        },
        {
          runValidators: true,
        }
      );

      counters.responses.processed += 1;
    } catch (error) {
      counters.responses.failed += 1;

      addError(
        errorDetails,
        'Response',
        response._id,
        error.message
      );
    }
  }
}

async function migrateSurveys(
  counters,
  errorDetails
) {
  const surveys = await Survey.find({})
    .sort({
      createdAt: 1,
      _id: 1,
    })
    .lean();

  for (const survey of surveys) {
    if (
      Number(
        survey.schemaVersion || 1
      ) >= 2
    ) {
      counters.surveys.skipped += 1;
      continue;
    }

    try {
      const totalQuestions =
        await Question.countDocuments({
          surveyId: survey._id,
        });

      const migratedQuestions =
        await Question.countDocuments({
          surveyId: survey._id,
          questionItemId: {
            $ne: null,
          },
          questionVersionId: {
            $ne: null,
          },
          schemaVersion: {
            $gte: 2,
          },
        });

      if (
        totalQuestions !==
        migratedQuestions
      ) {
        throw new Error(
          '问卷题目未全部迁移：' +
            `${migratedQuestions}/` +
            totalQuestions
        );
      }

      await Survey.updateOne(
        {
          _id: survey._id,
        },
        {
          $set: {
            schemaVersion: 2,
          },
        }
      );

      counters.surveys.processed += 1;
    } catch (error) {
      counters.surveys.failed += 1;

      addError(
        errorDetails,
        'Survey',
        survey._id,
        error.message
      );
    }
  }
}

async function prepareMigrationRecord() {
  let migration =
    await SchemaMigration.findOne({
      name: MIGRATION_NAME,
    });

  const previouslyCompleted =
    migration?.status === 'completed';

  if (!migration) {
    migration =
      await SchemaMigration.create({
        name: MIGRATION_NAME,
        status: 'running',
        startedAt: new Date(),
      });
  } else {
    migration.status = 'running';
    migration.startedAt = new Date();
    migration.completedAt = null;
    migration.processedCount = 0;
    migration.skippedCount = 0;
    migration.failedCount = 0;
    migration.errorDetails = [];

    await migration.save();
  }

  return {
    migration,
    previouslyCompleted,
  };
}

async function applyMigration() {
  await ensureIndexes();

  const {
    migration,
    previouslyCompleted,
  } = await prepareMigrationRecord();

  const counters = createCounters();
  const errorDetails = [];

  try {
    const questionMapping =
      await migrateQuestions(
        counters,
        errorDetails
      );

    await migrateResponses(
      questionMapping,
      counters,
      errorDetails
    );

    await migrateSurveys(
      counters,
      errorDetails
    );

    migration.processedCount =
      sumCounter(
        counters,
        'processed'
      );

    migration.skippedCount =
      sumCounter(
        counters,
        'skipped'
      );

    migration.failedCount =
      sumCounter(
        counters,
        'failed'
      );

    migration.errorDetails =
      errorDetails.slice(0, 100);

    if (migration.failedCount > 0) {
      migration.status = 'failed';
      migration.completedAt = null;
    } else {
      migration.status = 'completed';
      migration.completedAt =
        new Date();
    }

    await migration.save();

    return {
      previouslyCompleted,
      status: migration.status,
      counters,
      errorDetails,
    };
  } catch (error) {
    migration.status = 'failed';
    migration.completedAt = null;
    migration.failedCount += 1;

    migration.errorDetails = [
      ...errorDetails,
      {
        sourceType: 'Migration',
        sourceId: MIGRATION_NAME,
        message: error.message,
      },
    ].slice(0, 100);

    await migration.save();

    throw error;
  }
}

async function main() {
  const {
    applyMode,
    mongoUri,
    requestedDatabaseName,
  } = parseArguments();

  await mongoose.connect(mongoUri, {
    autoCreate: applyMode,
    autoIndex: applyMode,
    serverSelectionTimeoutMS: 5000,
  });

  const connectedDatabaseName = (
    mongoose.connection.name || ''
  ).trim();

  if (!connectedDatabaseName) {
    throw new Error(
      '连接后的数据库名称为空'
    );
  }

  if (
    connectedDatabaseName !==
    requestedDatabaseName
  ) {
    throw new Error(
      '连接后的数据库名称与连接字符串不一致：' +
        `${connectedDatabaseName} / ` +
        requestedDatabaseName
    );
  }

  console.log(
    JSON.stringify(
      {
        migration: MIGRATION_NAME,
        mode: applyMode
          ? 'apply'
          : 'dry-run',
        host: mongoose.connection.host,
        database:
          connectedDatabaseName,
      },
      null,
      2
    )
  );

  const inspection =
    await inspectMigrationState();

  console.log(
    '迁移前检查：',
    JSON.stringify(
      inspection,
      null,
      2
    )
  );

  if (!applyMode) {
    console.log(
      'dry-run 完成：没有写入或修改任何数据。'
    );

    console.log(
      '确认结果后，显式添加 --apply 才会执行迁移。'
    );

    return;
  }

  if (inspection.issueCount > 0) {
    throw new Error(
      '迁移前检查发现数据引用问题，已拒绝写入。'
    );
  }

  const result =
    await applyMigration();

  console.log(
    '迁移执行结果：',
    JSON.stringify(
      result,
      null,
      2
    )
  );

  if (result.status !== 'completed') {
    throw new Error(
      '迁移存在失败记录，请检查 errorDetails。'
    );
  }
}

main()
  .catch((error) => {
    console.error(
      '迁移失败：',
      error.message
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    if (
      mongoose.connection.readyState !== 0
    ) {
      await mongoose.disconnect();
    }
  });