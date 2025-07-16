# Test Cases: Authentication Middleware

## Token Authentication
1. Valid access token should authenticate user successfully
2. Invalid token should be rejected with 401 status
3. Expired token should be rejected with appropriate error message
4. Missing authorization header should be rejected
5. Malformed authorization header should be rejected
6. Wrong token type (refresh token) should be rejected
7. Token with invalid signature should be rejected

## Role-Based Authorization
1. Users with required role should be granted access
2. Users without required role should be denied access (403)
3. Multiple allowed roles should work correctly
4. Missing user context should return authentication required error
5. Role checking should work with array of allowed roles

## Optional Authentication
1. Requests with valid token should set user context
2. Requests without token should set user to null
3. Requests with invalid token should set user to null
4. Process should continue regardless of token validity

## User Verification
1. Existing users should pass verification
2. Non-existent users should be rejected
3. User role should be updated from database
4. Database errors should be handled gracefully