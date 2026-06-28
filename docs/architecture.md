# Architecture

## Overview

Continue = modular monorepo. Frontend (Next.js) + Backend (NestJS) + shared packages.
No microservices. Single VPS initially. Scale via vertical first, horizontal later.

## Boundaries

```
┌─────────────────────────────────────────────────┐
│  Browser                                        │
│  Next.js App Router (SSR-first)                 │
│  Tailwind CSS + Framer Motion (selective)       │
└───────────────────┬─────────────────────────────┘
                    │ REST /api/v1
┌───────────────────▼─────────────────────────────┐
│  NestJS API (Fastify)                           │
│  Feature modules: auth|users|games|reviews|...  │
│  Prisma ORM → PostgreSQL                        │
│  Bull queues → Redis                            │
└─────────────────────────────────────────────────┘
```

## Key Decisions

| Decision    | Choice                 | Reason                            |
| ----------- | ---------------------- | --------------------------------- |
| Rendering   | SSR-first              | SEO for discovery pages           |
| API style   | REST + versioning      | Predictable, cacheable            |
| Pagination  | Cursor-based           | Consistent UX for infinite scroll |
| Auth        | JWT (access + refresh) | Stateless, VPS-friendly           |
| Search (v1) | Postgres pg_trgm       | Zero infra dependency             |
| Search (v2) | Meilisearch            | When scale demands                |
| ORM         | Prisma                 | Type safety, migration tooling    |
| Adapter     | Fastify                | 2-3x throughput vs Express        |

## Module Boundaries

```
apps/api/src/modules/
├── auth/     — JWT issue/refresh/revoke
├── users/    — profiles, settings
├── games/    — game CRUD, search
├── reviews/  — review CRUD, moderation
├── ratings/  — score management, aggregation
├── search/   — abstraction layer (pg_trgm → Meilisearch)
├── lists/    — collections, visibility
└── admin/    — moderation, tag approval
```

Each module = controller + service + repository pattern. No cross-module direct imports — use service injections.

## Data Rules

- Ratings separate from reviews (user can rate without reviewing)
- One primary review per user per game (editable)
- Soft delete: User, Game, Review
- Tags: hybrid moderated (community-created, admin-approved)
- avg_rating on Game = denormalized, updated by rating service on change

## SEO Architecture

- `/games`, `/games/[id]/[slug]`, `/profile/[username]` → full SSR
- Dynamic OG metadata per game page
- Sitemap generated server-side
- Structured data (JSON-LD) for game pages
