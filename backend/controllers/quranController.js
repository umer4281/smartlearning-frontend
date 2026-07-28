const QuranProgress = require('../models/QuranProgress');

// @desc    Get user's Quran reading progress
// @route   GET /api/quran/progress
const getProgress = async (req, res) => {
  try {
    let progress = await QuranProgress.findOne({ user: req.user._id });

    if (!progress) {
      progress = await QuranProgress.create({
        user: req.user._id,
        currentPage: 1,
        completedPages: [],
        errors: [],
      });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update current page
// @route   PUT /api/quran/progress/page
const updatePage = async (req, res) => {
  try {
    const { page } = req.body;

    if (!page || page < 1 || page > 604) {
      return res.status(400).json({ message: 'Invalid page number. Must be between 1 and 604.' });
    }

    const progress = await QuranProgress.findOneAndUpdate(
      { user: req.user._id },
      {
        currentPage: page,
        lastRecitedAt: Date.now(),
      },
      { new: true, upsert: true }
    );

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a page as completed
// @route   POST /api/quran/progress/complete
const markPageComplete = async (req, res) => {
  try {
    const { page } = req.body;

    if (!page || page < 1 || page > 604) {
      return res.status(400).json({ message: 'Invalid page number.' });
    }

    const progress = await QuranProgress.findOne({ user: req.user._id });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found. Start reciting first.' });
    }

    if (!progress.completedPages.includes(page)) {
      progress.completedPages.push(page);
    }

    if (page < 604) {
      progress.currentPage = page + 1;
    }

    progress.lastRecitedAt = Date.now();
    await progress.save();

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Log a recitation error (wrong word)
// @route   POST /api/quran/errors
const logError = async (req, res) => {
  try {
    const { wordIndex, wordText, verseNumber, pageNumber } = req.body;

    if (wordIndex === undefined || !wordText || !pageNumber) {
      return res.status(400).json({ message: 'Missing required fields: wordIndex, wordText, pageNumber' });
    }

    const progress = await QuranProgress.findOne({ user: req.user._id });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found.' });
    }

    progress.errors.push({
      wordIndex,
      wordText,
      verseNumber: verseNumber || null,
      pageNumber,
      attemptedAt: new Date(),
    });

    progress.lastRecitedAt = Date.now();
    await progress.save();

    res.json({ success: true, totalErrors: progress.errors.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get error statistics
// @route   GET /api/quran/errors/stats
const getErrorStats = async (req, res) => {
  try {
    const progress = await QuranProgress.findOne({ user: req.user._id });

    if (!progress) {
      return res.json({
        totalErrors: 0,
        errorsByPage: {},
        commonMistakes: [],
      });
    }

    // Group errors by page
    const errorsByPage = {};
    progress.errors.forEach((err) => {
      if (!errorsByPage[err.pageNumber]) {
        errorsByPage[err.pageNumber] = [];
      }
      errorsByPage[err.pageNumber].push({
        wordText: err.wordText,
        verseNumber: err.verseNumber,
        attemptedAt: err.attemptedAt,
      });
    });

    // Find most common error words
    const wordCount = {};
    progress.errors.forEach((err) => {
      const key = err.wordText;
      wordCount[key] = (wordCount[key] || 0) + 1;
    });

    const commonMistakes = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    res.json({
      totalErrors: progress.errors.length,
      errorsByPage,
      commonMistakes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recitation statistics
// @route   GET /api/quran/progress/stats
const getStats = async (req, res) => {
  try {
    const progress = await QuranProgress.findOne({ user: req.user._id });

    if (!progress) {
      return res.json({
        pagesCompleted: 0,
        currentPage: 1,
        totalPages: 604,
        percentage: 0,
        lastRecited: null,
        totalErrors: 0,
      });
    }

    const stats = {
      pagesCompleted: progress.completedPages.length,
      currentPage: progress.currentPage,
      totalPages: 604,
      percentage: Math.round((progress.completedPages.length / 604) * 100),
      lastRecited: progress.lastRecitedAt,
      totalErrors: progress.errors.length,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProgress, updatePage, markPageComplete, logError, getErrorStats, getStats };