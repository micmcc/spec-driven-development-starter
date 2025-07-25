# API Documentation - New Endpoints

This document describes the newly implemented API endpoints for project collaboration and specification management.

## Collaborator Management

### Add Collaborator
```http
POST /api/projects/:id/collaborators
```

Add a new collaborator to a project.

**Authentication:** Required (Admin/Owner)

**Request Body:**
```json
{
  "email": "user@example.com",
  "role": "contributor"
}
```

**Roles:** `viewer`, `contributor`, `admin`

**Response (201):**
```json
{
  "message": "Collaborator added successfully",
  "collaborator": {
    "id": "user-uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "contributor",
    "joined_at": "2023-12-01T10:00:00Z"
  }
}
```

### Remove Collaborator
```http
DELETE /api/projects/:id/collaborators/:collaboratorId
```

Remove a collaborator from a project (cannot remove project owner).

**Authentication:** Required (Admin/Owner)

**Response (200):**
```json
{
  "message": "Collaborator removed successfully"
}
```

### Update Collaborator Role
```http
PUT /api/projects/:id/collaborators/:collaboratorId
```

Change a collaborator's role (cannot change owner role).

**Authentication:** Required (Admin/Owner)

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response (200):**
```json
{
  "message": "Collaborator role updated successfully",
  "role": "admin"
}
```

## Enhanced Specification Management

### Create Specification
```http
POST /api/projects/:projectId/specs
```

Create a new specification manually.

**Authentication:** Required (Contributor+)

**Request Body:**
```json
{
  "title": "User Authentication Spec",
  "content": "# Authentication\n\nThis spec describes...",
  "file_path": "features/auth/authentication.md",
  "status": "draft"
}
```

**Response (201):**
```json
{
  "message": "Specification created successfully",
  "specification": {
    "id": "spec-uuid",
    "title": "User Authentication Spec",
    "content": "# Authentication\n\nThis spec describes...",
    "file_path": "features/auth/authentication.md",
    "status": "draft",
    "version": 1,
    "project_id": "project-uuid",
    "created_at": "2023-12-01T10:00:00Z",
    "updated_at": "2023-12-01T10:00:00Z"
  }
}
```

### Upload Specification File
```http
POST /api/projects/:projectId/specs/upload
```

Upload a specification file (supports .md, .txt, .json, .yaml, .yml).

**Authentication:** Required (Contributor+)

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file`: The specification file to upload
- `title`: (optional) Custom title, defaults to filename
- `folder`: (optional) Folder path for organization
- `file_path`: (optional) Custom file path, defaults to filename

**Example with curl:**
```bash
curl -X POST \
  http://localhost:3000/api/projects/project-uuid/specs/upload \
  -H "Authorization: Bearer your-jwt-token" \
  -F "file=@specification.md" \
  -F "title=My Specification" \
  -F "folder=features" \
  -F "file_path=my-spec.md"
```

**Response (201):**
```json
{
  "message": "Specification file uploaded successfully",
  "specification": {
    "id": "spec-uuid",
    "title": "My Specification",
    "content": "# Content from uploaded file...",
    "file_path": "features/my-spec.md",
    "status": "draft",
    "version": 1,
    "project_id": "project-uuid",
    "created_at": "2023-12-01T10:00:00Z",
    "updated_at": "2023-12-01T10:00:00Z"
  }
}
```

### Get Project Specifications
```http
GET /api/projects/:projectId/specs
```

Retrieve all specifications for a project with author information.

**Authentication:** Required (Any project member)

**Response (200):**
```json
{
  "specifications": [
    {
      "id": "spec-uuid",
      "title": "User Authentication Spec",
      "content": "# Authentication...",
      "file_path": "features/auth/authentication.md",
      "status": "approved",
      "version": 2,
      "created_at": "2023-12-01T10:00:00Z",
      "updated_at": "2023-12-01T12:00:00Z",
      "author": {
        "id": "user-uuid",
        "first_name": "John",
        "last_name": "Doe"
      }
    }
  ],
  "count": 1
}
```

### Get Specification by ID
```http
GET /api/specs/:id
```

Retrieve a specific specification with full details.

**Authentication:** Required (Project member)

**Response (200):**
```json
{
  "specification": {
    "id": "spec-uuid",
    "title": "User Authentication Spec",
    "content": "# Authentication\n\nDetailed content...",
    "file_path": "features/auth/authentication.md",
    "status": "approved",
    "version": 2,
    "project_id": "project-uuid",
    "created_at": "2023-12-01T10:00:00Z",
    "updated_at": "2023-12-01T12:00:00Z",
    "author": {
      "id": "user-uuid",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

### Update Specification
```http
PUT /api/specs/:id
```

Update an existing specification.

**Authentication:** Required (Contributor+)

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Authentication Spec",
  "content": "# Updated content...",
  "file_path": "features/auth/updated-auth.md",
  "status": "in_review"
}
```

**Response (200):**
```json
{
  "message": "Specification updated successfully",
  "specification": {
    "id": "spec-uuid",
    "title": "Updated Authentication Spec",
    "content": "# Updated content...",
    "file_path": "features/auth/updated-auth.md",
    "status": "in_review",
    "version": 2,
    "updated_at": "2023-12-01T14:00:00Z"
  }
}
```

### Delete Specification
```http
DELETE /api/specs/:id
```

Delete a specification. Authors can delete their own specs, admins/owners can delete any spec.

**Authentication:** Required (Author/Admin/Owner)

**Response (200):**
```json
{
  "message": "Specification deleted successfully"
}
```

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

**400 Bad Request:**
```json
{
  "error": "Validation error message",
  "code": "VALIDATION_ERROR"
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found",
  "code": "RESOURCE_NOT_FOUND"
}
```

**409 Conflict:**
```json
{
  "error": "Resource already exists",
  "code": "RESOURCE_EXISTS"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## Permission Matrix

| Role        | View Specs | Create Specs | Update Own Specs | Update Any Specs | Delete Own Specs | Delete Any Specs | Manage Collaborators |
|-------------|------------|--------------|------------------|------------------|------------------|------------------|---------------------|
| Viewer      | ✅         | ❌           | ❌               | ❌               | ❌               | ❌               | ❌                  |
| Contributor | ✅         | ✅           | ✅               | ❌               | ✅               | ❌               | ❌                  |
| Admin       | ✅         | ✅           | ✅               | ✅               | ✅               | ✅               | ✅                  |
| Owner       | ✅         | ✅           | ✅               | ✅               | ✅               | ✅               | ✅                  |

## File Upload Constraints

- **Maximum file size:** 10MB
- **Supported formats:** .md, .txt, .json, .yaml, .yml
- **Content types:** text/plain, text/markdown, application/json, text/yaml, application/yaml, text/x-yaml
- **Upload directory:** `/tmp/uploads/` (temporary, cleaned after processing)

## Folder Hierarchy

Specifications support folder organization through the `file_path` field:

- `README.md` - Root level
- `features/authentication.md` - Features folder
- `api/v1/endpoints.md` - Nested folder structure
- `tests/unit/auth.test.md` - Deep nesting supported

The folder structure is virtual and maintained through the `file_path` field in the database.