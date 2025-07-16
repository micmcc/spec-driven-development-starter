const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Create a new project
router.post('/', authenticateToken, projectController.createProject);

// Get all projects for the current user
router.get('/', authenticateToken, projectController.getProjects);

// Get a single project by ID
router.get('/:id', authenticateToken, projectController.getProjectById);

// Update a project by ID
router.put('/:id', authenticateToken, projectController.updateProject);

// Delete a project by ID
router.delete('/:id', authenticateToken, projectController.deleteProject);

module.exports = router;
