const express = require('express');
const router = express.Router();
const { protect, teacherOnly, teacherOrAdmin } = require('../middleware/auth');
const {
  createTest,
  getTests,
  getTestById,
  submitTest,
  getMyResults,
  getAllResults,
} = require('../controllers/testController');

router.post('/', protect, teacherOrAdmin, createTest);
router.get('/', protect, getTests);
router.get('/results/mine', protect, getMyResults);
router.get('/results/all', protect, teacherOrAdmin, getAllResults);
router.get('/:id', protect, getTestById);
router.post('/:id/submit', protect, submitTest);

module.exports = router;