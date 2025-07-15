const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Helper function to hash passwords
async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

// Helper function to create future timestamp
function futureTimestamp(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

// Helper function to create content hash
function createContentHash(content) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function seedDatabase(db) {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (in reverse dependency order)
    await db.query('DELETE FROM document_operations');
    await db.query('DELETE FROM editing_sessions');
    await db.query('DELETE FROM document_versions');
    await db.query('DELETE FROM project_invitations');
    await db.query('DELETE FROM password_reset_tokens');
    await db.query('DELETE FROM email_change_requests');
    await db.query('DELETE FROM sessions');
    await db.query('DELETE FROM collaborations');
    await db.query('DELETE FROM specifications');
    await db.query('DELETE FROM projects');
    await db.query('DELETE FROM users');

    // Create users
    const users = [
      {
        id: uuidv4(),
        email: 'alice@example.com',
        password_hash: await hashPassword('password123'),
        name: 'Alice Johnson',
        role: 'owner',
        email_verified: true,
        email_verified_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        email: 'bob@example.com',
        password_hash: await hashPassword('password123'),
        name: 'Bob Smith',
        role: 'admin',
        email_verified: true,
        email_verified_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        email: 'carol@example.com',
        password_hash: await hashPassword('password123'),
        name: 'Carol Williams',
        role: 'contributor',
        email_verified: true,
        email_verified_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        email: 'david@example.com',
        password_hash: await hashPassword('password123'),
        name: 'David Brown',
        role: 'viewer',
        email_verified: false
      }
    ];

    for (const user of users) {
      await db.query(`
        INSERT INTO users (id, email, password_hash, name, role, email_verified, email_verified_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [user.id, user.email, user.password_hash, user.name, user.role, user.email_verified, user.email_verified_at]);
    }

    console.log('✅ Created users');

    // Create projects
    const projects = [
      {
        id: uuidv4(),
        name: 'E-commerce Platform',
        description: 'Specifications for a modern e-commerce platform with advanced features',
        owner_id: users[0].id, // Alice
        visibility: 'private'
      },
      {
        id: uuidv4(),
        name: 'Mobile Banking App',
        description: 'Comprehensive specs for a secure mobile banking application',
        owner_id: users[1].id, // Bob
        visibility: 'public'
      },
      {
        id: uuidv4(),
        name: 'Internal CRM System',
        description: 'Customer relationship management system specifications',
        owner_id: users[0].id, // Alice
        visibility: 'private'
      }
    ];

    for (const project of projects) {
      await db.query(`
        INSERT INTO projects (id, name, description, owner_id, visibility)
        VALUES ($1, $2, $3, $4, $5)
      `, [project.id, project.name, project.description, project.owner_id, project.visibility]);
    }

    console.log('✅ Created projects');

    // Create collaborations
    const collaborations = [
      { user_id: users[2].id, project_id: projects[0].id, permissions: 'contributor' }, // Carol on E-commerce
      { user_id: users[3].id, project_id: projects[0].id, permissions: 'viewer' },      // David on E-commerce
      { user_id: users[0].id, project_id: projects[1].id, permissions: 'admin' },       // Alice on Banking
      { user_id: users[2].id, project_id: projects[1].id, permissions: 'contributor' }, // Carol on Banking
      { user_id: users[1].id, project_id: projects[2].id, permissions: 'contributor' }  // Bob on CRM
    ];

    for (const collab of collaborations) {
      await db.query(`
        INSERT INTO collaborations (user_id, project_id, permissions)
        VALUES ($1, $2, $3)
      `, [collab.user_id, collab.project_id, collab.permissions]);
    }

    console.log('✅ Created collaborations');

    // Create specifications
    const specifications = [
      {
        id: uuidv4(),
        title: 'User Authentication System',
        description: 'Complete authentication flow including registration, login, and password reset',
        content: `# User Authentication System

## Overview
This specification defines the authentication system for the e-commerce platform.

## Requirements

### Functional Requirements
- [ ] User registration with email verification
- [ ] Secure login with JWT tokens
- [ ] Password reset functionality
- [ ] Session management
- [ ] Role-based access control

### Non-Functional Requirements
- [ ] Password hashing using bcrypt
- [ ] JWT tokens with 15-minute expiration
- [ ] Rate limiting on authentication endpoints
- [ ] Secure session storage

## API Endpoints

### Registration
\`\`\`
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
\`\`\`

### Login
\`\`\`
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securePassword123"
}
\`\`\`

## Security Considerations
- All passwords must be hashed using bcrypt with minimum 12 rounds
- JWT tokens should include user ID, email, and role
- Implement rate limiting to prevent brute force attacks`,
        type: 'feature',
        created_by: users[0].id,
        project_id: projects[0].id
      },
      {
        id: uuidv4(),
        title: 'Shopping Cart Functionality',
        description: 'Add to cart, modify quantities, checkout process',
        content: `# Shopping Cart

## Requirements

### Core Functionality
- [ ] Add items to cart
- [ ] Modify item quantities
- [ ] Remove items from cart
- [ ] Calculate totals with tax
- [ ] Apply discount codes
- [ ] Secure checkout process

### User Experience
- [ ] Real-time cart updates
- [ ] Cart persistence across sessions
- [ ] Mobile-responsive design
- [ ] Loading states for all actions

## Data Model

### Cart Item
\`\`\`javascript
{
  id: UUID,
  product_id: UUID,
  quantity: number,
  price: decimal,
  added_at: timestamp
}
\`\`\`

### Cart Summary
\`\`\`javascript
{
  subtotal: decimal,
  tax: decimal,
  discount: decimal,
  total: decimal
}
\`\`\`

## Business Rules
- Maximum 10 items per product in cart
- Cart expires after 24 hours of inactivity
- Prices are locked when items are added to cart`,
        type: 'feature',
        created_by: users[2].id,
        project_id: projects[0].id
      },
      {
        id: uuidv4(),
        title: 'Account Balance Display',
        description: 'Real-time account balance with transaction history',
        content: `# Account Balance

## Functional Requirements

### Balance Display
- [ ] Real-time balance updates
- [ ] Available vs pending balance
- [ ] Multiple account support
- [ ] Currency formatting

### Transaction History
- [ ] Paginated transaction list
- [ ] Transaction search and filtering
- [ ] Export functionality
- [ ] Transaction categories

## Security Requirements
- [ ] Two-factor authentication for sensitive operations
- [ ] Audit logging for all balance inquiries
- [ ] Rate limiting on balance API calls
- [ ] Encrypted data transmission

## Performance Requirements
- [ ] Balance updates within 100ms
- [ ] Support for 10,000 concurrent users
- [ ] 99.9% uptime requirement
- [ ] Graceful degradation during high load`,
        type: 'feature',
        created_by: users[1].id,
        project_id: projects[1].id
      },
      {
        id: uuidv4(),
        title: 'Money Transfer Feature',
        description: 'Secure peer-to-peer money transfers',
        content: `# Money Transfer

## Security Requirements

### Authentication
- [ ] Two-factor authentication required
- [ ] Biometric verification on mobile
- [ ] Transaction PIN verification

### Transfer Limits
- [ ] Daily transfer limits based on account type
- [ ] Velocity checking for unusual patterns
- [ ] Fraud detection algorithms

### Audit Trail
- [ ] Complete transaction logging
- [ ] Immutable transaction records
- [ ] Compliance reporting

## User Experience

### Transfer Flow
1. Select recipient (from contacts or manual entry)
2. Enter amount and optional memo
3. Review transfer details
4. Authenticate with 2FA
5. Receive confirmation

### Notifications
- [ ] Real-time transfer notifications
- [ ] Email confirmations
- [ ] SMS alerts for large transfers`,
        type: 'feature',
        created_by: users[0].id,
        project_id: projects[1].id
      },
      {
        id: uuidv4(),
        title: 'Customer Contact Management',
        description: 'Store and manage customer contact information',
        content: `# Contact Management

## Data Fields

### Personal Information
- [ ] Full name (first, middle, last)
- [ ] Email addresses (primary, secondary)
- [ ] Phone numbers (mobile, work, home)
- [ ] Mailing address
- [ ] Date of birth
- [ ] Preferred communication method

### Company Information
- [ ] Company name
- [ ] Job title
- [ ] Department
- [ ] Company address
- [ ] Industry classification

### Relationship Tracking
- [ ] Customer lifecycle stage
- [ ] Interaction history
- [ ] Purchase history
- [ ] Support ticket history
- [ ] Marketing preferences

## Features

### Contact Organization
- [ ] Custom tags and categories
- [ ] Smart contact groups
- [ ] Duplicate detection and merging
- [ ] Import/export functionality

### Integration Points
- [ ] Email marketing system
- [ ] Support ticket system
- [ ] Sales pipeline
- [ ] Billing system`,
        type: 'feature',
        created_by: users[0].id,
        project_id: projects[2].id
      }
    ];

    for (const spec of specifications) {
      await db.query(`
        INSERT INTO specifications (id, title, description, content, type, created_by, project_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [spec.id, spec.title, spec.description, spec.content, spec.type, spec.created_by, spec.project_id]);
    }

    console.log('✅ Created specifications');

    // Create document versions for version control
    for (let i = 0; i < specifications.length; i++) {
      const spec = specifications[i];
      await db.query(`
        INSERT INTO document_versions (spec_id, version, content, content_hash, created_by)
        VALUES ($1, 1, $2, $3, $4)
      `, [spec.id, spec.content, createContentHash(spec.content), spec.created_by]);
    }

    console.log('✅ Created document versions');

    // Create some project invitations
    const invitations = [
      {
        id: uuidv4(),
        project_id: projects[0].id,
        inviter_id: users[0].id,
        email: 'newuser@example.com',
        permissions: 'contributor',
        token_hash: createContentHash('invitation_token_1'),
        expires_at: futureTimestamp(7)
      },
      {
        id: uuidv4(),
        project_id: projects[1].id,
        inviter_id: users[1].id,
        email: 'developer@example.com',
        permissions: 'admin',
        token_hash: createContentHash('invitation_token_2'),
        expires_at: futureTimestamp(7)
      }
    ];

    for (const invitation of invitations) {
      await db.query(`
        INSERT INTO project_invitations (id, project_id, inviter_id, email, permissions, token_hash, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [invitation.id, invitation.project_id, invitation.inviter_id, invitation.email, invitation.permissions, invitation.token_hash, invitation.expires_at]);
    }

    console.log('✅ Created project invitations');

    // Create some active editing sessions
    const editingSessions = [
      {
        id: uuidv4(),
        spec_id: specifications[0].id,
        user_id: users[0].id,
        socket_id: 'socket_alice_1',
        cursor_position: 156,
        selection_start: 150,
        selection_end: 165
      },
      {
        id: uuidv4(),
        spec_id: specifications[0].id,
        user_id: users[2].id,
        socket_id: 'socket_carol_1',
        cursor_position: 89
      }
    ];

    for (const session of editingSessions) {
      await db.query(`
        INSERT INTO editing_sessions (id, spec_id, user_id, socket_id, cursor_position, selection_start, selection_end)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [session.id, session.spec_id, session.user_id, session.socket_id, session.cursor_position, session.selection_start, session.selection_end]);
    }

    console.log('✅ Created editing sessions');

    console.log('🎉 Database seed completed successfully!');
    console.log('\n📊 Seed Data Summary:');
    console.log(`- ${users.length} users created`);
    console.log(`- ${projects.length} projects created`);
    console.log(`- ${collaborations.length} collaborations created`);
    console.log(`- ${specifications.length} specifications created`);
    console.log(`- ${invitations.length} pending invitations created`);
    console.log(`- ${editingSessions.length} active editing sessions created`);
    console.log('\n🔐 Test User Credentials:');
    console.log('Alice (Owner): alice@example.com / password123');
    console.log('Bob (Admin): bob@example.com / password123');
    console.log('Carol (Contributor): carol@example.com / password123');
    console.log('David (Viewer): david@example.com / password123');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// For direct execution
if (require.main === module) {
  const { Pool } = require('pg');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/spec_driven_dev',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  seedDatabase(pool).then(() => {
    pool.end();
  }).catch(console.error);
}

module.exports = { seedDatabase };
