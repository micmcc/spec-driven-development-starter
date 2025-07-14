const specModel = require('../models/specModel');

exports.createSpec = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, type } = req.body;
    const created_by = req.user.id;

    const spec = await specModel.createSpec({ title, description, type, created_by, project_id: projectId });
    res.status(201).json(spec);
  } catch (err) {
    console.error('Create spec failed:', err);
    res.status(500).json({ error: 'Failed to create spec' });
  }
};

exports.getSpecsByProject = async (req, res) => {
  try {
    const specs = await specModel.getSpecsByProject(req.params.projectId);
    res.json(specs);
  } catch (err) {
    console.error('Fetch specs failed:', err);
    res.status(500).json({ error: 'Failed to fetch specs' });
  }
};

exports.getSpecById = async (req, res) => {
  try {
    const spec = await specModel.getSpecById(req.params.id);
    if (!spec) return res.status(404).json({ error: 'Spec not found' });
    res.json(spec);
  } catch (err) {
    console.error('Fetch spec failed:', err);
    res.status(500).json({ error: 'Failed to fetch spec' });
  }
};

exports.updateSpec = async (req, res) => {
  try {
    const updated = await specModel.updateSpec(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error('Update spec failed:', err);
    res.status(500).json({ error: 'Failed to update spec' });
  }
};

exports.deleteSpec = async (req, res) => {
  try {
    await specModel.deleteSpec(req.params.id);
    res.json({ message: 'Spec deleted' });
  } catch (err) {
    console.error('Delete spec failed:', err);
    res.status(500).json({ error: 'Failed to delete spec' });
  }
};
