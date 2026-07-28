const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [
    {
      optionText: { type: String, required: true },
      isCorrect: { type: Boolean, required: true },
    },
  ],
  points: {
    type: Number,
    default: 1,
  },
});

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a test title'],
  },
  description: {
    type: String,
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number, // in minutes
    default: 30,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Test', testSchema);