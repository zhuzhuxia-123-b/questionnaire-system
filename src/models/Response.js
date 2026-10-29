const mongoose = require('mongoose');

const { Schema } = mongoose;

const optionSnapshotSchema = new Schema(
  {
    optionId: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const answerSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
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
    questionType: {
      type: String,
      required: true,
      enum: [
        'singleChoice',
        'multipleChoice',
        'text',
        'number',
      ],
    },
    questionTitle: {
      type: String,
      required: true,
      maxlength: 500,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    optionSnapshots: {
      type: [optionSnapshotSchema],
      default: [],
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const responseSchema = new Schema(
  {
    surveyId: {
      type: Schema.Types.ObjectId,
      ref: 'Survey',
      required: true,
    },
    respondentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    anonymous: {
      type: Boolean,
      default: false,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    visitedQuestionIds: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Question',
        },
      ],
      default: [],
    },
    surveyVersion: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    schemaVersion: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    uniqueSubmissionKey: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

responseSchema.index(
  {
    uniqueSubmissionKey: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

responseSchema.index({
  surveyId: 1,
  submittedAt: -1,
});

responseSchema.index({
  surveyId: 1,
  respondentId: 1,
});

responseSchema.index({
  'answers.questionItemId': 1,
  surveyId: 1,
});

responseSchema.index({
  'answers.questionVersionId': 1,
  surveyId: 1,
});

responseSchema.pre(
  'validate',
  function validateResponseVersion() {
    if (this.schemaVersion < 2) {
      return;
    }

    this.answers.forEach((answer, index) => {
      if (!answer.questionItemId) {
        this.invalidate(
          `answers.${index}.questionItemId`,
          '第二阶段答案必须关联逻辑题目'
        );
      }

      if (!answer.questionVersionId) {
        this.invalidate(
          `answers.${index}.questionVersionId`,
          '第二阶段答案必须关联题目版本'
        );
      }
    });
  }
);

module.exports = mongoose.model(
  'Response',
  responseSchema
);