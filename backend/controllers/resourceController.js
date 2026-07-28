const Resource = require('../models/Resource');
const path = require('path');
const fs = require('fs');

// Helper: auto-detect category from MIME type
const detectCategory = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('document') || mimeType.includes('spreadsheet') || mimeType.includes('presentation')) return 'document';
  return 'other';
};

// @desc    Upload a resource
// @route   POST /api/resources
const uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const resource = await Resource.create({
      title: req.body.title || req.file.originalname,
      description: req.body.description || '',
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      category: detectCategory(req.file.mimetype),
      uploadedBy: req.user._id,
    });

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all resources (with optional category filter)
// @route   GET /api/resources?category=image|pdf|video|audio|document|other
const getResources = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const resources = await Resource.find(filter)
      .populate('uploadedBy', 'name email')
      .sort('-createdAt');
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Delete file from server
    if (fs.existsSync(resource.filePath)) {
      fs.unlinkSync(resource.filePath);
    }

    await resource.deleteOne();
    res.json({ message: 'Resource removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download a resource
// @route   GET /api/resources/:id/download
const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.download(resource.filePath, resource.fileName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Preview a resource (inline viewing for images/PDFs)
// @route   GET /api/resources/:id/preview
const previewResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check file exists
    if (!fs.existsSync(resource.filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Set inline content disposition so browser shows it instead of downloading
    const ext = path.extname(resource.fileName).toLowerCase();
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const isInline = imageExts.includes(ext) || resource.fileType === 'application/pdf';

    if (isInline) {
      res.setHeader('Content-Disposition', `inline; filename="${resource.fileName}"`);
      res.setHeader('Content-Type', resource.fileType);
      const fileStream = fs.createReadStream(resource.filePath);
      fileStream.pipe(res);
    } else {
      // For non-previewable files, redirect to download
      res.redirect(`/api/resources/${resource._id}/download`);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadResource, getResources, deleteResource, downloadResource, previewResource };