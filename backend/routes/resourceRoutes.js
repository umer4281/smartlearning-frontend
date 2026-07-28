const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, teacherOrAdmin } = require('../middleware/auth');
const { uploadResource, getResources, deleteResource, downloadResource, previewResource } = require('../controllers/resourceController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

router.post('/', protect, teacherOrAdmin, upload.single('file'), uploadResource);
router.get('/', protect, getResources);
router.get('/:id/download', protect, downloadResource);
router.get('/:id/preview', protect, previewResource);
router.delete('/:id', protect, teacherOrAdmin, deleteResource);

module.exports = router;