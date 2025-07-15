const { runMigration } = require('./migrate');
const { seedDatabase } = require('./seed');
const { Pool } = require('pg');

async function setupDatabase() {
  console.log('🚀 Setting up database...\n');
  
  try {
    // Run migration first
    await runMigration();
    
    // Then run seed
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/spec_driven_dev',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    try {
      await seedDatabase(pool);
    } finally {
      await pool.end();
    }
    
    console.log('\n🎉 Database setup complete!');
    console.log('You can now start your application with realistic test data.');
    console.log('\n🚀 Next steps:');
    console.log('1. Start your application server');
    console.log('2. Test the steel thread with the provided user credentials');
    console.log('3. Use the test data to validate your specifications');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Database setup failed: Cannot connect to PostgreSQL');
      console.error('📋 Please ensure PostgreSQL is running and accessible.');
      console.error('🚀 See database/README.md for setup instructions.');
    } else {
      console.error('❌ Database setup failed:', error);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };
