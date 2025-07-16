require('dotenv').config();
const express = require('express');
const db = require('./src/models/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Basic health check
app.get('/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as server_time');
    res.json({
      status: 'healthy',
      database: { connected: true },
      server_time: result.rows[0].server_time
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: { connected: false, error: error.message }
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
