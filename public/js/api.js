const TOKEN_STORAGE_KEY =
  'questionnaire_auth_token';

function getToken() {
  return localStorage.getItem(
    TOKEN_STORAGE_KEY
  );
}

function setToken(token) {
  localStorage.setItem(
    TOKEN_STORAGE_KEY,
    token
  );
}

function clearToken() {
  localStorage.removeItem(
    TOKEN_STORAGE_KEY
  );
}

async function apiRequest(
  path,
  {
    method = 'GET',
    body,
    auth = false,
  } = {}
) {
  const headers = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] =
      'application/json';
  }

  if (auth) {
    const token = getToken();

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }
  }

  const response = await fetch(path, {
    method,
    headers,
    body:
      body === undefined
        ? undefined
        : JSON.stringify(body),
  });

  const responseText =
    await response.text();

  let data = {};

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = {
        message: responseText,
      };
    }
  }

  if (!response.ok) {
    const error = new Error(
      data.message || '请求失败'
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

window.Api = {
  getToken,
  setToken,
  clearToken,
  request: apiRequest,
};