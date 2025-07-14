const db = require('./db');

async function createSpec({ title, description, type, created_by, project_id }) {
  const result = await db.query(
    `INSERT INTO specifications (title, description, type, created_by, project_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, description, type, created_by, project_id]
  );
  return result.rows[0];
}

async function getSpecsByProject(projectId) {
  const result = await db.query(
    `SELECT * FROM specifications WHERE project_id = $1`,
    [projectId]
  );
  return result.rows;
}

async function getSpecById(id) {
  const result = await db.query(
    `SELECT * FROM specifications WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

async function updateSpec(id, { title, description, type }) {
  const result = await db.query(
    `UPDATE specifications
     SET title = $1, description = $2, type = $3, updated_at = NOW()
     WHERE id = $4 RETURNING *`,
    [title, description, type, id]
  );
  return result.rows[0];
}

async function deleteSpec(id) {
  await db.query(`DELETE FROM specifications WHERE id = $1`, [id]);
}

module.exports = {
  createSpec,
  getSpecsByProject,
  getSpecById,
  updateSpec,
  deleteSpec,
};
