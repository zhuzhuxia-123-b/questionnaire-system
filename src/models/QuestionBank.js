const mongoose = require('mongoose');

const { Schema } = mongoose;

const questionBankItemSchema = new Schema(
  {
    questionItemId: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionItem',
      required: true,
    },
    preferredVersionId: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionVersion',
      default: null,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const questionBankSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    items: {
      type: [questionBankItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'questionBanks',
  }
);

questionBankSchema.index(
  {
    ownerId: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

questionBankSchema.index({
  ownerId: 1,
  status: 1,
  updatedAt: -1,
});

questionBankSchema.index({
  'items.questionItemId': 1,
});

questionBankSchema.pre(
  'validate',
  function validateQuestionBank() {
    const itemIds = this.items.map(
      (item) => item.questionItemId?.toString()
    );

    const validItemIds = itemIds.filter(Boolean);

    if (
      new Set(validItemIds).size !==
      validItemIds.length
    ) {
      this.invalidate(
        'items',
        '同一题目库中不能重复加入同一道题'
      );
    }
  }
);

module.exports = mongoose.model(
  'QuestionBank',
  questionBankSchema
);