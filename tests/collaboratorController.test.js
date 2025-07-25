const request = require('supertest');
const express = require('express');
const projectController = require('../src/controllers/projectController');

// Create a test app
const app = express();
app.use(express.json());

// Mock auth middleware
app.use((req, res, next) => {
  req.user = { id: 'test-user-id', role: 'contributor' };
  next();
});

// Add collaborator routes for testing
app.post('/projects/:id/collaborators', projectController.addCollaborator);
app.delete('/projects/:id/collaborators/:collaboratorId', projectController.removeCollaborator);
app.put('/projects/:id/collaborators/:collaboratorId', projectController.updateCollaboratorRole);

// Mock the database
jest.mock('../src/models/db', () => ({
  query: jest.fn()
}));

const db = require('../src/models/db');

describe('Collaborator Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /projects/:id/collaborators', () => {
    it('should add a collaborator successfully', async () => {
      const mockUser = {
        id: 'collaborator-id',
        email: 'collaborator@example.com',
        first_name: 'John',
        last_name: 'Doe'
      };

      db.query
        .mockResolvedValueOnce({ rows: [{ role: 'owner' }] }) // Permission check
        .mockResolvedValueOnce({ rows: [mockUser] }) // User lookup
        .mockResolvedValueOnce({ rows: [] }) // Existing collaboration check
        .mockResolvedValueOnce({ rows: [] }); // Add collaboration

      const response = await request(app)
        .post('/projects/project-id/collaborators')
        .send({
          email: 'collaborator@example.com',
          role: 'contributor'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Collaborator added successfully');
      expect(response.body.collaborator.email).toBe('collaborator@example.com');
      expect(response.body.collaborator.role).toBe('contributor');
    });

    it('should reject invalid role', async () => {
      const response = await request(app)
        .post('/projects/project-id/collaborators')
        .send({
          email: 'collaborator@example.com',
          role: 'invalid-role'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid role. Must be viewer, contributor, or admin');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject if user lacks permissions', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ role: 'contributor' }] }); // Permission check

      const response = await request(app)
        .post('/projects/project-id/collaborators')
        .send({
          email: 'collaborator@example.com',
          role: 'contributor'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions to add collaborators');
    });

    it('should reject if user not found', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ role: 'owner' }] }) // Permission check
        .mockResolvedValueOnce({ rows: [] }); // User lookup (not found)

      const response = await request(app)
        .post('/projects/project-id/collaborators')
        .send({
          email: 'nonexistent@example.com',
          role: 'contributor'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
      expect(response.body.code).toBe('USER_NOT_FOUND');
    });

    it('should reject if user is already a collaborator', async () => {
      const mockUser = {
        id: 'collaborator-id',
        email: 'collaborator@example.com',
        first_name: 'John',
        last_name: 'Doe'
      };

      db.query
        .mockResolvedValueOnce({ rows: [{ role: 'owner' }] }) // Permission check
        .mockResolvedValueOnce({ rows: [mockUser] }) // User lookup
        .mockResolvedValueOnce({ rows: [{ id: 'existing-collaboration' }] }); // Existing collaboration check

      const response = await request(app)
        .post('/projects/project-id/collaborators')
        .send({
          email: 'collaborator@example.com',
          role: 'contributor'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User is already a collaborator on this project');
      expect(response.body.code).toBe('COLLABORATION_EXISTS');
    });
  });

  describe('DELETE /projects/:id/collaborators/:collaboratorId', () => {
    it('should remove a collaborator successfully', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ role: 'owner' }] }) // Permission check
        .mockResolvedValueOnce({ rows: [{ role: 'contributor' }] }) // Collaboration check
        .mockResolvedValueOnce({ rows: [] }); // Remove collaboration

      const response = await request(app)
        .delete('/projects/project-id/collaborators/collaborator-id');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Collaborator removed successfully');
    });

    it('should prevent removing project owner', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ role: 'owner' }] }) // Permission check
        .mockResolvedValueOnce({ rows: [{ role: 'owner' }] }); // Collaboration check (target is owner)

      const response = await request(app)
        .delete('/projects/project-id/collaborators/owner-id');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Cannot remove project owner');
      expect(response.body.code).toBe('CANNOT_REMOVE_OWNER');
    });

    it('should reject if collaborator not found', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ role: 'owner' }] }) // Permission check
        .mockResolvedValueOnce({ rows: [] }); // Collaboration check (not found)

      const response = await request(app)
        .delete('/projects/project-id/collaborators/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Collaborator not found');
      expect(response.body.code).toBe('COLLABORATOR_NOT_FOUND');
    });
  });

  describe('PUT /projects/:id/collaborators/:collaboratorId', () => {
    it('should update collaborator role successfully', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ role: 'owner' }] }) // Permission check
        .mockResolvedValueOnce({ rows: [{ role: 'contributor' }] }) // Collaboration check
        .mockResolvedValueOnce({ rows: [] }); // Update collaboration

      const response = await request(app)
        .put('/projects/project-id/collaborators/collaborator-id')
        .send({
          role: 'admin'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Collaborator role updated successfully');
      expect(response.body.role).toBe('admin');
    });

    it('should reject invalid role', async () => {
      const response = await request(app)
        .put('/projects/project-id/collaborators/collaborator-id')
        .send({
          role: 'invalid-role'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid role. Must be viewer, contributor, or admin');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should prevent changing owner role', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ role: 'owner' }] }) // Permission check
        .mockResolvedValueOnce({ rows: [{ role: 'owner' }] }); // Collaboration check (target is owner)

      const response = await request(app)
        .put('/projects/project-id/collaborators/owner-id')
        .send({
          role: 'admin'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Cannot change owner role');
      expect(response.body.code).toBe('CANNOT_CHANGE_OWNER_ROLE');
    });
  });
});