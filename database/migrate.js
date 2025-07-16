require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase
  });

  try {
    console.log('🔄 Running database migration...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', '002_app_schema.sql'),
      'utf8'
    );
    
    await pool.query(migrationSQL);
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to PostgreSQL database.');
      console.error('📋 Please ensure PostgreSQL is running and accessible at:');
      console.error(`   ${process.env.DATABASE_URL || 'postgresql://localhost:5432/spec_driven_dev'}`);
      console.error('\n🚀 To start PostgreSQL:');
      console.error('   - macOS: brew services start postgresql');
      console.error('   - Ubuntu: sudo service postgresql start');
      console.error('   - Docker: docker run -d -p 5432:5432 -e POSTGRES_DB=spec_driven_dev postgres');
      console.error('\n💡 Or update DATABASE_URL in your .env file to point to your database.');
    } else {
      console.error('❌ Migration failed:', error);
    }
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = { runMigration };
