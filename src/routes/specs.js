const express = require('express');
const router = express.Router();
const specController = require('../controllers/specController');
const verifyToken = require('../middleware/authMiddleware');

// Create a new spec under a project
router.post('/projects/:projectId/specs', verifyToken, specController.createSpec);

// Get all specs for a project
router.get('/projects/:projectId/specs', verifyToken, specController.getSpecsByProject);

// Get a single spec by ID
router.get('/specs/:id', verifyToken, specController.getSpecById);

// Update a spec by ID
router.put('/specs/:id', verifyToken, specController.updateSpec);

// Delete a spec by ID
router.delete('/specs/:id', verifyToken, specController.deleteSpec);

module.exports = router;
