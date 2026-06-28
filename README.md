# Continue

Cinematic game discovery platform. Discover, rate, collect games.

## Stack

| Layer    | Tech                                                      |
| -------- | --------------------------------------------------------- |
| Frontend | Next.js 15 App Router, TypeScript strict, Tailwind CSS v4 |
| Backend  | NestJS 10, Fastify, TypeScript strict                     |
| Database | PostgreSQL 16 + Prisma ORM                                |
| Cache    | Redis 7                                                   |
| Shared   | `@continue/types`, `@continue/validation` (Zod)           |
| Build    | Turborepo + pnpm workspaces                               |
| Infra    | Docker Compose, Nginx, Let's Encrypt, Cloudflare          |
| CI/CD    | GitHub Actions                                            |

## Project Structure

```
Continue/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── validation/   # Shared Zod schemas
│   └── ui/           # Shared UI components (Phase 2)
├── infra/
│   ├── nginx/        # Nginx config
│   └── docker/       # DB init scripts
├── docs/             # Architecture & dev guides
├── .github/workflows/ # CI/CD
├── docker-compose.yml      # Production
├── docker-compose.dev.yml  # Local development
└── turbo.json
```

## Local Development

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- Docker + Docker Compose

### Start

```bash
# 1. Install deps
pnpm install

# 2. Copy env
cp .env.example .env

# 3. Start infra (Postgres + Redis)
docker compose -f docker-compose.dev.yml up postgres redis -d

# 4. Run migrations
pnpm --filter @continue/api db:migrate

# 5. Start dev servers
pnpm dev
```

Frontend: http://localhost:3000
API: http://localhost:3001
Swagger: http://localhost:3001/api/docs

## Scripts

```bash
pnpm dev          # Start all apps in watch mode
pnpm build        # Build all apps
pnpm lint         # Lint all
pnpm type-check   # Type check all
pnpm test         # Run all tests
pnpm format       # Format with Prettier
```

## Docs

- [Architecture](./docs/architecture.md)
- [Development Guide](./docs/development.md)
