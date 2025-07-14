const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const verifyToken = require('../middleware/authMiddleware');

// Create a new project
router.post('/', verifyToken, projectController.createProject);

// Get all projects for the current user
router.get('/', verifyToken, projectController.getProjects);

// Get a single project by ID
router.get('/:id', verifyToken, projectController.getProjectById);

// Update a project by ID
router.put('/:id', verifyToken, projectController.updateProject);

// Delete a project by ID
router.delete('/:id', verifyToken, projectController.deleteProject);

module.exports = router;
