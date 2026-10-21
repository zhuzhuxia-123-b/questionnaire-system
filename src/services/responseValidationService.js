function isAnswered(question, value) {
  if (value === undefined || value === null) {
    return false;
  }

  if (question.type === 'text') {
    return (
      typeof value === 'string' &&
      value.trim().length > 0
    );
  }

  if (question.type === 'multipleChoice') {
    return Array.isArray(value) && value.length > 0;
  }

  return true;
}

function validateAnswer(question, value) {
  const validation = question.validation || {};
  const optionMap = new Map(
    question.options.map((option) => [
      option.optionId,
      option,
    ])
  );

  if (question.type === 'singleChoice') {
    if (
      typeof value !== 'string' ||
      !optionMap.has(value)
    ) {
      return {
        error: `${question.title}：请选择有效选项`,
      };
    }

    const selectedOption = optionMap.get(value);

    return {
      value,
      optionSnapshots: [
        {
          optionId: selectedOption.optionId,
          label: selectedOption.label,
        },
      ],
    };
  }

  if (question.type === 'multipleChoice') {
    if (
      !Array.isArray(value) ||
      value.some((item) => typeof item !== 'string')
    ) {
      return {
        error: `${question.title}：答案必须是 optionId 数组`,
      };
    }

    if (new Set(value).size !== value.length) {
      return {
        error: `${question.title}：不能重复选择同一选项`,
      };
    }

    if (value.some((item) => !optionMap.has(item))) {
      return {
        error: `${question.title}：包含无效选项`,
      };
    }

    if (
      validation.minSelections !== undefined &&
      value.length < validation.minSelections
    ) {
      return {
        error:
          `${question.title}：至少选择 ` +
          `${validation.minSelections} 项`,
      };
    }

    if (
      validation.maxSelections !== undefined &&
      value.length > validation.maxSelections
    ) {
      return {
        error:
          `${question.title}：最多选择 ` +
          `${validation.maxSelections} 项`,
      };
    }

    return {
      value,
      optionSnapshots: value.map((optionId) => {
        const option = optionMap.get(optionId);

        return {
          optionId: option.optionId,
          label: option.label,
        };
      }),
    };
  }

  if (question.type === 'text') {
    if (typeof value !== 'string') {
      return {
        error: `${question.title}：答案必须是字符串`,
      };
    }

    const normalizedValue = value.trim();

    if (
      validation.minLength !== undefined &&
      normalizedValue.length < validation.minLength
    ) {
      return {
        error:
          `${question.title}：至少需要 ` +
          `${validation.minLength} 个字符`,
      };
    }

    if (
      validation.maxLength !== undefined &&
      normalizedValue.length > validation.maxLength
    ) {
      return {
        error:
          `${question.title}：不能超过 ` +
          `${validation.maxLength} 个字符`,
      };
    }

    return {
      value: normalizedValue,
      optionSnapshots: [],
    };
  }

  if (question.type === 'number') {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value)
    ) {
      return {
        error: `${question.title}：答案必须是有限数字`,
      };
    }

    if (
      validation.integerOnly === true &&
      !Number.isInteger(value)
    ) {
      return {
        error: `${question.title}：答案必须是整数`,
      };
    }

    if (
      validation.minValue !== undefined &&
      value < validation.minValue
    ) {
      return {
        error:
          `${question.title}：不能小于 ` +
          `${validation.minValue}`,
      };
    }

    if (
      validation.maxValue !== undefined &&
      value > validation.maxValue
    ) {
      return {
        error:
          `${question.title}：不能大于 ` +
          `${validation.maxValue}`,
      };
    }

    return {
      value,
      optionSnapshots: [],
    };
  }

  return {
    error: '遇到不支持的题型',
  };
}

function ruleMatches(rule, value) {
  if (rule.operator === 'equals') {
    return value === rule.value;
  }

  if (rule.operator === 'containsAny') {
    return (
      Array.isArray(value) &&
      rule.value.some((item) => value.includes(item))
    );
  }

  if (rule.operator === 'containsAll') {
    return (
      Array.isArray(value) &&
      rule.value.every((item) => value.includes(item))
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

function buildSubmission(questions, inputAnswers) {
  if (!Array.isArray(inputAnswers)) {
    return {
      error: 'answers 必须是数组',
    };
  }

  if (questions.length === 0) {
    return {
      error: '问卷没有可填写的题目',
    };
  }

  const questionById = new Map(
    questions.map((question) => [
      question._id.toString(),
      question,
    ])
  );

  const indexById = new Map(
    questions.map((question, index) => [
      question._id.toString(),
      index,
    ])
  );

  const answerMap = new Map();

  for (const answer of inputAnswers) {
    if (
      !answer ||
      typeof answer !== 'object' ||
      Array.isArray(answer) ||
      typeof answer.questionId !== 'string'
    ) {
      return {
        error:
          '每个答案必须包含字符串形式的 questionId',
      };
    }

    if (
      !Object.prototype.hasOwnProperty.call(
        answer,
        'value'
      )
    ) {
      return {
        error: '每个答案必须包含 value',
      };
    }

    if (!questionById.has(answer.questionId)) {
      return {
        error: '答案包含不属于该问卷的题目',
      };
    }

    if (answerMap.has(answer.questionId)) {
      return {
        error: '同一道题不能提交多个答案',
      };
    }

    answerMap.set(answer.questionId, answer.value);
  }

  const visitedQuestionIds = [];
  const visitedSet = new Set();
  const answerSnapshots = [];

  let currentQuestion = questions[0];

  while (currentQuestion) {
    const questionId = currentQuestion._id.toString();

    if (visitedSet.has(questionId)) {
      return {
        error: '填写路径出现循环',
      };
    }

    visitedSet.add(questionId);
    visitedQuestionIds.push(currentQuestion._id);

    const hasInput = answerMap.has(questionId);
    const inputValue = answerMap.get(questionId);
    const answered =
      hasInput && isAnswered(currentQuestion, inputValue);

    if (currentQuestion.required && !answered) {
      return {
        error: `${currentQuestion.title}：该题为必答题`,
      };
    }

    let normalizedAnswer = null;

    if (answered) {
      normalizedAnswer = validateAnswer(
        currentQuestion,
        inputValue
      );

      if (normalizedAnswer.error) {
        return normalizedAnswer;
      }

      answerSnapshots.push({
        questionId: currentQuestion._id,
        questionType: currentQuestion.type,
        questionTitle: currentQuestion.title,
        value: normalizedAnswer.value,
        optionSnapshots:
          normalizedAnswer.optionSnapshots,
      });
    }

    const sortedRules = [...currentQuestion.jumpRules]
      .sort(
        (left, right) =>
          left.priority - right.priority
      );

    const matchedRule = answered
      ? sortedRules.find((rule) =>
          ruleMatches(rule, normalizedAnswer.value)
        )
      : null;

    if (matchedRule?.action === 'submit') {
      break;
    }

    if (matchedRule?.action === 'goto') {
      currentQuestion = questionById.get(
        matchedRule.targetQuestionId.toString()
      );

      if (!currentQuestion) {
        return {
          error: '填写路径包含无效的跳转目标',
        };
      }

      continue;
    }

    const currentIndex = indexById.get(questionId);
    currentQuestion = questions[currentIndex + 1];
  }

  const unexpectedAnswerIds = [
    ...answerMap.keys(),
  ].filter((questionId) => !visitedSet.has(questionId));

  if (unexpectedAnswerIds.length > 0) {
    return {
      error: '答案包含填写路径中未访问的题目',
    };
  }

  return {
    answers: answerSnapshots,
    visitedQuestionIds,
  };
}

module.exports = {
  buildSubmission,
};