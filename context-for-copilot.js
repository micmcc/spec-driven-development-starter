
// SPECIFICATION CONTEXT FOR GITHUB COPILOT
// Generated: 2025-07-14T21:41:34.103Z

/*
PRODUCT INTENT:
# Product Intent

**Spec Driven** is a collaborative specification and test design workspace for modern product teams. It provides a structured environment for capturing product intent, use cases, test cases, and architectural requirements—designed to integrate seamlessly with AI-assisted development tools such as GitHub Copilot.

## Purpose

Spec Driven aims to bridge the gap between ideation and implementation. It empowers teams to move from loosely structured ideas to machine-readable specs that fuel AI tooling and automated delivery pipelines.

## Core Values

- **Clarity First** – Encourage specification formats that are clear to both humans and machines.
- **AI Native** – Designed from the ground up to support LLM-based code generation, testing, and refactoring.
- **Collaborative by Design** – Built for teams, including role-based access and shared project contexts.
- **Composable and Extensible** – Support evolving workflows and integration with development pipelines.

## Target Users

- Product Managers and Product Owners
- Software Engineers
- Quality Assurance and Test Engineers
- UX Designers and Architects


ARCHITECTURE:
# Architecture & Technologies

## Frontend

- Framework: React or Next.js
- State management: Redux Toolkit or Zustand
- Styling: Tailwind CSS or CSS Modules

## Backend

- Node.js with Express or Fastify
- Authentication: JWT or OAuth2
- Data Storage: PostgreSQL or Firebase

## Hosting/DevOps

- Cloud hosting (Vercel, Render, or AWS)
- CI/CD with GitHub Actions
- Infrastructure as code with Terraform (optional)

## LLM Integration (Future Phase)

- Use OpenAI or Anthropic APIs to:
  - Generate structured specification scaffolds based on user intent
  - Propose prompt templates for feature and test specs
  - Refactor or rephrase existing specifications
  - Suggest tests, architecture, or UI scaffolds from specs

## Document Collaboration

- Real-time collaborative editing using WebSocket or WebRTC channels
- Paragraph-level conflict resolution using OT (Operational Transform) or CRDT
- Version history stored in relational or document-based schema

## Prompt Services

- Prompt endpoint for initiating spec-based code or test generation
- Rate limiting and queueing for LLM-based operations
- Token metering or audit logging per user/session


FEATURES:

--- COLLABORATIVE_EDITING ---
# Feature: Collaborative Spec Editing

## Objective

Enable multiple users to edit the same specification in real time, with role-based permissions and version tracking.

## Background

Currently, all specs are edited individually. This feature introduces shared access, which supports concurrent workflows among team members and lays the foundation for commenting and version control.

## Requirements

- Users with `write` or `admin` permissions can edit the specification content.
- Edits are auto-saved every 10 seconds or when the user pauses for 2 seconds.
- All edits should be logged with timestamp and user ID.
- Previous versions can be viewed and restored.
- Only one user can edit a given paragraph at a time to avoid conflicts.
- Read-only users cannot make any changes but can see real-time updates.

## Roles & Permissions

| Role        | Can View | Can Edit | Can Restore Versions |
|-------------|----------|----------|-----------------------|
| Read        | ✅        | ❌        | ❌                    |
| Write       | ✅        | ✅        | ❌                    |
| Admin       | ✅        | ✅        | ✅                    |

## UX Flow

1. User opens a shared spec.
2. If they have edit access, they can place the cursor and begin typing.
3. A visual indicator shows who is editing each paragraph.
4. Users can click “Version History” to view or restore past versions.

## Edge Cases

- What happens if two users attempt to edit the same paragraph at once?
  - The second user sees a lock indicator and must wait or request control.
- What if a user loses connection mid-edit?
  - Draft changes are saved locally and synced when reconnected.

## Out of Scope (for MVP)

- Inline comments and discussion threads
- Offline collaborative editing



--- LOGIN-FLOW ---
# Feature: Login Flow

## Objective

Allow users to securely log in and access their personalized workspace of projects and specifications.

## Requirements

- Users can log in with email and password.
- Credentials are checked against stored user records (`User` entity).
- On success, the user is redirected to their project dashboard.
- On failure, an appropriate error message is shown.

## Authorization

- Logged-in users can only view and edit projects they are assigned to (`Collaboration` entry exists).
- Role-based access: contributors can view and edit specs; owners can manage users and settings.

## UX Flow

- Display login form with email and password fields.
- Validate form inputs client-side.
- Show spinner during authentication request.
- On success: redirect to project dashboard (`/projects`).
- On failure: display error toast or inline message.



--- PROJECT-CREATION ---
# Feature: Project Creation

## Objective

Enable users to create a new project workspace and initialize it with starter specification templates.

## Requirements

- User must be logged in to create a project.
- User can create a new project from the dashboard or project list view.
- Project must have:
  - Title (required)
  - Description (optional)
  - Visibility setting (default: private)
- After creation, the system:
  - Assigns the current user as project owner
  - Initializes an empty folder for the project
  - Optionally creates starter specs (e.g., feature.md, test.md, ux.md)
- Redirects user to the new project's workspace upon successful creation

## UX Flow

1. User clicks “New Project” from the dashboard.
2. A modal/form appears prompting for:
   - Project title
   - Description (optional)
   - Visibility (private/public toggle)
3. User clicks “Create Project”
4. System validates and submits form
5. On success:
   - Project is created and associated with user
   - Starter specs are scaffolded in `/specs/[project-name]/`
   - User is redirected to the project’s spec dashboard

## Edge Cases

- Duplicate project title: show an error or auto-increment (e.g., “My Project (2)”)
- User loses connection mid-creation: form draft should be recoverable from local storage
- Auth token expired: prompt user to log in again

## Out of Scope (for MVP)

- Team invitations during project creation
- Project templates from existing projects
- Public sharing and cloning



TESTS:

--- AUTH-TEST-CASES ---
# Test Cases: Authentication

1. Valid login credentials should allow access
2. Invalid credentials should show an error
3. Empty form fields should show validation warnings


*/
