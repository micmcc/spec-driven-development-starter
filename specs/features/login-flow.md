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
