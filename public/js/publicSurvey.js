(() => {
  const titleElement = document.querySelector(
    '#public-survey-title'
  );
  const descriptionElement = document.querySelector(
    '#public-survey-description'
  );
  const deadlineElement = document.querySelector(
    '#public-survey-deadline'
  );
  const authStatusElement = document.querySelector(
    '#public-auth-status'
  );
  const surveyMessageElement = document.querySelector(
    '#public-survey-message'
  );
  const questionSection = document.querySelector(
    '#public-question-list'
  );
  const responseForm = document.querySelector(
    '#response-form'
  );
  const progressElement = document.querySelector(
    '#question-progress'
  );
  const currentQuestionElement = document.querySelector(
    '#current-question'
  );
  const questionMessageElement = document.querySelector(
    '#question-message'
  );
  const anonymousPanel = document.querySelector(
    '#anonymous-panel'
  );
  const anonymousCheckbox = document.querySelector(
    '#anonymous-checkbox'
  );
  const previousButton = document.querySelector(
    '#previous-question-button'
  );
  const nextButton = document.querySelector(
    '#next-question-button'
  );
  const successSection = document.querySelector(
    '#submission-success'
  );
  const successMessageElement = document.querySelector(
    '#submission-success-message'
  );
  const submissionSummary = document.querySelector(
    '#submission-summary'
  );

  const typeLabels = {
    singleChoice: '单选题',
    multipleChoice: '多选题',
    text: '文本题',
    number: '数字题',
  };

  let publicId = '';
  let survey = null;
  let questions = [];
  let currentUser = null;
  let visitedPath = [];
  let currentPathIndex = 0;

  const questionById = new Map();
  const answerMap = new Map();

  function showMessage(
    element,
    message,
    isError = false
  ) {
    element.textContent = message;
    element.className = isError
      ? 'form-message status-error'
      : 'form-message status-success';
  }

  function clearMessage(element) {
    element.textContent = '';
    element.className = 'form-message';
  }

  function formatDeadline(value) {
    if (!value) {
      return '未设置截止时间';
    }

    return `截止时间：${new Intl.DateTimeFormat(
      'zh-CN',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    ).format(new Date(value))}`;
  }

  function hasValue(value) {
    return (
      value !== undefined &&
      value !== null
    );
  }

  function getValidationText(question) {
    const validation =
      question.validation || {};
    const parts = [];

    if (
      question.type === 'multipleChoice'
    ) {
      if (
        hasValue(
          validation.minSelections
        )
      ) {
        parts.push(
          `至少选择 ${validation.minSelections} 项`
        );
      }

      if (
        hasValue(
          validation.maxSelections
        )
      ) {
        parts.push(
          `最多选择 ${validation.maxSelections} 项`
        );
      }
    }

    if (question.type === 'text') {
      if (
        hasValue(validation.minLength)
      ) {
        parts.push(
          `至少 ${validation.minLength} 个字符`
        );
      }

      if (
        hasValue(validation.maxLength)
      ) {
        parts.push(
          `最多 ${validation.maxLength} 个字符`
        );
      }
    }

    if (question.type === 'number') {
      if (
        hasValue(validation.minValue)
      ) {
        parts.push(
          `最小值 ${validation.minValue}`
        );
      }

      if (
        hasValue(validation.maxValue)
      ) {
        parts.push(
          `最大值 ${validation.maxValue}`
        );
      }

      if (
        validation.integerOnly === true
      ) {
        parts.push('只能填写整数');
      }
    }

    return parts.join('，');
  }

  function createChoiceInput(
    question,
    option,
    selectedValue
  ) {
    const label =
      document.createElement('label');

    label.className =
      'checkbox-row public-choice';

    const input =
      document.createElement('input');

    input.type =
      question.type === 'singleChoice'
        ? 'radio'
        : 'checkbox';

    input.name = 'current-answer';
    input.value = option.optionId;

    if (
      question.type === 'singleChoice'
    ) {
      input.checked =
        selectedValue === option.optionId;
    } else {
      input.checked =
        Array.isArray(selectedValue) &&
        selectedValue.includes(
          option.optionId
        );
    }

    const text =
      document.createElement('span');

    text.textContent = option.label;

    label.append(input, text);

    return label;
  }

  function createQuestionInput(
    question
  ) {
    const selectedValue =
      answerMap.get(question.id);

    const container =
      document.createElement('div');

    container.className =
      'public-answer-control';

    if (
      question.type === 'singleChoice' ||
      question.type === 'multipleChoice'
    ) {
      (question.options || []).forEach(
        (option) => {
          container.append(
            createChoiceInput(
              question,
              option,
              selectedValue
            )
          );
        }
      );

      return container;
    }

    if (question.type === 'text') {
      const textarea =
        document.createElement('textarea');

      textarea.id = 'current-answer';
      textarea.rows = 6;
      textarea.placeholder =
        '请输入你的回答';

      textarea.value =
        typeof selectedValue === 'string'
          ? selectedValue
          : '';

      container.append(textarea);

      return container;
    }

    const input =
      document.createElement('input');

    input.id = 'current-answer';
    input.type = 'number';
    input.placeholder = '请输入数字';

    const validation =
      question.validation || {};

    if (
      hasValue(validation.minValue)
    ) {
      input.min = validation.minValue;
    }

    if (
      hasValue(validation.maxValue)
    ) {
      input.max = validation.maxValue;
    }

    input.step =
      validation.integerOnly === true
        ? '1'
        : 'any';

    if (
      typeof selectedValue === 'number'
    ) {
      input.value = selectedValue;
    }

    container.append(input);

    return container;
  }

  function getCurrentQuestion() {
    const questionId =
      visitedPath[currentPathIndex];

    return questionById.get(questionId);
  }

  function readCurrentValue(question) {
    if (
      question.type === 'singleChoice'
    ) {
      return currentQuestionElement
        .querySelector(
          'input[name="current-answer"]:checked'
        )
        ?.value;
    }

    if (
      question.type === 'multipleChoice'
    ) {
      return [
        ...currentQuestionElement
          .querySelectorAll(
            'input[name="current-answer"]:checked'
          ),
      ].map((input) => input.value);
    }

    const input =
      currentQuestionElement.querySelector(
        '#current-answer'
      );

    if (question.type === 'text') {
      return input.value;
    }

    if (input.value.trim() === '') {
      return undefined;
    }

    return Number(input.value);
  }

  function isAnswered(question, value) {
    if (
      value === undefined ||
      value === null
    ) {
      return false;
    }

    if (question.type === 'text') {
      return (
        typeof value === 'string' &&
        value.trim().length > 0
      );
    }

    if (
      question.type === 'multipleChoice'
    ) {
      return (
        Array.isArray(value) &&
        value.length > 0
      );
    }

    return true;
  }

  function validateAnswer(
    question,
    value,
    answered
  ) {
    if (
      question.required &&
      !answered
    ) {
      return `${question.title}：该题为必答题`;
    }

    if (!answered) {
      return null;
    }

    const validation =
      question.validation || {};

    const optionIds = new Set(
      (question.options || []).map(
        (option) => option.optionId
      )
    );

    if (
      question.type === 'singleChoice'
    ) {
      if (
        typeof value !== 'string' ||
        !optionIds.has(value)
      ) {
        return `${question.title}：请选择有效选项`;
      }
    }

    if (
      question.type === 'multipleChoice'
    ) {
      if (
        !Array.isArray(value) ||
        value.some(
          (item) => !optionIds.has(item)
        )
      ) {
        return `${question.title}：包含无效选项`;
      }

      if (
        hasValue(
          validation.minSelections
        ) &&
        value.length <
          validation.minSelections
      ) {
        return (
          `${question.title}：至少选择 ` +
          `${validation.minSelections} 项`
        );
      }

      if (
        hasValue(
          validation.maxSelections
        ) &&
        value.length >
          validation.maxSelections
      ) {
        return (
          `${question.title}：最多选择 ` +
          `${validation.maxSelections} 项`
        );
      }
    }

    if (question.type === 'text') {
      const text = value.trim();

      if (
        hasValue(
          validation.minLength
        ) &&
        text.length <
          validation.minLength
      ) {
        return (
          `${question.title}：至少需要 ` +
          `${validation.minLength} 个字符`
        );
      }

      if (
        hasValue(
          validation.maxLength
        ) &&
        text.length >
          validation.maxLength
      ) {
        return (
          `${question.title}：不能超过 ` +
          `${validation.maxLength} 个字符`
        );
      }
    }

    if (question.type === 'number') {
      if (
        typeof value !== 'number' ||
        !Number.isFinite(value)
      ) {
        return `${question.title}：答案必须是有限数字`;
      }

      if (
        validation.integerOnly === true &&
        !Number.isInteger(value)
      ) {
        return `${question.title}：答案必须是整数`;
      }

      if (
        hasValue(validation.minValue) &&
        value < validation.minValue
      ) {
        return (
          `${question.title}：不能小于 ` +
          `${validation.minValue}`
        );
      }

      if (
        hasValue(validation.maxValue) &&
        value > validation.maxValue
      ) {
        return (
          `${question.title}：不能大于 ` +
          `${validation.maxValue}`
        );
      }
    }

    return null;
  }

  function normalizeValue(
    question,
    value
  ) {
    if (question.type === 'text') {
      return value.trim();
    }

    return value;
  }

  function saveCurrentAnswer(
    shouldValidate = true
  ) {
    const question =
      getCurrentQuestion();

    if (!question) {
      return null;
    }

    const rawValue =
      readCurrentValue(question);

    const answered =
      isAnswered(question, rawValue);

    if (shouldValidate) {
      const errorMessage =
        validateAnswer(
          question,
          rawValue,
          answered
        );

      if (errorMessage) {
        showMessage(
          questionMessageElement,
          errorMessage,
          true
        );

        return null;
      }
    }

    if (answered) {
      answerMap.set(
        question.id,
        normalizeValue(
          question,
          rawValue
        )
      );
    } else {
      answerMap.delete(question.id);
    }

    return {
      question,
      answered,
      value: answered
        ? answerMap.get(question.id)
        : undefined,
    };
  }

  function ruleMatches(rule, value) {
    if (rule.operator === 'equals') {
      return value === rule.value;
    }

    if (
      rule.operator === 'containsAny'
    ) {
      return (
        Array.isArray(value) &&
        Array.isArray(rule.value) &&
        rule.value.some(
          (item) => value.includes(item)
        )
      );
    }

    if (
      rule.operator === 'containsAll'
    ) {
      return (
        Array.isArray(value) &&
        Array.isArray(rule.value) &&
        rule.value.every(
          (item) => value.includes(item)
        )
      );
    }

    if (rule.operator === 'gt') {
      return value > rule.value;
    }

    if (rule.operator === 'gte') {
      return value >= rule.value;
    }

    if (rule.operator === 'lt') {
      return value < rule.value;
    }

    if (rule.operator === 'lte') {
      return value <= rule.value;
    }

    return false;
  }

  function getNextAction(
    question,
    value,
    answered
  ) {
    const sortedRules = [
      ...(question.jumpRules || []),
    ].sort(
      (left, right) =>
        left.priority - right.priority
    );

    const matchedRule = answered
      ? sortedRules.find(
          (rule) =>
            ruleMatches(rule, value)
        )
      : null;

    if (matchedRule) {
      if (
        matchedRule.action === 'submit'
      ) {
        return {
          action: 'submit',
        };
      }

      return {
        action: 'goto',
        targetQuestionId:
          matchedRule.targetQuestionId,
      };
    }

    const currentIndex =
      questions.findIndex(
        (item) =>
          item.id === question.id
      );

    const nextQuestion =
      questions[currentIndex + 1];

    if (!nextQuestion) {
      return {
        action: 'submit',
      };
    }

    return {
      action: 'goto',
      targetQuestionId:
        nextQuestion.id,
    };
  }

  function updateNextButtonText() {
    const question =
      getCurrentQuestion();

    if (!question) {
      return;
    }

    const value =
      readCurrentValue(question);

    const answered =
      isAnswered(question, value);

    const nextAction =
      getNextAction(
        question,
        value,
        answered
      );

    nextButton.textContent =
      nextAction.action === 'submit'
        ? '提交答卷'
        : '下一题';
  }

  function renderCurrentQuestion() {
    const question =
      getCurrentQuestion();

    if (!question) {
      showMessage(
        questionMessageElement,
        '当前题目不存在',
        true
      );

      return;
    }

    clearMessage(
      questionMessageElement
    );

    currentQuestionElement
      .replaceChildren();

    const heading =
      document.createElement('h2');

    heading.textContent =
      `${question.order}. ${question.title}`;

    const meta =
      document.createElement('p');

    meta.className = 'question-meta';

    meta.textContent =
      `${typeLabels[question.type]} · ` +
      `${
        question.required
          ? '必答'
          : '非必答'
      }`;

    currentQuestionElement.append(
      heading,
      meta
    );

    const validationText =
      getValidationText(question);

    if (validationText) {
      const validationElement =
        document.createElement('p');

      validationElement.className =
        'question-meta';

      validationElement.textContent =
        `填写限制：${validationText}`;

      currentQuestionElement.append(
        validationElement
      );
    }

    currentQuestionElement.append(
      createQuestionInput(question)
    );

    progressElement.textContent =
      `当前为第 ${currentPathIndex + 1} 个已访问题目，` +
      `原问卷题号 ${question.order}/${questions.length}`;

    previousButton.disabled =
      currentPathIndex === 0;

    currentQuestionElement
      .querySelectorAll(
        'input, textarea'
      )
      .forEach((input) => {
        input.addEventListener(
          'input',
          updateNextButtonText
        );

        input.addEventListener(
          'change',
          updateNextButtonText
        );
      });

    updateNextButtonText();
  }

  function removeFutureAnswers() {
    const futureQuestionIds =
      visitedPath.slice(
        currentPathIndex + 1
      );

    futureQuestionIds.forEach(
      (questionId) => {
        answerMap.delete(questionId);
      }
    );

    visitedPath =
      visitedPath.slice(
        0,
        currentPathIndex + 1
      );
  }

  async function submitResponse() {
    if (!currentUser) {
      showMessage(
        questionMessageElement,
        '登录状态无效，请返回首页重新登录',
        true
      );

      return;
    }

    const pathQuestionIds =
      visitedPath.slice(
        0,
        currentPathIndex + 1
      );

    const answers =
      pathQuestionIds
        .filter(
          (questionId) =>
            answerMap.has(questionId)
        )
        .map((questionId) => ({
          questionId,
          value:
            answerMap.get(questionId),
        }));

    nextButton.disabled = true;
    previousButton.disabled = true;

    showMessage(
      questionMessageElement,
      '正在提交答卷……'
    );

    try {
      const result =
        await window.Api.request(
          `/api/public/surveys/` +
            `${encodeURIComponent(publicId)}` +
            '/responses',
          {
            method: 'POST',
            auth: true,
            body: {
              anonymous:
                survey.allowAnonymous
                  ? anonymousCheckbox.checked
                  : false,
              answers,
            },
          }
        );

      questionSection.hidden = true;
      successSection.hidden = false;

      successMessageElement.textContent =
        result.message;

      submissionSummary.textContent =
        `共保存 ${result.response.answerCount} 个答案，` +
        `访问 ${result.response.visitedQuestionIds.length} 道题。`;
    } catch (error) {
      if (error.status === 401) {
        window.Api.clearToken();
        currentUser = null;
      }

      showMessage(
        questionMessageElement,
        error.message,
        true
      );

      nextButton.disabled = false;
      previousButton.disabled =
        currentPathIndex === 0;
    }
  }

  async function handleNext(event) {
    event.preventDefault();

    clearMessage(
      questionMessageElement
    );

    const current =
      saveCurrentAnswer(true);

    if (!current) {
      return;
    }

    const nextAction =
      getNextAction(
        current.question,
        current.value,
        current.answered
      );

    removeFutureAnswers();

    if (
      nextAction.action === 'submit'
    ) {
      await submitResponse();
      return;
    }

    const nextQuestion =
      questionById.get(
        nextAction.targetQuestionId
      );

    if (!nextQuestion) {
      showMessage(
        questionMessageElement,
        '跳转目标不存在，无法继续填写',
        true
      );

      return;
    }

    if (
      visitedPath.includes(
        nextQuestion.id
      )
    ) {
      showMessage(
        questionMessageElement,
        '填写路径出现循环',
        true
      );

      return;
    }

    visitedPath.push(nextQuestion.id);
    currentPathIndex += 1;

    renderCurrentQuestion();

    window.scrollTo({
      top: questionSection.offsetTop,
      behavior: 'smooth',
    });
  }

  function handlePrevious() {
    if (currentPathIndex === 0) {
      return;
    }

    saveCurrentAnswer(false);

    currentPathIndex -= 1;

    renderCurrentQuestion();
  }

  async function loadCurrentUser() {
    if (!window.Api.getToken()) {
      authStatusElement.textContent =
        '当前未登录。请返回系统首页登录后再填写问卷。';

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

      currentUser = result.user;

      authStatusElement.textContent =
        `当前登录用户：${currentUser.username}`;

      return true;
    } catch (error) {
      if (error.status === 401) {
        window.Api.clearToken();
      }

      currentUser = null;

      authStatusElement.textContent =
        '登录状态已失效，请返回系统首页重新登录后再填写。';

      return false;
    }
  }

  async function loadPublicSurvey(
    authenticated
  ) {
    showMessage(
      surveyMessageElement,
      '正在读取公开问卷……'
    );

    try {
      const result =
        await window.Api.request(
          `/api/public/surveys/` +
            `${encodeURIComponent(publicId)}`
        );

      survey = result.survey;

      questions = [
        ...result.questions,
      ].sort(
        (left, right) =>
          left.order - right.order
      );

      titleElement.textContent =
        survey.title;

      descriptionElement.textContent =
        survey.description ||
        '暂无问卷说明';

      deadlineElement.textContent =
        formatDeadline(
          survey.deadline
        );

      if (questions.length === 0) {
        throw new Error(
          '问卷没有可填写的题目'
        );
      }

      showMessage(
        surveyMessageElement,
        `公开问卷读取成功，共 ${questions.length} 道题目`
      );

      /*
       * 公开问卷可以在未登录状态读取，
       * 但必须登录后才能进入填写流程。
       */
      if (!authenticated) {
        questionSection.hidden = true;

        showMessage(
          surveyMessageElement,
          `问卷共 ${questions.length} 道题。` +
            '请返回系统首页登录后再填写。',
          true
        );

        return;
      }

      questionById.clear();
      answerMap.clear();

      questions.forEach((question) => {
        questionById.set(
          question.id,
          question
        );
      });

      visitedPath = [
        questions[0].id,
      ];

      currentPathIndex = 0;

      anonymousPanel.hidden =
        !survey.allowAnonymous;

      anonymousCheckbox.checked =
        false;

      questionSection.hidden = false;
      successSection.hidden = true;

      renderCurrentQuestion();
    } catch (error) {
      titleElement.textContent =
        '问卷无法访问';

      descriptionElement.textContent =
        '';

      deadlineElement.textContent =
        '';

      questionSection.hidden = true;

      showMessage(
        surveyMessageElement,
        error.message,
        true
      );
    }
  }

  async function initializePage() {
    publicId =
      new URLSearchParams(
        window.location.search
      ).get('publicId') || '';

    if (!publicId) {
      titleElement.textContent =
        '无法打开问卷';

      showMessage(
        surveyMessageElement,
        '公开链接缺少 publicId',
        true
      );

      return;
    }

    const authenticated =
      await loadCurrentUser();

    await loadPublicSurvey(
      authenticated
    );
  }

  responseForm.addEventListener(
    'submit',
    handleNext
  );

  previousButton.addEventListener(
    'click',
    handlePrevious
  );

  initializePage();
})();