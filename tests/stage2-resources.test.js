const request = require('supertest');

const api = request(
  'http://127.0.0.1:3101'
);

const PASSWORD = 'Test123456!';

jest.setTimeout(60000);

let usernameSequence = 0;

function uniqueUsername(prefix) {
  usernameSequence += 1;

  return (
    `${prefix}_` +
    `${Date.now().toString(36)}_` +
    `${usernameSequence}`
  );
}

function authorization(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

async function registerAndLogin(prefix) {
  const username = uniqueUsername(prefix);

  await api
    .post('/api/auth/register')
    .send({
      username,
      password: PASSWORD,
    })
    .expect(201);

  const loginResponse = await api
    .post('/api/auth/login')
    .send({
      username,
      password: PASSWORD,
    })
    .expect(200);

  return {
    username,
    token: loginResponse.body.token,
  };
}

async function createSurvey(
  token,
  title = '第二阶段自动测试问卷'
) {
  const response = await api
    .post('/api/surveys')
    .set(authorization(token))
    .send({
      title,
      description:
        'AI-031 第二阶段自动化测试',
      allowAnonymous: false,
      allowMultipleSubmissions: false,
    })
    .expect(201);

  return response.body.survey;
}

async function publishSurvey(
  token,
  surveyId
) {
  const response = await api
    .post(
      `/api/surveys/${surveyId}/publish`
    )
    .set(authorization(token))
    .expect(200);

  return response.body.survey;
}

async function closeSurvey(
  token,
  surveyId
) {
  const response = await api
    .post(
      `/api/surveys/${surveyId}/close`
    )
    .set(authorization(token))
    .expect(200);

  return response.body.survey;
}

async function createQuestionItem(
  token,
  title = 'AI-031 可复用单选题'
) {
  const response = await api
    .post('/api/question-items')
    .set(authorization(token))
    .send({
      type: 'singleChoice',
      title,
      options: [
        {
          label: '选项 A',
        },
        {
          label: '选项 B',
        },
      ],
      changeNote: '创建自动测试初始版本',
    })
    .expect(201);

  return {
    item: response.body.questionItem,
    version:
      response.body.questionItem.currentVersion,
  };
}

async function createQuestionVersion(
  token,
  questionItemId,
  title
) {
  const response = await api
    .post(
      `/api/question-items/` +
        `${questionItemId}/versions`
    )
    .set(authorization(token))
    .send({
      title,
      changeNote: '创建自动测试新版本',
    })
    .expect(201);

  return {
    item: response.body.questionItem,
    version: response.body.version,
  };
}

async function restoreQuestionVersion(
  token,
  questionItemId,
  versionId
) {
  const response = await api
    .post(
      `/api/question-items/` +
        `${questionItemId}/versions/` +
        `${versionId}/restore`
    )
    .set(authorization(token))
    .send({
      changeNote: '自动测试恢复历史版本',
    })
    .expect(201);

  return {
    item: response.body.questionItem,
    version: response.body.version,
    restoredFromVersionId:
      response.body.restoredFromVersionId,
  };
}

async function addVersionToSurvey({
  token,
  surveyId,
  questionItemId,
  questionVersionId,
  required = false,
}) {
  const response = await api
    .post(
      `/api/surveys/${surveyId}` +
        '/questions/from-library'
    )
    .set(authorization(token))
    .send({
      questionItemId,
      questionVersionId,
      required,
    })
    .expect(201);

  return response.body.question;
}

async function getSurveyQuestions(
  token,
  surveyId
) {
  const response = await api
    .get(
      `/api/surveys/${surveyId}/questions`
    )
    .set(authorization(token))
    .expect(200);

  return response.body.questions;
}

async function shareQuestionItem(
  token,
  questionItemId,
  username,
  expectedStatus = 201
) {
  const response = await api
    .post(
      `/api/question-items/` +
        `${questionItemId}/shares`
    )
    .set(authorization(token))
    .send({
      username,
    })
    .expect(expectedStatus);

  return response.body;
}

async function submitSurvey({
  token,
  publicId,
  answers,
}) {
  return api
    .post(
      `/api/public/surveys/${publicId}` +
        '/responses'
    )
    .set(authorization(token))
    .send({
      anonymous: false,
      answers,
    })
    .expect(201);
}

describe(
  '第二阶段题目资源管理 API',
  () => {
    test(
      '可复用题目创建新版本并通过复制生成恢复版本',
      async () => {
        const owner =
          await registerAndLogin('s2ver');

        const created =
          await createQuestionItem(
            owner.token,
            'AI-031 版本 v1'
          );

        const questionItemId =
          created.item.id;
        const v1 = created.version;

        expect(v1.versionNumber).toBe(1);
        expect(v1.parentVersionId).toBeNull();
        expect(
          v1.restoredFromVersionId
        ).toBeNull();

        const createdV2 =
          await createQuestionVersion(
            owner.token,
            questionItemId,
            'AI-031 版本 v2'
          );

        const v2 = createdV2.version;

        expect(v2.versionNumber).toBe(2);
        expect(v2.parentVersionId).toBe(
          v1.id
        );
        expect(
          v2.restoredFromVersionId
        ).toBeNull();

        expect(
          v2.options.map(
            (option) => option.optionId
          )
        ).toEqual(
          v1.options.map(
            (option) => option.optionId
          )
        );

        const restored =
          await restoreQuestionVersion(
            owner.token,
            questionItemId,
            v1.id
          );

        const v3 = restored.version;

        expect(v3.versionNumber).toBe(3);
        expect(v3.parentVersionId).toBe(
          v2.id
        );
        expect(
          v3.restoredFromVersionId
        ).toBe(v1.id);
        expect(
          restored.restoredFromVersionId
        ).toBe(v1.id);
        expect(v3.title).toBe(v1.title);

        expect(
          restored.item.currentVersionId
        ).toBe(v3.id);

        const historyResponse = await api
          .get(
            `/api/question-items/` +
              `${questionItemId}/versions` +
              '?page=1&limit=20'
          )
          .set(authorization(owner.token))
          .expect(200);

        expect(
          historyResponse.body.pagination
            .total
        ).toBe(3);

        expect(
          historyResponse.body
            .latestVersionNumber
        ).toBe(3);

        expect(
          historyResponse.body
            .currentVersionId
        ).toBe(v3.id);

        const history =
          historyResponse.body.versions;

        const storedV1 = history.find(
          (version) =>
            version.versionNumber === 1
        );

        const storedV2 = history.find(
          (version) =>
            version.versionNumber === 2
        );

        const storedV3 = history.find(
          (version) =>
            version.versionNumber === 3
        );

        expect(storedV1.title).toBe(
          'AI-031 版本 v1'
        );

        expect(storedV2.title).toBe(
          'AI-031 版本 v2'
        );

        expect(
          storedV3.restoredFromVersionId
        ).toBe(v1.id);
      }
    );

    test(
      '指定历史版本加入问卷并正确返回使用情况',
      async () => {
        const owner =
          await registerAndLogin('s2use');

        const created =
          await createQuestionItem(
            owner.token,
            'AI-031 入卷 v1'
          );

        const questionItemId =
          created.item.id;
        const v1 = created.version;

        const createdV2 =
          await createQuestionVersion(
            owner.token,
            questionItemId,
            'AI-031 入卷 v2'
          );

        const v2 = createdV2.version;

        const survey = await createSurvey(
          owner.token,
          'AI-031 指定版本入卷'
        );

        const questionV1 =
          await addVersionToSurvey({
            token: owner.token,
            surveyId: survey.id,
            questionItemId,
            questionVersionId: v1.id,
            required: true,
          });

        const questionV2 =
          await addVersionToSurvey({
            token: owner.token,
            surveyId: survey.id,
            questionItemId,
            questionVersionId: v2.id,
            required: false,
          });

        expect(
          questionV1.questionItemId
        ).toBe(questionItemId);

        expect(
          questionV1.questionVersionId
        ).toBe(v1.id);

        expect(
          questionV1.contentSource
        ).toBe('library');

        expect(questionV1.schemaVersion).toBe(
          2
        );

        expect(questionV1.required).toBe(
          true
        );

        expect(questionV1.title).toBe(
          v1.title
        );

        expect(
          questionV1.options
        ).toEqual(v1.options);

        expect(
          questionV2.questionVersionId
        ).toBe(v2.id);

        expect(questionV2.title).toBe(
          v2.title
        );

        await createQuestionVersion(
          owner.token,
          questionItemId,
          'AI-031 入卷 v3'
        );

        const questions =
          await getSurveyQuestions(
            owner.token,
            survey.id
          );

        const storedV1 = questions.find(
          (question) =>
            question.id === questionV1.id
        );

        const storedV2 = questions.find(
          (question) =>
            question.id === questionV2.id
        );

        expect(storedV1.title).toBe(
          'AI-031 入卷 v1'
        );

        expect(
          storedV1.questionVersionId
        ).toBe(v1.id);

        expect(storedV2.title).toBe(
          'AI-031 入卷 v2'
        );

        expect(
          storedV2.questionVersionId
        ).toBe(v2.id);

        const usageResponse = await api
          .get(
            `/api/question-items/` +
              `${questionItemId}/usage`
          )
          .set(authorization(owner.token))
          .expect(200);

        expect(
          usageResponse.body.summary
            .usageCount
        ).toBe(2);

        expect(
          usageResponse.body.summary
            .surveyCount
        ).toBe(1);

        expect(
          usageResponse.body.usages
        ).toHaveLength(2);

        expect(
          usageResponse.body.summary
            .versions
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              questionVersionId: v1.id,
              usageCount: 1,
            }),
            expect.objectContaining({
              questionVersionId: v2.id,
              usageCount: 1,
            }),
          ])
        );

        const usageJson = JSON.stringify(
          usageResponse.body
        );

        expect(usageJson).not.toContain(
          'respondentId'
        );

        expect(usageJson).not.toContain(
          'uniqueSubmissionKey'
        );
      }
    );

    test(
      '共享支持接收者复用、软撤销和重新激活',
      async () => {
        const owner =
          await registerAndLogin('s2shareo');

        const receiver =
          await registerAndLogin('s2sharer');

        const created =
          await createQuestionItem(
            owner.token,
            'AI-031 共享题目'
          );

        const questionItemId =
          created.item.id;
        const v1 = created.version;

        const shareCreated =
          await shareQuestionItem(
            owner.token,
            questionItemId,
            receiver.username,
            201
          );

        expect(shareCreated.action).toBe(
          'created'
        );

        expect(
          shareCreated.share.permission
        ).toBe('use');

        expect(
          shareCreated.share.status
        ).toBe('active');

        const shareId =
          shareCreated.share.id;

        const repeatedShare =
          await shareQuestionItem(
            owner.token,
            questionItemId,
            receiver.username,
            200
          );

        expect(repeatedShare.action).toBe(
          'alreadyActive'
        );

        expect(repeatedShare.share.id).toBe(
          shareId
        );

        const receivedResponse = await api
          .get(
            '/api/question-items/' +
              'received-shares'
          )
          .set(
            authorization(receiver.token)
          )
          .expect(200);

        expect(
          receivedResponse.body.items.some(
            (item) =>
              item.questionItem.id ===
              questionItemId
          )
        ).toBe(true);

        const receivedVersions =
          await api
            .get(
              '/api/question-items/' +
                'received-shares/' +
                `${questionItemId}/versions`
            )
            .set(
              authorization(receiver.token)
            )
            .expect(200);

        expect(
          receivedVersions.body.versions
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: v1.id,
              versionNumber: 1,
            }),
          ])
        );

        const receiverSurvey =
          await createSurvey(
            receiver.token,
            'AI-031 接收者问卷'
          );

        const reusedQuestion =
          await addVersionToSurvey({
            token: receiver.token,
            surveyId: receiverSurvey.id,
            questionItemId,
            questionVersionId: v1.id,
          });

        expect(
          reusedQuestion.questionVersionId
        ).toBe(v1.id);

        expect(reusedQuestion.title).toBe(
          v1.title
        );

        const revokeResponse = await api
          .delete(
            `/api/question-items/` +
              `${questionItemId}/shares/` +
              `${shareId}`
          )
          .set(authorization(owner.token))
          .expect(200);

        expect(
          revokeResponse.body.action
        ).toBe('revoked');

        expect(
          revokeResponse.body.share.status
        ).toBe('revoked');

        const receivedAfterRevoke =
          await api
            .get(
              '/api/question-items/' +
                'received-shares'
            )
            .set(
              authorization(receiver.token)
            )
            .expect(200);

        expect(
          receivedAfterRevoke.body.items.some(
            (item) =>
              item.questionItem.id ===
              questionItemId
          )
        ).toBe(false);

        const secondReceiverSurvey =
          await createSurvey(
            receiver.token,
            'AI-031 撤销后复用测试'
          );

        await api
          .post(
            `/api/surveys/` +
              `${secondReceiverSurvey.id}` +
              '/questions/from-library'
          )
          .set(
            authorization(receiver.token)
          )
          .send({
            questionItemId,
            questionVersionId: v1.id,
            required: false,
          })
          .expect(404);

        const existingQuestions =
          await getSurveyQuestions(
            receiver.token,
            receiverSurvey.id
          );

        const existingSnapshot =
          existingQuestions.find(
            (question) =>
              question.id ===
              reusedQuestion.id
          );

        expect(existingSnapshot).toBeTruthy();

        expect(
          existingSnapshot
            .questionVersionId
        ).toBe(v1.id);

        expect(
          existingSnapshot.title
        ).toBe(v1.title);

        const reactivated =
          await shareQuestionItem(
            owner.token,
            questionItemId,
            receiver.username,
            200
          );

        expect(reactivated.action).toBe(
          'reactivated'
        );

        expect(reactivated.share.id).toBe(
          shareId
        );

        expect(
          reactivated.share.status
        ).toBe('active');

        await addVersionToSurvey({
          token: receiver.token,
          surveyId: secondReceiverSurvey.id,
          questionItemId,
          questionVersionId: v1.id,
        });

        await api
          .post(
            `/api/question-items/` +
              `${questionItemId}/versions`
          )
          .set(
            authorization(receiver.token)
          )
          .send({
            title:
              '接收者不应创建新版本',
          })
          .expect(404);

        await api
          .delete(
            `/api/question-items/` +
              `${questionItemId}/shares/` +
              `${shareId}`
          )
          .set(
            authorization(receiver.token)
          )
          .expect(404);
      }
    );

    test(
      '题目库保存引用、推荐版本并从指定版本加入问卷',
      async () => {
        const owner =
          await registerAndLogin('s2bank');

        const created =
          await createQuestionItem(
            owner.token,
            'AI-031 题目库 v1'
          );

        const questionItemId =
          created.item.id;
        const v1 = created.version;

        const createdV2 =
          await createQuestionVersion(
            owner.token,
            questionItemId,
            'AI-031 题目库 v2'
          );

        const v2 = createdV2.version;

        const createBankResponse = await api
          .post('/api/question-banks')
          .set(authorization(owner.token))
          .send({
            name: 'AI-031 测试题目库',
            description: '创建时的说明',
          })
          .expect(201);

        const bankId =
          createBankResponse.body
            .questionBank.id;

        const listResponse = await api
          .get('/api/question-banks')
          .set(authorization(owner.token))
          .expect(200);

        expect(
          listResponse.body.questionBanks
            .some(
              (bank) => bank.id === bankId
            )
        ).toBe(true);

        const updateResponse = await api
          .patch(
            `/api/question-banks/${bankId}`
          )
          .set(authorization(owner.token))
          .send({
            name:
              'AI-031 已修改测试题目库',
            description: '修改后的说明',
          })
          .expect(200);

        expect(
          updateResponse.body.questionBank
            .name
        ).toBe(
          'AI-031 已修改测试题目库'
        );

        const addItemResponse = await api
          .post(
            `/api/question-banks/` +
              `${bankId}/items`
          )
          .set(authorization(owner.token))
          .send({
            questionItemId,
            preferredVersionId: v1.id,
          })
          .expect(201);

        const addedItem =
          addItemResponse.body.questionBank
            .items[0];

        expect(
          addedItem.questionItemId
        ).toBe(questionItemId);

        expect(
          addedItem.preferredVersionId
        ).toBe(v1.id);

        await api
          .post(
            `/api/question-banks/` +
              `${bankId}/items`
          )
          .set(authorization(owner.token))
          .send({
            questionItemId,
            preferredVersionId: v1.id,
          })
          .expect(409);

        const preferredResponse =
          await api
            .patch(
              `/api/question-banks/` +
                `${bankId}/items/` +
                `${questionItemId}/` +
                'preferred-version'
            )
            .set(
              authorization(owner.token)
            )
            .send({
              preferredVersionId: v2.id,
            })
            .expect(200);

        expect(
          preferredResponse.body
            .questionBank.items[0]
            .preferredVersionId
        ).toBe(v2.id);

        const survey = await createSurvey(
          owner.token,
          'AI-031 题库入卷问卷'
        );

        const addToSurveyResponse =
          await api
            .post(
              `/api/question-banks/` +
                `${bankId}/items/` +
                `${questionItemId}/` +
                'add-to-survey'
            )
            .set(
              authorization(owner.token)
            )
            .send({
              surveyId: survey.id,
              questionVersionId: v1.id,
              required: true,
            })
            .expect(201);

        const snapshot =
          addToSurveyResponse.body.question;

        expect(
          snapshot.questionVersionId
        ).toBe(v1.id);

        expect(snapshot.title).toBe(
          v1.title
        );

        expect(snapshot.required).toBe(
          true
        );

        expect(snapshot.contentSource).toBe(
          'library'
        );

        await api
          .delete(
            `/api/question-banks/` +
              `${bankId}/items/` +
              `${questionItemId}`
          )
          .set(authorization(owner.token))
          .expect(200);

        const bankDetailResponse =
          await api
            .get(
              `/api/question-banks/${bankId}`
            )
            .set(
              authorization(owner.token)
            )
            .expect(200);

        expect(
          bankDetailResponse.body
            .questionBank.items
        ).toHaveLength(0);

        const sourceResponse = await api
          .get(
            `/api/question-items/` +
              `${questionItemId}`
          )
          .set(authorization(owner.token))
          .expect(200);

        expect(
          sourceResponse.body.questionItem.id
        ).toBe(questionItemId);

        const historyResponse = await api
          .get(
            `/api/question-items/` +
              `${questionItemId}/versions`
          )
          .set(authorization(owner.token))
          .expect(200);

        expect(
          historyResponse.body.pagination
            .total
        ).toBe(2);

        const questions =
          await getSurveyQuestions(
            owner.token,
            survey.id
          );

        expect(
          questions.some(
            (question) =>
              question.id === snapshot.id &&
              question.questionVersionId ===
                v1.id
          )
        ).toBe(true);
      }
    );

    test(
      '跨问卷统计按本人问卷和题目版本隔离',
      async () => {
        const owner =
          await registerAndLogin('s2stato');

        const receiver =
          await registerAndLogin('s2statr');

        const filler =
          await registerAndLogin('s2fill');

        const created =
          await createQuestionItem(
            owner.token,
            'AI-031 统计 v1'
          );

        const questionItemId =
          created.item.id;
        const v1 = created.version;

        const createdV2 =
          await createQuestionVersion(
            owner.token,
            questionItemId,
            'AI-031 统计 v2'
          );

        const v2 = createdV2.version;

        const survey1 = await createSurvey(
          owner.token,
          'AI-031 统计问卷一'
        );

        const survey1V1 =
          await addVersionToSurvey({
            token: owner.token,
            surveyId: survey1.id,
            questionItemId,
            questionVersionId: v1.id,
            required: false,
          });

        await addVersionToSurvey({
          token: owner.token,
          surveyId: survey1.id,
          questionItemId,
          questionVersionId: v2.id,
          required: false,
        });

        const survey2 = await createSurvey(
          owner.token,
          'AI-031 统计问卷二'
        );

        const survey2V1 =
          await addVersionToSurvey({
            token: owner.token,
            surveyId: survey2.id,
            questionItemId,
            questionVersionId: v1.id,
            required: false,
          });

        const published1 =
          await publishSurvey(
            owner.token,
            survey1.id
          );

        const published2 =
          await publishSurvey(
            owner.token,
            survey2.id
          );

        await submitSurvey({
          token: filler.token,
          publicId: published1.publicId,
          answers: [
            {
              questionId: survey1V1.id,
              value:
                survey1V1.options[0]
                  .optionId,
            },
          ],
        });

        await submitSurvey({
          token: filler.token,
          publicId: published2.publicId,
          answers: [
            {
              questionId: survey2V1.id,
              value:
                survey2V1.options[1]
                  .optionId,
            },
          ],
        });

        await shareQuestionItem(
          owner.token,
          questionItemId,
          receiver.username,
          201
        );

        const receiverSurvey =
          await createSurvey(
            receiver.token,
            'AI-031 接收者统计问卷'
          );

        const receiverQuestion =
          await addVersionToSurvey({
            token: receiver.token,
            surveyId: receiverSurvey.id,
            questionItemId,
            questionVersionId: v1.id,
            required: false,
          });

        const receiverPublished =
          await publishSurvey(
            receiver.token,
            receiverSurvey.id
          );

        await submitSurvey({
          token: receiver.token,
          publicId:
            receiverPublished.publicId,
          answers: [
            {
              questionId:
                receiverQuestion.id,
              value:
                receiverQuestion.options[0]
                  .optionId,
            },
          ],
        });

        const statisticsResponse =
          await api
            .get(
              `/api/question-items/` +
                `${questionItemId}/` +
                'cross-survey-statistics'
            )
            .set(
              authorization(owner.token)
            )
            .expect(200);

        const summary =
          statisticsResponse.body.summary;

        expect(summary.surveyCount).toBe(2);

        expect(
          summary.questionInstanceCount
        ).toBe(3);

        expect(summary.responseCount).toBe(
          2
        );

        expect(
          summary.answerOpportunityCount
        ).toBe(3);

        expect(summary.totalAnswers).toBe(
          2
        );

        expect(
          summary.notAnsweredCount
        ).toBe(1);

        expect(summary.versionCount).toBe(
          2
        );

        const v1Statistics =
          statisticsResponse.body.versions.find(
            (version) =>
              version.questionVersionId ===
              v1.id
          );

        const v2Statistics =
          statisticsResponse.body.versions.find(
            (version) =>
              version.questionVersionId ===
              v2.id
          );

        expect(
          v1Statistics
            .questionInstanceCount
        ).toBe(2);

        expect(
          v1Statistics
            .answerOpportunityCount
        ).toBe(2);

        expect(
          v1Statistics.totalAnswers
        ).toBe(2);

        expect(
          v1Statistics.notAnsweredCount
        ).toBe(0);

        expect(
          v1Statistics.options.reduce(
            (total, option) =>
              total + option.count,
            0
          )
        ).toBe(2);

        expect(
          v2Statistics
            .questionInstanceCount
        ).toBe(1);

        expect(
          v2Statistics
            .answerOpportunityCount
        ).toBe(1);

        expect(
          v2Statistics.totalAnswers
        ).toBe(0);

        expect(
          v2Statistics.notAnsweredCount
        ).toBe(1);

        const ownerStatisticsJson =
          JSON.stringify(
            statisticsResponse.body
          );

        expect(
          ownerStatisticsJson
        ).not.toContain('respondentId');

        expect(
          ownerStatisticsJson
        ).not.toContain(
          'uniqueSubmissionKey'
        );

        expect(
          ownerStatisticsJson
        ).not.toContain(
          receiver.username
        );

        const filteredResponse = await api
          .get(
            `/api/question-items/` +
              `${questionItemId}/` +
              'cross-survey-statistics' +
              `?questionVersionId=${v1.id}`
          )
          .set(authorization(owner.token))
          .expect(200);

        expect(
          filteredResponse.body.filter
            .questionVersionId
        ).toBe(v1.id);

        expect(
          filteredResponse.body.summary
            .versionCount
        ).toBe(1);

        expect(
          filteredResponse.body.versions
        ).toHaveLength(1);

        expect(
          filteredResponse.body
            .versions[0]
            .questionVersionId
        ).toBe(v1.id);

        expect(
          filteredResponse.body.summary
            .surveyCount
        ).toBe(2);

        expect(
          filteredResponse.body.summary
            .responseCount
        ).toBe(2);

        const receiverStatistics =
          await api
            .get(
              `/api/question-items/` +
                `${questionItemId}/` +
                'cross-survey-statistics'
            )
            .set(
              authorization(receiver.token)
            )
            .expect(200);

        expect(
          receiverStatistics.body.summary
            .surveyCount
        ).toBe(1);

        expect(
          receiverStatistics.body.summary
            .questionInstanceCount
        ).toBe(1);

        expect(
          receiverStatistics.body.summary
            .responseCount
        ).toBe(1);

        expect(
          receiverStatistics.body.summary
            .answerOpportunityCount
        ).toBe(1);

        expect(
          receiverStatistics.body.summary
            .totalAnswers
        ).toBe(1);
      }
    );

    test(
      '第二阶段接口执行认证、所有权和问卷状态保护',
      async () => {
        const owner =
          await registerAndLogin('s2proo');

        const outsider =
          await registerAndLogin('s2prox');

        const created =
          await createQuestionItem(
            owner.token,
            'AI-031 权限测试题目'
          );

        const questionItemId =
          created.item.id;
        const versionId =
          created.version.id;

        await api
          .get('/api/question-items')
          .expect(401);

        await api
          .get(
            `/api/question-items/` +
              `${questionItemId}`
          )
          .set(
            authorization(outsider.token)
          )
          .expect(404);

        await api
          .get(
            `/api/question-items/` +
              `${questionItemId}/usage`
          )
          .set(
            authorization(outsider.token)
          )
          .expect(404);

        const bankResponse = await api
          .post('/api/question-banks')
          .set(authorization(owner.token))
          .send({
            name:
              'AI-031 权限测试题目库',
            description: '',
          })
          .expect(201);

        const bankId =
          bankResponse.body.questionBank.id;

        await api
          .get(
            `/api/question-banks/${bankId}`
          )
          .set(
            authorization(outsider.token)
          )
          .expect(404);

        const draftSurvey =
          await createSurvey(
            owner.token,
            'AI-031 发布状态保护'
          );

        await addVersionToSurvey({
          token: owner.token,
          surveyId: draftSurvey.id,
          questionItemId,
          questionVersionId: versionId,
        });

        await publishSurvey(
          owner.token,
          draftSurvey.id
        );

        await api
          .post(
            `/api/surveys/` +
              `${draftSurvey.id}/` +
              'questions/from-library'
          )
          .set(authorization(owner.token))
          .send({
            questionItemId,
            questionVersionId: versionId,
            required: false,
          })
          .expect(409);

        await closeSurvey(
          owner.token,
          draftSurvey.id
        );

        await api
          .post(
            `/api/surveys/` +
              `${draftSurvey.id}/` +
              'questions/from-library'
          )
          .set(authorization(owner.token))
          .send({
            questionItemId,
            questionVersionId: versionId,
            required: false,
          })
          .expect(409);

        const invalidVersionSurvey =
          await createSurvey(
            owner.token,
            'AI-031 非法版本测试'
          );

        await api
          .post(
            `/api/surveys/` +
              `${invalidVersionSurvey.id}/` +
              'questions/from-library'
          )
          .set(authorization(owner.token))
          .send({
            questionItemId,
            questionVersionId:
              '000000000000000000000000',
            required: false,
          })
          .expect(404);

        await api
          .get(
            `/api/question-items/` +
              `${questionItemId}/` +
              'cross-survey-statistics'
          )
          .expect(401);
      }
    );
  }
);