# Authentication Technical Specification

## Metadata

- **Type**: Technical
- **Priority**: High
- **Status**: Draft
- **Dependencies**: User Registration, Database schema (users table)

## Objective

Define the technical implementation of authentication, authorization, and session management for secure user access.

## Context

The platform requires robust authentication to protect user data and ensure proper access control. This specification covers JWT implementation, password security, session management, and middleware behavior for all authenticated endpoints.

## JWT Token Implementation

### Token Structure

```javascript
// JWT Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// JWT Payload
{
  "sub": "user-uuid",           // Subject (user ID)
  "email": "user@example.com",  // User email
  "role": "contributor",        // User role
  "name": "John Doe",          // User name
  "iat": 1642780800,           // Issued at (timestamp)
  "exp": 1642867200,           // Expires at (timestamp)
  "jti": "token-uuid"          // JWT ID (for revocation)
}
```

### Token Configuration

- **Algorithm**: HS256 (HMAC SHA-256)
- **Secret**: Environment variable `JWT_SECRET` (minimum 256 bits)
- **Access Token Expiry**: 15 minutes
- **Refresh Token Expiry**: 7 days
- **Issuer**: Application domain
- **Audience**: Application domain

## Session Management

### Token Types

```javascript
// Access Token (short-lived)
{
  "type": "access",
  "exp": "15 minutes from issue"
}

// Refresh Token (long-lived, stored in database)
{
  "type": "refresh", 
  "exp": "7 days from issue",
  "tokenId": "uuid"  // Stored in sessions table
}
```

### Session Storage

```sql
-- Additional table needed in db-schema.md
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP NOT NULL,
  last_used TIMESTAMP DEFAULT now(),
  user_agent TEXT,
  ip_address INET
);
```

## Password Security

### Password Requirements

- **Minimum Length**: 8 characters
- **Maximum Length**: 128 characters
- **Character Requirements**: At least one letter, one number
- **Forbidden Patterns**: Common passwords, sequential characters
- **Hashing Algorithm**: bcrypt with 12 salt rounds

### Password Validation Rules

```javascript
// Password strength validation
const passwordRules = {
  minLength: 8,
  maxLength: 128,
  requireLetter: true,
  requireNumber: true,
  forbiddenPatterns: [
    /^(.)\1+$/, // All same character
    /123456|password|qwerty/i, // Common patterns
  ]
};
```

## Authentication Middleware

### Protected Route Behavior

```javascript
// Middleware flow for protected routes
1. Extract JWT from Authorization header or cookies
2. Verify JWT signature and expiration
3. Check if user exists and is active
4. Check if session is valid (for refresh tokens)
5. Attach user object to request
6. Continue to route handler

// User object attached to request
req.user = {
  id: "user-uuid",
  email: "user@example.com", 
  role: "contributor",
  name: "John Doe"
};
```

### Authorization Levels

```javascript
// Role-based access control
const permissions = {
  viewer: ['read'],
  contributor: ['read', 'write'],
  admin: ['read', 'write', 'manage_users'],
  owner: ['read', 'write', 'manage_users', 'delete_project']
};
```

## API Endpoints

### Authentication Endpoints

```javascript
// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "contributor"
    }
  }
}

// Refresh token
POST /api/auth/refresh
{
  "refreshToken": "jwt-refresh-token"
}

// Logout
POST /api/auth/logout
Authorization: Bearer <access-token>

// Logout all sessions
POST /api/auth/logout-all
Authorization: Bearer <access-token>
```

## Security Measures

### Rate Limiting

- **Login attempts**: 5 per IP per 15 minutes
- **Registration**: 3 per IP per hour
- **Password reset**: 5 per email per hour
- **Token refresh**: 10 per session per minute

### Security Headers

```javascript
// Required security headers
{
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Content-Security-Policy": "default-src 'self'"
}
```

### Token Revocation

- **Logout**: Invalidate specific refresh token
- **Logout All**: Invalidate all user sessions
- **Password Change**: Invalidate all existing sessions
- **Account Deactivation**: Invalidate all sessions immediately

## Error Handling

### Authentication Errors

```javascript
// Invalid credentials
{
  "success": false,
  "error": "Invalid email or password",
  "code": "AUTH_INVALID_CREDENTIALS"
}

// Token expired
{
  "success": false, 
  "error": "Token has expired",
  "code": "AUTH_TOKEN_EXPIRED"
}

// Account not verified
{
  "success": false,
  "error": "Please verify your email before logging in",
  "code": "AUTH_EMAIL_NOT_VERIFIED"
}

// Rate limited
{
  "success": false,
  "error": "Too many login attempts. Please try again later",
  "code": "AUTH_RATE_LIMITED",
  "retryAfter": 900 // seconds
}
```

## Implementation Requirements

### Environment Variables

```bash
# Required environment variables
JWT_SECRET=your-super-secure-secret-key-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000  # 15 minutes in ms
RATE_LIMIT_MAX_ATTEMPTS=5
```

### Middleware Integration Points

- **All `/api/auth/*` routes**: Public (no authentication required)
- **All `/api/projects/*` routes**: Require authentication
- **All `/api/specs/*` routes**: Require authentication
- **Admin routes**: Require admin or owner role
- **Project management**: Require project ownership or admin role

## Test Requirements

- [ ] JWT token generation and validation
- [ ] Password hashing and verification
- [ ] Session management (create, refresh, revoke)
- [ ] Rate limiting enforcement
- [ ] Role-based authorization
- [ ] Token expiration handling
- [ ] Secure password reset flow
- [ ] Cross-session logout functionality

## Security Compliance

- **OWASP Authentication Guidelines**: Implement all recommended practices
- **GDPR Compliance**: Secure handling of personal data
- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **Audit Logging**: Log all authentication events for security monitoring

## Related Files

- [User Registration](../features/user-registration.md)
- [Login Flow](../features/login-flow.md)
- [Database Schema](../product-overview/db-schema.md)
- [API Routes](../product-overview/api-routes.md)
