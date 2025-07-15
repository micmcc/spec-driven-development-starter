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
