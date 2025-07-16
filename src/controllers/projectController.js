const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, description, is_public } = req.body;
    const owner_id = req.user.id;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Project name is required',
        code: 'VALIDATION_ERROR'
      });
    }

    if (name.length > 255) {
      return res.status(400).json({
        error: 'Project name must be less than 255 characters',
        code: 'VALIDATION_ERROR'
      });
    }

    // Create project
    const projectId = uuidv4();
    const projectResult = await db.query(
      `INSERT INTO projects (id, name, description, owner_id, is_public, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [projectId, name.trim(), description || '', owner_id, is_public || false, 'active']
    );

    const project = projectResult.rows[0];

    // Add owner as admin collaborator
    await db.query(
      `INSERT INTO collaborations (id, project_id, user_id, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [uuidv4(), projectId, owner_id, 'owner']
    );

    res.status(201).json({
      message: 'Project created successfully',
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        owner_id: project.owner_id,
        is_public: project.is_public,
        status: project.status,
        created_at: project.created_at,
        updated_at: project.updated_at
      }
    });

  } catch (err) {
    console.error('Create project failed:', err);
    res.status(500).json({
      error: 'Failed to create project',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Get user's projects
exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, role } = req.query;

    let query = `
      SELECT DISTINCT p.*, c.role as user_role,
        au.first_name as owner_first_name, au.last_name as owner_last_name
      FROM projects p
      INNER JOIN collaborations c ON p.id = c.project_id
      INNER JOIN app_users au ON p.owner_id = au.id
      WHERE c.user_id = $1
    `;
    
    const params = [userId];
    let paramIndex = 2;

    if (status) {
      query += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (role) {
      query += ` AND c.role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    query += ` ORDER BY p.updated_at DESC`;

    const result = await db.query(query, params);

    const projects = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      owner_id: row.owner_id,
      owner_name: `${row.owner_first_name} ${row.owner_last_name}`,
      is_public: row.is_public,
      status: row.status,
      user_role: row.user_role,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    res.json({
      projects,
      count: projects.length
    });

  } catch (err) {
    console.error('Get projects failed:', err);
    res.status(500).json({
      error: 'Failed to fetch projects',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user has access to this project
    const accessCheck = await db.query(
      `SELECT p.*, c.role as user_role,
        au.first_name as owner_first_name, au.last_name as owner_last_name
       FROM projects p
       INNER JOIN collaborations c ON p.id = c.project_id
       INNER JOIN app_users au ON p.owner_id = au.id
       WHERE p.id = $1 AND c.user_id = $2`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Project not found or access denied',
        code: 'PROJECT_NOT_FOUND'
      });
    }

    const project = accessCheck.rows[0];

    // Get all collaborators
    const collaboratorsResult = await db.query(
      `SELECT c.role, c.created_at as joined_at,
        au.id, au.email, au.first_name, au.last_name
       FROM collaborations c
       INNER JOIN app_users au ON c.user_id = au.id
       WHERE c.project_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );

    const collaborators = collaboratorsResult.rows.map(row => ({
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      role: row.role,
      joined_at: row.joined_at
    }));

    res.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        owner_id: project.owner_id,
        owner_name: `${project.owner_first_name} ${project.owner_last_name}`,
        is_public: project.is_public,
        status: project.status,
        user_role: project.user_role,
        created_at: project.created_at,
        updated_at: project.updated_at,
        collaborators
      }
    });

  } catch (err) {
    console.error('Get project failed:', err);
    res.status(500).json({
      error: 'Failed to fetch project',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_public, status } = req.body;
    const userId = req.user.id;

    // Check if user has admin/owner permissions
    const permissionCheck = await db.query(
      `SELECT c.role FROM collaborations c WHERE c.project_id = $1 AND c.user_id = $2`,
      [id, userId]
    );

    if (permissionCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Project not found',
        code: 'PROJECT_NOT_FOUND'
      });
    }

    const userRole = permissionCheck.rows[0].role;
    if (!['admin', 'owner'].includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions to update project',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          error: 'Project name cannot be empty',
          code: 'VALIDATION_ERROR'
        });
      }
      updates.push(`name = $${paramIndex}`);
      params.push(name.trim());
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(description || '');
      paramIndex++;
    }

    if (is_public !== undefined) {
      updates.push(`is_public = $${paramIndex}`);
      params.push(is_public);
      paramIndex++;
    }

    if (status !== undefined) {
      if (!['active', 'archived', 'draft'].includes(status)) {
        return res.status(400).json({
          error: 'Invalid status. Must be active, archived, or draft',
          code: 'VALIDATION_ERROR'
        });
      }
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No fields to update',
        code: 'VALIDATION_ERROR'
      });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE projects 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, params);
    const project = result.rows[0];

    res.json({
      message: 'Project updated successfully',
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        owner_id: project.owner_id,
        is_public: project.is_public,
        status: project.status,
        created_at: project.created_at,
        updated_at: project.updated_at
      }
    });

  } catch (err) {
    console.error('Update project failed:', err);
    res.status(500).json({
      error: 'Failed to update project',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is the owner
    const ownerCheck = await db.query(
      `SELECT owner_id FROM projects WHERE id = $1`,
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Project not found',
        code: 'PROJECT_NOT_FOUND'
      });
    }

    if (ownerCheck.rows[0].owner_id !== userId) {
      return res.status(403).json({
        error: 'Only project owner can delete the project',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Delete project (cascading will handle related records)
    await db.query('DELETE FROM projects WHERE id = $1', [id]);

    res.json({
      message: 'Project deleted successfully'
    });

  } catch (err) {
    console.error('Delete project failed:', err);
    res.status(500).json({
      error: 'Failed to delete project',
      code: 'INTERNAL_ERROR'
    });
  }
};
