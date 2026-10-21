(() => {
  const editor =
    document.querySelector(
      '#jump-rule-editor'
    );

  const questionName =
    document.querySelector(
      '#jump-rule-question-name'
    );

  const closeButton =
    document.querySelector(
      '#close-jump-rule-editor'
    );

  const draftForm =
    document.querySelector(
      '#jump-rule-draft-form'
    );

  const operatorSelect =
    document.querySelector(
      '#jump-rule-operator'
    );

  const valueContainer =
    document.querySelector(
      '#jump-rule-value-container'
    );

  const actionSelect =
    document.querySelector(
      '#jump-rule-action'
    );

  const targetGroup =
    document.querySelector(
      '#jump-rule-target-group'
    );

  const targetSelect =
    document.querySelector(
      '#jump-rule-target'
    );

  const priorityInput =
    document.querySelector(
      '#jump-rule-priority'
    );

  const message =
    document.querySelector(
      '#jump-rule-message'
    );

  const ruleList =
    document.querySelector(
      '#jump-rule-list'
    );

  const saveButton =
    document.querySelector(
      '#save-jump-rules-button'
    );

  const operatorsByType = {
    singleChoice: [
      ['equals', '等于所选选项'],
    ],
    multipleChoice: [
      ['containsAny', '包含任一选项'],
      ['containsAll', '包含全部选项'],
    ],
    text: [
      ['equals', '等于指定文本'],
    ],
    number: [
      ['equals', '等于'],
      ['gt', '大于'],
      ['gte', '大于或等于'],
      ['lt', '小于'],
      ['lte', '小于或等于'],
    ],
  };

  let currentSurvey = null;
  let sourceQuestion = null;
  let surveyQuestions = [];
  let draftRules = [];

  function showMessage(
    text,
    isError = false
  ) {
    message.textContent = text;

    message.className = isError
      ? 'form-message status-error'
      : 'form-message status-success';
  }

  function closeEditor() {
    editor.hidden = true;
    currentSurvey = null;
    sourceQuestion = null;
    surveyQuestions = [];
    draftRules = [];
    ruleList.replaceChildren();
    showMessage('');
  }

  function addOption(
    select,
    value,
    label
  ) {
    const option =
      document.createElement('option');

    option.value = value;
    option.textContent = label;

    select.append(option);
  }

  function populateOperators() {
    operatorSelect.replaceChildren();

    const operators =
      operatorsByType[
        sourceQuestion.type
      ] || [];

    operators.forEach(
      ([value, label]) => {
        addOption(
          operatorSelect,
          value,
          label
        );
      }
    );
  }

  function renderValueInput() {
    valueContainer.replaceChildren();

    if (
      sourceQuestion.type ===
      'singleChoice'
    ) {
      const select =
        document.createElement('select');

      select.id =
        'jump-rule-single-value';

      sourceQuestion.options.forEach(
        (option) => {
          addOption(
            select,
            option.optionId,
            option.label
          );
        }
      );

      valueContainer.append(select);
      return;
    }

    if (
      sourceQuestion.type ===
      'multipleChoice'
    ) {
      const choiceList =
        document.createElement('div');

      choiceList.className =
        'rule-choice-list';

      sourceQuestion.options.forEach(
        (option) => {
          const label =
            document.createElement(
              'label'
            );

          label.className =
            'checkbox-row';

          const input =
            document.createElement(
              'input'
            );

          input.type = 'checkbox';
          input.value = option.optionId;

          label.append(
            input,
            document.createTextNode(
              option.label
            )
          );

          choiceList.append(label);
        }
      );

      valueContainer.append(
        choiceList
      );

      return;
    }

    const input =
      document.createElement('input');

    input.id = 'jump-rule-basic-value';

    if (
      sourceQuestion.type === 'number'
    ) {
      input.type = 'number';
      input.step = 'any';
    } else {
      input.type = 'text';
    }

    valueContainer.append(input);
  }

  function laterQuestions() {
    return surveyQuestions.filter(
      (question) =>
        question.order >
        sourceQuestion.order
    );
  }

  function populateTargets() {
    targetSelect.replaceChildren();

    const targets =
      laterQuestions();

    targets.forEach((question) => {
      addOption(
        targetSelect,
        question.id,
        `${question.order}. ${question.title}`
      );
    });

    if (targets.length === 0) {
      actionSelect.value = 'submit';
    }

    updateActionFields();
  }

  function updateActionFields() {
    const isGoto =
      actionSelect.value === 'goto';

    targetGroup.hidden = !isGoto;

    if (
      isGoto &&
      targetSelect.options.length === 0
    ) {
      showMessage(
        '当前题目后面没有可跳转题目，请选择直接提交',
        true
      );
    } else {
      showMessage('');
    }
  }

  function nextPriority() {
    if (draftRules.length === 0) {
      return 0;
    }

    return Math.max(
      ...draftRules.map(
        (rule) => rule.priority
      )
    ) + 1;
  }

  function resetDraftForm() {
    draftForm.reset();

    populateOperators();
    renderValueInput();
    populateTargets();

    priorityInput.value =
      String(nextPriority());
  }

  function readRuleValue() {
    if (
      sourceQuestion.type ===
      'singleChoice'
    ) {
      return document.querySelector(
        '#jump-rule-single-value'
      ).value;
    }

    if (
      sourceQuestion.type ===
      'multipleChoice'
    ) {
      const values = Array.from(
        valueContainer.querySelectorAll(
          'input[type="checkbox"]:checked'
        )
      ).map((input) => input.value);

      if (values.length === 0) {
        throw new Error(
          '多选题规则至少选择一个比较选项'
        );
      }

      return values;
    }

    const input =
      document.querySelector(
        '#jump-rule-basic-value'
      );

    if (input.value === '') {
      throw new Error(
        '跳转规则比较值不能为空'
      );
    }

    if (
      sourceQuestion.type === 'number'
    ) {
      const number = Number(input.value);

      if (!Number.isFinite(number)) {
        throw new Error(
          '数字题规则必须填写有效数字'
        );
      }

      return number;
    }

    return input.value;
  }

  function optionLabel(optionId) {
    return sourceQuestion.options.find(
      (option) =>
        option.optionId === optionId
    )?.label || optionId;
  }

  function describeValue(value) {
    if (Array.isArray(value)) {
      return value
        .map(optionLabel)
        .join('、');
    }

    if (
      sourceQuestion.type ===
      'singleChoice'
    ) {
      return optionLabel(value);
    }

    return String(value);
  }

  function describeTarget(rule) {
    if (rule.action === 'submit') {
      return '直接提交问卷';
    }

    const target =
      surveyQuestions.find(
        (question) =>
          question.id ===
          rule.targetQuestionId
      );

    return target
      ? `${target.order}. ${target.title}`
      : rule.targetQuestionId;
  }

  function renderRules() {
    ruleList.replaceChildren();

    if (draftRules.length === 0) {
      const empty =
        document.createElement('p');

      empty.className =
        'empty-message';

      empty.textContent =
        '当前题目没有跳转规则';

      ruleList.append(empty);
      return;
    }

    draftRules
      .slice()
      .sort(
        (left, right) =>
          left.priority -
          right.priority
      )
      .forEach((rule) => {
        const item =
          document.createElement(
            'article'
          );

        item.className =
          'jump-rule-item';

        const condition =
          document.createElement('p');

        condition.textContent =
          `优先级 ${rule.priority}：` +
          `${rule.operator} ` +
          `${describeValue(rule.value)}`;

        const action =
          document.createElement('p');

        action.textContent =
          `命中后：${describeTarget(
            rule
          )}`;

        const removeButton =
          document.createElement(
            'button'
          );

        removeButton.type = 'button';

        removeButton.className =
          'button-danger';

        removeButton.textContent =
          '从规则列表移除';

        removeButton.addEventListener(
          'click',
          () => {
            draftRules =
              draftRules.filter(
                (itemRule) =>
                  itemRule !== rule
              );

            renderRules();
            priorityInput.value =
              String(nextPriority());
          }
        );

        item.append(
          condition,
          action,
          removeButton
        );

        ruleList.append(item);
      });
  }

  function normalizeExistingRules(
    rules
  ) {
    return rules.map((rule) => ({
      operator: rule.operator,
      value: rule.value,
      action: rule.action,
      targetQuestionId:
        rule.action === 'goto'
          ? String(
              rule.targetQuestionId
            )
          : undefined,
      priority: rule.priority,
    }));
  }

  async function openEditor(
    survey,
    question
  ) {
    currentSurvey = survey;
    sourceQuestion = question;

    editor.hidden = false;

    questionName.textContent =
      `${question.order}. ${question.title}`;

    showMessage(
      '正在读取最新题目和规则……'
    );

    editor.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    try {
      const result =
        await window.Api.request(
          `/api/surveys/` +
            `${survey.id}/questions`,
          {
            auth: true,
          }
        );

      surveyQuestions =
        result.questions;

      sourceQuestion =
        surveyQuestions.find(
          (item) =>
            item.id === question.id
        );

      if (!sourceQuestion) {
        throw new Error(
          '当前题目不存在'
        );
      }

      draftRules =
        normalizeExistingRules(
          sourceQuestion.jumpRules || []
        );

      questionName.textContent =
        `${sourceQuestion.order}. ` +
        `${sourceQuestion.title}`;

      resetDraftForm();
      renderRules();

      showMessage(
        '可以添加、移除规则，最后点击保存全部规则'
      );
    } catch (error) {
      showMessage(
        error.message,
        true
      );
    }
  }

  draftForm.addEventListener(
    'submit',
    (event) => {
      event.preventDefault();

      try {
        const priority = Number(
          priorityInput.value
        );

        if (
          !Number.isInteger(priority) ||
          priority < 0
        ) {
          throw new Error(
            '优先级必须是大于或等于 0 的整数'
          );
        }

        if (
          draftRules.some(
            (rule) =>
              rule.priority === priority
          )
        ) {
          throw new Error(
            '同一道题的优先级不能重复'
          );
        }

        const action =
          actionSelect.value;

        const rule = {
          operator:
            operatorSelect.value,
          value: readRuleValue(),
          action,
          priority,
        };

        if (action === 'goto') {
          if (!targetSelect.value) {
            throw new Error(
              '请选择跳转目标题目'
            );
          }

          rule.targetQuestionId =
            targetSelect.value;
        }

        draftRules.push(rule);

        renderRules();
        resetDraftForm();

        showMessage(
          '规则已加入本地列表，点击保存后才会写入数据库'
        );
      } catch (error) {
        showMessage(
          error.message,
          true
        );
      }
    }
  );

  actionSelect.addEventListener(
    'change',
    updateActionFields
  );

  saveButton.addEventListener(
    'click',
    async () => {
      if (
        !currentSurvey ||
        !sourceQuestion
      ) {
        return;
      }

      saveButton.disabled = true;

      showMessage(
        '正在保存跳转规则……'
      );

      try {
        const result =
          await window.Api.request(
            `/api/surveys/` +
              `${currentSurvey.id}` +
              `/questions/` +
              `${sourceQuestion.id}` +
              '/jump-rules',
            {
              method: 'PUT',
              auth: true,
              body: {
                jumpRules:
                  draftRules,
              },
            }
          );

        sourceQuestion =
          result.question;

        draftRules =
          normalizeExistingRules(
            sourceQuestion.jumpRules ||
              []
          );

        renderRules();
        resetDraftForm();

        showMessage(
          '跳转规则保存成功'
        );

        window.dispatchEvent(
          new CustomEvent(
            'questions:reload'
          )
        );
      } catch (error) {
        showMessage(
          error.message,
          true
        );
      } finally {
        saveButton.disabled = false;
      }
    }
  );

  closeButton.addEventListener(
    'click',
    closeEditor
  );

  window.addEventListener(
    'jump-rules:open',
    (event) => {
      const survey =
        event.detail?.survey;

      const question =
        event.detail?.question;

      if (survey && question) {
        openEditor(
          survey,
          question
        );
      }
    }
  );

  window.addEventListener(
    'auth:changed',
    (event) => {
      if (!event.detail?.user) {
        closeEditor();
      }
    }
  );
})();