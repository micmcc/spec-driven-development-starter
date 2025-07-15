# Quick Reference for GitHub Copilot

## Common Data Model Patterns

### User Model (from specs/product-overview/db-schema.md)
```javascript
// Correct User model structure:
{
  id: UUID           // NOT auto-increment,
  email: TEXT        // unique,
  password_hash: TEXT // NOT 'password',
  name: TEXT         // NOT 'username',
  created_at: TIMESTAMP,
  role: ENUM // 'viewer', 'contributor', 'admin', 'owner'
}
```

### Project Model
```javascript
{
  id: UUID           // NOT auto-increment,
  name: TEXT         // NOT 'username',
  description: TEXT,
  owner_id: UUID     // FK to owner,
  created_at: TIMESTAMP,
  visibility: ENUM // 'private', 'public'
}
```

### Specification Model
```javascript
{
  id: UUID           // NOT auto-increment,
  title: TEXT,
  description: TEXT,
  type: ENUM // 'feature', 'use_case', 'test_case', 'architecture', 'ux', 'other',
  created_by: UUID,
  project_id: UUID     // FK to project,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
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
5. **Specify response format**: "Return response following API patterns"
6. **Check project instructions**: See `.github/instructions/copilot-instructions.md` for detailed guidelines

## Common Field Patterns

- **IDs**: Always use UUID, never auto-increment
- **Timestamps**: Use TIMESTAMP with DEFAULT now()
- **Foreign Keys**: Reference parent table with `_id` suffix
- **Enums**: Always define allowed values explicitly

## Validation Rules

- Email fields must be unique
- Password fields stored as `password_hash`
- User names stored in `name` field (not `username`)
- All enum fields must have CHECK constraints

---
*Auto-generated from specifications. Run `node tools/update-quick-reference.js` to update.*
