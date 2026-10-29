const mongoose = require('mongoose');

const { Schema } = mongoose;

const questionShareSchema = new Schema(
  {
    questionItemId: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionItem',
      required: true,
    },
    sharedWithUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    permission: {
      type: String,
      enum: ['use'],
      default: 'use',
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'questionShares',
  }
);

questionShareSchema.index(
  {
    questionItemId: 1,
    sharedWithUserId: 1,
  },
  {
    unique: true,
  }
);

questionShareSchema.index({
  sharedWithUserId: 1,
  status: 1,
  updatedAt: -1,
});

questionShareSchema.index({
  questionItemId: 1,
  status: 1,
});

module.exports = mongoose.model(
  'QuestionShare',
  questionShareSchema
);