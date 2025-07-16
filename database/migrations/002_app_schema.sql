-- Custom schema for Spec Driven Development Platform
-- Using app_users to avoid conflict with Supabase auth.users

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS document_operations CASCADE;
DROP TABLE IF EXISTS editing_sessions CASCADE;
DROP TABLE IF EXISTS document_versions CASCADE;
DROP TABLE IF EXISTS project_invitations CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS email_change_requests CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS collaborations CASCADE;
DROP TABLE IF EXISTS specifications CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;

-- App Users table (separate from Supabase auth)
CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    role TEXT CHECK (role IN ('viewer', 'contributor', 'admin', 'owner')) DEFAULT 'contributor',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    is_public BOOLEAN DEFAULT false,
    status TEXT CHECK (status IN ('active', 'archived', 'draft')) DEFAULT 'draft'
);

-- Specifications table
CREATE TABLE specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    file_path TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES app_users(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    version INTEGER DEFAULT 1,
    status TEXT CHECK (status IN ('draft', 'in_review', 'approved', 'archived')) DEFAULT 'draft'
);

-- Collaborations table (project membership)
CREATE TABLE collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('viewer', 'contributor', 'admin', 'owner')) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE(project_id, user_id)
);

-- Sessions table (for tracking user sessions)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    user_agent TEXT,
    ip_address INET
);

-- Email change requests table
CREATE TABLE email_change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    new_email TEXT NOT NULL,
    verification_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    used_at TIMESTAMP
);

-- Project invitations table
CREATE TABLE project_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES app_users(id),
    email TEXT NOT NULL,
    role TEXT CHECK (role IN ('viewer', 'contributor', 'admin')) NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    accepted_by UUID REFERENCES app_users(id),
    created_at TIMESTAMP DEFAULT now()
);

-- Document versions table (for version control)
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specification_id UUID NOT NULL REFERENCES specifications(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    created_by UUID NOT NULL REFERENCES app_users(id),
    created_at TIMESTAMP DEFAULT now(),
    commit_message TEXT,
    UNIQUE(specification_id, version_number)
);

-- Editing sessions table (for real-time collaboration)
CREATE TABLE editing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specification_id UUID NOT NULL REFERENCES specifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT now(),
    last_activity TIMESTAMP DEFAULT now(),
    cursor_position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Document operations table (for operational transformation)
CREATE TABLE document_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specification_id UUID NOT NULL REFERENCES specifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app_users(id),
    operation_type TEXT NOT NULL CHECK (operation_type IN ('insert', 'delete', 'retain')),
    position INTEGER NOT NULL,
    content TEXT,
    length INTEGER,
    timestamp TIMESTAMP DEFAULT now(),
    operation_vector JSONB,
    parent_operation_id UUID REFERENCES document_operations(id)
);

-- Indexes for performance
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_specifications_project_id ON specifications(project_id);
CREATE INDEX idx_specifications_created_by ON specifications(created_by);
CREATE INDEX idx_specifications_status ON specifications(status);
CREATE INDEX idx_collaborations_project_id ON collaborations(project_id);
CREATE INDEX idx_collaborations_user_id ON collaborations(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_document_operations_spec_id ON document_operations(specification_id);
CREATE INDEX idx_document_operations_timestamp ON document_operations(timestamp);
CREATE INDEX idx_editing_sessions_spec_id ON editing_sessions(specification_id);
CREATE INDEX idx_editing_sessions_user_id ON editing_sessions(user_id);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_users_updated_at BEFORE UPDATE ON app_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_specifications_updated_at BEFORE UPDATE ON specifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collaborations_updated_at BEFORE UPDATE ON collaborations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
