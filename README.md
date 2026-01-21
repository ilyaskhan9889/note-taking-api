# Note Taking API

A Note Taking API built with Express, MySQL (Sequelize), and Redis caching. Supports version history, optimistic concurrency control, full-text search, and soft deletes.

## Features

- User registration/login with JWT auth
- Notes with version history and revert support
- Optimistic locking on updates (version field)
- MySQL full-text search on title/content
- Soft delete notes (paranoid)
- Redis cache for list and detail endpoints
- Docker/Docker Compose setup

## Quick Start (Docker)

1. Copy environment file and update secrets:
   ```bash
   cp .env.example .env
   ```
2. Build and run:
   ```bash
   docker compose up --build
   ```
3. API available at `http://localhost:3000`.

## Local Development (without Docker)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Ensure MySQL and Redis are running and update `.env`.
3. Start the server:
   ```bash
   npm run dev
   ```

## Authentication

- Register: `POST /auth/register`
- Login: `POST /auth/login`
- Use the returned token in `Authorization: Bearer <token>`

## Notes API

- Create: `POST /notes`
- List: `GET /notes`
- Search: `GET /notes/search?q=keyword`
- Get by ID: `GET /notes/:id`
- Update: `PUT /notes/:id` (requires `version` field)
- Delete (soft): `DELETE /notes/:id`
- Versions: `GET /notes/:id/versions`
- Revert: `POST /notes/:id/versions/:versionId/revert`

### Update Example (Optimistic Locking)

```json
{
  "title": "Updated title",
  "content": "Updated content",
  "version": 2
}
```

If the version is stale, the API responds with `409` and the `currentVersion`.

## Caching

- `GET /notes` and `GET /notes/:id` responses are cached in Redis.
- Cache is invalidated on create, update, delete, and revert.

## Testing

No automated tests are included. Use Postman/curl to verify endpoints.

## Docs

- Technical analysis: `docs/TECHNICAL_ANALYSIS.md`
