const request = require('supertest');
const express = require('express');
const specController = require('../src/controllers/specController');

// Create a test app
const app = express();
app.use(express.json());

// Mock auth middleware
app.use((req, res, next) => {
  req.user = { id: 'test-user-id', role: 'contributor' };
  next();
});

// Add spec routes for testing
app.post('/projects/:projectId/specs', specController.createSpec);
app.get('/projects/:projectId/specs', specController.getSpecsByProject);
app.get('/specs/:id', specController.getSpecById);
app.put('/specs/:id', specController.updateSpec);
app.delete('/specs/:id', specController.deleteSpec);

// Mock the database and spec model
jest.mock('../src/models/db', () => ({
  query: jest.fn()
}));

jest.mock('../src/models/specModel', () => ({
  createSpec: jest.fn(),
  getSpecsByProject: jest.fn(),
  getSpecById: jest.fn(),
  updateSpec: jest.fn(),
  deleteSpec: jest.fn(),
}));

const db = require('../src/models/db');
const specModel = require('../src/models/specModel');

describe('Enhanced Specification Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /projects/:projectId/specs', () => {
    it('should create a specification successfully', async () => {
      const mockSpec = {
        id: 'spec-id',
        title: 'Test Spec',
        content: 'Test content',
        file_path: 'features/test-spec.md',
        status: 'draft',
        project_id: 'project-id',
        created_by: 'test-user-id',
        created_at: new Date(),
        updated_at: new Date()
      };

      db.query.mockResolvedValueOnce({ rows: [{ role: 'contributor' }] }); // Access check
      specModel.createSpec.mockResolvedValueOnce(mockSpec);

      const response = await request(app)
        .post('/projects/project-id/specs')
        .send({
          title: 'Test Spec',
          content: 'Test content',
          file_path: 'features/test-spec.md',
          status: 'draft'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Specification created successfully');
      expect(response.body.specification.title).toBe('Test Spec');
      expect(response.body.specification.file_path).toBe('features/test-spec.md');
    });

    it('should reject specification creation without title', async () => {
      const response = await request(app)
        .post('/projects/project-id/specs')
        .send({
          content: 'Test content',
          file_path: 'features/test-spec.md'
          // Missing title
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Specification title is required');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject specification creation without file_path', async () => {
      const response = await request(app)
        .post('/projects/project-id/specs')
        .send({
          title: 'Test Spec',
          content: 'Test content'
          // Missing file_path
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('File path is required');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject if user lacks project access', async () => {
      db.query.mockResolvedValueOnce({ rows: [] }); // No access to project

      const response = await request(app)
        .post('/projects/project-id/specs')
        .send({
          title: 'Test Spec',
          content: 'Test content',
          file_path: 'features/test-spec.md'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Project not found or access denied');
      expect(response.body.code).toBe('PROJECT_NOT_FOUND');
    });

    it('should reject if user lacks sufficient permissions', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ role: 'viewer' }] }); // Viewer role

      const response = await request(app)
        .post('/projects/project-id/specs')
        .send({
          title: 'Test Spec',
          content: 'Test content',
          file_path: 'features/test-spec.md'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions to create specifications');
      expect(response.body.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('GET /projects/:projectId/specs', () => {
    it('should return specifications for a project', async () => {
      const mockSpecs = [
        {
          id: 'spec-1',
          title: 'Spec 1',
          content: 'Content 1',
          file_path: 'features/spec1.md',
          status: 'draft',
          version: 1,
          created_at: new Date(),
          updated_at: new Date(),
          author: {
            id: 'user-1',
            first_name: 'John',
            last_name: 'Doe'
          }
        },
        {
          id: 'spec-2',
          title: 'Spec 2',
          content: 'Content 2',
          file_path: 'features/spec2.md',
          status: 'approved',
          version: 2,
          created_at: new Date(),
          updated_at: new Date(),
          author: {
            id: 'user-2',
            first_name: 'Jane',
            last_name: 'Smith'
          }
        }
      ];

      db.query.mockResolvedValueOnce({ rows: [{ role: 'contributor' }] }); // Access check
      specModel.getSpecsByProject.mockResolvedValueOnce(mockSpecs);

      const response = await request(app)
        .get('/projects/project-id/specs');

      expect(response.status).toBe(200);
      expect(response.body.specifications).toHaveLength(2);
      expect(response.body.count).toBe(2);
      expect(response.body.specifications[0].title).toBe('Spec 1');
      expect(response.body.specifications[0].author.first_name).toBe('John');
      expect(response.body.specifications[1].title).toBe('Spec 2');
      expect(response.body.specifications[1].status).toBe('approved');
    });

    it('should reject if user lacks project access', async () => {
      db.query.mockResolvedValueOnce({ rows: [] }); // No access to project

      const response = await request(app)
        .get('/projects/project-id/specs');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Project not found or access denied');
      expect(response.body.code).toBe('PROJECT_NOT_FOUND');
    });
  });

  describe('GET /specs/:id', () => {
    it('should return a specification by ID', async () => {
      const mockSpec = {
        id: 'spec-id',
        title: 'Test Spec',
        content: 'Test content',
        file_path: 'features/test-spec.md',
        status: 'draft',
        version: 1,
        project_id: 'project-id',
        created_at: new Date(),
        updated_at: new Date(),
        author: {
          id: 'user-id',
          first_name: 'John',
          last_name: 'Doe'
        }
      };

      specModel.getSpecById.mockResolvedValueOnce(mockSpec);
      db.query.mockResolvedValueOnce({ rows: [{ role: 'contributor' }] }); // Access check

      const response = await request(app)
        .get('/specs/spec-id');

      expect(response.status).toBe(200);
      expect(response.body.specification.title).toBe('Test Spec');
      expect(response.body.specification.author.first_name).toBe('John');
      expect(response.body.specification.file_path).toBe('features/test-spec.md');
    });

    it('should return 404 if specification not found', async () => {
      specModel.getSpecById.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/specs/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Specification not found');
      expect(response.body.code).toBe('SPEC_NOT_FOUND');
    });
  });

  describe('PUT /specs/:id', () => {
    it('should update a specification successfully', async () => {
      const mockSpec = {
        id: 'spec-id',
        title: 'Test Spec',
        content: 'Original content',
        file_path: 'features/test-spec.md',
        status: 'draft',
        project_id: 'project-id',
        author: { id: 'user-id' }
      };

      const updatedSpec = {
        ...mockSpec,
        title: 'Updated Spec',
        content: 'Updated content',
        status: 'in_review'
      };

      specModel.getSpecById.mockResolvedValueOnce(mockSpec);
      db.query.mockResolvedValueOnce({ rows: [{ role: 'contributor' }] }); // Access check
      specModel.updateSpec.mockResolvedValueOnce(updatedSpec);

      const response = await request(app)
        .put('/specs/spec-id')
        .send({
          title: 'Updated Spec',
          content: 'Updated content',
          status: 'in_review'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Specification updated successfully');
      expect(response.body.specification.title).toBe('Updated Spec');
    });

    it('should reject if user lacks permissions', async () => {
      const mockSpec = {
        id: 'spec-id',
        project_id: 'project-id',
        author: { id: 'user-id' }
      };

      specModel.getSpecById.mockResolvedValueOnce(mockSpec);
      db.query.mockResolvedValueOnce({ rows: [{ role: 'viewer' }] }); // Viewer role

      const response = await request(app)
        .put('/specs/spec-id')
        .send({
          title: 'Updated Spec'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions to update specifications');
    });
  });

  describe('DELETE /specs/:id', () => {
    it('should delete a specification successfully (owner)', async () => {
      const mockSpec = {
        id: 'spec-id',
        project_id: 'project-id',
        author: { id: 'test-user-id' } // Same as authenticated user
      };

      specModel.getSpecById.mockResolvedValueOnce(mockSpec);
      db.query.mockResolvedValueOnce({ rows: [{ role: 'contributor' }] }); // Access check
      specModel.deleteSpec.mockResolvedValueOnce();

      const response = await request(app)
        .delete('/specs/spec-id');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Specification deleted successfully');
    });

    it('should delete a specification successfully (admin)', async () => {
      const mockSpec = {
        id: 'spec-id',
        project_id: 'project-id',
        author: { id: 'other-user-id' }
      };

      specModel.getSpecById.mockResolvedValueOnce(mockSpec);
      db.query.mockResolvedValueOnce({ rows: [{ role: 'admin' }] }); // Admin role
      specModel.deleteSpec.mockResolvedValueOnce();

      const response = await request(app)
        .delete('/specs/spec-id');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Specification deleted successfully');
    });

    it('should reject if user lacks permissions', async () => {
      const mockSpec = {
        id: 'spec-id',
        project_id: 'project-id',
        author: { id: 'other-user-id' } // Different from authenticated user
      };

      specModel.getSpecById.mockResolvedValueOnce(mockSpec);
      db.query.mockResolvedValueOnce({ rows: [{ role: 'contributor' }] }); // Contributor role, not owner

      const response = await request(app)
        .delete('/specs/spec-id');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions to delete specifications');
    });
  });
});