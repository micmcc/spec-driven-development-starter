# Database Schema (PostgreSQL)

## Table: users

- id UUID PRIMARY KEY
- email TEXT UNIQUE NOT NULL
- password_hash TEXT NOT NULL
- name TEXT NOT NULL
- created_at TIMESTAMP DEFAULT now()
- role TEXT CHECK (role IN ('viewer', 'contributor', 'admin', 'owner'))

## Table: projects

- id UUID PRIMARY KEY
- name TEXT NOT NULL
- description TEXT
- owner_id UUID REFERENCES users(id)
- created_at TIMESTAMP DEFAULT now()
- visibility TEXT CHECK (visibility IN ('private', 'public'))

## Table: specifications

- id UUID PRIMARY KEY
- title TEXT NOT NULL
- description TEXT
- type TEXT CHECK (type IN ('feature', 'use_case', 'test_case', 'architecture', 'ux', 'other'))
- created_by UUID REFERENCES users(id)
- project_id UUID REFERENCES projects(id)
- created_at TIMESTAMP DEFAULT now()
- updated_at TIMESTAMP DEFAULT now()

## Table: collaborations

- user_id UUID REFERENCES users(id)
- project_id UUID REFERENCES projects(id)
- permissions TEXT CHECK (permissions IN ('viewer', 'contributor', 'admin', 'owner'))
- PRIMARY KEY (user_id, project_id)

## Table: sessions

- id UUID PRIMARY KEY
- user_id UUID REFERENCES users(id) ON DELETE CASCADE
- refresh_token_hash TEXT NOT NULL
- created_at TIMESTAMP DEFAULT now()
- expires_at TIMESTAMP NOT NULL
- last_used TIMESTAMP DEFAULT now()
- user_agent TEXT
- ip_address INET

## Table: document_versions

- id UUID PRIMARY KEY
- spec_id UUID REFERENCES specifications(id) ON DELETE CASCADE
- version INTEGER NOT NULL
- content TEXT NOT NULL
- content_hash TEXT NOT NULL
- created_by UUID REFERENCES users(id)
- created_at TIMESTAMP DEFAULT now()
- UNIQUE(spec_id, version)

## Table: editing_sessions

- id UUID PRIMARY KEY
- spec_id UUID REFERENCES specifications(id) ON DELETE CASCADE
- user_id UUID REFERENCES users(id) ON DELETE CASCADE
- socket_id TEXT NOT NULL
- cursor_position JSONB
- joined_at TIMESTAMP DEFAULT now()
- last_activity TIMESTAMP DEFAULT now()
- UNIQUE(spec_id, user_id)

## Table: document_operations

- id UUID PRIMARY KEY
- spec_id UUID REFERENCES specifications(id) ON DELETE CASCADE
- operation_id UUID NOT NULL
- user_id UUID REFERENCES users(id)
- version INTEGER NOT NULL
- operations JSONB NOT NULL
- applied_at TIMESTAMP DEFAULT now()
