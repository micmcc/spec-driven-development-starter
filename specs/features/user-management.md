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
