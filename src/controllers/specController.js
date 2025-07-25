const specModel = require('../models/specModel');
const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

exports.createSpec = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, content = '', file_path, status = 'draft' } = req.body;
    const created_by = req.user.id;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Specification title is required',
        code: 'VALIDATION_ERROR'
      });
    }

    if (!file_path || file_path.trim().length === 0) {
      return res.status(400).json({
        error: 'File path is required',
        code: 'VALIDATION_ERROR'
      });
    }

    // Check if user has access to the project
    const accessCheck = await db.query(
      `SELECT c.role FROM collaborations c WHERE c.project_id = $1 AND c.user_id = $2`,
      [projectId, created_by]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Project not found or access denied',
        code: 'PROJECT_NOT_FOUND'
      });
    }

    const userRole = accessCheck.rows[0].role;
    if (!['contributor', 'admin', 'owner'].includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions to create specifications',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const spec = await specModel.createSpec({
      title: title.trim(),
      content,
      file_path: file_path.trim(),
      created_by,
      project_id: projectId,
      status
    });

    res.status(201).json({
      message: 'Specification created successfully',
      specification: spec
    });

  } catch (err) {
    console.error('Create spec failed:', err);
    res.status(500).json({
      error: 'Failed to create specification',
      code: 'INTERNAL_ERROR'
    });
  }
};

exports.getSpecsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check if user has access to the project
    const accessCheck = await db.query(
      `SELECT c.role FROM collaborations c WHERE c.project_id = $1 AND c.user_id = $2`,
      [projectId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Project not found or access denied',
        code: 'PROJECT_NOT_FOUND'
      });
    }

    const specs = await specModel.getSpecsByProject(projectId);
    
    res.json({
      specifications: specs,
      count: specs.length
    });

  } catch (err) {
    console.error('Fetch specs failed:', err);
    res.status(500).json({
      error: 'Failed to fetch specifications',
      code: 'INTERNAL_ERROR'
    });
  }
};

exports.getSpecById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const spec = await specModel.getSpecById(id);
    if (!spec) {
      return res.status(404).json({
        error: 'Specification not found',
        code: 'SPEC_NOT_FOUND'
      });
    }

    // Check if user has access to the project
    const accessCheck = await db.query(
      `SELECT c.role FROM collaborations c WHERE c.project_id = $1 AND c.user_id = $2`,
      [spec.project_id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Specification not found or access denied',
        code: 'SPEC_NOT_FOUND'
      });
    }

    res.json({
      specification: spec
    });

  } catch (err) {
    console.error('Fetch spec failed:', err);
    res.status(500).json({
      error: 'Failed to fetch specification',
      code: 'INTERNAL_ERROR'
    });
  }
};

exports.updateSpec = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, file_path, status } = req.body;
    const userId = req.user.id;

    // Get spec to check project access
    const spec = await specModel.getSpecById(id);
    if (!spec) {
      return res.status(404).json({
        error: 'Specification not found',
        code: 'SPEC_NOT_FOUND'
      });
    }

    // Check if user has access to modify the spec
    const accessCheck = await db.query(
      `SELECT c.role FROM collaborations c WHERE c.project_id = $1 AND c.user_id = $2`,
      [spec.project_id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Specification not found or access denied',
        code: 'SPEC_NOT_FOUND'
      });
    }

    const userRole = accessCheck.rows[0].role;
    if (!['contributor', 'admin', 'owner'].includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions to update specifications',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const updatedSpec = await specModel.updateSpec(id, {
      title: title?.trim(),
      content,
      file_path: file_path?.trim(),
      status
    });

    res.json({
      message: 'Specification updated successfully',
      specification: updatedSpec
    });

  } catch (err) {
    console.error('Update spec failed:', err);
    res.status(500).json({
      error: 'Failed to update specification',
      code: 'INTERNAL_ERROR'
    });
  }
};

exports.deleteSpec = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get spec to check project access
    const spec = await specModel.getSpecById(id);
    if (!spec) {
      return res.status(404).json({
        error: 'Specification not found',
        code: 'SPEC_NOT_FOUND'
      });
    }

    // Check if user has access to delete the spec
    const accessCheck = await db.query(
      `SELECT c.role FROM collaborations c WHERE c.project_id = $1 AND c.user_id = $2`,
      [spec.project_id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Specification not found or access denied',
        code: 'SPEC_NOT_FOUND'
      });
    }

    const userRole = accessCheck.rows[0].role;
    if (!['admin', 'owner'].includes(userRole) && spec.author.id !== userId) {
      return res.status(403).json({
        error: 'Insufficient permissions to delete specifications',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    await specModel.deleteSpec(id);

    res.json({
      message: 'Specification deleted successfully'
    });

  } catch (err) {
    console.error('Delete spec failed:', err);
    res.status(500).json({
      error: 'Failed to delete specification',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Upload specification file
exports.uploadSpecFile = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, file_path, folder = '' } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        code: 'VALIDATION_ERROR'
      });
    }

    // Check if user has access to the project
    const accessCheck = await db.query(
      `SELECT c.role FROM collaborations c WHERE c.project_id = $1 AND c.user_id = $2`,
      [projectId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Project not found or access denied',
        code: 'PROJECT_NOT_FOUND'
      });
    }

    const userRole = accessCheck.rows[0].role;
    if (!['contributor', 'admin', 'owner'].includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions to upload specifications',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Read file content
    const content = await fs.readFile(req.file.path, 'utf-8');
    
    // Clean up uploaded file
    await fs.unlink(req.file.path);

    // Create specification with file content
    const spec = await specModel.createSpec({
      title: title || req.file.originalname,
      content: content,
      file_path: folder ? `${folder}/${file_path || req.file.originalname}` : (file_path || req.file.originalname),
      created_by: userId,
      project_id: projectId,
      status: 'draft'
    });

    res.status(201).json({
      message: 'Specification file uploaded successfully',
      specification: spec
    });

  } catch (err) {
    console.error('Upload spec file failed:', err);
    res.status(500).json({
      error: 'Failed to upload specification file',
      code: 'INTERNAL_ERROR'
    });
  }
};
