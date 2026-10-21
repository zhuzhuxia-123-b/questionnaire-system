module.exports =
  async function globalTeardown() {
    const child =
      globalThis.__QUESTIONNAIRE_TEST_SERVER__;

    if (!child || child.killed) {
      return;
    }

    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        child.kill();
        resolve();
      }, 10000);

      child.once('exit', () => {
        clearTimeout(timeout);
        resolve();
      });

      if (child.connected) {
        child.send({
          type: 'shutdown',
        });
      } else {
        child.kill();
      }
    });
  };