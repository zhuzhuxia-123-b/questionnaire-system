const mongoose = require('mongoose');

const { Schema } = mongoose;

const optionSchema = new Schema(
  {
    optionId: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const validationSchema = new Schema(
  {
    minSelections: {
      type: Number,
      min: 0,
    },
    maxSelections: {
      type: Number,
      min: 0,
    },
    minLength: {
      type: Number,
      min: 0,
    },
    maxLength: {
      type: Number,
      min: 0,
    },
    minValue: Number,
    maxValue: Number,
    integerOnly: {
      type: Boolean,
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const jumpRuleSchema = new Schema(
  {
    operator: {
      type: String,
      required: true,
      enum: [
        'equals',
        'containsAny',
        'containsAll',
        'gt',
        'gte',
        'lt',
        'lte',
      ],
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['goto', 'submit'],
      default: 'goto',
    },
    targetQuestionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      default: null,
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const questionSchema = new Schema(
  {
    surveyId: {
      type: Schema.Types.ObjectId,
      ref: 'Survey',
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'singleChoice',
        'multipleChoice',
        'text',
        'number',
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: {
      type: [optionSchema],
      default: [],
    },
    validation: {
      type: validationSchema,
      default: () => ({}),
    },
    jumpRules: {
      type: [jumpRuleSchema],
      default: [],
    },
    questionItemId: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionItem',
      default: null,
    },
    questionVersionId: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionVersion',
      default: null,
    },
    contentSource: {
      type: String,
      enum: ['legacy', 'library'],
      default: null,
    },
    schemaVersion: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

questionSchema.index(
  {
    surveyId: 1,
    order: 1,
  },
  {
    unique: true,
  }
);

questionSchema.index({
  questionItemId: 1,
  surveyId: 1,
});

questionSchema.index({
  questionVersionId: 1,
  surveyId: 1,
});

questionSchema.index({
  surveyId: 1,
  questionVersionId: 1,
});

questionSchema.pre(
  'validate',
  function validateQuestion() {
    const choiceTypes = [
      'singleChoice',
      'multipleChoice',
    ];

    const isChoice = choiceTypes.includes(this.type);

    if (isChoice && this.options.length < 2) {
      this.invalidate(
        'options',
        '单选题和多选题至少需要两个选项'
      );
    }

    if (!isChoice && this.options.length > 0) {
      this.invalidate(
        'options',
        '文本题和数字题不能包含选项'
      );
    }

    const optionIds = this.options.map(
      (option) => option.optionId
    );

    if (
      new Set(optionIds).size !== optionIds.length
    ) {
      this.invalidate(
        'options',
        '同一道题中的 optionId 不能重复'
      );
    }

    const validation = this.validation || {};

    if (
      this.type === 'multipleChoice' &&
      validation.minSelections !== undefined &&
      validation.maxSelections !== undefined &&
      validation.minSelections >
        validation.maxSelections
    ) {
      this.invalidate(
        'validation.maxSelections',
        '最多选择数量不能小于最少选择数量'
      );
    }

    if (
      this.type === 'text' &&
      validation.minLength !== undefined &&
      validation.maxLength !== undefined &&
      validation.minLength >
        validation.maxLength
    ) {
      this.invalidate(
        'validation.maxLength',
        '最大文本长度不能小于最小文本长度'
      );
    }

    if (
      this.type === 'number' &&
      validation.minValue !== undefined &&
      validation.maxValue !== undefined &&
      validation.minValue > validation.maxValue
    ) {
      this.invalidate(
        'validation.maxValue',
        '最大值不能小于最小值'
      );
    }

    for (const rule of this.jumpRules) {
      if (
        rule.action === 'goto' &&
        !rule.targetQuestionId
      ) {
        this.invalidate(
          'jumpRules',
          'goto 跳转规则必须设置 targetQuestionId'
        );
      }

      if (
        rule.action === 'submit' &&
        rule.targetQuestionId
      ) {
        this.invalidate(
          'jumpRules',
          'submit 规则不能设置 targetQuestionId'
        );
      }
    }

    if (this.schemaVersion >= 2) {
      if (!this.questionItemId) {
        this.invalidate(
          'questionItemId',
          '第二阶段题目必须关联逻辑题目'
        );
      }

      if (!this.questionVersionId) {
        this.invalidate(
          'questionVersionId',
          '第二阶段题目必须关联题目版本'
        );
      }

      if (!this.contentSource) {
        this.invalidate(
          'contentSource',
          '第二阶段题目必须记录内容来源'
        );
      }
    }
  }
);

module.exports = mongoose.model(
  'Question',
  questionSchema
);