# Database Schema (PostgreSQL)

## Table: users

- id UUID PRIMARY KEY
- email TEXT UNIQUE NOT NULL
- password_hash TEXT NOT NULL
- name TEXT NOT NULL
- created_at TIMESTAMP DEFAULT now()
- role TEXT CHECK (role IN ('owner', 'contributor'))

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
- permissions TEXT CHECK (permissions IN ('read', 'write', 'admin'))
- PRIMARY KEY (user_id, project_id)
