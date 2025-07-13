# Data Model (Initial Draft)

## User
- `id`: UUID
- `email`: string
- `password_hash`: string
- `name`: string
- `created_at`: datetime
- `role`: enum (owner, contributor)

## Specification
- `id`: UUID
- `title`: string
- `description`: text
- `type`: enum (feature, use_case, test_case, architecture, ux, other)
- `created_by`: UUID (FK to User)
- `created_at`: datetime
- `updated_at`: datetime

## Project
- `id`: UUID
- `name`: string
- `description`: text
- `owner_id`: UUID (FK to User)
- `created_at`: datetime
- `spec_ids`: array of UUIDs (FKs to Specification)

## Collaboration
- `user_id`: UUID (FK to User)
- `project_id`: UUID (FK to Project)
- `permissions`: enum (read, write, admin)