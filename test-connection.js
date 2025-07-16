#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 Testing database connection...');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 1000,
  max: 1 // Use only 1 connection for testing
});

async function testConnection() {
  try {
    console.log('⏳ Attempting database connection...');
    const client = await pool.connect();
    console.log('✅ Connected to database successfully!');
    
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('📅 Server time:', result.rows[0].current_time);
    console.log('🗄️  PostgreSQL version:', result.rows[0].pg_version.split(' ')[0]);
    
    client.release();
    await pool.end();
    console.log('✅ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error.code);
    await pool.end();
    process.exit(1);
  }
}

// Set a timeout to prevent hanging
setTimeout(() => {
  console.error('⏰ Connection test timed out after 10 seconds');
  process.exit(1);
}, 10000);

testConnection();
