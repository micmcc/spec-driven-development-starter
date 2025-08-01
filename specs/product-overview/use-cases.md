---
id: FEAT-8d7c52c
title: Core Use Cases
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
# Core Use Cases

## 1. Create and Manage Specifications

- Product team creates a new spec for a feature or use case
- Uses markdown structure and type tagging (e.g., feature, test_case)

## 2. AI-Assisted Spec Generation

- User types in spec objectives and requirements
- System suggests prompt templates or pre-populates sections using LLM

## 3. Collaborative Editing and Versioning

- Multiple users edit the same spec with real-time updates
- Admin can restore a previous version if needed

## 4. Project-Based Access Control

- Contributors are assigned roles per project
- Admins can control visibility and write access to specs

## 5. Prompt-to-Code Integration

- Developer selects a spec and triggers Copilot to generate corresponding code or test stubs

## 6. Create New Project with Starter Specs

- User creates a new project from the dashboard
- System prompts user to add initial specs (e.g., feature, test, UX)
- Default folder structure and template files are created
