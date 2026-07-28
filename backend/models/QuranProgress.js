const mongoose = require('mongoose');

const wordErrorSchema = new mongoose.Schema({
  wordIndex: { type: Number, required: true },
  wordText: { type: String, required: true },
  verseNumber: { type: Number },
  pageNumber: { type: Number, required: true },
  attemptedAt: { type: Date, default: Date.now },
});

const quranProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  currentPage: {
    type: Number,
    default: 1,
    min: 1,
    max: 604,
  },
  completedPages: [{
    type: Number,
  }],
  // Track errors per page: { pageNumber: [wordErrors] }
  errors: [wordErrorSchema],
  lastRecitedAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate progress entries per user
quranProgressSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('QuranProgress', quranProgressSchema);