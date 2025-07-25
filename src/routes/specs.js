const express = require('express');
const multer = require('multer');
const router = express.Router();
const specController = require('../controllers/specController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const upload = multer({
  dest: '/tmp/uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow text files and common spec formats
    const allowedMimes = [
      'text/plain',
      'text/markdown',
      'application/json',
      'text/yaml',
      'application/yaml',
      'text/x-yaml'
    ];
    
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(md|txt|json|yaml|yml)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only text, markdown, JSON, and YAML files are allowed'), false);
    }
  }
});

// Create a new spec under a project
router.post('/projects/:projectId/specs', authenticateToken, specController.createSpec);

// Upload a spec file under a project
router.post('/projects/:projectId/specs/upload', authenticateToken, upload.single('file'), specController.uploadSpecFile);

// Get all specs for a project
router.get('/projects/:projectId/specs', authenticateToken, specController.getSpecsByProject);

// Get a single spec by ID
router.get('/specs/:id', authenticateToken, specController.getSpecById);

// Update a spec by ID
router.put('/specs/:id', authenticateToken, specController.updateSpec);

// Delete a spec by ID
router.delete('/specs/:id', authenticateToken, specController.deleteSpec);

module.exports = router;
