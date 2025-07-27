---
id: FEAT-c2babc7
title: Data Model (Initial Draft)
type: feature
status: draft
domain: general
owner: unassigned
last_reviewed: '2025-07-27'
depends_on: []
implements: []
covers_tests: []
code_refs: []
---
# Data Model (Initial Draft)

## User

- `id`: UUID
- `email`: string
- `password_hash`: string
- `name`: string
- `created_at`: datetime
- `role`: TEXT CHECK (role IN ('viewer', 'contributor', 'admin', 'owner'))

## Specification

- `id`: UUID
- `title`: string
- `description`: text
- `type`: enum (feature, use_case, test_case, architecture, ux, other)
- `created_by`: UUID (FK to User)
- `created_at`: datetime
- `updated_at`: datetime
- `project_id`: UUID (FK to Project)

## Project

- `id`: UUID
- `name`: string
- `description`: text
- `owner_id`: UUID (FK to User)
- `created_at`: datetime
- `visibility`: enum (private, public)

## Collaboration

- `user_id`: UUID (FK to User)
- `project_id`: UUID (FK to Project)
- `permissions`: TEXT CHECK (permissions IN ('viewer', 'contributor', 'admin', 'owner'))

---

## Related Files

- [API Routes](./api-routes.md)
- [Database Schema](./db-schema.md)
