const db = require('./db');

async function createSpec({ title, content = '', file_path, created_by, project_id, status = 'draft' }) {
  const result = await db.query(
    `INSERT INTO specifications (title, content, file_path, created_by, project_id, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [title, content, file_path, created_by, project_id, status]
  );
  return result.rows[0];
}

async function getSpecsByProject(projectId) {
  const result = await db.query(
    `SELECT s.*, au.first_name, au.last_name 
     FROM specifications s
     INNER JOIN app_users au ON s.created_by = au.id
     WHERE s.project_id = $1
     ORDER BY s.created_at DESC`,
    [projectId]
  );
  
  return result.rows.map(row => ({
    id: row.id,
    title: row.title,
    content: row.content,
    file_path: row.file_path,
    status: row.status,
    version: row.version,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: {
      id: row.created_by,
      first_name: row.first_name,
      last_name: row.last_name
    }
  }));
}

async function getSpecById(id) {
  const result = await db.query(
    `SELECT s.*, au.first_name, au.last_name 
     FROM specifications s
     INNER JOIN app_users au ON s.created_by = au.id
     WHERE s.id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    file_path: row.file_path,
    status: row.status,
    version: row.version,
    project_id: row.project_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: {
      id: row.created_by,
      first_name: row.first_name,
      last_name: row.last_name
    }
  };
}

async function updateSpec(id, { title, content, file_path, status }) {
  const updates = [];
  const params = [];
  let paramIndex = 1;

  if (title !== undefined) {
    updates.push(`title = $${paramIndex}`);
    params.push(title);
    paramIndex++;
  }

  if (content !== undefined) {
    updates.push(`content = $${paramIndex}`);
    params.push(content);
    paramIndex++;
  }

  if (file_path !== undefined) {
    updates.push(`file_path = $${paramIndex}`);
    params.push(file_path);
    paramIndex++;
  }

  if (status !== undefined) {
    updates.push(`status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  updates.push(`updated_at = NOW()`);
  params.push(id);

  const query = `
    UPDATE specifications 
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await db.query(query, params);
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
