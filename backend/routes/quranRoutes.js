const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProgress,
  updatePage,
  markPageComplete,
  logError,
  getErrorStats,
  getStats,
} = require('../controllers/quranController');

// All routes require authentication
router.use(protect);

router.get('/progress', getProgress);
router.put('/progress/page', updatePage);
router.post('/progress/complete', markPageComplete);
router.get('/progress/stats', getStats);

// Error tracking
router.post('/errors', logError);
router.get('/errors/stats', getErrorStats);

module.exports = router;