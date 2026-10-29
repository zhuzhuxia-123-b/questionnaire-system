const resourceState = {
  user: null,
  ownItems: [],
  receivedItems: [],
  surveys: [],
  banks: [],
  currentBank: null,
  ownVersions: new Map(),
  receivedVersions: new Map(),
};

const resourceElements = {};

function byId(id) {
  return document.getElementById(id);
}

function showResourceMessage(message, isError = false) {
  const element = resourceElements.message;
  element.textContent = message || '';
  element.className = isError
    ? 'form-message status-error'
    : 'form-message status-success';
}

function sanitizeForDisplay(value) {
  const hiddenFields = new Set([
    'passwordHash',
    'token',
    'respondentId',
    'uniqueSubmissionKey',
  ]);

  if (Array.isArray(value)) {
    return value.map(sanitizeForDisplay);
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([key]) => !hiddenFields.has(key)
        )
        .map(([key, item]) => [
          key,
          sanitizeForDisplay(item),
        ])
    );
  }

  return value;
}

function pretty(value) {
  return value
    ? JSON.stringify(
        sanitizeForDisplay(value),
        null,
        2
      )
    : '';
}

function setOutput(id, value) {
  byId(id).textContent = pretty(value);
}

function createOption(value, label) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  return option;
}

function setSelectOptions(
  select,
  entries,
  placeholder = '请选择'
) {
  const previous = select.value;
  select.replaceChildren();
  select.append(createOption('', placeholder));

  for (const entry of entries) {
    select.append(
      createOption(entry.value, entry.label)
    );
  }

  if (
    entries.some(
      (entry) => entry.value === previous
    )
  ) {
    select.value = previous;
  } else if (entries.length > 0) {
    select.value = entries[0].value;
  }
}

function requireValue(select, label) {
  if (!select.value) {
    throw new Error(`请选择${label}`);
  }

  return select.value;
}

function typeLabel(type) {
  return {
    singleChoice: '单选题',
    multipleChoice: '多选题',
    text: '文本题',
    number: '数字题',
  }[type] || type;
}

function versionLabel(version) {
  return (
    `v${version.versionNumber} ` +
    `[${typeLabel(version.type)}] ` +
    version.title
  );
}

function itemLabel(item) {
  const version = item.currentVersion;

  if (!version) {
    return `${item.id}（没有当前版本）`;
  }

  return (
    `[${typeLabel(version.type)}] ` +
    `${version.title}（v${version.versionNumber}）`
  );
}

function parseOptions(text, type) {
  const isChoice = [
    'singleChoice',
    'multipleChoice',
  ].includes(type);

  if (!isChoice) {
    return [];
  }

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf('|');

      if (separatorIndex === -1) {
        return {
          label: line,
        };
      }

      const optionId = line
        .slice(0, separatorIndex)
        .trim();
      const label = line
        .slice(separatorIndex + 1)
        .trim();

      if (!optionId || !label) {
        throw new Error(
          '选项格式应为 optionId|label'
        );
      }

      return {
        optionId,
        label,
      };
    });
}

function parseValidation(text) {
  if (!text.trim()) {
    return {};
  }

  const value = JSON.parse(text);

  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    throw new Error(
      'validation 必须是 JSON 对象'
    );
  }

  return value;
}

function buildVersionPayload(prefix) {
  const type = byId(`${prefix}-resource-type`).value;
  const title = byId(`${prefix}-resource-title`)
    .value.trim();
  const options = parseOptions(
    byId(`${prefix}-resource-options`).value,
    type
  );
  const validation = parseValidation(
    byId(`${prefix}-resource-validation`).value
  );
  const changeNote = byId(
    `${prefix}-resource-note`
  ).value.trim();

  if (!title) {
    throw new Error('题目内容不能为空');
  }

  return {
    type,
    title,
    options,
    validation,
    changeNote,
  };
}

async function authenticatedRequest(path, options = {}) {
  return window.Api.request(path, {
    ...options,
    auth: true,
  });
}

async function runResourceAction(
  action,
  successMessage
) {
  showResourceMessage('正在处理……');

  try {
    const result = await action();
    showResourceMessage(successMessage || '操作成功');
    return result;
  } catch (error) {
    showResourceMessage(error.message, true);
    throw error;
  }
}

function draftSurveyEntries() {
  return resourceState.surveys
    .filter((survey) => survey.status === 'draft')
    .map((survey) => ({
      value: survey.id,
      label: survey.title,
    }));
}

function renderBaseSelections() {
  const ownEntries = resourceState.ownItems.map(
    (item) => ({
      value: item.id,
      label: itemLabel(item),
    })
  );

  const receivedEntries =
    resourceState.receivedItems.map((entry) => ({
      value: entry.questionItem.id,
      label:
        `${entry.currentVersion?.title || entry.questionItem.id}` +
        `（来自 ${entry.owner?.username || '未知用户'}）`,
    }));

  for (const id of [
    'own-item-select',
    'share-own-item-select',
    'bank-add-item-select',
  ]) {
    setSelectOptions(byId(id), ownEntries, '暂无本人题目');
  }

  setSelectOptions(
    byId('received-item-select'),
    receivedEntries,
    '暂无收到的共享'
  );

  const combined = new Map();

  for (const entry of ownEntries) {
    combined.set(entry.value, {
      ...entry,
      access: 'owned',
    });
  }

  for (const entry of receivedEntries) {
    if (!combined.has(entry.value)) {
      combined.set(entry.value, {
        ...entry,
        access: 'received',
      });
    }
  }

  setSelectOptions(
    byId('statistics-item-select'),
    [...combined.values()],
    '暂无可统计题目'
  );

  byId('statistics-item-select').dataset.catalog =
    JSON.stringify(
      Object.fromEntries(
        [...combined.values()].map((entry) => [
          entry.value,
          entry.access,
        ])
      )
    );

  const drafts = draftSurveyEntries();

  for (const id of [
    'own-target-survey',
    'received-target-survey',
    'bank-target-survey',
  ]) {
    setSelectOptions(byId(id), drafts, '暂无草稿问卷');
  }

  setSelectOptions(
    byId('bank-select'),
    resourceState.banks.map((bank) => ({
      value: bank.id,
      label: `${bank.name}（${bank.itemCount} 题）`,
    })),
    '暂无题目库'
  );

  resourceElements.summary.textContent =
    `本人题目 ${resourceState.ownItems.length}，` +
    `收到共享 ${resourceState.receivedItems.length}，` +
    `草稿问卷 ${drafts.length}，` +
    `题目库 ${resourceState.banks.length}`;
}

async function refreshAllResourceData() {
  const [
    ownResult,
    receivedResult,
    surveyResult,
    bankResult,
  ] = await Promise.all([
    authenticatedRequest(
      '/api/question-items?page=1&limit=100&status=active'
    ),
    authenticatedRequest(
      '/api/question-items/received-shares?page=1&limit=100'
    ),
    authenticatedRequest(
      '/api/surveys?page=1&limit=50'
    ),
    authenticatedRequest('/api/question-banks'),
  ]);

  resourceState.ownItems =
    ownResult.questionItems || [];
  resourceState.receivedItems =
    receivedResult.items || [];
  resourceState.surveys =
    surveyResult.surveys || [];
  resourceState.banks =
    bankResult.questionBanks || [];

  renderBaseSelections();
}

async function loadOwnVersions(itemId) {
  if (!itemId) {
    resourceState.ownVersions.delete(itemId);
    setSelectOptions(
      byId('own-version-select'),
      [],
      '暂无版本'
    );
    return [];
  }

  const result = await authenticatedRequest(
    `/api/question-items/${itemId}/versions?page=1&limit=100`
  );
  const versions = result.versions || [];
  resourceState.ownVersions.set(itemId, versions);

  setSelectOptions(
    byId('own-version-select'),
    versions.map((version) => ({
      value: version.id,
      label: versionLabel(version),
    })),
    '暂无版本'
  );

  const item = resourceState.ownItems.find(
    (entry) => entry.id === itemId
  );
  const current = versions.find(
    (version) =>
      version.id === item?.currentVersionId
  ) || versions[0];

  if (current) {
    byId('version-resource-type').value = current.type;
    byId('version-resource-title').value = current.title;
    byId('version-resource-options').value =
      (current.options || [])
        .map(
          (option) =>
            `${option.optionId}|${option.label}`
        )
        .join('\n');
    byId('version-resource-validation').value =
      JSON.stringify(current.validation || {}, null, 2);
  }

  setOutput('own-version-output', result);
  return versions;
}

async function loadReceivedVersions(itemId) {
  if (!itemId) {
    setSelectOptions(
      byId('received-version-select'),
      [],
      '暂无版本'
    );
    return [];
  }

  const result = await authenticatedRequest(
    `/api/question-items/received-shares/${itemId}/versions?page=1&limit=100`
  );
  const versions = result.versions || [];
  resourceState.receivedVersions.set(itemId, versions);

  setSelectOptions(
    byId('received-version-select'),
    versions.map((version) => ({
      value: version.id,
      label: versionLabel(version),
    })),
    '暂无版本'
  );
  setOutput('received-output', result);
  return versions;
}

async function loadSentShares() {
  const itemId = byId('share-own-item-select').value;
  const container = byId('sent-share-list');
  container.replaceChildren();

  if (!itemId) {
    return;
  }

  const result = await authenticatedRequest(
    `/api/question-items/${itemId}/shares?status=all&page=1&limit=100`
  );

  if (!result.shares.length) {
    container.textContent = '暂无共享记录';
    return;
  }

  for (const share of result.shares) {
    const card = document.createElement('article');
    card.className = 'resource-list-item';

    const text = document.createElement('p');
    text.textContent =
      `${share.sharedWithUser?.username || '未知用户'} · ` +
      `${share.status} · ${share.permission}`;
    card.append(text);

    if (share.status === 'active') {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button-danger';
      button.textContent = '软撤销共享';
      button.addEventListener('click', async () => {
        try {
          await runResourceAction(
            () => authenticatedRequest(
              `/api/question-items/${itemId}/shares/${share.id}`,
              { method: 'DELETE' }
            ),
            '共享已撤销'
          );
          await loadSentShares();
        } catch {}
      });
      card.append(button);
    }

    container.append(card);
  }
}

async function loadBankDetail(bankId) {
  if (!bankId) {
    resourceState.currentBank = null;
    setSelectOptions(byId('bank-item-select'), [], '暂无条目');
    setOutput('bank-output', null);
    return null;
  }

  const result = await authenticatedRequest(
    `/api/question-banks/${bankId}`
  );
  const bank = result.questionBank;
  resourceState.currentBank = bank;

  byId('update-bank-name').value = bank.name;
  byId('update-bank-description').value =
    bank.description || '';

  setSelectOptions(
    byId('bank-item-select'),
    bank.items.map((item) => ({
      value: item.questionItemId,
      label:
        `${item.preferredVersion?.title || item.questionItemId}` +
        `（推荐 v${item.preferredVersion?.versionNumber || '-'}）`,
    })),
    '题目库为空'
  );

  setOutput('bank-output', bank);

  if (byId('bank-item-select').value) {
    await loadBankItemVersions();
  }

  return bank;
}

async function loadBankAddVersions() {
  const itemId = byId('bank-add-item-select').value;

  if (!itemId) {
    setSelectOptions(byId('bank-add-version-select'), [], '暂无版本');
    return;
  }

  const versions =
    resourceState.ownVersions.get(itemId) ||
    await loadVersionsWithoutRendering(itemId, 'owned');

  setSelectOptions(
    byId('bank-add-version-select'),
    versions.map((version) => ({
      value: version.id,
      label: versionLabel(version),
    })),
    '暂无版本'
  );
}

async function loadBankItemVersions() {
  const itemId = byId('bank-item-select').value;

  if (!itemId) {
    setSelectOptions(byId('bank-item-version-select'), [], '暂无版本');
    return;
  }

  const versions =
    resourceState.ownVersions.get(itemId) ||
    await loadVersionsWithoutRendering(itemId, 'owned');

  setSelectOptions(
    byId('bank-item-version-select'),
    versions.map((version) => ({
      value: version.id,
      label: versionLabel(version),
    })),
    '暂无版本'
  );

  const bankItem = resourceState.currentBank?.items.find(
    (item) => item.questionItemId === itemId
  );

  if (bankItem?.preferredVersionId) {
    byId('bank-item-version-select').value =
      bankItem.preferredVersionId;
  }
}

async function loadVersionsWithoutRendering(itemId, access) {
  const path = access === 'received'
    ? `/api/question-items/received-shares/${itemId}/versions?page=1&limit=100`
    : `/api/question-items/${itemId}/versions?page=1&limit=100`;
  const result = await authenticatedRequest(path);
  const versions = result.versions || [];

  if (access === 'received') {
    resourceState.receivedVersions.set(itemId, versions);
  } else {
    resourceState.ownVersions.set(itemId, versions);
  }

  return versions;
}

async function loadStatisticsVersions() {
  const select = byId('statistics-item-select');
  const itemId = select.value;

  if (!itemId) {
    setSelectOptions(byId('statistics-version-select'), [], '全部版本');
    return;
  }

  const catalog = JSON.parse(select.dataset.catalog || '{}');
  const access = catalog[itemId] || 'owned';
  const versions = await loadVersionsWithoutRendering(itemId, access);

  setSelectOptions(
    byId('statistics-version-select'),
    versions.map((version) => ({
      value: version.id,
      label: versionLabel(version),
    })),
    '全部版本'
  );
  byId('statistics-version-select').value = '';
}

function renderStatistics(result) {
  const summary = byId('statistics-summary');
  summary.replaceChildren();

  const fields = [
    ['问卷数', result.summary.surveyCount],
    ['题目实例', result.summary.questionInstanceCount],
    ['去重答卷', result.summary.responseCount],
    ['回答机会', result.summary.answerOpportunityCount],
    ['实际回答', result.summary.totalAnswers],
    ['未回答', result.summary.notAnsweredCount],
  ];

  for (const [label, value] of fields) {
    const card = document.createElement('div');
    card.className = 'resource-summary-card';
    const strong = document.createElement('strong');
    strong.textContent = String(value);
    const span = document.createElement('span');
    span.textContent = label;
    card.append(strong, span);
    summary.append(card);
  }

  setOutput('statistics-output', {
    filter: result.filter,
    surveys: result.surveys,
    versions: result.versions,
  });
}

async function initializeResourcePage() {
  Object.assign(resourceElements, {
    gate: byId('resource-auth-gate'),
    app: byId('resource-app'),
    user: byId('resource-current-user'),
    summary: byId('resource-data-summary'),
    message: byId('resource-message'),
  });

  if (!window.Api.getToken()) {
    resourceElements.gate.hidden = false;
    return;
  }

  try {
    const me = await authenticatedRequest('/api/auth/me');
    resourceState.user = me.user;
    resourceElements.user.textContent =
      `当前用户：${me.user.username}`;
    resourceElements.app.hidden = false;
    await refreshAllResourceData();
    await Promise.allSettled([
      loadOwnVersions(byId('own-item-select').value),
      loadReceivedVersions(byId('received-item-select').value),
      loadSentShares(),
      loadBankDetail(byId('bank-select').value),
      loadBankAddVersions(),
      loadStatisticsVersions(),
    ]);
  } catch (error) {
    window.Api.clearToken();
    resourceElements.gate.hidden = false;
    resourceElements.app.hidden = true;
    showResourceMessage('登录状态失效，请重新登录', true);
  }
}

document.querySelectorAll('[data-resource-tab]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.resourceTab;

    document.querySelectorAll('[data-resource-tab]').forEach((item) => {
      item.classList.toggle('is-active', item === button);
    });

    document.querySelectorAll('[data-resource-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.resourcePanel !== target;
    });
  });
});

byId('resource-refresh-all').addEventListener('click', async () => {
  try {
    await runResourceAction(refreshAllResourceData, '数据已刷新');
  } catch {}
});

byId('create-resource-item-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const body = buildVersionPayload('create');
    await runResourceAction(
      () => authenticatedRequest('/api/question-items', {
        method: 'POST',
        body,
      }),
      '可复用题目创建成功'
    );
    event.currentTarget.reset();
    await refreshAllResourceData();
    await loadOwnVersions(byId('own-item-select').value);
  } catch {}
});

byId('refresh-own-items').addEventListener('click', async () => {
  try {
    await runResourceAction(refreshAllResourceData, '本人题目已刷新');
  } catch {}
});

byId('own-item-select').addEventListener('change', async (event) => {
  try {
    await loadOwnVersions(event.target.value);
  } catch (error) {
    showResourceMessage(error.message, true);
  }
});

byId('load-own-detail').addEventListener('click', async () => {
  try {
    const itemId = requireValue(byId('own-item-select'), '本人题目');
    const result = await runResourceAction(
      () => authenticatedRequest(`/api/question-items/${itemId}`),
      '题目详情读取成功'
    );
    setOutput('own-item-output', result);
  } catch {}
});

byId('load-own-versions').addEventListener('click', async () => {
  try {
    const itemId = requireValue(byId('own-item-select'), '本人题目');
    await runResourceAction(
      () => loadOwnVersions(itemId),
      '版本历史读取成功'
    );
  } catch {}
});

byId('load-own-usage').addEventListener('click', async () => {
  try {
    const itemId = requireValue(byId('own-item-select'), '本人题目');
    const result = await runResourceAction(
      () => authenticatedRequest(`/api/question-items/${itemId}/usage?page=1&limit=100`),
      '使用情况读取成功'
    );
    setOutput('own-item-output', result);
  } catch {}
});

byId('create-resource-version-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const itemId = requireValue(byId('own-item-select'), '本人题目');
    const body = buildVersionPayload('version');
    await runResourceAction(
      () => authenticatedRequest(`/api/question-items/${itemId}/versions`, {
        method: 'POST',
        body,
      }),
      '题目新版本创建成功'
    );
    await refreshAllResourceData();
    byId('own-item-select').value = itemId;
    await loadOwnVersions(itemId);
  } catch {}
});

byId('restore-version-button').addEventListener('click', async () => {
  try {
    const itemId = requireValue(byId('own-item-select'), '本人题目');
    const versionId = requireValue(byId('own-version-select'), '历史版本');
    const changeNote = byId('restore-change-note').value.trim();
    await runResourceAction(
      () => authenticatedRequest(`/api/question-items/${itemId}/versions/${versionId}/restore`, {
        method: 'POST',
        body: { changeNote },
      }),
      '历史版本已复制为新版本'
    );
    await refreshAllResourceData();
    byId('own-item-select').value = itemId;
    await loadOwnVersions(itemId);
  } catch {}
});

async function addVersionToSurvey(itemId, versionId, surveyId, required) {
  return authenticatedRequest(`/api/surveys/${surveyId}/questions/from-library`, {
    method: 'POST',
    body: {
      questionItemId: itemId,
      questionVersionId: versionId,
      required,
    },
  });
}

byId('add-own-version-to-survey').addEventListener('click', async () => {
  try {
    const itemId = requireValue(byId('own-item-select'), '本人题目');
    const versionId = requireValue(byId('own-version-select'), '题目版本');
    const surveyId = requireValue(byId('own-target-survey'), '草稿问卷');
    await runResourceAction(
      () => addVersionToSurvey(itemId, versionId, surveyId, byId('own-version-required').checked),
      '指定版本已加入草稿问卷'
    );
  } catch {}
});

byId('share-own-item-select').addEventListener('change', async () => {
  try {
    await loadSentShares();
  } catch (error) {
    showResourceMessage(error.message, true);
  }
});

byId('share-resource-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const itemId = requireValue(byId('share-own-item-select'), '本人题目');
    const username = byId('share-recipient-username').value.trim();
    await runResourceAction(
      () => authenticatedRequest(`/api/question-items/${itemId}/shares`, {
        method: 'POST',
        body: { username },
      }),
      '共享操作完成'
    );
    event.currentTarget.reset();
    await loadSentShares();
  } catch {}
});

byId('refresh-sent-shares').addEventListener('click', async () => {
  try {
    await runResourceAction(loadSentShares, '发出共享已刷新');
  } catch {}
});

byId('refresh-received-items').addEventListener('click', async () => {
  try {
    await runResourceAction(refreshAllResourceData, '收到共享已刷新');
    await loadReceivedVersions(byId('received-item-select').value);
  } catch {}
});

byId('received-item-select').addEventListener('change', async (event) => {
  try {
    await loadReceivedVersions(event.target.value);
  } catch (error) {
    showResourceMessage(error.message, true);
  }
});

byId('add-received-version-to-survey').addEventListener('click', async () => {
  try {
    const itemId = requireValue(byId('received-item-select'), '共享题目');
    const versionId = requireValue(byId('received-version-select'), '共享版本');
    const surveyId = requireValue(byId('received-target-survey'), '草稿问卷');
    await runResourceAction(
      () => addVersionToSurvey(itemId, versionId, surveyId, byId('received-required').checked),
      '共享题目版本已加入草稿问卷'
    );
  } catch {}
});

byId('create-bank-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const formData = new FormData(event.currentTarget);
    const result = await runResourceAction(
      () => authenticatedRequest('/api/question-banks', {
        method: 'POST',
        body: {
          name: formData.get('name'),
          description: formData.get('description'),
        },
      }),
      '题目库创建成功'
    );
    event.currentTarget.reset();
    await refreshAllResourceData();
    byId('bank-select').value = result.questionBank.id;
    await loadBankDetail(result.questionBank.id);
  } catch {}
});

byId('refresh-banks').addEventListener('click', async () => {
  try {
    await runResourceAction(refreshAllResourceData, '题目库已刷新');
    await loadBankDetail(byId('bank-select').value);
  } catch {}
});

byId('bank-select').addEventListener('change', async (event) => {
  try {
    await loadBankDetail(event.target.value);
  } catch (error) {
    showResourceMessage(error.message, true);
  }
});

byId('update-bank-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const bankId = requireValue(byId('bank-select'), '题目库');
    const formData = new FormData(event.currentTarget);
    await runResourceAction(
      () => authenticatedRequest(`/api/question-banks/${bankId}`, {
        method: 'PATCH',
        body: {
          name: formData.get('name'),
          description: formData.get('description'),
        },
      }),
      '题目库修改成功'
    );
    await refreshAllResourceData();
    byId('bank-select').value = bankId;
    await loadBankDetail(bankId);
  } catch {}
});

byId('bank-add-item-select').addEventListener('change', async () => {
  try {
    await loadBankAddVersions();
  } catch (error) {
    showResourceMessage(error.message, true);
  }
});

byId('add-item-to-bank').addEventListener('click', async () => {
  try {
    const bankId = requireValue(byId('bank-select'), '题目库');
    const itemId = requireValue(byId('bank-add-item-select'), '本人题目');
    const preferredVersionId = requireValue(byId('bank-add-version-select'), '推荐版本');
    await runResourceAction(
      () => authenticatedRequest(`/api/question-banks/${bankId}/items`, {
        method: 'POST',
        body: { questionItemId: itemId, preferredVersionId },
      }),
      '题目已加入题目库'
    );
    await refreshAllResourceData();
    byId('bank-select').value = bankId;
    await loadBankDetail(bankId);
  } catch {}
});

byId('bank-item-select').addEventListener('change', async () => {
  try {
    await loadBankItemVersions();
  } catch (error) {
    showResourceMessage(error.message, true);
  }
});

byId('set-bank-preferred-version').addEventListener('click', async () => {
  try {
    const bankId = requireValue(byId('bank-select'), '题目库');
    const itemId = requireValue(byId('bank-item-select'), '题目库条目');
    const preferredVersionId = requireValue(byId('bank-item-version-select'), '指定版本');
    await runResourceAction(
      () => authenticatedRequest(`/api/question-banks/${bankId}/items/${itemId}/preferred-version`, {
        method: 'PATCH',
        body: { preferredVersionId },
      }),
      '推荐版本修改成功'
    );
    await loadBankDetail(bankId);
  } catch {}
});

byId('add-bank-item-to-survey').addEventListener('click', async () => {
  try {
    const bankId = requireValue(byId('bank-select'), '题目库');
    const itemId = requireValue(byId('bank-item-select'), '题目库条目');
    const questionVersionId = requireValue(byId('bank-item-version-select'), '指定版本');
    const surveyId = requireValue(byId('bank-target-survey'), '草稿问卷');
    await runResourceAction(
      () => authenticatedRequest(`/api/question-banks/${bankId}/items/${itemId}/add-to-survey`, {
        method: 'POST',
        body: {
          surveyId,
          questionVersionId,
          required: byId('bank-item-required').checked,
        },
      }),
      '题目库指定版本已加入问卷'
    );
  } catch {}
});

byId('remove-bank-item').addEventListener('click', async () => {
  try {
    const bankId = requireValue(byId('bank-select'), '题目库');
    const itemId = requireValue(byId('bank-item-select'), '题目库条目');
    await runResourceAction(
      () => authenticatedRequest(`/api/question-banks/${bankId}/items/${itemId}`, {
        method: 'DELETE',
      }),
      '题目已从题目库移除'
    );
    await refreshAllResourceData();
    byId('bank-select').value = bankId;
    await loadBankDetail(bankId);
  } catch {}
});

byId('statistics-item-select').addEventListener('change', async () => {
  try {
    await loadStatisticsVersions();
  } catch (error) {
    showResourceMessage(error.message, true);
  }
});

byId('load-cross-statistics').addEventListener('click', async () => {
  try {
    const itemId = requireValue(byId('statistics-item-select'), '统计题目');
    const versionId = byId('statistics-version-select').value;
    const query = versionId
      ? `?questionVersionId=${encodeURIComponent(versionId)}`
      : '';
    const result = await runResourceAction(
      () => authenticatedRequest(`/api/question-items/${itemId}/cross-survey-statistics${query}`),
      '跨问卷统计读取成功'
    );
    renderStatistics(result);
  } catch {}
});

initializeResourcePage();
