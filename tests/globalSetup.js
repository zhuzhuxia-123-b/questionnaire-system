const path = require('path');
const { fork } = require('child_process');

module.exports = async function globalSetup() {
  const serverPath = path.join(
    __dirname,
    'testServer.js'
  );

  const child = fork(serverPath, [], {
    cwd: path.resolve(__dirname, '..'),
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
    stdio: [
      'ignore',
      'inherit',
      'inherit',
      'ipc',
    ],
  });

  globalThis.__QUESTIONNAIRE_TEST_SERVER__ =
    child;

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill();
      reject(
        new Error('测试服务器启动超时')
      );
    }, 15000);

    child.once('exit', (code) => {
      clearTimeout(timeout);

      reject(
        new Error(
          `测试服务器提前退出，代码：${code}`
        )
      );
    });

    child.on('message', (message) => {
      if (message?.type === 'ready') {
        clearTimeout(timeout);
        resolve();
      }

      if (message?.type === 'error') {
        clearTimeout(timeout);
        reject(
          new Error(message.message)
        );
      }
    });
  });
};