// controllers/projectController.js

const projectModel = require('../models/projectModel');

exports.createProject = async (req, res) => {
  try {
    const { name, description, visibility } = req.body;
    const owner_id = req.user.id; // Assumes auth middleware adds `user` to req
    const project = await projectModel.createProject({ name, description, owner_id, visibility });
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await projectModel.getProjectsByUser(userId);
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectModel.getProjectById(id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, visibility } = req.body;
    const updated = await projectModel.updateProject(id, { name, description, visibility });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await projectModel.deleteProject(id);
    res.json({ message: `Project ${id} deleted` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};
