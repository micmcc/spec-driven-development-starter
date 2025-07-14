require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./src/models/db');

async function seed() {
  try {
    // Clear existing data
    await db.query('DELETE FROM specifications');
    await db.query('DELETE FROM collaborations');
    await db.query('DELETE FROM projects');
    await db.query('DELETE FROM users');

    // Insert users
    const aliceId = '11111111-1111-1111-1111-111111111111';
    const bobId = '22222222-2222-2222-2222-222222222222';

    const hashedPasswordAlice = await bcrypt.hash('password123', 10);
    const hashedPasswordBob = await bcrypt.hash('password456', 10);

    await db.query(
      `INSERT INTO users (id, email, password_hash, name, role)
       VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)`,
      [
        aliceId, 'alice@example.com', hashedPasswordAlice, 'Alice', 'owner',
        bobId, 'bob@example.com', hashedPasswordBob, 'Bob', 'contributor'
      ]
    );

    // Insert project
    const projectId = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    await db.query(
      `INSERT INTO projects (id, name, description, owner_id, visibility)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        projectId, 'Spec Driven MVP', 'Initial project for testing spec-driven dev',
        aliceId, 'private'
      ]
    );

    // Insert collaboration
    await db.query(
      `INSERT INTO collaborations (user_id, project_id, permissions)
       VALUES ($1, $2, $3)`,
      [
        bobId, projectId, 'write'
      ]
    );

    // Insert specifications
    await db.query(
      `INSERT INTO specifications (id, title, description, type, created_by, project_id)
       VALUES 
       ('55555555-aaaa-bbbb-cccc-111111111111', 'Login Flow', 'Spec for login page and authentication logic', 'feature', $1, $2),
       ('55555555-aaaa-bbbb-cccc-222222222222', 'User Dashboard', 'User dashboard layout and core widgets', 'ux', $1, $2)`,
      [aliceId, projectId]
    );

    console.log('✅ Seed complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    process.exit();
  }
}

seed();
