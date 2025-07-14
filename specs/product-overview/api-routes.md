# API Routes

## Project Routes

- `POST /api/projects` – Create a new project
- `GET /api/projects` – Get all projects for the current user
- `GET /api/projects/:id` – Get details of a single project
- `PUT /api/projects/:id` – Update a project (name, description, visibility)
- `DELETE /api/projects/:id` – Delete a project

## Specification Routes (Scoped by Project)

- `POST /api/projects/:projectId/specs` – Create a new specification in a project
- `GET /api/projects/:projectId/specs` – List all specifications for a project
- `GET /api/specs/:id` – Get a single specification
- `PUT /api/specs/:id` – Update a specification
- `DELETE /api/specs/:id` – Delete a specification
