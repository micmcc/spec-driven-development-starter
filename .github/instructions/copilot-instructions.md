# GitHub Copilot Instructions for Spec Driven Development

## Project Context

This is a collaborative specification and test design workspace. All development should be driven by the specifications in the `/specs` directory.

## Development Workflow

1. Always reference `/specs/product-intent.md` for core values and purpose
2. Check `/specs/product-overview/` for architecture and technical decisions
3. Implement features based on `/specs/features/` specifications
4. Create tests following patterns in `/specs/tests/`

## Key Specifications to Reference

### Product Intent

- File: `/specs/product-intent.md`
- Purpose: Core values, target users, and product vision
- Use for: Understanding overall direction and constraints

### Architecture & Overview

- **API Routes**: `/specs/product-overview/api-routes.md` - API endpoint specifications
- **Architecture & Technologies**: `/specs/product-overview/architecture.md` - Technology stack and infrastructure patterns
- **Data Model (Initial Draft)**: `/specs/product-overview/data-model.md` - Entity definitions and relationships
- **Database Schema (PostgreSQL)**: `/specs/product-overview/db-schema.md` - PostgreSQL database schema
- **Core Use Cases**: `/specs/product-overview/use-cases.md` - User stories and scenarios
- **UX and Design Aesthetics**: `/specs/product-overview/ux.md` - User experience guidelines

### Feature Specifications

- Directory: `/specs/features/`
- Available features:
  - **Collaboration Management Feature**: `/specs/features/collaboration-management.md`
  - **Feature: Collaborative Spec Editing**: `/specs/features/collaborative_editing.md`
  - **Feature: Login Flow**: `/specs/features/login-flow.md`
  - **project-creation**: `/specs/features/project-creation.md`
  - **User Management Feature**: `/specs/features/user-management.md`
  - **User Registration Feature**: `/specs/features/user-registration.md`
- Pattern: Each feature has objective, requirements, UX flow, edge cases
- Use for: Implementation guidance and acceptance criteria

### Test Strategy

- Directory: `/specs/tests/`
- Available test specs:
  - **Test Cases: Authentication**: `/specs/tests/auth-test-cases.md`
- Use for: Test case patterns and validation approaches



## Code Generation Guidelines

- Follow the technology stack defined in architecture.md
- Implement features according to their specification requirements
- Include error handling for edge cases mentioned in feature specs
- Generate tests that cover the test cases outlined in specs
- Use the existing project structure in `/src/`

## Current Project Structure

```text
src/
├── controllers/     # Business logic
│   ├── authController.js
│   ├── projectController.js
│   └── specController.js
├── middleware/      # Auth and validation
│   └── authMiddleware.js
├── models/         # Data models and DB interactions
│   ├── db.js
│   ├── projectModel.js
│   └── specModel.js
├── routes/         # API endpoints
│   ├── auth.js
│   ├── projects.js
│   └── specs.js
└── login.js

```

When implementing features, maintain this structure and follow the patterns established in existing files.

## API Route Patterns

Current API endpoints:

### Auth Routes
- `POST /login`

### Projects Routes
- `POST /`
- `GET /`
- `GET /:id`
- `PUT /:id`
- `DELETE /:id`

### Specs Routes
- `POST /projects/:projectId/specs`
- `GET /projects/:projectId/specs`
- `GET /specs/:id`
- `PUT /specs/:id`
- `DELETE /specs/:id`



## Database Schema Reference

When working with data models, always reference:
- `/specs/product-overview/data-model.md` for entity definitions
- `/specs/product-overview/db-schema.md` for PostgreSQL schema

### Key Data Model Rules:
- All IDs should be UUIDs, not auto-incrementing integers
- User table uses `name` field (not `username`)
- User table uses `password_hash` field (not `password`)
- Role field is enum: ('owner', 'contributor')
- Visibility field is enum: ('private', 'public')
- Use PostgreSQL-specific types (UUID, TIMESTAMP, TEXT)

### Schema Patterns:
```sql
-- User table pattern from db-schema.md
id UUID PRIMARY KEY
email TEXT UNIQUE NOT NULL
password_hash TEXT NOT NULL
name TEXT NOT NULL
created_at TIMESTAMP DEFAULT now()
role TEXT CHECK (role IN ('viewer', 'contributor', 'admin', 'owner'))
```


---
*Auto-generated from specifications and project structure. Run `node tools/update-copilot-instructions.js` to update.*
