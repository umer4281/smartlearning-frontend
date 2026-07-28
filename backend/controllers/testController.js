const Test = require('../models/Test');
const TestResult = require('../models/TestResult');

// @desc    Create a test (Teacher only)
// @route   POST /api/tests
const createTest = async (req, res) => {
  try {
    const { title, description, questions, timeLimit } = req.body;

    const test = await Test.create({
      title,
      description,
      questions,
      timeLimit,
      createdBy: req.user._id,
    });

    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tests
// @route   GET /api/tests
const getTests = async (req, res) => {
  try {
    const tests = await Test.find({ isActive: true })
      .populate('createdBy', 'name email')
      .select('-questions')
      .sort('-createdAt');
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single test with questions
// @route   GET /api/tests/:id
const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit test answers
// @route   POST /api/tests/:id/submit
const submitTest = async (req, res) => {
  try {
    const { answers } = req.body;
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Calculate score
    let score = 0;
    let totalPoints = 0;

    const gradedAnswers = test.questions.map((question, index) => {
      totalPoints += question.points;
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.options.findIndex(o => o.isCorrect);

      if (isCorrect) {
        score += question.points;
      }

      return {
        questionId: question._id,
        selectedOption: userAnswer,
        isCorrect,
      };
    });

    const percentage = Math.round((score / totalPoints) * 100);

    const testResult = await TestResult.create({
      test: test._id,
      student: req.user._id,
      answers: gradedAnswers,
      score,
      totalPoints,
      percentage,
    });

    res.status(201).json({
      testResult,
      score,
      totalPoints,
      percentage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get test results for a student
// @route   GET /api/tests/results/mine
const getMyResults = async (req, res) => {
  try {
    const results = await TestResult.find({ student: req.user._id })
      .populate('test', 'title')
      .sort('-submittedAt');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all results (Teacher)
// @route   GET /api/tests/results/all
const getAllResults = async (req, res) => {
  try {
    const results = await TestResult.find()
      .populate('test', 'title')
      .populate('student', 'name email')
      .sort('-submittedAt');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTest, getTests, getTestById, submitTest, getMyResults, getAllResults };