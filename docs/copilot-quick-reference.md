# Quick Reference for GitHub Copilot

## Common Data Model Patterns

### User Model (from specs/product-overview/db-schema.md)
```javascript
// Correct User model structure:
{
  id: UUID,           // NOT auto-increment
  email: TEXT,        // unique
  password_hash: TEXT, // NOT 'password'
  name: TEXT,         // NOT 'username'
  role: ENUM('owner', 'contributor'),
  created_at: TIMESTAMP
}
```

### Project Model
```javascript
{
  id: UUID,
  name: TEXT,
  description: TEXT,
  owner_id: UUID,     // FK to users
  visibility: ENUM('private', 'public'),
  created_at: TIMESTAMP
}
```

### API Response Patterns
```javascript
// Success response
{ success: true, data: {...} }

// Error response  
{ success: false, error: "message" }
```

## Copilot Prompting Tips

1. **Reference specific files**: "Following /specs/product-overview/db-schema.md"
2. **Be explicit about constraints**: "Use UUID not auto-increment"
3. **Mention enum values**: "Role must be 'owner' or 'contributor'"
4. **Ask for corrections**: "Does this match the data model specs?"
