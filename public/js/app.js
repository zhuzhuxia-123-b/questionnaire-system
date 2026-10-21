const apiStatusElement =
  document.querySelector('#api-status');

const guestPanel =
  document.querySelector('#guest-panel');

const userPanel =
  document.querySelector('#user-panel');

const currentUsername =
  document.querySelector(
    '#current-username'
  );

const authMessage =
  document.querySelector('#auth-message');

const registerForm =
  document.querySelector(
    '#register-form'
  );

const loginForm =
  document.querySelector('#login-form');

const logoutButton =
  document.querySelector(
    '#logout-button'
  );

const loginTab =
  document.querySelector('#login-tab');

const registerTab =
  document.querySelector('#register-tab');

function showAuthMessage(
  message,
  isError = false
) {
  authMessage.textContent = message;

  authMessage.className = isError
    ? 'form-message status-error'
    : 'form-message status-success';
}

function updateAuthView(user) {
  const loggedIn = Boolean(user);

  guestPanel.hidden = loggedIn;
  userPanel.hidden = !loggedIn;

  currentUsername.textContent =
    user?.username || '';

  window.dispatchEvent(
    new CustomEvent('auth:changed', {
      detail: {
        user,
      },
    })
  );
}

function showAuthForm(mode) {
  const showLogin = mode === 'login';

  loginForm.hidden = !showLogin;
  registerForm.hidden = showLogin;

  loginTab.classList.toggle(
    'is-active',
    showLogin
  );

  registerTab.classList.toggle(
    'is-active',
    !showLogin
  );

  loginTab.setAttribute(
    'aria-selected',
    String(showLogin)
  );

  registerTab.setAttribute(
    'aria-selected',
    String(!showLogin)
  );

  showAuthMessage('');
}

async function checkApiStatus() {
  try {
    const result =
      await window.Api.request(
        '/api/health'
      );

    apiStatusElement.textContent =
      `后端连接正常：${result.message}`;

    apiStatusElement.className =
      'status-success';
  } catch (error) {
    apiStatusElement.textContent =
      `后端连接失败：${error.message}`;

    apiStatusElement.className =
      'status-error';
  }
}

async function restoreCurrentUser() {
  if (!window.Api.getToken()) {
    updateAuthView(null);
    return;
  }

  try {
    const result =
      await window.Api.request(
        '/api/auth/me',
        {
          auth: true,
        }
      );

    updateAuthView(result.user);
  } catch (error) {
    window.Api.clearToken();
    updateAuthView(null);

    showAuthMessage(
      '登录状态已失效，请重新登录',
      true
    );
  }
}

loginTab.addEventListener(
  'click',
  () => {
    showAuthForm('login');
  }
);

registerTab.addEventListener(
  'click',
  () => {
    showAuthForm('register');
  }
);

registerForm.addEventListener(
  'submit',
  async (event) => {
    event.preventDefault();
    showAuthMessage('');

    const formData =
      new FormData(registerForm);

    try {
      const result =
        await window.Api.request(
          '/api/auth/register',
          {
            method: 'POST',
            body: {
              username:
                formData.get('username'),
              password:
                formData.get('password'),
            },
          }
        );

      window.Api.setToken(
        result.token
      );

      updateAuthView(result.user);
      registerForm.reset();

      showAuthMessage(
        '注册并登录成功'
      );
    } catch (error) {
      showAuthMessage(
        error.message,
        true
      );
    }
  }
);

loginForm.addEventListener(
  'submit',
  async (event) => {
    event.preventDefault();
    showAuthMessage('');

    const formData =
      new FormData(loginForm);

    try {
      const result =
        await window.Api.request(
          '/api/auth/login',
          {
            method: 'POST',
            body: {
              username:
                formData.get('username'),
              password:
                formData.get('password'),
            },
          }
        );

      window.Api.setToken(
        result.token
      );

      updateAuthView(result.user);
      loginForm.reset();

      showAuthMessage('登录成功');
    } catch (error) {
      showAuthMessage(
        error.message,
        true
      );
    }
  }
);

logoutButton.addEventListener(
  'click',
  () => {
    window.Api.clearToken();
    updateAuthView(null);
    showAuthForm('login');

    showAuthMessage(
      '已退出登录'
    );
  }
);

showAuthForm('login');
checkApiStatus();
restoreCurrentUser();