const questionManagement =
  document.querySelector(
    '#question-management'
  );

const questionSurveyManagement =
  document.querySelector(
    '#survey-management'
  );

const selectedSurveyName =
  document.querySelector(
    '#selected-survey-name'
  );

const backToSurveysButton =
  document.querySelector(
    '#back-to-surveys-button'
  );

const createQuestionForm =
  document.querySelector(
    '#create-question-form'
  );

const questionFormTitle =
  document.querySelector(
    '#question-form-title'
  );

const questionSubmitButton =
  document.querySelector(
    '#question-submit-button'
  );

const cancelQuestionEditButton =
  document.querySelector(
    '#cancel-question-edit-button'
  );

const createQuestionMessage =
  document.querySelector(
    '#create-question-message'
  );

const questionType =
  document.querySelector(
    '#question-type'
  );

const choiceQuestionConfig =
  document.querySelector(
    '#choice-question-config'
  );

const multipleChoiceValidation =
  document.querySelector(
    '#multiple-choice-validation'
  );

const textValidation =
  document.querySelector(
    '#text-validation'
  );

const numberValidation =
  document.querySelector(
    '#number-validation'
  );

const questionList =
  document.querySelector(
    '#question-list'
  );

const questionSummary =
  document.querySelector(
    '#question-summary'
  );

const questionListMessage =
  document.querySelector(
    '#question-list-message'
  );

const refreshQuestionsButton =
  document.querySelector(
    '#refresh-questions-button'
  );

const questionTypeLabels = {
  singleChoice: '单选题',
  multipleChoice: '多选题',
  text: '文本题',
  number: '数字题',
};

let activeSurvey = null;
let editingQuestion = null;

function showQuestionMessage(
  element,
  message,
  isError = false
) {
  element.textContent = message;

  element.className = isError
    ? 'form-message status-error'
    : 'form-message status-success';
}

function updateQuestionFields() {
  const type = questionType.value;

  const isChoice =
    type === 'singleChoice' ||
    type === 'multipleChoice';

  choiceQuestionConfig.hidden =
    !isChoice;

  multipleChoiceValidation.hidden =
    type !== 'multipleChoice';

  textValidation.hidden =
    type !== 'text';

  numberValidation.hidden =
    type !== 'number';
}

function optionalNumber(elementId) {
  const value =
    document.querySelector(
      elementId
    ).value;

  if (value === '') {
    return undefined;
  }

  return Number(value);
}

function getOptionLabels() {
  return document.querySelector(
    '#question-options'
  )
    .value
    .split(/\r?\n/)
    .map((label) => label.trim())
    .filter(Boolean);
}

function buildOptions(optionLabels) {
  const originalOptions =
    editingQuestion &&
    (
      editingQuestion.type ===
        'singleChoice' ||
      editingQuestion.type ===
        'multipleChoice'
    )
      ? editingQuestion.options
      : [];

  const unusedIndexes = new Set(
    originalOptions.map(
      (option, index) => index
    )
  );

  return optionLabels.map(
    (label, currentIndex) => {
      let matchedIndex =
        originalOptions.findIndex(
          (option, index) =>
            unusedIndexes.has(index) &&
            option.label === label
        );

      if (
        matchedIndex < 0 &&
        unusedIndexes.has(currentIndex)
      ) {
        matchedIndex = currentIndex;
      }

      if (matchedIndex >= 0) {
        unusedIndexes.delete(
          matchedIndex
        );

        return {
          optionId:
            originalOptions[
              matchedIndex
            ].optionId,
          label,
        };
      }

      return {
        label,
      };
    }
  );
}

function buildQuestionBody() {
  const type = questionType.value;

  const body = {
    type,
    title:
      document.querySelector(
        '#question-title'
      ).value,
    required:
      document.querySelector(
        '#question-required'
      ).checked,
    options: [],
    validation: {},
  };

  if (
    type === 'singleChoice' ||
    type === 'multipleChoice'
  ) {
    const optionLabels =
      getOptionLabels();

    if (optionLabels.length < 2) {
      throw new Error(
        '单选题和多选题至少需要两个选项'
      );
    }

    body.options =
      buildOptions(optionLabels);
  }

  if (type === 'multipleChoice') {
    body.validation = {
      minSelections:
        optionalNumber(
          '#minimum-selections'
        ),
      maxSelections:
        optionalNumber(
          '#maximum-selections'
        ),
    };
  }

  if (type === 'text') {
    body.validation = {
      minLength:
        optionalNumber(
          '#minimum-length'
        ),
      maxLength:
        optionalNumber(
          '#maximum-length'
        ),
    };
  }

  if (type === 'number') {
    body.validation = {
      minValue:
        optionalNumber(
          '#minimum-value'
        ),
      maxValue:
        optionalNumber(
          '#maximum-value'
        ),
      integerOnly:
        document.querySelector(
          '#integer-only'
        ).checked,
    };
  }

  return body;
}

function resetQuestionForm() {
  editingQuestion = null;

  createQuestionForm.reset();

  questionFormTitle.textContent =
    '添加题目';

  questionSubmitButton.textContent =
    '添加题目';

  cancelQuestionEditButton.hidden =
    true;

  updateQuestionFields();
}

function setInputValue(
  selector,
  value
) {
  document.querySelector(
    selector
  ).value = value ?? '';
}

function startQuestionEdit(question) {
  editingQuestion = question;

  questionType.value = question.type;

  setInputValue(
    '#question-title',
    question.title
  );

  document.querySelector(
    '#question-required'
  ).checked = question.required;

  setInputValue(
    '#question-options',
    question.options
      .map((option) => option.label)
      .join('\n')
  );

  const validation =
    question.validation || {};

  setInputValue(
    '#minimum-selections',
    validation.minSelections
  );

  setInputValue(
    '#maximum-selections',
    validation.maxSelections
  );

  setInputValue(
    '#minimum-length',
    validation.minLength
  );

  setInputValue(
    '#maximum-length',
    validation.maxLength
  );

  setInputValue(
    '#minimum-value',
    validation.minValue
  );

  setInputValue(
    '#maximum-value',
    validation.maxValue
  );

  document.querySelector(
    '#integer-only'
  ).checked =
    validation.integerOnly === true;

  questionFormTitle.textContent =
    `编辑第 ${question.order} 题`;

  questionSubmitButton.textContent =
    '保存修改';

  cancelQuestionEditButton.hidden =
    false;

  updateQuestionFields();

  createQuestionForm.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function createQuestionItem(question) {
  const article =
    document.createElement('article');

  article.className =
    'question-item';

  const heading =
    document.createElement('h3');

  heading.textContent =
    `${question.order}. ${question.title}`;

  const type =
    document.createElement('p');

  type.className =
    'question-meta';

  type.textContent =
    `题型：${
      questionTypeLabels[
        question.type
      ] || question.type
    }`;

  const required =
    document.createElement('p');

  required.className =
    'question-meta';

  required.textContent =
    `必答：${
      question.required ? '是' : '否'
    }`;

  article.append(
    heading,
    type,
    required
  );

  if (question.options.length > 0) {
    const optionList =
      document.createElement('ul');

    optionList.className =
      'question-options';

    question.options.forEach(
      (option) => {
        const item =
          document.createElement('li');

        item.textContent =
          option.label;

        optionList.append(item);
      }
    );

    article.append(optionList);
  }

  const validationEntries =
    Object.entries(
      question.validation || {}
    );

  if (validationEntries.length > 0) {
    const validation =
      document.createElement('p');

    validation.className =
      'question-meta';

    validation.textContent =
      `校验：${validationEntries
        .map(
          ([key, value]) =>
            `${key}=${value}`
        )
        .join('，')}`;

    article.append(validation);
  }

  if (activeSurvey?.status === 'draft') {
    const actions =
      document.createElement('div');

    actions.className =
      'question-actions';

    const editButton =
      document.createElement('button');

    editButton.type = 'button';
    editButton.textContent = '编辑';

    editButton.addEventListener(
      'click',
      () => {
        startQuestionEdit(question);
      }
    );

    const jumpRuleButton =
      document.createElement('button');

    jumpRuleButton.type = 'button';

    jumpRuleButton.className =
      'button-secondary';

    jumpRuleButton.textContent =
      '配置跳转';

    jumpRuleButton.addEventListener(
      'click',
      () => {
        window.dispatchEvent(
          new CustomEvent(
            'jump-rules:open',
            {
              detail: {
                survey: activeSurvey,
                question,
              },
            }
          )
        );
      }
    );

    const deleteButton =
      document.createElement('button');

    deleteButton.type = 'button';

    deleteButton.className =
      'button-danger';

    deleteButton.textContent =
      '删除';

    deleteButton.addEventListener(
      'click',
      () => {
        deleteQuestion(question);
      }
    );

    actions.append(
      editButton,
      jumpRuleButton,
      deleteButton
    );

    article.append(actions);
  }

  return article;
}

function renderQuestions(
  questions,
  total
) {
  questionList.replaceChildren();

  questionSummary.textContent =
    `共 ${total} 道题目`;

  if (questions.length === 0) {
    const empty =
      document.createElement('p');

    empty.className =
      'empty-message';

    empty.textContent =
      '当前问卷还没有题目';

    questionList.append(empty);
    return;
  }

  const fragment =
    document.createDocumentFragment();

  questions.forEach((question) => {
    fragment.append(
      createQuestionItem(question)
    );
  });

  questionList.append(fragment);
}

async function loadQuestions() {
  if (!activeSurvey) {
    return;
  }

  showQuestionMessage(
    questionListMessage,
    '正在读取题目……'
  );

  try {
    const result =
      await window.Api.request(
        `/api/surveys/` +
          `${activeSurvey.id}/questions`,
        {
          auth: true,
        }
      );

    renderQuestions(
      result.questions,
      result.total
    );

    showQuestionMessage(
      questionListMessage,
      '题目列表已更新'
    );
  } catch (error) {
    if (error.status === 401) {
      window.Api.clearToken();
      window.location.reload();
      return;
    }

    showQuestionMessage(
      questionListMessage,
      error.message,
      true
    );
  }
}

async function deleteQuestion(question) {
  if (
    !activeSurvey ||
    activeSurvey.status !== 'draft'
  ) {
    return;
  }

  const confirmed = window.confirm(
    `确认删除第 ${question.order} 题“` +
      `${question.title}”吗？`
  );

  if (!confirmed) {
    return;
  }

  showQuestionMessage(
    questionListMessage,
    '正在删除题目……'
  );

  try {
    await window.Api.request(
      `/api/surveys/` +
        `${activeSurvey.id}/questions/` +
        `${question.id}`,
      {
        method: 'DELETE',
        auth: true,
      }
    );

    if (
      editingQuestion?.id ===
      question.id
    ) {
      resetQuestionForm();
    }

    showQuestionMessage(
      questionListMessage,
      '题目删除成功'
    );

    await loadQuestions();
  } catch (error) {
    showQuestionMessage(
      questionListMessage,
      error.message,
      true
    );
  }
}

questionType.addEventListener(
  'change',
  updateQuestionFields
);

cancelQuestionEditButton.addEventListener(
  'click',
  () => {
    resetQuestionForm();

    showQuestionMessage(
      createQuestionMessage,
      '已取消编辑'
    );
  }
);

createQuestionForm.addEventListener(
  'submit',
  async (event) => {
    event.preventDefault();

    if (!activeSurvey) {
      return;
    }

    try {
      const body =
        buildQuestionBody();

      const isEditing =
        Boolean(editingQuestion);

      const requestPath =
        isEditing
          ? `/api/surveys/` +
            `${activeSurvey.id}/questions/` +
            `${editingQuestion.id}`
          : `/api/surveys/` +
            `${activeSurvey.id}/questions`;

      questionSubmitButton.disabled =
        true;

      cancelQuestionEditButton.disabled =
        true;

      showQuestionMessage(
        createQuestionMessage,
        isEditing
          ? '正在保存修改……'
          : '正在添加题目……'
      );

      await window.Api.request(
        requestPath,
        {
          method:
            isEditing
              ? 'PATCH'
              : 'POST',
          auth: true,
          body,
        }
      );

      resetQuestionForm();

      showQuestionMessage(
        createQuestionMessage,
        isEditing
          ? '题目修改成功'
          : '题目添加成功'
      );

      await loadQuestions();
    } catch (error) {
      showQuestionMessage(
        createQuestionMessage,
        error.message,
        true
      );
    } finally {
      questionSubmitButton.disabled =
        false;

      cancelQuestionEditButton.disabled =
        false;
    }
  }
);

refreshQuestionsButton.addEventListener(
  'click',
  loadQuestions
);

backToSurveysButton.addEventListener(
  'click',
  () => {
    activeSurvey = null;

    resetQuestionForm();

    questionManagement.hidden = true;

    questionSurveyManagement.hidden =
      false;
  }
);

window.addEventListener(
  'survey:selected',
  (event) => {
    activeSurvey =
      event.detail?.survey || null;

    if (!activeSurvey) {
      return;
    }

    resetQuestionForm();

    selectedSurveyName.textContent =
      `${activeSurvey.title}（${
        activeSurvey.status
      }）`;

    createQuestionForm.hidden =
      activeSurvey.status !== 'draft';

    questionSurveyManagement.hidden =
      true;

    questionManagement.hidden = false;

    showQuestionMessage(
      createQuestionMessage,
      ''
    );

    loadQuestions();
  }
);

window.addEventListener(
  'questions:reload',
  loadQuestions
);

window.addEventListener(
  'auth:changed',
  (event) => {
    if (!event.detail?.user) {
      activeSurvey = null;
      editingQuestion = null;

      questionManagement.hidden = true;
      questionList.replaceChildren();
    }
  }
);

updateQuestionFields();