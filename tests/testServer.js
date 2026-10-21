const TEST_DATABASE_NAME =
  'questionnaire_system_test';

const TEST_MONGODB_URI =
  `mongodb://127.0.0.1:27017/${TEST_DATABASE_NAME}`;

const TEST_PORT = 3101;

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  'ai017_test_secret_only_for_local_tests';
process.env.JWT_EXPIRES_IN = '1h';
process.env.MONGODB_URI = TEST_MONGODB_URI;

const mongoose = require('mongoose');
const app = require('../src/app');

let server;
let shuttingDown = false;

function assertSafeTestDatabase() {
  if (
    mongoose.connection.name !==
    TEST_DATABASE_NAME
  ) {
    throw new Error(
      '测试只能清理 questionnaire_system_test 数据库'
    );
  }
}

async function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  try {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }

    if (mongoose.connection.readyState !== 0) {
      assertSafeTestDatabase();
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }

    process.exit(exitCode);
  } catch (error) {
    console.error(
      'Test server shutdown failed:',
      error.message
    );
    process.exit(1);
  }
}

async function start() {
  try {
    await mongoose.connect(TEST_MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    assertSafeTestDatabase();

    // 每次测试运行前清空独立测试数据库。
    await mongoose.connection.dropDatabase();

    server = app.listen(
      TEST_PORT,
      '127.0.0.1',
      () => {
        if (process.send) {
          process.send({
            type: 'ready',
            port: TEST_PORT,
          });
        }
      }
    );
  } catch (error) {
    if (process.send) {
      process.send({
        type: 'error',
        message: error.message,
      });
    }

    await shutdown(1);
  }
}

process.on('message', (message) => {
  if (message?.type === 'shutdown') {
    shutdown(0);
  }
});

process.on('SIGINT', () => shutdown(1));
process.on('SIGTERM', () => shutdown(1));

start();