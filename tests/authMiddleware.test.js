const authMiddleware = require('../src/middleware/authMiddleware');

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

const jwt = require('jsonwebtoken');

// Mock database
jest.mock('../src/models/db', () => ({
  query: jest.fn()
}));

const db = require('../src/models/db');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token', () => {
      const mockDecoded = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'contributor',
        type: 'access'
      };

      req.headers['authorization'] = 'Bearer valid-token';
      jwt.verify.mockReturnValue(mockDecoded);

      authMiddleware.authenticateToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
      expect(req.user).toEqual(mockDecoded);
      expect(next).toHaveBeenCalled();
    });

    it('should reject request with no token', () => {
      authMiddleware.authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      req.headers['authorization'] = 'Bearer invalid-token';
      
      const error = new Error('invalid signature');
      error.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      authMiddleware.authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject expired token', () => {
      req.headers['authorization'] = 'Bearer expired-token';
      
      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      authMiddleware.authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject wrong token type', () => {
      const mockDecoded = {
        id: 'user-id',
        email: 'test@example.com',
        type: 'refresh' // Wrong type
      };

      req.headers['authorization'] = 'Bearer refresh-token';
      jwt.verify.mockReturnValue(mockDecoded);

      authMiddleware.authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    beforeEach(() => {
      req.user = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'contributor'
      };
    });

    it('should allow access for exact role match', () => {
      const middleware = authMiddleware.requireRole(['contributor']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow access when role is in allowed list', () => {
      const middleware = authMiddleware.requireRole(['contributor', 'admin', 'owner']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access for role not in allowed list', () => {
      req.user.role = 'viewer';
      const middleware = authMiddleware.requireRole(['contributor']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required_roles: ['contributor'],
        user_role: 'viewer'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle missing user', () => {
      req.user = null;
      const middleware = authMiddleware.requireRole(['contributor']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});