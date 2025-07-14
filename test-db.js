require('dotenv').config();
const db = require('./src/models/db');

async function testConnection() {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('✅ Connected to DB. Current time:', result.rows[0].now);
  } catch (err) {
    console.error('❌ Failed to connect to DB:', err);
  }
}

testConnection();