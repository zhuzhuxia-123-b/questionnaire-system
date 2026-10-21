(() => {
  const surveyTitleElement =
    document.querySelector(
      '#statistics-survey-title'
    );

  const authStatusElement =
    document.querySelector(
      '#statistics-auth-status'
    );

  const messageElement =
    document.querySelector(
      '#statistics-message'
    );

  const contentElement =
    document.querySelector(
      '#statistics-content'
    );

  const surveyStatusElement =
    document.querySelector(
      '#statistics-survey-status'
    );

  const responseCountElement =
    document.querySelector(
      '#statistics-response-count'
    );

  const questionCountElement =
    document.querySelector(
      '#statistics-question-count'
    );

  const questionFilter =
    document.querySelector(
      '#statistics-question-filter'
    );

  const refreshButton =
    document.querySelector(
      '#refresh-statistics-button'
    );

  const questionList =
    document.querySelector(
      '#statistics-question-list'
    );

  const statusLabels = {
    draft: '草稿',
    published: '已发布',
    closed: '已关闭',
  };

  const typeLabels = {
    singleChoice: '单选题',
    multipleChoice: '多选题',
    text: '文本题',
    number: '数字题',
  };

  let surveyId = '';
  let allQuestions = [];

  function showMessage(
    message,
    isError = false
  ) {
    messageElement.textContent = message;

    messageElement.className = isError
      ? 'form-message status-error'
      : 'form-message status-success';
  }

  function formatNumber(value) {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value)
    ) {
      return '无数据';
    }

    return new Intl.NumberFormat(
      'zh-CN',
      {
        maximumFractionDigits: 2,
      }
    ).format(value);
  }

  function createMetric(
    label,
    value
  ) {
    const container =
      document.createElement('div');

    container.className =
      'statistics-metric';

    const labelElement =
      document.createElement('span');

    labelElement.className =
      'statistics-metric-label';

    labelElement.textContent = label;

    const valueElement =
      document.createElement('strong');

    valueElement.textContent =
      String(value);

    container.append(
      labelElement,
      valueElement
    );

    return container;
  }

  function createEmptyMessage(text) {
    const paragraph =
      document.createElement('p');

    paragraph.className =
      'empty-message';

    paragraph.textContent = text;

    return paragraph;
  }

  function renderChoiceStatistics(
    question
  ) {
    const options =
      question.options || [];

    if (options.length === 0) {
      return createEmptyMessage(
        '当前没有选项统计数据'
      );
    }

    const wrapper =
      document.createElement('div');

    wrapper.className =
      'statistics-table-wrapper';

    const table =
      document.createElement('table');

    table.className =
      'statistics-table';

    const head =
      document.createElement('thead');

    const headRow =
      document.createElement('tr');

    ['选项', '选择次数'].forEach(
      (text) => {
        const cell =
          document.createElement('th');

        cell.textContent = text;
        headRow.append(cell);
      }
    );

    head.append(headRow);

    const body =
      document.createElement('tbody');

    options.forEach((option) => {
      const row =
        document.createElement('tr');

      const labelCell =
        document.createElement('td');

      labelCell.textContent =
        option.label;

      const countCell =
        document.createElement('td');

      countCell.textContent =
        String(option.count);

      row.append(
        labelCell,
        countCell
      );

      body.append(row);
    });

    table.append(head, body);
    wrapper.append(table);

    return wrapper;
  }

  function renderTextStatistics(
    question
  ) {
    const values =
      Array.isArray(question.values)
        ? question.values
        : [];

    if (values.length === 0) {
      return createEmptyMessage(
        '当前没有文本回答'
      );
    }

    const list =
      document.createElement('ol');

    list.className =
      'statistics-text-values';

    values.forEach((value) => {
      const item =
        document.createElement('li');

      item.textContent = value;
      list.append(item);
    });

    return list;
  }

  function renderNumberStatistics(
    question
  ) {
    const values =
      Array.isArray(question.values)
        ? question.values.filter(
            (value) =>
              typeof value === 'number' &&
              Number.isFinite(value)
          )
        : [];

    const minimum =
      values.length > 0
        ? Math.min(...values)
        : null;

    const maximum =
      values.length > 0
        ? Math.max(...values)
        : null;

    const grid =
      document.createElement('div');

    grid.className =
      'statistics-number-grid';

    grid.append(
      createMetric(
        '有效数字数量',
        question.totalAnswers
      ),
      createMetric(
        '平均值',
        formatNumber(question.average)
      ),
      createMetric(
        '最小值',
        formatNumber(minimum)
      ),
      createMetric(
        '最大值',
        formatNumber(maximum)
      )
    );

    return grid;
  }

  function renderQuestion(question) {
    const article =
      document.createElement('article');

    article.className =
      'card statistics-question';

    const heading =
      document.createElement('h3');

    heading.textContent =
      `${question.order}. ` +
      `${question.title}`;

    const meta =
      document.createElement('p');

    meta.className =
      'question-meta';

    meta.textContent =
      typeLabels[question.type] ||
      question.type;

    const answerSummary =
      document.createElement('div');

    answerSummary.className =
      'statistics-answer-summary';

    answerSummary.append(
      createMetric(
        '已回答',
        question.totalAnswers
      ),
      createMetric(
        '未回答',
        question.notAnsweredCount
      )
    );

    article.append(
      heading,
      meta,
      answerSummary
    );

    if (
      question.type === 'singleChoice' ||
      question.type === 'multipleChoice'
    ) {
      article.append(
        renderChoiceStatistics(question)
      );
    } else if (
      question.type === 'text'
    ) {
      article.append(
        renderTextStatistics(question)
      );
    } else if (
      question.type === 'number'
    ) {
      article.append(
        renderNumberStatistics(question)
      );
    }

    return article;
  }

  function populateQuestionFilter(
    questions
  ) {
    const selectedValue =
      questionFilter.value;

    questionFilter.replaceChildren();

    const allOption =
      document.createElement('option');

    allOption.value = '';
    allOption.textContent = '整份问卷';

    questionFilter.append(allOption);

    questions.forEach((question) => {
      const option =
        document.createElement('option');

      option.value =
        question.questionId;

      option.textContent =
        `${question.order}. ` +
        `${question.title}`;

      questionFilter.append(option);
    });

    const selectedStillExists =
      questions.some(
        (question) =>
          question.questionId ===
          selectedValue
      );

    questionFilter.value =
      selectedStillExists
        ? selectedValue
        : '';
  }

  function renderStatistics(result) {
    surveyTitleElement.textContent =
      result.survey.title;

    document.title =
      `${result.survey.title} - 问卷统计`;

    surveyStatusElement.textContent =
      statusLabels[
        result.survey.status
      ] || result.survey.status;

    responseCountElement.textContent =
      String(result.responseCount);

    questionCountElement.textContent =
      String(result.questionCount);

    questionList.replaceChildren();

    if (result.questions.length === 0) {
      questionList.append(
        createEmptyMessage(
          '当前没有可显示的题目统计'
        )
      );

      return;
    }

    const fragment =
      document.createDocumentFragment();

    result.questions.forEach(
      (question) => {
        fragment.append(
          renderQuestion(question)
        );
      }
    );

    questionList.append(fragment);
  }

  async function loadStatistics(
    questionId = ''
  ) {
    refreshButton.disabled = true;

    showMessage('正在读取统计数据……');

    const query =
      new URLSearchParams();

    if (questionId) {
      query.set(
        'questionId',
        questionId
      );
    }

    const queryString =
      query.toString();

    const path =
      `/api/surveys/` +
      `${encodeURIComponent(surveyId)}` +
      '/statistics' +
      (
        queryString
          ? `?${queryString}`
          : ''
      );

    try {
      const result =
        await window.Api.request(
          path,
          {
            auth: true,
          }
        );

      /*
       * 整份统计包含全部题目，
       * 用于建立题目筛选选项。
       */
      if (!questionId) {
        allQuestions =
          result.questions;

        populateQuestionFilter(
          allQuestions
        );
      }

      renderStatistics(result);
      contentElement.hidden = false;

      showMessage(
        questionId
          ? '单题统计已更新'
          : '整份问卷统计已更新'
      );
    } catch (error) {
      contentElement.hidden = true;

      if (error.status === 401) {
        window.Api.clearToken();

        authStatusElement.textContent =
          '登录状态无效，请返回首页重新登录。';
      }

      showMessage(
        error.message,
        true
      );
    } finally {
      refreshButton.disabled = false;
    }
  }

  async function verifyCurrentUser() {
    if (!window.Api.getToken()) {
      authStatusElement.textContent =
        '当前未登录，请返回首页登录后查看统计。';

      showMessage(
        '查看统计需要登录',
        true
      );

      return false;
    }

    try {
      const result =
        await window.Api.request(
          '/api/auth/me',
          {
            auth: true,
          }
        );

      authStatusElement.textContent =
        `当前登录用户：${result.user.username}`;

      return true;
    } catch (error) {
      if (error.status === 401) {
        window.Api.clearToken();
      }

      authStatusElement.textContent =
        '登录状态无效，请返回首页重新登录。';

      showMessage(
        error.message,
        true
      );

      return false;
    }
  }

  async function initializeStatistics() {
    surveyId =
      new URLSearchParams(
        window.location.search
      ).get('surveyId') || '';

    if (!surveyId) {
      surveyTitleElement.textContent =
        '无法读取统计';

      showMessage(
        '统计页面缺少 surveyId',
        true
      );

      return;
    }

    const authenticated =
      await verifyCurrentUser();

    if (!authenticated) {
      return;
    }

    await loadStatistics();
  }

  questionFilter.addEventListener(
    'change',
    () => {
      loadStatistics(
        questionFilter.value
      );
    }
  );

  refreshButton.addEventListener(
    'click',
    () => {
      loadStatistics(
        questionFilter.value
      );
    }
  );

  initializeStatistics();
})();