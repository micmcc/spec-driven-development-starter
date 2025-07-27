---
id: FEAT-871e5df
title: 'ADR-003: Database Schema Design'
type: feature
status: draft
domain: technical
owner: unassigned
last_reviewed: '2025-07-27'
depends_on: []
implements: []
covers_tests: []
code_refs: []
---
# ADR-003: Database Schema Design

## Status

Accepted

## Context

We need to design a database schema that supports:
- User management and authentication
- Project organization and permissions
- Specification document storage and versioning
- Real-time collaboration tracking
- Comment and annotation systems
- Future extensibility for additional features

The schema must balance normalization for data integrity with performance for real-time operations.

## Decision

We will use a relational PostgreSQL database with the following schema design:

### Core Entity Design

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    role user_role DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE TYPE user_role AS ENUM ('admin', 'user');
```

#### Projects Table
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}'
);
```

#### Project Members Table
```sql
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role member_role DEFAULT 'viewer',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

CREATE TYPE member_role AS ENUM ('owner', 'editor', 'viewer');
```

#### Specifications Table
```sql
CREATE TABLE specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    spec_type spec_type_enum DEFAULT 'feature',
    status spec_status DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE TYPE spec_type_enum AS ENUM ('feature', 'technical', 'test', 'architecture');
CREATE TYPE spec_status AS ENUM ('draft', 'review', 'approved', 'deprecated');
```

#### Document Operations Table (for real-time collaboration)
```sql
CREATE TABLE document_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specification_id UUID REFERENCES specifications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    operation_type operation_type_enum NOT NULL,
    position INTEGER NOT NULL,
    content TEXT,
    length INTEGER,
    version INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE operation_type_enum AS ENUM ('insert', 'delete', 'retain');
```

#### Comments Table
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specification_id UUID REFERENCES specifications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    position_start INTEGER,
    position_end INTEGER,
    parent_id UUID REFERENCES comments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_resolved BOOLEAN DEFAULT false
);
```

### Indexing Strategy

```sql
-- Performance indexes
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_specifications_project ON specifications(project_id);
CREATE INDEX idx_specifications_updated ON specifications(updated_at DESC);
CREATE INDEX idx_document_operations_spec_version ON document_operations(specification_id, version);
CREATE INDEX idx_comments_specification ON comments(specification_id);
CREATE INDEX idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;

-- Full-text search indexes
CREATE INDEX idx_specifications_content_fts ON specifications USING gin(to_tsvector('english', content));
CREATE INDEX idx_specifications_title_fts ON specifications USING gin(to_tsvector('english', title));
```

## Design Principles

### 1. UUID Primary Keys
- Global uniqueness across distributed systems
- No information leakage through sequential IDs
- Better for horizontal scaling

### 2. Audit Trail
- `created_at` and `updated_at` timestamps on all main entities
- Document operations table maintains complete change history
- Soft deletes where appropriate

### 3. JSONB for Flexibility
- `metadata` and `settings` fields for extensible configuration
- Allows adding new features without schema changes
- Maintains queryability with PostgreSQL's JSONB operators

### 4. Referential Integrity
- Foreign key constraints ensure data consistency
- CASCADE deletes for dependent data cleanup
- Appropriate NULL handling for optional references

### 5. Performance Optimization
- Strategic indexing for common query patterns
- Full-text search capabilities for content
- Compound indexes for multi-column queries

## Consequences

### Positive
- Strong data consistency through ACID properties
- Flexible schema allowing future extensions
- Efficient querying with proper indexing
- Full-text search capabilities built-in
- Complete audit trail for collaboration features

### Negative
- More complex than NoSQL for simple operations
- Requires careful migration planning for schema changes
- PostgreSQL-specific features limit database portability
- JSONB fields may require application-level validation

### Performance Considerations
- Document operations table will grow quickly with active collaboration
- May require partitioning or archiving strategies for large datasets
- Full-text indexes require maintenance and can be large

## Alternatives Considered

### Document-based Database (MongoDB)
- Pros: Flexible schema, easier for JSON documents
- Cons: Weaker consistency guarantees, complex transactions
- Decision: PostgreSQL chosen for ACID properties and consistency needs

### Event Sourcing Pattern
- Pros: Complete audit trail, easy to replay events
- Cons: Complexity in querying current state, eventual consistency
- Decision: Traditional relational model chosen for simplicity

### Separate Collaboration Database
- Pros: Could optimize specifically for real-time operations
- Cons: Added complexity, data synchronization challenges
- Decision: Single database chosen for consistency and simplicity

## Migration Strategy

### Initial Setup
1. Create all tables with proper constraints
2. Add indexes for performance
3. Insert seed data for development

### Future Migrations
- Use versioned migration scripts
- Test migrations on copy of production data
- Plan for zero-downtime migrations with proper strategies

### Backup and Recovery
- Regular automated backups
- Point-in-time recovery capability
- Test restoration procedures regularly

## Security Considerations

### Data Protection
- Password hashing using bcrypt with appropriate salt rounds
- Sensitive data in environment variables, not in database
- Audit logging for security events

### Access Control
- Row-level security for multi-tenant isolation
- Role-based permissions at application level
- Regular security audits and penetration testing

## Monitoring and Maintenance

### Performance Monitoring
- Query performance analysis
- Index usage statistics
- Connection pool monitoring

### Data Maintenance
- Regular VACUUM and ANALYZE operations
- Index rebuilding as needed
- Archive old document operations

## Future Considerations

### Potential Schema Evolution
- File attachments table for specification assets
- Template system for specification types
- Integration with external systems (Git, JIRA, etc.)
- Advanced workflow and approval processes

### Scaling Considerations
- Read replicas for query performance
- Partitioning strategies for large tables
- Horizontal sharding if needed

## Review Date

This schema design should be reviewed after 6 months of production use or when performance issues arise.

---

*Decision made on: July 25, 2024*
*Last updated: July 25, 2024*
*Status: Accepted*
