const request = require('supertest');

const api = request(
  'http://127.0.0.1:3101'
);

describe('健康接口', () => {
  test('GET /api/health 返回服务状态', async () => {
    const response = await api
      .get('/api/health')
      .expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      message:
        'Questionnaire API is running',
    });
  });

  test('不存在的接口返回 404', async () => {
    const response = await api
      .get('/api/not-found')
      .expect(404);

    expect(response.body).toEqual({
      message: '接口不存在',
    });
  });
});