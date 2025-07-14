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

### Architecture Guidelines

- File: `/specs/product-overview/architecture.md`
- Technologies: Node.js/Express, PostgreSQL, React/Next.js, JWT auth
- Use for: Technology stack decisions and infrastructure patterns

### Feature Implementation

- Directory: `/specs/features/`
- Pattern: Each feature has objective, requirements, UX flow, edge cases
- Use for: Implementation guidance and acceptance criteria

### Test Strategy

- Directory: `/specs/tests/`
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
├── middleware/      # Auth and validation
├── models/         # Data models and DB interactions
├── routes/         # API endpoints
└── login.js        # Entry point
```

When implementing features, maintain this structure and follow the patterns established in existing files.

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
role TEXT CHECK (role IN ('owner', 'contributor'))
```
