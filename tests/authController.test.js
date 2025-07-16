const request = require('supertest');
const express = require('express');
const authController = require('../src/controllers/authController');

// Create a test app
const app = express();
app.use(express.json());

// Add auth routes for testing
app.post('/register', authController.register);
app.post('/login', authController.login);
app.post('/refresh', authController.refresh);

// Mock the database
jest.mock('../src/models/db', () => ({
  query: jest.fn()
}));

const db = require('../src/models/db');

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

const bcrypt = require('bcrypt');

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

const jwt = require('jsonwebtoken');

describe('Authentication Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default JWT mock
    jwt.sign.mockReturnValue('mock-token');
  });

  describe('POST /register', () => {
    it('should register a new user with valid credentials', async () => {
      // Mock database responses
      db.query
        .mockResolvedValueOnce({ rows: [] }) // User doesn't exist
        .mockResolvedValueOnce({ 
          rows: [{ 
            id: 'user-id', 
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            role: 'contributor',
            email_verified: false,
            created_at: new Date()
          }] 
        }); // User creation

      bcrypt.hash.mockResolvedValue('hashed-password');

      const response = await request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          first_name: 'Test',
          last_name: 'User'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.accessToken).toBe('mock-token');
      expect(response.body.refreshToken).toBe('mock-token');
    });

    it('should reject registration with missing required fields', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          email: 'test@example.com'
          // Missing password, first_name, last_name
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required fields');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with invalid email format', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          first_name: 'Test',
          last_name: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email format');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          password: '123', // Too short
          first_name: 'Test',
          last_name: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Password must be at least 8 characters long');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration if user already exists', async () => {
      // Mock user already exists
      db.query.mockResolvedValueOnce({ 
        rows: [{ id: 'existing-user-id' }] 
      });

      const response = await request(app)
        .post('/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          first_name: 'Test',
          last_name: 'User'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User already exists');
      expect(response.body.code).toBe('USER_EXISTS');
    });
  });

  describe('POST /login', () => {
    it('should allow login with valid credentials', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        first_name: 'Test',
        last_name: 'User',
        role: 'contributor',
        email_verified: false
      };

      db.query
        .mockResolvedValueOnce({ rows: [mockUser] }) // Find user
        .mockResolvedValueOnce({ rows: [] }); // Update last login

      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.accessToken).toBe('mock-token');
      expect(response.body.refreshToken).toBe('mock-token');
    });

    it('should show error for invalid credentials', async () => {
      // Mock user not found
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should show error for wrong password', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password_hash: 'hashed-password'
      };

      db.query.mockResolvedValueOnce({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(false); // Wrong password

      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should show validation warnings for empty form fields', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          // Empty email and password
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'contributor'
      };

      jwt.verify.mockReturnValue({ 
        id: 'user-id', 
        email: 'test@example.com',
        type: 'refresh' 
      });
      
      db.query.mockResolvedValueOnce({ rows: [mockUser] });

      const response = await request(app)
        .post('/refresh')
        .send({
          refreshToken: 'valid-refresh-token'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Tokens refreshed successfully');
      expect(response.body.accessToken).toBe('mock-token');
      expect(response.body.refreshToken).toBe('mock-token');
    });

    it('should reject invalid refresh token', async () => {
      jwt.verify.mockImplementation(() => {
        const error = new Error('invalid signature');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      const response = await request(app)
        .post('/refresh')
        .send({
          refreshToken: 'invalid-token'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid or expired refresh token');
      expect(response.body.code).toBe('INVALID_TOKEN');
    });

    it('should require refresh token', async () => {
      const response = await request(app)
        .post('/refresh')
        .send({
          // Missing refreshToken
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Refresh token is required');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });
});