const request = require('supertest');

const api = request(
  'http://127.0.0.1:3101'
);

const PASSWORD = 'Test123456!';

let userSequence = 0;

function nextUsername(prefix) {
  userSequence += 1;

  return (
    prefix +
    String(userSequence).padStart(2, '0')
  );
}

async function registerAndLogin(username) {
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

  return loginResponse.body.token;
}

async function createSurvey(ownerToken) {
  const response = await api
    .post('/api/surveys')
    .set(
      'Authorization',
      `Bearer ${ownerToken}`
    )
    .send({
      title: '自动测试问卷',
      description:
        'Jest 和 Supertest 流程测试',
      allowAnonymous: true,
      allowMultipleSubmissions: false,
    })
    .expect(201);

  return response.body.survey;
}

async function addQuestion(
  ownerToken,
  surveyId,
  questionData
) {
  const response = await api
    .post(
      `/api/surveys/${surveyId}/questions`
    )
    .set(
      'Authorization',
      `Bearer ${ownerToken}`
    )
    .send(questionData)
    .expect(201);

  return response.body.question;
}

async function createDraftScenario(ownerToken) {
  const survey =
    await createSurvey(ownerToken);

  const question1 = await addQuestion(
    ownerToken,
    survey.id,
    {
      type: 'singleChoice',
      title: '请选择年级',
      required: true,
      options: [
        {
          label: '一年级',
        },
        {
          label: '二年级',
        },
      ],
    }
  );

  const question2 = await addQuestion(
    ownerToken,
    survey.id,
    {
      type: 'multipleChoice',
      title: '请选择学习方式',
      required: false,
      options: [
        {
          label: '课堂听讲',
        },
        {
          label: '自主学习',
        },
      ],
      validation: {
        minSelections: 1,
        maxSelections: 2,
      },
    }
  );

  const question3 = await addQuestion(
    ownerToken,
    survey.id,
    {
      type: 'text',
      title: '请填写学习计划',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 100,
      },
    }
  );

  const question4 = await addQuestion(
    ownerToken,
    survey.id,
    {
      type: 'number',
      title: '每天学习多少小时',
      required: true,
      validation: {
        minValue: 0,
        maxValue: 24,
        integerOnly: false,
      },
    }
  );

  return {
    survey,
    question1,
    question2,
    question3,
    question4,
  };
}

async function configureForwardJump(
  ownerToken,
  scenario
) {
  const response = await api
    .put(
      `/api/surveys/${scenario.survey.id}` +
        `/questions/${scenario.question1.id}` +
        '/jump-rules'
    )
    .set(
      'Authorization',
      `Bearer ${ownerToken}`
    )
    .send({
      jumpRules: [
        {
          operator: 'equals',
          value:
            scenario.question1.options[0]
              .optionId,
          action: 'goto',
          targetQuestionId:
            scenario.question3.id,
          priority: 0,
        },
      ],
    })
    .expect(200);

  return response.body.question;
}

async function publishSurvey(
  ownerToken,
  surveyId
) {
  const response = await api
    .post(
      `/api/surveys/${surveyId}/publish`
    )
    .set(
      'Authorization',
      `Bearer ${ownerToken}`
    )
    .expect(200);

  return response.body.survey;
}

async function createPublishedScenario(
  ownerToken
) {
  const scenario =
    await createDraftScenario(ownerToken);

  await configureForwardJump(
    ownerToken,
    scenario
  );

  const publishedSurvey =
    await publishSurvey(
      ownerToken,
      scenario.survey.id
    );

  return {
    ...scenario,
    publishedSurvey,
  };
}

function buildValidResponse(scenario) {
  return {
    anonymous: false,
    answers: [
      {
        questionId:
          scenario.question1.id,
        value:
          scenario.question1.options[0]
            .optionId,
      },
      {
        questionId:
          scenario.question3.id,
        value: '每天完成学习计划',
      },
      {
        questionId:
          scenario.question4.id,
        value: 5,
      },
    ],
  };
}

describe('问卷系统核心流程', () => {
  test('创建问卷', async () => {
    const ownerToken =
      await registerAndLogin(
        nextUsername('owner')
      );

    const survey =
      await createSurvey(ownerToken);

    expect(survey.title).toBe(
      '自动测试问卷'
    );
    expect(survey.status).toBe('draft');
    expect(survey.allowAnonymous).toBe(
      true
    );
    expect(
      survey.allowMultipleSubmissions
    ).toBe(false);
  });

  test('添加题目', async () => {
    const ownerToken =
      await registerAndLogin(
        nextUsername('owner')
      );

    const survey =
      await createSurvey(ownerToken);

    const question = await addQuestion(
      ownerToken,
      survey.id,
      {
        type: 'singleChoice',
        title: '测试单选题',
        required: true,
        options: [
          {
            label: '选项 A',
          },
          {
            label: '选项 B',
          },
        ],
      }
    );

    expect(question.order).toBe(1);
    expect(question.type).toBe(
      'singleChoice'
    );
    expect(question.required).toBe(true);
    expect(question.options).toHaveLength(2);
    expect(
      question.options[0].optionId
    ).toBeTruthy();
  });

  test(
    '合法向后跳转成功且向前跳转被拒绝',
    async () => {
      const ownerToken =
        await registerAndLogin(
          nextUsername('owner')
        );

      const scenario =
        await createDraftScenario(
          ownerToken
        );

      const updatedQuestion =
        await configureForwardJump(
          ownerToken,
          scenario
        );

      expect(
        updatedQuestion.jumpRules
      ).toHaveLength(1);

      expect(
        updatedQuestion.jumpRules[0]
          .targetQuestionId
      ).toBe(scenario.question3.id);

      const invalidResponse = await api
        .put(
          `/api/surveys/` +
            `${scenario.survey.id}` +
            `/questions/` +
            `${scenario.question4.id}` +
            '/jump-rules'
        )
        .set(
          'Authorization',
          `Bearer ${ownerToken}`
        )
        .send({
          jumpRules: [
            {
              operator: 'gte',
              value: 1,
              action: 'goto',
              targetQuestionId:
                scenario.question2.id,
              priority: 0,
            },
          ],
        })
        .expect(400);

      expect(
        invalidResponse.body.message
      ).toBe(
        'goto 只能跳转到后续题目'
      );
    }
  );

  test(
    '提交无效选项时返回答案校验错误',
    async () => {
      const ownerToken =
        await registerAndLogin(
          nextUsername('owner')
        );

      const fillerToken =
        await registerAndLogin(
          nextUsername('filler')
        );

      const scenario =
        await createPublishedScenario(
          ownerToken
        );

      const response = await api
        .post(
          `/api/public/surveys/` +
            `${scenario.publishedSurvey.publicId}` +
            '/responses'
        )
        .set(
          'Authorization',
          `Bearer ${fillerToken}`
        )
        .send({
          anonymous: false,
          answers: [
            {
              questionId:
                scenario.question1.id,
              value:
                'invalid-option-id',
            },
          ],
        })
        .expect(400);

      expect(
        response.body.message
      ).toContain('请选择有效选项');
    }
  );

  test(
    '提交问卷并阻止重复提交',
    async () => {
      const ownerToken =
        await registerAndLogin(
          nextUsername('owner')
        );

      const fillerToken =
        await registerAndLogin(
          nextUsername('filler')
        );

      const scenario =
        await createPublishedScenario(
          ownerToken
        );

      const responseBody =
        buildValidResponse(scenario);

      const submitResponse = await api
        .post(
          `/api/public/surveys/` +
            `${scenario.publishedSurvey.publicId}` +
            '/responses'
        )
        .set(
          'Authorization',
          `Bearer ${fillerToken}`
        )
        .send(responseBody)
        .expect(201);

      expect(
        submitResponse.body.message
      ).toBe('答卷提交成功');

      expect(
        submitResponse.body.response
          .answerCount
      ).toBe(3);

      expect(
        submitResponse.body.response
          .visitedQuestionIds
      ).toEqual([
        scenario.question1.id,
        scenario.question3.id,
        scenario.question4.id,
      ]);

      const duplicateResponse = await api
        .post(
          `/api/public/surveys/` +
            `${scenario.publishedSurvey.publicId}` +
            '/responses'
        )
        .set(
          'Authorization',
          `Bearer ${fillerToken}`
        )
        .send(responseBody)
        .expect(409);

      expect(
        duplicateResponse.body.message
      ).toBe(
        '该用户已经提交过此问卷'
      );
    }
  );

  test(
    '生成统计并保护所有权和身份字段',
    async () => {
      const ownerToken =
        await registerAndLogin(
          nextUsername('owner')
        );

      const fillerToken =
        await registerAndLogin(
          nextUsername('filler')
        );

      const scenario =
        await createPublishedScenario(
          ownerToken
        );

      await api
        .post(
          `/api/public/surveys/` +
            `${scenario.publishedSurvey.publicId}` +
            '/responses'
        )
        .set(
          'Authorization',
          `Bearer ${fillerToken}`
        )
        .send(
          buildValidResponse(scenario)
        )
        .expect(201);

      const statisticsResponse = await api
        .get(
          `/api/surveys/` +
            `${scenario.survey.id}` +
            '/statistics'
        )
        .set(
          'Authorization',
          `Bearer ${ownerToken}`
        )
        .expect(200);

      expect(
        statisticsResponse.body
          .responseCount
      ).toBe(1);

      expect(
        statisticsResponse.body
          .questionCount
      ).toBe(4);

      const questions =
        statisticsResponse.body.questions;

      const single = questions.find(
        (question) =>
          question.order === 1
      );

      const multiple = questions.find(
        (question) =>
          question.order === 2
      );

      const text = questions.find(
        (question) =>
          question.order === 3
      );

      const number = questions.find(
        (question) =>
          question.order === 4
      );

      expect(single.totalAnswers).toBe(1);
      expect(
        single.notAnsweredCount
      ).toBe(0);
      expect(
        single.options[0].count
      ).toBe(1);

      expect(
        multiple.totalAnswers
      ).toBe(0);
      expect(
        multiple.notAnsweredCount
      ).toBe(1);

      expect(text.values).toEqual([
        '每天完成学习计划',
      ]);

      expect(number.values).toEqual([5]);
      expect(number.average).toBe(5);

      const statisticsJson =
        JSON.stringify(
          statisticsResponse.body
        );

      expect(
        statisticsJson
      ).not.toContain('respondentId');

      expect(
        statisticsJson
      ).not.toContain('username');

      expect(
        statisticsJson
      ).not.toContain(
        'uniqueSubmissionKey'
      );

      await api
        .get(
          `/api/surveys/` +
            `${scenario.survey.id}` +
            '/statistics'
        )
        .expect(401);

      await api
        .get(
          `/api/surveys/` +
            `${scenario.survey.id}` +
            '/statistics'
        )
        .set(
          'Authorization',
          `Bearer ${fillerToken}`
        )
        .expect(404);

      const singleQuestionResponse =
        await api
          .get(
            `/api/surveys/` +
              `${scenario.survey.id}` +
              '/statistics' +
              `?questionId=` +
              `${scenario.question2.id}`
          )
          .set(
            'Authorization',
            `Bearer ${ownerToken}`
          )
          .expect(200);

      expect(
        singleQuestionResponse.body
          .questionCount
      ).toBe(1);

      expect(
        singleQuestionResponse.body
          .questions[0].questionId
      ).toBe(scenario.question2.id);

      expect(
        singleQuestionResponse.body
          .questions[0].totalAnswers
      ).toBe(0);

      expect(
        singleQuestionResponse.body
          .questions[0].notAnsweredCount
      ).toBe(1);
    }
  );
});