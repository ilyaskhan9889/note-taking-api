# Technical Analysis

## Approach
- **Express + Sequelize**: Model-driven API with MySQL-backed persistence.
- **Versioning**: Each note update writes a new `note_versions` row, creating an immutable history.
- **Revert**: Restores a selected version by copying its title/content into the live note and recording a new version.
- **Optimistic locking**: `notes.version` enforces concurrency control; clients must provide the last known version.
- **Full-text search**: MySQL FULLTEXT index on `notes.title` and `notes.content` with `MATCH ... AGAINST` queries.
- **Caching**: Redis stores results for list and detail endpoints; cache invalidated on mutations.
- **Soft deletes**: Sequelize paranoid mode retains deleted notes for auditing.
- **Singleton pattern**: Redis client and Sequelize instance are singletons to prevent duplicate connections.

## Key Implementation Choices
- **Optimistic vs. pessimistic locking**: Optimistic locking keeps writes non-blocking and is simpler for stateless APIs.
- **Sequelize sync**: Automatic schema sync simplifies local setup but is not suitable for production migrations.
- **Cache scope**: Only high-traffic endpoints are cached to avoid complex invalidation and cache staleness.

## Trade-offs
- **Scalability**: Redis caching reduces read load, but invalidation is coarse (list/detail) and may not cover search caches.
- **Consistency**: Version checks prevent overwriting changes, but clients must handle `409` conflicts and refresh state.
- **Search**: MySQL full-text is fast and simple, but less powerful than dedicated search services (e.g., Elasticsearch).
- **Schema management**: `sequelize.sync()` trades production-grade migrations for rapid assessment setup.
- **Storage growth**: Version history increases storage usage; TTL policies or archiving could mitigate.

## Future Improvements
- Add refresh tokens and token rotation for long-lived sessions.
- Implement note sharing with permission scopes.
- Introduce file uploads (S3/local) for multimedia attachments.
- Add test suite (Jest + supertest) and migration tooling.
