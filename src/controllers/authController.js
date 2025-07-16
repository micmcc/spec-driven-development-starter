const db = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// JWT token generation
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      type: 'access'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );

  const refreshToken = jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      type: 'refresh'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );

  return { accessToken, refreshToken };
};

// User Registration
exports.register = async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  try {
    // Validation
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        code: 'VALIDATION_ERROR',
        details: 'email, password, first_name, and last_name are required'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        code: 'VALIDATION_ERROR'
      });
    }

    // Password strength validation (minimum 8 characters)
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long',
        code: 'VALIDATION_ERROR'
      });
    }

    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM app_users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        error: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    const result = await db.query(
      `INSERT INTO app_users (id, email, password_hash, first_name, last_name, role, email_verified, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
       RETURNING id, email, first_name, last_name, role, email_verified, created_at`,
      [userId, email, password_hash, first_name, last_name, 'contributor', false]
    );

    const user = result.rows[0];
    const tokens = generateTokens(user);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        email_verified: user.email_verified,
        created_at: user.created_at
      },
      ...tokens
    });

  } catch (err) {
    console.error('Registration failed:', err);
    console.error('Error details:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      error: 'Registration failed',
      code: 'INTERNAL_ERROR'
    });
  }
};

// User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        code: 'VALIDATION_ERROR'
      });
    }

    // Find user
    const result = await db.query('SELECT * FROM app_users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    await db.query('UPDATE app_users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Generate tokens
    const tokens = generateTokens(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        email_verified: user.email_verified
      },
      ...tokens
    });

  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ 
      error: 'Login failed',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Token Refresh
exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token is required',
        code: 'VALIDATION_ERROR'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ 
        error: 'Invalid token type',
        code: 'INVALID_TOKEN'
      });
    }

    // Get user details
    const result = await db.query('SELECT * FROM app_users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    res.json({
      message: 'Tokens refreshed successfully',
      ...tokens
    });

  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Invalid or expired refresh token',
        code: 'INVALID_TOKEN'
      });
    }

    console.error('Token refresh failed:', err);
    res.status(500).json({ 
      error: 'Token refresh failed',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Get current user profile
exports.profile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      'SELECT id, email, first_name, last_name, role, email_verified, created_at, last_login FROM app_users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({ user });

  } catch (err) {
    console.error('Profile fetch failed:', err);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      code: 'INTERNAL_ERROR'
    });
  }
};
