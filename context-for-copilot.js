
// SPECIFICATION CONTEXT FOR GITHUB COPILOT
// Generated: 2025-07-15T23:36:49.090Z

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

--- COLLABORATION-MANAGEMENT ---
# Collaboration Management Feature

## Metadata

- **Type**: Feature
- **Priority**: Medium-High
- **Status**: Draft
- **Dependencies**: Authentication system, User Management, Project Creation, Database schema

## Objective

Enable project owners and admins to invite users to collaborate on projects and manage their permissions.

## Context

Projects need multiple users working together with different permission levels. This feature allows project owners to build teams, assign appropriate roles, and manage access to their projects. It's essential for the collaborative nature of specification development.

## Requirements

### Functional Requirements

- [ ] Invite users to projects by email address
- [ ] Send invitation emails with project details
- [ ] Accept/decline project invitations
- [ ] View project collaborators and their roles
- [ ] Change collaborator permissions (admin/owner only)
- [ ] Remove collaborators from projects (admin/owner only)
- [ ] Leave projects as a collaborator
- [ ] View pending invitations (sent and received)
- [ ] Cancel pending invitations

### Non-Functional Requirements

- [ ] Invitation emails include project context and sender information
- [ ] Invitations expire after 7 days
- [ ] Permission changes take effect immediately
- [ ] Audit log of collaboration changes
- [ ] Rate limiting on invitation sending

## Role Hierarchy & Permissions

### Permission Matrix

| Action | Viewer | Contributor | Admin | Owner |
|--------|--------|-------------|-------|-------|
| View specs | ✅ | ✅ | ✅ | ✅ |
| Edit specs | ❌ | ✅ | ✅ | ✅ |
| Invite users | ❌ | ❌ | ✅ | ✅ |
| Change permissions | ❌ | ❌ | ✅ | ✅ |
| Remove collaborators | ❌ | ❌ | ✅ | ✅ |
| Delete project | ❌ | ❌ | ❌ | ✅ |
| Transfer ownership | ❌ | ❌ | ❌ | ✅ |

### Role Definitions

- **viewer**: Read-only access to project specifications
- **contributor**: Can edit specifications and collaborate on content
- **admin**: Can manage users and project settings (except deletion)
- **owner**: Full control including project deletion and ownership transfer

## API Specification

```javascript
// Get project collaborators
GET /api/projects/:projectId/collaborators
Authorization: Bearer <access-token>

// Response
{
  "success": true,
  "data": {
    "collaborators": [
      {
        "userId": "user-uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "contributor",
        "joinedAt": "2025-01-15T10:30:00Z"
      }
    ],
    "pendingInvitations": [
      {
        "id": "invitation-uuid",
        "email": "invited@example.com",
        "role": "contributor",
        "invitedBy": "admin-user-uuid",
        "invitedAt": "2025-07-15T09:00:00Z",
        "expiresAt": "2025-07-22T09:00:00Z"
      }
    ]
  }
}

// Invite user to project
POST /api/projects/:projectId/invitations
Authorization: Bearer <access-token>
{
  "email": "newuser@example.com",
  "role": "contributor",
  "message": "Would you like to collaborate on this project?"
}

// Response
{
  "success": true,
  "data": {
    "invitationId": "invitation-uuid",
    "message": "Invitation sent successfully"
  }
}

// Get user's received invitations
GET /api/user/invitations
Authorization: Bearer <access-token>

// Response
{
  "success": true,
  "data": {
    "invitations": [
      {
        "id": "invitation-uuid",
        "project": {
          "id": "project-uuid",
          "name": "API Documentation",
          "description": "REST API specifications"
        },
        "role": "contributor",
        "invitedBy": {
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "invitedAt": "2025-07-15T09:00:00Z",
        "expiresAt": "2025-07-22T09:00:00Z",
        "message": "Would you like to collaborate on this project?"
      }
    ]
  }
}

// Accept invitation
PUT /api/invitations/:invitationId/accept
Authorization: Bearer <access-token>

// Response
{
  "success": true,
  "data": {
    "message": "You are now a collaborator on this project",
    "project": {
      "id": "project-uuid",
      "name": "API Documentation"
    }
  }
}

// Decline invitation
PUT /api/invitations/:invitationId/decline
Authorization: Bearer <access-token>

// Change collaborator role
PUT /api/projects/:projectId/collaborators/:userId
Authorization: Bearer <access-token>
{
  "role": "admin"
}

// Remove collaborator
DELETE /api/projects/:projectId/collaborators/:userId
Authorization: Bearer <access-token>

// Leave project
DELETE /api/projects/:projectId/leave
Authorization: Bearer <access-token>

// Cancel invitation
DELETE /api/projects/:projectId/invitations/:invitationId
Authorization: Bearer <access-token>
```

## User Stories

- As a project owner, I want to invite users by email so that I can build a collaborative team
- As a project admin, I want to manage user permissions so that I can control access levels
- As an invited user, I want to see project details before accepting so that I can make an informed decision
- As a collaborator, I want to leave projects I no longer want to work on
- As a project owner, I want to remove inactive collaborators so that I can maintain project security
- As a user, I want to see all my pending invitations so that I can manage my project participation
- As a project admin, I want to see who has access to the project so that I can audit permissions

## Acceptance Criteria

- Given a user is a project admin/owner, when they invite someone by email, then an invitation is sent
- Given a user receives an invitation, when they view it, then they see project details and sender information
- Given a user accepts an invitation, when the invitation is valid, then they become a project collaborator
- Given a user declines an invitation, when they decline, then the invitation is removed
- Given a project admin changes permissions, when the change is valid, then the collaborator's role is updated
- Given a project admin removes a collaborator, when they confirm, then the user loses project access
- Given a collaborator leaves a project, when they confirm, then they are removed from the project
- Given an invitation expires, when 7 days pass, then the invitation becomes invalid

## Implementation Notes

### Database Changes Needed

```sql
-- New table for project invitations
CREATE TABLE project_invitations (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('viewer', 'contributor', 'admin')) NOT NULL,
  message TEXT,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP NULL,
  declined_at TIMESTAMP NULL,
  accepted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Add indexes for performance
CREATE INDEX idx_invitations_email ON project_invitations(invited_email);
CREATE INDEX idx_invitations_project ON project_invitations(project_id);
CREATE INDEX idx_invitations_token ON project_invitations(token_hash);

-- Update collaborations table to include join timestamp
ALTER TABLE collaborations ADD COLUMN joined_at TIMESTAMP DEFAULT now();
```

### Business Rules

- **Invitation Limits**: Max 10 pending invitations per project
- **Role Restrictions**:
  - Only owner can assign 'owner' role (ownership transfer)
  - Only admin/owner can assign 'admin' role
  - Contributors can only be assigned 'viewer' or 'contributor'
- **Permission Changes**: Cannot demote yourself below your current level
- **Project Limits**: Max 50 collaborators per project

### Email Templates

```javascript
// Invitation email template
{
  "subject": "Invitation to collaborate on {{projectName}}",
  "template": `
    Hi there!
    
    {{inviterName}} ({{inviterEmail}}) has invited you to collaborate on the project "{{projectName}}" as a {{role}}.
    
    {{#if message}}
    Message from {{inviterName}}:
    "{{message}}"
    {{/if}}
    
    Project Description: {{projectDescription}}
    
    Click here to accept: {{acceptUrl}}
    Click here to decline: {{declineUrl}}
    
    This invitation will expire on {{expirationDate}}.
  `
}
```

### Security Considerations

- Validate email addresses before sending invitations
- Use secure random tokens for invitation links
- Rate limiting: 5 invitations per project per hour
- Verify user permissions before allowing role changes
- Log all collaboration changes for audit trail

## Test Cases

- [ ] Test case 1: Project owner can invite users by email
- [ ] Test case 2: Invitation emails are sent with correct project details
- [ ] Test case 3: Users can accept valid invitations
- [ ] Test case 4: Users can decline invitations
- [ ] Test case 5: Expired invitations cannot be accepted
- [ ] Test case 6: Project admins can change collaborator roles
- [ ] Test case 7: Project admins can remove collaborators
- [ ] Test case 8: Collaborators can leave projects
- [ ] Test case 9: Permission changes are enforced immediately
- [ ] Test case 10: Non-admins cannot manage collaborators
- [ ] Test case 11: Rate limiting prevents invitation spam
- [ ] Test case 12: Invitation tokens are secure and unique

## Out of Scope

- Bulk user invitations
- Team/group invitations
- Project templates with default collaborators
- Integration with external user directories (LDAP, Active Directory)
- Notification preferences for collaboration events
- Project access request system

## Related Files

- [Authentication](../technical/authentication.md)
- [User Management](./user-management.md)
- [Project Creation](./project-creation.md)
- [Database Schema](../product-overview/db-schema.md)
- [Collaborative Editing](./collaborative_editing.md)



--- COLLABORATIVE_EDITING ---
# Feature: Collaborative Spec Editing

## Objective

Enable multiple users to edit the same specification in real time, with role-based permissions and version tracking.

## Background

Currently, all specs are edited individually. This feature introduces shared access, which supports concurrent workflows among team members and lays the foundation for commenting and version control.

## Requirements

- Users with `contributor`, `admin`, or `owner` permissions can edit the specification content.
- Edits are auto-saved every 10 seconds or when the user pauses for 2 seconds.
- All edits should be logged with timestamp and user ID.
- Previous versions can be viewed and restored.
- Only one user can edit a given paragraph at a time to avoid conflicts.
- Users with `viewer` permission cannot make any changes but can see real-time updates.

## Roles & Permissions

| Role        | Can View | Can Edit | Can Restore Versions |
|-------------|----------|----------|-----------------------|
| viewer      | ✅        | ❌        | ❌                    |
| contributor | ✅        | ✅        | ❌                    |
| admin       | ✅        | ✅        | ✅                    |
| owner       | ✅        | ✅        | ✅                    |

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



--- USER-MANAGEMENT ---
# User Management Feature

## Metadata

- **Type**: Feature
- **Priority**: Medium-High
- **Status**: Draft
- **Dependencies**: Authentication system, User Registration, Database schema

## Objective

Enable users to manage their accounts, including profile updates, password changes, and account settings.

## Context

After users register and login, they need the ability to maintain their accounts. This includes updating personal information, changing passwords for security, and managing account preferences. This feature is essential for user retention and security compliance.

## Requirements

### Functional Requirements

- [ ] View current profile information
- [ ] Update profile information (name, email)
- [ ] Change password with current password verification
- [ ] Password reset via email (forgot password flow)
- [ ] View account activity/login history
- [ ] Account deactivation (soft delete)
- [ ] Email change verification process

### Non-Functional Requirements

- [ ] Password changes invalidate all existing sessions
- [ ] Email changes require verification to both old and new addresses
- [ ] Account activity logging for security audit
- [ ] Rate limiting on sensitive operations
- [ ] Data validation and sanitization

## API Specification

```javascript
// Get current user profile
GET /api/user/profile
Authorization: Bearer <access-token>

// Response
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "contributor",
    "created_at": "2025-01-15T10:30:00Z",
    "last_login": "2025-07-15T09:15:00Z"
  }
}

// Update profile information
PUT /api/user/profile
Authorization: Bearer <access-token>
{
  "name": "John Smith"
}

// Change password
PUT /api/user/password
Authorization: Bearer <access-token>
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}

// Success response
{
  "success": true,
  "data": {
    "message": "Password updated successfully. Please log in again."
  }
}

// Change email (step 1 - request change)
PUT /api/user/email
Authorization: Bearer <access-token>
{
  "newEmail": "newemail@example.com",
  "password": "currentPassword123"
}

// Response
{
  "success": true,
  "data": {
    "message": "Verification emails sent to both addresses. Please confirm the change."
  }
}

// Verify email change
GET /api/user/verify-email-change?token=verification-token

// Password reset request
POST /api/auth/password-reset
{
  "email": "user@example.com"
}

// Password reset confirmation
PUT /api/auth/password-reset
{
  "token": "reset-token",
  "newPassword": "newSecurePassword789"
}

// Get account activity
GET /api/user/activity
Authorization: Bearer <access-token>

// Response
{
  "success": true,
  "data": {
    "loginHistory": [
      {
        "timestamp": "2025-07-15T09:15:00Z",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "success": true
      }
    ],
    "passwordChanges": [
      {
        "timestamp": "2025-07-10T14:30:00Z",
        "ipAddress": "192.168.1.100"
      }
    ]
  }
}

// Deactivate account
DELETE /api/user/account
Authorization: Bearer <access-token>
{
  "password": "confirmPassword123",
  "reason": "No longer needed"
}
```

## User Stories

- As a user, I want to view my profile information so that I can see my current account details
- As a user, I want to update my name so that it reflects my current identity
- As a user, I want to change my email so that I can use a different email address
- As a user, I want to change my password so that I can maintain account security
- As a user, I want to reset my password when I forget it so that I can regain access
- As a user, I want to see my login history so that I can monitor account access
- As a user, I want to deactivate my account so that I can stop using the platform

## Acceptance Criteria

- Given a user is logged in, when they view their profile, then they see their current information
- Given a user updates their profile, when the changes are valid, then the information is updated
- Given a user changes their password, when they provide the correct current password, then the new password is set and all sessions are invalidated
- Given a user requests a password reset, when they provide a valid email, then they receive a reset link
- Given a user clicks a valid reset link, when they set a new password, then they can log in with the new password
- Given a user changes their email, when they verify both addresses, then the email is updated
- Given a user requests account deactivation, when they confirm with their password, then the account is deactivated

## Implementation Notes

### Database Changes Needed

```sql
-- Add to sessions table for activity tracking
ALTER TABLE sessions ADD COLUMN success BOOLEAN DEFAULT true;

-- New table for password reset tokens
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL
);

-- New table for email change verification
CREATE TABLE email_change_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  new_email TEXT NOT NULL,
  old_email_token_hash TEXT NOT NULL,
  new_email_token_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP NOT NULL,
  verified_old BOOLEAN DEFAULT false,
  verified_new BOOLEAN DEFAULT false
);

-- Add soft delete to users table
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN deletion_reason TEXT NULL;
```

### Security Considerations

- Password changes must invalidate all existing refresh tokens
- Email changes require verification from both old and new addresses
- Rate limiting: 3 password change attempts per hour
- Rate limiting: 5 password reset requests per email per hour
- Account activity logging for security monitoring
- Soft delete for account deactivation (preserve data integrity)

### Integration Points

- Authentication middleware for protected endpoints
- Email service for verification and reset emails
- Session management for token invalidation
- Error handling following established patterns

## Test Cases

- [ ] Test case 1: User can view their current profile information
- [ ] Test case 2: User can update name and changes are persisted
- [ ] Test case 3: Password change with correct current password succeeds
- [ ] Test case 4: Password change with incorrect current password fails
- [ ] Test case 5: Password change invalidates all existing sessions
- [ ] Test case 6: Email change sends verification emails to both addresses
- [ ] Test case 7: Email change requires verification from both addresses
- [ ] Test case 8: Password reset sends email with valid token
- [ ] Test case 9: Password reset with valid token updates password
- [ ] Test case 10: Password reset tokens expire after set time
- [ ] Test case 11: Account activity shows recent login history
- [ ] Test case 12: Account deactivation with correct password succeeds
- [ ] Test case 13: Rate limiting prevents abuse of sensitive operations

## Out of Scope

- Profile pictures/avatars
- Two-factor authentication (2FA)
- Account recovery via security questions
- Export personal data (GDPR compliance)
- Multiple email addresses per account
- Social media account linking

## Related Files

- [Authentication](../technical/authentication.md)
- [User Registration](./user-registration.md)
- [Database Schema](../product-overview/db-schema.md)
- [Error Handling](../technical/error-handling.md)



--- USER-REGISTRATION ---
# User Registration Feature

## Metadata

- **Type**: Feature
- **Priority**: High
- **Status**: Draft
- **Dependencies**: Database schema (users table), Authentication system

## Objective

Enable new users to create accounts with email verification and secure password storage.

## Context

Users need a way to register for the platform before they can create projects or collaborate on specifications. This is the entry point for all user interactions and must be secure, user-friendly, and integrated with the authentication system.

## Requirements

### Functional Requirements

- [ ] User can register with email, name, and password
- [ ] Email validation and uniqueness checking
- [ ] Password strength validation
- [ ] Email verification process
- [ ] Automatic role assignment (default: 'contributor')
- [ ] Integration with login flow
- [ ] Account activation workflow

### Non-Functional Requirements

- [ ] Password hashing using bcrypt (minimum 12 rounds)
- [ ] Email verification within 24 hours
- [ ] Registration form validation with real-time feedback
- [ ] GDPR compliance for data collection
- [ ] Rate limiting to prevent spam registrations

## API Specification

```javascript
// Registration request
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "SecurePassword123!"
}

// Success response
{
  "success": true,
  "data": {
    "message": "Registration successful. Please check your email to verify your account.",
    "userId": "uuid-here"
  }
}

// Error response
{
  "success": false,
  "error": "Email already exists"
}

// Email verification
GET /api/auth/verify-email?token=verification-token

// Verification success response
{
  "success": true,
  "data": {
    "message": "Email verified successfully. You can now log in.",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "contributor"
    }
  }
}
```

## User Stories

- As a new user, I want to register with my email and password so that I can access the platform
- As a new user, I want to receive email verification so that my account is secure
- As a new user, I want clear feedback if my password is too weak so that I can create a secure account
- As a new user, I want to be notified if my email is already registered so that I can try logging in instead
- As a platform owner, I want to verify email addresses so that I can ensure legitimate users

## Acceptance Criteria

- Given a new user visits the registration page, when they enter valid details, then they receive a verification email
- Given a user tries to register with an existing email, when they submit the form, then they see an error message
- Given a user enters a weak password, when they type it, then they see real-time validation feedback
- Given a user clicks the verification link, when the token is valid, then their account is activated
- Given a user tries to login before verification, when they attempt login, then they're prompted to verify their email first

## Implementation Notes

- Use bcrypt for password hashing with minimum 12 salt rounds
- Generate UUID for user ID (consistent with database schema)
- Email verification tokens should expire after 24 hours
- Default role assignment: 'contributor' (can be upgraded later)
- Integration points: Login flow, password reset, user management
- Store verification tokens in database with expiration timestamps

## Test Cases

- [ ] Test case 1: Successful registration with valid data creates user and sends verification email
- [ ] Test case 2: Registration with existing email returns appropriate error
- [ ] Test case 3: Registration with weak password shows validation errors
- [ ] Test case 4: Email verification with valid token activates account
- [ ] Test case 5: Email verification with expired token shows error
- [ ] Test case 6: Multiple registration attempts are rate-limited
- [ ] Test case 7: Unverified users cannot login

## Out of Scope

- Social media login integration (Google, GitHub, etc.)
- Phone number verification
- Custom password policies per organization
- Bulk user import functionality
- Account deletion during registration process

## Related Files

- [Login Flow](./login-flow.md)
- [Database Schema](../product-overview/db-schema.md)
- [API Routes](../product-overview/api-routes.md)



TESTS:

--- AUTH-TEST-CASES ---
# Test Cases: Authentication

1. Valid login credentials should allow access
2. Invalid credentials should show an error
3. Empty form fields should show validation warnings


*/
