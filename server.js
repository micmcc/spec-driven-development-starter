require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
const db = require('./src/models/db');

// Import routes (we'll create these progressively)
const authRoutes = require('./src/routes/auth');
const projectRoutes = require('./src/routes/projects');
const specRoutes = require('./src/routes/specs');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001'
  ],
  credentials: true
}));

// Rate limiting (temporarily disabled due to version compatibility)
// TODO: Fix express-rate-limit configuration
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
//   max: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS) || 100,
//   message: {
//     error: 'Too many requests from this IP, please try again later.',
//     code: 'RATE_LIMIT_EXCEEDED'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const result = await db.query('SELECT NOW() as server_time, version() as postgres_version');
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        server_time: result.rows[0].server_time,
        postgres_version: result.rows[0].postgres_version.split(' ')[0]
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message
      },
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// API root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Spec Driven Development API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  });
});

// Routes (we'll uncomment these as we implement them)
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', specRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Test database connection before starting server
    await db.query('SELECT 1');
    console.log('✅ Database connection established');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check available at http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
