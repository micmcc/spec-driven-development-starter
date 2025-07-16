const jwt = require('jsonwebtoken');
const db = require('../models/db');

// Basic authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ensure it's an access token
    if (decoded.type !== 'access') {
      return res.status(401).json({ 
        error: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(403).json({ 
      error: 'Token verification failed',
      code: 'TOKEN_VERIFICATION_FAILED'
    });
  }
};

// Role-based authorization middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required_roles: allowedRoles,
        user_role: req.user.role
      });
    }

    next();
  };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type === 'access') {
      req.user = decoded;
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }

  next();
};

// Verify user still exists in database
const verifyUserExists = async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, role FROM app_users WHERE id = $1', [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'User no longer exists',
        code: 'USER_NOT_FOUND'
      });
    }

    // Update user role if it changed in database
    req.user.role = result.rows[0].role;
    next();
  } catch (err) {
    console.error('User verification failed:', err);
    return res.status(500).json({ 
      error: 'User verification failed',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth,
  verifyUserExists,
  // Legacy export for backward compatibility
  verifyToken: authenticateToken
};
