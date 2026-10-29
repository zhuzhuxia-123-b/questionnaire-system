const mongoose = require('mongoose');

const { Schema } = mongoose;

const questionItemSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    currentVersionId: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionVersion',
      default: null,
    },
    latestVersionNumber: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    legacyQuestionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
    },
    schemaVersion: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'questionItems',
  }
);

questionItemSchema.index({
  ownerId: 1,
  createdAt: -1,
});

questionItemSchema.index({
  ownerId: 1,
  status: 1,
  updatedAt: -1,
});

questionItemSchema.index(
  {
    legacyQuestionId: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model(
  'QuestionItem',
  questionItemSchema
);