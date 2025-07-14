// models/projectModel.js
const db = require('./db');

// Create a new project
async function createProject({ name, description, owner_id, visibility }) {
  const result = await db.query(
    `INSERT INTO projects (name, description, owner_id, visibility)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, description, owner_id, visibility]
  );
  return result.rows[0];
}

// Get all projects for a user
async function getProjectsByUser(userId) {
  const result = await db.query(
    `SELECT * FROM projects WHERE owner_id = $1`,
    [userId]
  );
  return result.rows;
}

// Get a single project by ID
async function getProjectById(projectId) {
  const result = await db.query(
    `SELECT * FROM projects WHERE id = $1`,
    [projectId]
  );
  return result.rows[0];
}

// Update a project
async function updateProject(projectId, { name, description, visibility }) {
  const result = await db.query(
    `UPDATE projects
     SET name = $1, description = $2, visibility = $3
     WHERE id = $4
     RETURNING *`,
    [name, description, visibility, projectId]
  );
  return result.rows[0];
}

// Delete a project
async function deleteProject(projectId) {
  await db.query(
    `DELETE FROM projects WHERE id = $1`,
    [projectId]
  );
}

module.exports = {
  createProject,
  getProjectsByUser,
  getProjectById,
  updateProject,
  deleteProject,
};
