const surveyManagement =
  document.querySelector(
    '#survey-management'
  );

const createSurveyForm =
  document.querySelector(
    '#create-survey-form'
  );

const createSurveyMessage =
  document.querySelector(
    '#create-survey-message'
  );

const surveyList =
  document.querySelector(
    '#survey-list'
  );

const surveyListMessage =
  document.querySelector(
    '#survey-list-message'
  );

const surveySummary =
  document.querySelector(
    '#survey-summary'
  );

const surveyStatusFilter =
  document.querySelector(
    '#survey-status-filter'
  );

const refreshSurveysButton =
  document.querySelector(
    '#refresh-surveys-button'
  );

const statusLabels = {
  draft: '草稿',
  published: '已发布',
  closed: '已关闭',
};

function showSurveyMessage(
  element,
  message,
  isError = false
) {
  element.textContent = message;

  element.className = isError
    ? 'form-message status-error'
    : 'form-message status-success';
}

function formatDate(value) {
  if (!value) {
    return '未设置';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '时间格式无效';
  }

  return new Intl.DateTimeFormat(
    'zh-CN',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  ).format(date);
}

function getPublicSurveyUrl(publicId) {
  const url = new URL(
    '/survey.html',
    window.location.origin
  );

  url.searchParams.set(
    'publicId',
    publicId
  );

  return url.toString();
}

function getStatisticsUrl(surveyId) {
  const url = new URL(
    '/statistics.html',
    window.location.origin
  );

  url.searchParams.set(
    'surveyId',
    surveyId
  );

  return url.toString();
}

async function copyText(text) {
  if (
    navigator.clipboard &&
    window.isSecureContext
  ) {
    await navigator.clipboard.writeText(
      text
    );

    return;
  }

  const textArea =
    document.createElement('textarea');

  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';

  document.body.append(textArea);
  textArea.select();

  const copied =
    document.execCommand('copy');

  textArea.remove();

  if (!copied) {
    throw new Error(
      '浏览器未允许复制，请手动复制链接'
    );
  }
}

async function runSurveyLifecycleAction(
  survey,
  action,
  button
) {
  const actionText =
    action === 'publish'
      ? '发布'
      : '关闭';

  const warning =
    action === 'publish'
      ? '发布后将不能继续编辑题目，确认发布吗？'
      : '关闭后将不能继续填写，确认关闭吗？';

  if (!window.confirm(warning)) {
    return;
  }

  button.disabled = true;

  showSurveyMessage(
    surveyListMessage,
    `正在${actionText}问卷……`
  );

  try {
    const result =
      await window.Api.request(
        `/api/surveys/` +
          `${survey.id}/${action}`,
        {
          method: 'POST',
          auth: true,
        }
      );

    await loadSurveys();

    showSurveyMessage(
      surveyListMessage,
      result.message
    );
  } catch (error) {
    showSurveyMessage(
      surveyListMessage,
      error.message,
      true
    );
  } finally {
    button.disabled = false;
  }
}

function createSurveyActionButton(
  label,
  className,
  handler
) {
  const button =
    document.createElement('button');

  button.type = 'button';
  button.textContent = label;

  if (className) {
    button.className = className;
  }

  button.addEventListener(
    'click',
    handler
  );

  return button;
}

function createDetail(text) {
  const paragraph =
    document.createElement('p');

  paragraph.className =
    'survey-detail';

  paragraph.textContent = text;

  return paragraph;
}

function openStatistics(survey) {
  window.open(
    getStatisticsUrl(survey.id),
    '_blank',
    'noopener'
  );
}

function createSurveyItem(survey) {
  const article =
    document.createElement('article');

  article.className = 'survey-item';

  const title =
    document.createElement('h3');

  title.textContent = survey.title;

  const status =
    document.createElement('span');

  status.className =
    `survey-status ` +
    `survey-status-${survey.status}`;

  status.textContent =
    statusLabels[survey.status] ||
    survey.status;

  const description =
    document.createElement('p');

  description.className =
    'survey-description';

  description.textContent =
    survey.description ||
    '暂无问卷说明';

  const actions =
    document.createElement('div');

  actions.className =
    'survey-actions';

  const manageButton =
    createSurveyActionButton(
      survey.status === 'draft'
        ? '管理题目'
        : '查看题目',
      'manage-questions-button',
      () => {
        window.dispatchEvent(
          new CustomEvent(
            'survey:selected',
            {
              detail: {
                survey,
              },
            }
          )
        );
      }
    );

  actions.append(manageButton);

  if (survey.status === 'draft') {
    const publishButton =
      createSurveyActionButton(
        '发布问卷',
        '',
        (event) => {
          runSurveyLifecycleAction(
            survey,
            'publish',
            event.currentTarget
          );
        }
      );

    actions.append(publishButton);
  }

  if (
    survey.status === 'published' ||
    survey.status === 'closed'
  ) {
    const statisticsButton =
      createSurveyActionButton(
        '查看统计',
        'button-secondary',
        () => {
          openStatistics(survey);
        }
      );

    actions.append(statisticsButton);
  }

  if (survey.status === 'published') {
    const openPublicButton =
      createSurveyActionButton(
        '打开公开问卷',
        '',
        () => {
          window.open(
            getPublicSurveyUrl(
              survey.publicId
            ),
            '_blank',
            'noopener'
          );
        }
      );

    const copyLinkButton =
      createSurveyActionButton(
        '复制公开链接',
        'button-secondary',
        async () => {
          try {
            await copyText(
              getPublicSurveyUrl(
                survey.publicId
              )
            );

            showSurveyMessage(
              surveyListMessage,
              '公开链接已复制'
            );
          } catch (error) {
            showSurveyMessage(
              surveyListMessage,
              error.message,
              true
            );
          }
        }
      );

    const closeSurveyButton =
      createSurveyActionButton(
        '关闭问卷',
        'button-danger',
        (event) => {
          runSurveyLifecycleAction(
            survey,
            'close',
            event.currentTarget
          );
        }
      );

    actions.append(
      openPublicButton,
      copyLinkButton,
      closeSurveyButton
    );
  }

  article.append(
    title,
    status,
    description,
    createDetail(
      `公开编号：${survey.publicId}`
    ),
    createDetail(
      `截止时间：${formatDate(
        survey.deadline
      )}`
    ),
    createDetail(
      `允许匿名：${
        survey.allowAnonymous
          ? '是'
          : '否'
      }`
    ),
    createDetail(
      `允许重复提交：${
        survey.allowMultipleSubmissions
          ? '是'
          : '否'
      }`
    ),
    createDetail(
      `创建时间：${formatDate(
        survey.createdAt
      )}`
    ),
    actions
  );

  return article;
}

function renderSurveys(
  surveys,
  pagination
) {
  surveyList.replaceChildren();

  surveySummary.textContent =
    `共 ${pagination.total} 份问卷`;

  if (surveys.length === 0) {
    const emptyMessage =
      document.createElement('p');

    emptyMessage.className =
      'empty-message';

    emptyMessage.textContent =
      '当前没有符合条件的问卷';

    surveyList.append(emptyMessage);
    return;
  }

  const fragment =
    document.createDocumentFragment();

  surveys.forEach((survey) => {
    fragment.append(
      createSurveyItem(survey)
    );
  });

  surveyList.append(fragment);
}

async function loadSurveys() {
  if (!window.Api.getToken()) {
    return;
  }

  showSurveyMessage(
    surveyListMessage,
    '正在读取问卷……'
  );

  const status =
    surveyStatusFilter.value;

  const query = new URLSearchParams({
    page: '1',
    limit: '50',
  });

  if (status) {
    query.set('status', status);
  }

  try {
    const result =
      await window.Api.request(
        `/api/surveys?${query}`,
        {
          auth: true,
        }
      );

    renderSurveys(
      result.surveys,
      result.pagination
    );

    showSurveyMessage(
      surveyListMessage,
      '问卷列表已更新'
    );
  } catch (error) {
    if (error.status === 401) {
      window.Api.clearToken();
      window.location.reload();
      return;
    }

    showSurveyMessage(
      surveyListMessage,
      error.message,
      true
    );
  }
}

createSurveyForm.addEventListener(
  'submit',
  async (event) => {
    event.preventDefault();

    const submitButton =
      createSurveyForm.querySelector(
        'button[type="submit"]'
      );

    const formData =
      new FormData(createSurveyForm);

    const deadline =
      formData.get('deadline');

    showSurveyMessage(
      createSurveyMessage,
      '正在创建问卷……'
    );

    submitButton.disabled = true;

    try {
      await window.Api.request(
        '/api/surveys',
        {
          method: 'POST',
          auth: true,
          body: {
            title:
              formData.get('title'),
            description:
              formData.get(
                'description'
              ),
            deadline: deadline
              ? new Date(
                  deadline
                ).toISOString()
              : null,
            allowAnonymous:
              document.querySelector(
                '#survey-anonymous'
              ).checked,
            allowMultipleSubmissions:
              document.querySelector(
                '#survey-multiple'
              ).checked,
          },
        }
      );

      createSurveyForm.reset();

      showSurveyMessage(
        createSurveyMessage,
        '问卷创建成功'
      );

      await loadSurveys();
    } catch (error) {
      showSurveyMessage(
        createSurveyMessage,
        error.message,
        true
      );
    } finally {
      submitButton.disabled = false;
    }
  }
);

surveyStatusFilter.addEventListener(
  'change',
  loadSurveys
);

refreshSurveysButton.addEventListener(
  'click',
  loadSurveys
);

window.addEventListener(
  'auth:changed',
  (event) => {
    const user = event.detail?.user;

    surveyManagement.hidden =
      !user;

    if (user) {
      loadSurveys();
    } else {
      surveyList.replaceChildren();

      surveySummary.textContent = '';
    }
  }
);