-- Complete database schema for Spec Driven Development Platform
-- Migration: 001_complete_schema.sql

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
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
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
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    visibility TEXT CHECK (visibility IN ('private', 'public')) DEFAULT 'private',
    is_active BOOLEAN DEFAULT true
);

-- Specifications table
CREATE TABLE specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT DEFAULT '',
    type TEXT CHECK (type IN ('feature', 'use_case', 'test_case', 'architecture', 'ux', 'other')) DEFAULT 'feature',
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true
);

-- Collaborations table
CREATE TABLE collaborations (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    permissions TEXT CHECK (permissions IN ('viewer', 'contributor', 'admin', 'owner')) DEFAULT 'contributor',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (user_id, project_id)
);

-- Sessions table (for authentication)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    expires_at TIMESTAMP NOT NULL,
    last_used TIMESTAMP DEFAULT now(),
    user_agent TEXT,
    ip_address INET,
    is_active BOOLEAN DEFAULT true
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    is_used BOOLEAN DEFAULT false
);

-- Email change requests
CREATE TABLE email_change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    old_email TEXT NOT NULL,
    new_email TEXT NOT NULL,
    verification_token_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    expires_at TIMESTAMP NOT NULL,
    confirmed_at TIMESTAMP,
    is_confirmed BOOLEAN DEFAULT false
);

-- Project invitations
CREATE TABLE project_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    inviter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    permissions TEXT CHECK (permissions IN ('viewer', 'contributor', 'admin')) DEFAULT 'contributor',
    token_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    declined_at TIMESTAMP,
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending'
);

-- Document versions (for conflict resolution)
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spec_id UUID REFERENCES specifications(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    content TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT now(),
    operation_count INTEGER DEFAULT 0,
    UNIQUE(spec_id, version)
);

-- Editing sessions (for real-time collaboration)
CREATE TABLE editing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spec_id UUID REFERENCES specifications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    socket_id TEXT NOT NULL,
    cursor_position INTEGER DEFAULT 0,
    selection_start INTEGER,
    selection_end INTEGER,
    last_seen TIMESTAMP DEFAULT now(),
    created_at TIMESTAMP DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- Document operations (for operational transformation)
CREATE TABLE document_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spec_id UUID REFERENCES specifications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES editing_sessions(id) ON DELETE SET NULL,
    operation_type TEXT CHECK (operation_type IN ('insert', 'delete', 'retain')) NOT NULL,
    position INTEGER NOT NULL,
    content TEXT,
    length INTEGER,
    version INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    applied_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_visibility ON projects(visibility);
CREATE INDEX idx_specifications_project ON specifications(project_id);
CREATE INDEX idx_specifications_author ON specifications(created_by);
CREATE INDEX idx_collaborations_user ON collaborations(user_id);
CREATE INDEX idx_collaborations_project ON collaborations(project_id);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_active ON sessions(is_active);
CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_used ON password_reset_tokens(is_used);
CREATE INDEX idx_invitations_project ON project_invitations(project_id);
CREATE INDEX idx_invitations_email ON project_invitations(email);
CREATE INDEX idx_invitations_status ON project_invitations(status);
CREATE INDEX idx_document_versions_spec ON document_versions(spec_id);
CREATE INDEX idx_editing_sessions_spec ON editing_sessions(spec_id);
CREATE INDEX idx_editing_sessions_active ON editing_sessions(is_active);
CREATE INDEX idx_document_operations_spec ON document_operations(spec_id);
CREATE INDEX idx_document_operations_version ON document_operations(version);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_specifications_updated_at BEFORE UPDATE ON specifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collaborations_updated_at BEFORE UPDATE ON collaborations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
