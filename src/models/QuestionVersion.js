const mongoose = require('mongoose');

const { Schema } = mongoose;

const QUESTION_TYPES = [
  'singleChoice',
  'multipleChoice',
  'text',
  'number',
];

const VALIDATION_FIELDS_BY_TYPE = {
  singleChoice: [],
  multipleChoice: [
    'minSelections',
    'maxSelections',
  ],
  text: [
    'minLength',
    'maxLength',
  ],
  number: [
    'minValue',
    'maxValue',
    'integerOnly',
  ],
};

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
    integerOnly: Boolean,
  },
  {
    _id: false,
    versionKey: false,
  }
);

const questionVersionSchema = new Schema(
  {
    questionItemId: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionItem',
      required: true,
      immutable: true,
    },
    versionNumber: {
      type: Number,
      required: true,
      min: 1,
      immutable: true,
    },
    parentVersionId: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionVersion',
      default: null,
      immutable: true,
    },
    restoredFromVersionId: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionVersion',
      default: null,
      immutable: true,
    },
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    changeNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
      immutable: true,
    },
    type: {
      type: String,
      required: true,
      enum: QUESTION_TYPES,
      immutable: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
      immutable: true,
    },
    options: {
      type: [optionSchema],
      default: [],
      immutable: true,
    },
    validation: {
      type: validationSchema,
      default: () => ({}),
      immutable: true,
    },
    schemaVersion: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      immutable: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
    versionKey: false,
    collection: 'questionVersions',
  }
);

questionVersionSchema.index(
  {
    questionItemId: 1,
    versionNumber: 1,
  },
  {
    unique: true,
  }
);

questionVersionSchema.index({
  questionItemId: 1,
  createdAt: -1,
});

questionVersionSchema.index({
  parentVersionId: 1,
});

questionVersionSchema.pre(
  'validate',
  function validateQuestionVersion() {
    const isChoice = [
      'singleChoice',
      'multipleChoice',
    ].includes(this.type);

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
        '同一版本中的 optionId 不能重复'
      );
    }

    const validation =
      this.validation?.toObject() || {};

    const allowedFields = new Set(
      VALIDATION_FIELDS_BY_TYPE[this.type] || []
    );

    for (const [field, value] of Object.entries(
      validation
    )) {
      if (
        value !== undefined &&
        !allowedFields.has(field)
      ) {
        this.invalidate(
          `validation.${field}`,
          `${this.type} 题型不能保存 ${field}`
        );
      }
    }

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
      validation.minLength > validation.maxLength
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
  }
);

module.exports = mongoose.model(
  'QuestionVersion',
  questionVersionSchema
);