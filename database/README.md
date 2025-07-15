# Database Setup

This directory contains the complete database setup for the Spec Driven Development platform.

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up your database:**

   ```bash
   npm run db:setup
   ```

This will create all tables and populate them with realistic test data.

## Available Scripts

- `npm run db:migrate` - Run database migrations only
- `npm run db:seed` - Run database seed only (requires existing schema)
- `npm run db:setup` - Run both migration and seed (recommended)
- `npm run db:reset` - Alias for db:setup

## Database Configuration

Set your database connection via environment variable:

```bash
# Development (default)
DATABASE_URL=postgresql://localhost:5432/spec_driven_dev

# Production
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

## Database Schema

The complete schema includes 11 tables:

### Core Tables
- **users** - User accounts with roles and verification status
- **projects** - Project workspaces with visibility settings
- **specifications** - Individual specification documents
- **collaborations** - User permissions on projects

### Authentication Tables
- **sessions** - JWT refresh token management
- **password_reset_tokens** - Secure password reset flow
- **email_change_requests** - Email change verification

### Collaboration Tables
- **project_invitations** - Email-based project invitations
- **document_versions** - Version control for specifications
- **editing_sessions** - Real-time collaboration sessions
- **document_operations** - Operational transformation log

## Test Data

After running `npm run db:setup`, you'll have:

### Test Users
- **Alice** (Owner): `alice@example.com` / `password123`
- **Bob** (Admin): `bob@example.com` / `password123`
- **Carol** (Contributor): `carol@example.com` / `password123`
- **David** (Viewer): `david@example.com` / `password123`

### Sample Projects
- **E-commerce Platform** (Private) - Owner: Alice
- **Mobile Banking App** (Public) - Owner: Bob
- **Internal CRM System** (Private) - Owner: Alice

### Specifications
Each project contains realistic specifications with detailed content including:
- User authentication systems
- Shopping cart functionality
- Account balance displays
- Money transfer features
- Contact management

### Active Sessions
- Alice and Carol actively editing the authentication specification
- Pending invitations for new collaborators

## Files

- `migrations/001_complete_schema.sql` - Complete database schema
- `migrate.js` - Migration runner
- `seed.js` - Database seeding with test data
- `setup.js` - Combined migration and seed runner

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL is running
- Verify DATABASE_URL is correct
- Check user permissions

### Permission Errors
- Ensure database user has CREATE privileges
- For production, user needs appropriate schema permissions

### Seed Data Issues
- Run `npm run db:migrate` first if schema doesn't exist
- Clear existing data by re-running `npm run db:setup`
