## Database Design

### User collection (`users`)

- `_id` – string, same as lower‑cased email (simple id)
- `name` – optional string
- `email` – string, required, unique
- `passwordHash` – string, bcrypt hash
- `createdAt` – datetime

### Contact collection (`contacts`)

- `_id` – string UUID
- `userId` – string, required, references `users._id`
- `name` – string, required
- `phone` – string, required (basic length validation)
- `email` – string, required, must be valid email
- `notes` – optional string
- `tags` – optional array of strings
- `isFavorite` – boolean, default `false`
- `createdAt` – datetime
- `updatedAt` – datetime

Each contact belongs to a single user (`userId`), so each user only sees their own contacts.

---

## API Overview

Base URL (local): `http://localhost:8000`

All responses are JSON.  
Protected routes require header: `Authorization: Bearer <token>`.

---

### Auth APIs

#### POST `/api/auth/register`

Create a new user.

Request body:

```json
{
  "name": "Student Name (optional)",
  "email": "user@example.com",
  "password": "secret123"
}
```

Responses:

- `201/200` – user created
- `400` – email already exists or validation error

#### POST `/api/auth/login`

Login and get JWT token.

Request body:

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Success response:

```json
{
  "access_token": "<JWT_TOKEN>",
  "token_type": "bearer"
}
```

Errors: `401` invalid credentials.

#### GET `/api/auth/me`

Get current logged‑in user.

Requires: `Authorization: Bearer <token>`

Response:

```json
{
  "id": "user@example.com",
  "email": "user@example.com",
  "name": "Student Name",
  "createdAt": "2026-02-03T10:00:00Z"
}
```

Errors: `401` if token missing/invalid.

---

### Contact APIs (JWT protected)

All of these require `Authorization: Bearer <token>` and only return contacts for the logged‑in user.

#### POST `/api/contacts`

Add a contact.

Request body:

```json
{
  "name": "Alice",
  "phone": "9876543210",
  "email": "alice@example.com",
  "notes": "Optional notes",
  "tags": ["friends", "college"],
  "isFavorite": false
}
```

Responses:

- `200` – contact created (returns contact object)
- `400` – validation error

#### GET `/api/contacts`

List user contacts with optional filters.

Query params:

- `search` – optional, matches `name` / `phone` / `email` (case insensitive)
- `tag` – optional, filter contacts that contain this tag
- `favorite` – optional boolean (`true`/`false`)

Example:

`GET /api/contacts?search=ali&favorite=true&tag=friends`

Response: array of contacts.

```json
[
  {
    "id": "uuid",
    "userId": "user@example.com",
    "name": "Alice",
    "phone": "9876543210",
    "email": "alice@example.com",
    "notes": "Optional notes",
    "tags": ["friends", "college"],
    "isFavorite": true,
    "createdAt": "2026-02-03T10:00:00Z",
    "updatedAt": "2026-02-03T10:00:00Z"
  }
]
```

#### GET `/api/contacts/:id`

Get single contact (only if it belongs to current user).

Errors:

- `404` – not found or does not belong to user

#### PUT `/api/contacts/:id`

Update contact fields.

Request body (all fields optional; only provided ones are updated):

```json
{
  "name": "New name",
  "phone": "1234567890",
  "email": "new@example.com",
  "notes": "Updated notes",
  "tags": ["work"],
  "isFavorite": true
}
```

Responses:

- `200` – returns updated contact
- `404` – not found

#### DELETE `/api/contacts/:id`

Delete a contact.

Responses:

- `200` – `{ "status": "deleted" }`
- `404` – not found

#### PATCH `/api/contacts/:id/favorite`

Toggle `isFavorite` for the contact.

Responses:

- `200` – returns updated contact
- `404` – not found

---

### Error Handling Summary

- `400` – validation problems (missing fields, bad email, etc.)
- `401` – not logged in / bad token / wrong credentials
- `403` – (reserved for future, not used now)
- `404` – contact not found or not owned by user
- `500` – unexpected server error

Frontend shows:

- Inline messages on forms for invalid input
- Simple alerts/toasts when API calls fail

