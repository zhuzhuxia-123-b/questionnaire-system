const mongoose = require('mongoose');
const { randomBytes } = require('crypto');

const { Schema } = mongoose;

const surveySchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
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
    allowAnonymous: {
      type: Boolean,
      default: false,
    },
    allowMultipleSubmissions: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft',
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
      default: () => randomBytes(8).toString('hex'),
    },
    deadline: {
      type: Date,
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
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

surveySchema.index({ ownerId: 1, createdAt: -1 });
surveySchema.index({ status: 1, deadline: 1 });

module.exports = mongoose.model('Survey', surveySchema);