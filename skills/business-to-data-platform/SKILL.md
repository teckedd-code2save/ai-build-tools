---
name: business-to-data-platform
description: >
  Converts any business specification into a fully provisioned, production-grade data platform and
  full-stack product implementation. Trigger whenever a user describes a business system, app,
  workflow, SaaS, marketplace, fintech, or backend/frontend need — even casually. Covers: schema
  design, database provisioning, migrations, ORM setup, Redis/Elasticsearch integration, API
  contracts, modern UI generation, test generation, Docker Compose, infrastructure repos, and
  repository code following strong production patterns. Use for phrases like "build a system for",
  "I need a backend", "design a database", "create schema", "bootstrap an app", "add a feature",
  "build the UI", or "update the data model". Always use this skill — never hardcode data, never
  guess at structure, and never ignore an explicitly requested stack.
compatibility:
  requires:
    - Datafy MCP Server (@teckedd-code2save/datafy) connected and available as MCP tool
  optional:
    - Redis (for caching, sessions, queues, pub/sub)
    - Elasticsearch (for full-text search, analytics, event streaming)
    - PostgreSQL connection via Datafy
    - Prisma MCP (for migrations and DB exploration)
    - GitHub MCP (for repo discovery and CI/CD setup)
    - Context7 MCP (for up-to-date documentation and patterns)
---

# Business → Data Platform Skill

Turn any business description into a production-grade data platform and complete product scaffold:
schema, migrations, repository code, APIs, tests, UI surfaces, Docker Compose, and infra-ready
artifacts.

## Core Principles

1. Respect the user's explicit stack. If the prompt specifies language, framework, ORM, cloud,
   database version, UI stack, or deployment target, use that stack. Do not silently default to
   TypeScript or any other stack when the user asked for something else.
2. Build all implied product surfaces, not just a dashboard. If the product needs customer,
   operator, admin, onboarding, auth, marketing, checkout, or support flows, implement them.
   Never stop at one dashboard unless the user explicitly asked for only that view.
3. Never hardcode UI data. All UI data must come from real queries, real APIs, or typed fixtures
   explicitly created for dev/test paths.
4. Use real ORMs and live database connections. Repository code must use the stack-appropriate ORM
   and real connection configuration. Prefer Datafy MCP tools for schema and DB operations.
5. Every schema change must be migration-driven. Never mutate a live schema with ad hoc raw DDL
   after initial provisioning.
6. Use strong project structure. Organize code by domain, layer, or app boundary appropriate to the
   chosen stack. No flat dumps.
7. Proactively orchestrate sibling skills. You must use `api-test-generator`,
   `frontend-data-consumer`, `frontend-design-review`, `cloud-solution-architect`, and
   `infrastructure-as-code-architect` when their phase applies.
8. Tailwind and Shadcn are implementation tools, not the design itself. The UI must have a clear
   product-appropriate visual direction, sound hierarchy, accessibility, and interaction quality.
9. Default infra choices only when the user did not specify them:
   - Terraform provider: `gcp`
   - Docker Compose Postgres image: `postgres:18-alpine`
   - Include Docker Compose in the infra repo as well as app-local setup when useful

## Clarification Rules

Before building, resolve or infer:

- preferred stack
- product surfaces and user roles
- auth model
- deployment target
- cloud provider
- monorepo vs single app

If the user already specified any of these, do not re-ask them unless there is a real conflict.
When the prompt is specific, proceed with that stack.

## Workflow

### Step 0 — Architecture and Repo Strategy

Use `cloud-solution-architect` first.

1. Use `github-mcp-server` to discover whether code should go into an existing repo or a new app
   plus infra repo layout.
2. Choose architecture style that matches the product and scale.
3. Default Terraform provider to GCP unless the user specified AWS, Azure, or another target.
4. Ensure there is an infra home for deployment assets. Put Docker Compose alongside app setup when
   helpful, and also include it in the infra repo or infra package for operational reuse.

### Step 1 — Honor the Requested Stack

If the user says Laravel, Go, .NET, FastAPI, Next.js, Nuxt, Django, Rails, Kotlin, etc., use it.
Do not translate the request into a TypeScript stack unless the user asked for TypeScript or left
the stack unspecified.

Use `context7-mcp` for the chosen frameworks and libraries so the generated setup follows current
official patterns.

### Step 2 — Model the Business

Extract:

- actors
- roles
- workflows
- transactions
- entities
- state transitions
- operational views

Explicitly enumerate the UI surfaces implied by the product. Example: a meal-kit service may
require customer storefront, subscription management, checkout, admin catalog, kitchen operations,
delivery coordination, and analytics.

### Step 3 — Design the Data Layer

Generate PostgreSQL schema in 3NF unless the stack demands otherwise. Use:

- UUID primary keys where appropriate
- explicit foreign key policies
- timestamp columns
- proper indexes
- money-safe decimal types

Present schema for approval before execution when the user is in a planning mode; otherwise proceed.

### Step 4 — Prisma 7 + PostgreSQL Playbook

When using Prisma 7 with PostgreSQL, follow this pattern.

1. Centralize env loading in one shared side-effect module that resolves the workspace-root `.env`
   by absolute path.
2. Reuse that env loader everywhere:
   - app runtime
   - `prisma.config.ts`
   - seed scripts
   - background workers
3. Centralize Prisma client options in one helper.
4. For Prisma 7 + PostgreSQL, default to:
   - `@prisma/adapter-pg`
   - `pg`
   - `new PrismaPg({ connectionString: env.DATABASE_URL })`
   - `new PrismaClient({ adapter })`
5. For money-like PostgreSQL columns, emit:

```prisma
amount Decimal @db.Decimal(10, 2)
```

Do not emit `@db.Numeric(...)` for this Prisma 7 setup.

6. Make `prisma.config.ts` cwd-independent by importing the shared env loader.
7. Reuse the same env/runtime path in `prisma/seed.ts`; do not duplicate dotenv path math.
8. In monorepos, assume `.env` lives at the workspace root unless the repo clearly establishes a
   different convention.
9. Verify these commands from the package directory, not only repo root:
   - `pnpm install`
   - `pnpm db:generate`
   - `pnpm db:migrate`
   - `pnpm db:seed`

Recommended layout:

```text
apps/api/
  prisma.config.ts
  prisma/
    schema.prisma
    seed.ts
  src/
    config/
      load-env.ts
      env.ts
    db/
      prisma-options.ts
      prisma.ts
```

Required dependencies for Prisma 7 + PostgreSQL:

```json
{
  "@prisma/adapter-pg": "^7.x",
  "@prisma/client": "^7.x",
  "pg": "^8.x",
  "prisma": "^7.x"
}
```

### Step 5 — Provision Environment and Infra

Use `infrastructure-as-code-architect`.

1. Generate production-ready Dockerfiles.
2. Generate Docker Compose for local development.
3. Default the Postgres service image to `postgres:18-alpine` unless the user asked for another
   version.
4. Put Docker Compose in the infra repo or infra package, not only the app directory.
5. Generate Terraform with GCP as the default provider unless the user specified another provider.
6. Generate CI/CD and deployment assets.

### Step 6 — Provision Database via Datafy

Use available `execute_admin_sql_<id>` and `execute_sql_<id>` tools.

1. Verify or create the target database.
2. Apply schema in dependency order.
3. Keep execution safe and repeatable.
4. If `dbhub.toml` changes are required, update it and clearly tell the user that MCP must be
   restarted.

### Step 7 — Repository Code and Services

Generate stack-appropriate repository code, services, routes, handlers, and DTO/contracts. Keep
code idiomatic for the requested stack.

### Step 8 — Frontend Generation Standards

Use both `frontend-data-consumer` and `frontend-design-review`.

Rules:

1. Build modern, near-best-in-class UI quality for the product category.
2. Choose one or two successful reference products in the same category and mimic their
   interaction model, density, layout rhythm, navigation style, and information hierarchy without
   copying branding.
3. Consult current design guidance before locking the UI direction. Good anchors include Apple HIG,
   Material 3, and mature product design systems. Prefer hierarchy, clarity, spacing, and sensible
   motion over novelty for its own sake.
4. Do not ship generic “Tailwind + shadcn demo dashboard” output.
5. Tailwind/shadcn may be used for implementation, but the UI must still feel intentional and
   product-specific.
6. Build all required UI surfaces, not just the dashboard.
7. Ensure accessibility basics: readable typography, keyboard support, contrast, state cues beyond
   color, and adequate target sizes.

### Step 9 — Tests and Verification

Use `api-test-generator` and verify the generated repo actually works.

At minimum validate:

- install
- schema generation
- migrations
- seeding
- app boot
- tests

If Prisma is involved, explicitly validate the Prisma commands from the package directory.

## Internal Orchestrator Prompt Rules

When acting as the orchestrator:

1. Use the `business-to-data-platform` skill immediately.
2. Respect the exact stack named in the user's goal.
3. Implement all major UI surfaces implied by the business, not only a dashboard.
4. Use current official docs and patterns for the selected stack.
5. Default Terraform to GCP if the user did not specify a cloud.
6. Default Docker Compose Postgres to `postgres:18-alpine` if the user did not specify a version.
7. Put Docker Compose into the infra repo/package as part of the deliverables.
8. If using Prisma 7 + PostgreSQL, follow the Prisma playbook above exactly.

Hard rules:

- Never hardcode business data in the UI.
- Never ignore an explicitly requested stack.
- Never emit only one UI view when the business clearly needs several.
- Never rely on cwd-sensitive env loading for Prisma monorepos.
- Never default to `@db.Numeric(...)` for Prisma 7 PostgreSQL money fields in this setup.
