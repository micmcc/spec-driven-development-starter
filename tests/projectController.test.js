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

// Add project routes for testing
app.post('/projects', projectController.createProject);
app.get('/projects', projectController.getProjects);
app.get('/projects/:id', projectController.getProjectById);

// Mock the database
jest.mock('../src/models/db', () => ({
  query: jest.fn()
}));

const db = require('../src/models/db');

describe('Project Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /projects', () => {
    it('should create a new project successfully', async () => {
      const mockProject = {
        id: 'project-id',
        name: 'Test Project',
        description: 'A test project',
        owner_id: 'test-user-id',
        is_public: false,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      };

      db.query
        .mockResolvedValueOnce({ rows: [mockProject] }) // Project creation
        .mockResolvedValueOnce({ rows: [] }); // Collaboration creation

      const response = await request(app)
        .post('/projects')
        .send({
          name: 'Test Project',
          description: 'A test project',
          is_public: false
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Project created successfully');
      expect(response.body.project.name).toBe('Test Project');
      expect(response.body.project.owner_id).toBe('test-user-id');
    });

    it('should reject project creation without name', async () => {
      const response = await request(app)
        .post('/projects')
        .send({
          description: 'A test project'
          // Missing name
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Project name is required');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject project creation with empty name', async () => {
      const response = await request(app)
        .post('/projects')
        .send({
          name: '   ', // Empty/whitespace name
          description: 'A test project'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Project name is required');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject project creation with name too long', async () => {
      const longName = 'a'.repeat(256); // Over 255 characters

      const response = await request(app)
        .post('/projects')
        .send({
          name: longName,
          description: 'A test project'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Project name must be less than 255 characters');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      db.query.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/projects')
        .send({
          name: 'Test Project',
          description: 'A test project'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to create project');
    });
  });

  describe('GET /projects', () => {
    it('should return user projects successfully', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Project 1',
          description: 'First project',
          is_public: false,
          collaboration_role: 'owner'
        },
        {
          id: 'project-2',
          name: 'Project 2',
          description: 'Second project',
          is_public: true,
          collaboration_role: 'contributor'
        }
      ];

      db.query.mockResolvedValue({ rows: mockProjects });

      const response = await request(app)
        .get('/projects');

      expect(response.status).toBe(200);
      expect(response.body.projects).toHaveLength(2);
      expect(response.body.projects[0].name).toBe('Project 1');
      expect(response.body.projects[1].name).toBe('Project 2');
    });

    it('should handle database errors when fetching projects', async () => {
      db.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/projects');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch projects');
    });
  });

  describe('GET /projects/:id', () => {
    it('should return project details for valid project', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        description: 'A test project',
        owner_id: 'test-user-id',
        is_public: false,
        status: 'active',
        created_at: new Date(),
        collaboration_role: 'owner'
      };

      db.query.mockResolvedValue({ rows: [mockProject] });

      const response = await request(app)
        .get('/projects/project-1');

      expect(response.status).toBe(200);
      expect(response.body.project.name).toBe('Test Project');
      expect(response.body.project.id).toBe('project-1');
    });

    it('should return 404 for non-existent project', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/projects/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Project not found or access denied');
    });
  });
});