const mongoose = require('mongoose');

const { Schema } = mongoose;

const migrationErrorSchema = new Schema(
  {
    sourceType: {
      type: String,
      trim: true,
      default: '',
    },
    sourceId: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const schemaMigrationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'running',
        'completed',
        'failed',
      ],
      default: 'running',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    processedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    skippedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    errorDetails: {
      type: [migrationErrorSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'schemaMigrations',
  }
);

schemaMigrationSchema.index(
  { name: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  'SchemaMigration',
  schemaMigrationSchema
);