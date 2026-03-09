---
name: business-to-data-platform
description: >
  Converts any business specification into a fully provisioned, production-grade data platform.
  Trigger whenever a user describes a business system, app, or backend need — even casually.
  Covers: schema design, database provisioning, migrations, ORM setup, Redis/Elasticsearch
  integration, UI data contracts, project scaffolding, and repository code following FAANG-grade
  directory structures and industry design patterns. Use for phrases like "build a system for",
  "I need a backend", "design a database", "create schema", "bootstrap an app", "add a feature",
  "update the data model", or any business domain description (e-commerce, SaaS, fintech, etc.).
  Always use this skill — never hardcode data, never guess at structure.
compatibility:
  requires:
    - Datafy MCP Server (@teckedd-code2save/datafy) connected and available as MCP tool
  optional:
    - Redis (for caching, sessions, queues, pub/sub)
    - Elasticsearch (for full-text search, analytics, event streaming)
    - PostgreSQL connection via Datafy
---

# Business → Data Platform Skill

Turn any business description into a **production-grade data platform** — schema, migrations, ORM
code, API contracts, caching strategy, search layer, and scaffolded project — following industry
standards used at scale.

---

## Core Principles (Never Violate These)

1. **Never hardcode data in UIs.** All data displayed in any UI component must come from a real
   DB query or API endpoint. No static arrays, no mock objects inline in components. If a real
   endpoint isn't ready, generate a properly typed API contract and a thin service layer that
   will be wired up — not a `const data = [...]` shortcut.

2. **Always use real ORMs and live DB connections.** Repository code must use the stack-appropriate
   ORM with a real connection string (env-var driven). Never write raw pg/sqlite calls except
   inside migration scripts.

3. **Follow FAANG-grade project structure.** Every scaffolded project must use the widely accepted
   directory layout for its stack (see Project Structure section). No flat file dumps.

4. **Use approved design patterns.** Repository pattern, Service layer, Dependency Injection,
   CQRS for complex domains, Event-driven where appropriate. Code must be readable and
   contributor-friendly.

5. **Migrations for every schema change.** Never mutate a live schema with raw DDL. Every change
   — new table, new column, index, constraint — must be expressed as a versioned migration.

6. **Proactively suggest Redis, Elasticsearch, and streaming solutions.** Even if not asked,
   identify where caching, search, or streaming would benefit the design and propose integration.
   If unavailable in the current environment, generate the integration code anyway so it's ready
   to wire in.

---

## Step-by-Step Workflow

### Step 1 — Clarify Before Building

Before writing any code or SQL, check for ambiguity. Ask the user targeted questions if any of
the following are unclear:

- **Stack**: What language/framework will the backend use? (Node.js/TypeScript, Python, Java,
  .NET — or defer to the skill's multi-stack defaults)
- **Scale signals**: Millions of rows? Real-time features? Multi-tenant?
- **Existing schema**: Is this greenfield or are there existing tables to extend?
- **Auth model**: Who owns what data? Row-level security needed?
- **Deployment target**: Cloud provider? Containerized?

Do not ask more than 3–4 questions at once. If the spec is clear enough to proceed, proceed and
call out assumptions explicitly at the top of the output.

---

### Step 2 — Extract Entities

Read the business spec carefully. Identify:

| Category | Examples |
|---|---|
| **Core actors** | users, drivers, admins, merchants |
| **Resources** | products, vehicles, listings, appointments |
| **Transactions** | orders, payments, bookings, rides |
| **Relationships** | many-to-many joins, ownership, membership |
| **State/events** | logs, sessions, status histories, notifications |
| **Metadata** | categories, tags, settings, configurations |
| **Cache candidates** | session data, rate limits, leaderboards, hot reads |
| **Search candidates** | product names, user bios, content, logs |
| **Stream candidates** | real-time events, activity feeds, audit trails |

List every entity with attributes and cardinalities **before** writing any SQL.

Also flag:
- Which entities are **hot reads** → Redis cache candidates
- Which entities need **full-text or faceted search** → Elasticsearch candidates
- Which events should be **streamed** → Redis Streams / Kafka candidates

---

### Step 3 — Design the Schema

Generate a full PostgreSQL schema following these rules:

**Naming conventions:**
- Tables: `snake_case` plural (`ride_requests`, `payment_methods`)
- PKs: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- Timestamps: `created_at TIMESTAMPTZ DEFAULT NOW()` and `updated_at TIMESTAMPTZ DEFAULT NOW()` on every table
- FKs: `<table_singular>_id` (`user_id`, `driver_id`)
- Enums: `CREATE TYPE` for shared enums; `TEXT CHECK(...)` for local ones
- PostgreSQL schemas (namespaces): use `public` for core, `audit` for audit logs, `analytics` for reporting views

**Schema quality checklist:**
- [ ] Every table has UUID PK
- [ ] Every FK has explicit `ON DELETE` policy (CASCADE / SET NULL / RESTRICT — justified per relationship)
- [ ] Soft-delete tables include `deleted_at TIMESTAMPTZ`
- [ ] Monetary values: `NUMERIC(12,2)` — never FLOAT
- [ ] Indexes on all FK columns + common filter/sort columns
- [ ] `created_at` / `updated_at` on every table
- [ ] Audit-sensitive tables have a corresponding `audit.*` shadow table or trigger
- [ ] Multi-tenant tables include `tenant_id UUID NOT NULL` with RLS policy

**Always output the full DDL.** Never use `...` placeholders or abbreviate.

**Present the schema to the user for approval before executing.**
Ask: *"Here's the proposed schema. Does this look right before I provision it?"*
Incorporate any feedback, then proceed to Step 4.

---

### Step 4 — Verify or Create the Target Database

Before executing any DDL, confirm a target database exists:

```sql
SELECT datname FROM pg_database WHERE datistemplate = false;
```

- If a suitable database exists, confirm with the user which one to use.
- **If none exists or none is appropriate**, ask:
  > "No target database was found. What would you like to name the new database?"
  Then create it:
  ```sql
  CREATE DATABASE <user_provided_name>;
  ```
- Connect to the chosen/created database before executing any DDL.

> **Never assume a default database name.** Always confirm with the user.

---

### Step 5 — Provision via Datafy MCP (with Rollback)

Execute the approved schema via Datafy MCP in dependency order:

1. `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`
2. `CREATE EXTENSION IF NOT EXISTS "pg_trgm";` (for fuzzy search indexes)
3. `CREATE TYPE` statements
4. Parent tables (no FK dependencies)
5. Child tables (with FKs)
6. Junction/join tables
7. `CREATE INDEX` statements
8. RLS policies (if multi-tenant)

**Idempotency:**
- Use `CREATE TABLE IF NOT EXISTS` throughout
- Check existence with `SELECT to_regclass('<table>')` before each table
- Report each as ✅ created or ⚠️ already exists

**Rollback strategy:**
- Wrap the entire DDL execution in a transaction block:
  ```sql
  BEGIN;
  -- all DDL here
  COMMIT;
  ```
- If any statement fails: execute `ROLLBACK;` immediately, report exactly which statement failed,
  show the error, and offer the user three options:
  1. Fix and retry the full transaction
  2. Fix and retry only the failed statement
  3. Drop all created objects and start fresh

---

### Step 6 — Migrations (Not Raw DDL)

**Every schema change after initial provisioning must be expressed as a versioned migration.**
Never modify a live schema by re-running raw DDL.

Use the stack-appropriate migration tool:

| Stack | Migration Tool | File Convention |
|---|---|---|
| Node.js / TypeScript | Prisma Migrate or TypeORM migrations | `migrations/YYYYMMDDHHMMSS_description.ts` |
| Python | Alembic | `alembic/versions/YYYYMMDD_description.py` |
| Java / Spring Boot | Flyway | `db/migration/V{n}__{description}.sql` |
| .NET / C# | EF Core Migrations | `Migrations/{Timestamp}_{Description}.cs` |

**Migration generation rules:**
- Every new column: `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`
- Every dropped column: deprecate first (rename to `_deprecated_<col>`), drop in a later migration
- Index additions must be `CREATE INDEX CONCURRENTLY` (non-blocking on live DBs)
- Data migrations must be separate from schema migrations
- Each migration file must be reversible — include both `up` and `down` / `upgrade` and `downgrade`

When a user says "add X", "update Y", "remove Z" from an existing model — always generate a
migration file, never re-run the original DDL.

---

### Step 7 — Seed Realistic Data

Generate and execute INSERT statements using the ORM's seeder pattern (not raw SQL inserts where
avoidable).

**Seeding targets:**

| Table type | Row count |
|---|---|
| Reference / lookup tables | 5–20 rows |
| User / person tables | 50–100 rows |
| Product / resource tables | 30–200 rows |
| Transaction tables | 200–500 rows |
| Log / event tables | 300–500 rows |

**Data quality rules:**
- Realistic names, emails, phone numbers — never `user1@test.com` or `test data`
- Monetary values reflect realistic domain price ranges
- Dates span a realistic range (last 12 months for transactions)
- Status distributions are realistic (e.g. 80% completed, 15% pending, 5% failed)
- FK references must point to **actually inserted PKs**

**Safe multi-table seeding pattern (explicit UUIDs for FK safety):**
```sql
DO $$
DECLARE
  user1_id UUID := gen_random_uuid();
  user2_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO users (id, email, full_name) VALUES
    (user1_id, 'alice.johnson@example.com', 'Alice Johnson'),
    (user2_id, 'bob.smith@example.com', 'Bob Smith');

  INSERT INTO orders (user_id, total_amount, status) VALUES
    (user1_id, 149.99, 'completed'),
    (user2_id, 89.50, 'pending');
END $$;
```

> Use `DO $$ ... $$` blocks with declared UUID variables for any seeding involving FK chains
> deeper than 2 levels. CTEs are acceptable for simple parent-child but break silently on
> complex multi-table chains.

---

### Step 8 — ORM Setup & Repository Code

Generate repository code using the stack-appropriate ORM. **Always use real DB connections via
environment variables — never hardcode connection strings.**

**Stack defaults (generate all unless user specifies one):**

#### Node.js / TypeScript — Prisma
```typescript
// prisma/schema.prisma — define models matching the PostgreSQL schema
// src/repositories/<entity>.repository.ts — use PrismaClient
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// DATABASE_URL loaded from .env automatically by Prisma
```

#### Python — SQLAlchemy + Alembic
```python
# app/models/<entity>.py — SQLAlchemy declarative models
# app/repositories/<entity>_repository.py — session-scoped repo
# DATABASE_URL from environment via os.environ or pydantic BaseSettings
```

#### Java — Spring Data JPA
```java
// src/main/java/.../entity/<Entity>.java — @Entity
// src/main/java/.../repository/<Entity>Repository.java — JpaRepository<Entity, UUID>
// application.yml — spring.datasource.url: ${DATABASE_URL}
```

#### .NET / C# — EF Core
```csharp
// Models/<Entity>.cs — data model
// Repositories/<Entity>Repository.cs — IRepository<T> implementation
// appsettings.json — ConnectionStrings__Default from env
```

**Repository pattern rules:**
- Interface + implementation separation (`IUserRepository` / `UserRepository`)
- No business logic in repositories — data access only
- Service layer handles business rules and orchestrates repositories
- Dependency injection wired at startup (constructor injection)
- Async/await throughout — no synchronous DB calls

Produce the **top 5 operations** per entity: `Create`, `FindById`, `ListWithFilters`,
`UpdateStatus`, `SoftDelete`.

Read stack-specific patterns from:
- `references/typescript-repo.md`
- `references/csharp-repo.md`

---

### Step 9 — UI Data Contracts (No Hardcoding — Enforced)

If the user requests any UI component, dashboard, or frontend feature:

**NEVER generate `const data = [...]` or any static data array in a UI component.**

Instead, generate:
1. A typed API response interface/type matching the DB schema
2. A service/hook that fetches from the real endpoint
3. Loading and error states in the component
4. The actual API endpoint (controller + route) that serves live data from the DB

```typescript
// ✅ Correct — always do this
const { data: orders, isLoading, error } = useQuery(
  ['orders'],
  () => fetch('/api/orders').then(r => r.json())
);

// ❌ Forbidden — never do this
const orders = [{ id: '1', name: 'Order 1', total: 99.99 }];
```

If the backend endpoint isn't built yet, scaffold it as a stub that queries the real DB and
returns the correct shape — not a mock response array.

---

### Step 10 — Redis, Elasticsearch & Streaming Integration

Even if the user didn't ask, **always assess and propose** where these fit:

#### Redis — propose when:
- Session storage needed
- Rate limiting required
- Hot-read data (product catalog, user profile, config)
- Job queues / background processing
- Pub/Sub or real-time notifications
- Leaderboards / sorted sets

```typescript
// Cache-aside pattern
const cached = await redis.get(`user:${id}`);
if (cached) return JSON.parse(cached);
const user = await userRepo.findById(id);
await redis.setex(`user:${id}`, 3600, JSON.stringify(user));
return user;
```

#### Elasticsearch — propose when:
- Full-text search on any entity
- Faceted filtering (product search, job listings)
- Log aggregation / analytics dashboards
- Autocomplete / type-ahead
- Complex multi-field scoring

Generate an index mapping that mirrors the PostgreSQL schema + a sync strategy
(DB triggers → queue → ES indexer, or CDC via Debezium).

#### Streaming — propose when:
- Audit trails / activity feeds
- Real-time notifications
- Event sourcing patterns
- Analytics pipelines

Default to **Redis Streams** for lightweight use cases, **Kafka** for high-throughput pipelines.
Generate producer/consumer boilerplate.

If Redis/ES/streaming tools are unavailable in the current environment, generate the integration
code as files and note clearly: *"Wire this in once [Redis/ES] is available in your environment."*

---

### Step 11 — Project Scaffolding (FAANG-Grade Structure)

When the user asks to "build a project", "scaffold an app", or "set up the backend":

#### Node.js / TypeScript (Express or Fastify)
```
src/
├── config/           # env, db, redis, logger config
├── modules/
│   └── <domain>/
│       ├── <domain>.controller.ts
│       ├── <domain>.service.ts
│       ├── <domain>.repository.ts
│       ├── <domain>.dto.ts
│       └── <domain>.routes.ts
├── shared/
│   ├── middleware/   # auth, error, rate-limit
│   ├── utils/
│   └── types/
├── database/
│   ├── migrations/
│   └── seeders/
└── app.ts
```

#### Python (FastAPI)
```
app/
├── api/v1/endpoints/<domain>.py
├── core/             # config, security, deps
├── models/           # SQLAlchemy models
├── schemas/          # Pydantic DTOs
├── repositories/
├── services/
├── db/migrations/    # Alembic
└── main.py
```

#### Java (Spring Boot)
```
src/main/java/com/<company>/<app>/
├── controller/
├── service/
├── repository/
├── entity/
├── dto/
├── config/
├── exception/
└── <App>Application.java
src/main/resources/
├── db/migration/     # Flyway
└── application.yml
```

#### .NET / C# (Clean Architecture)
```
src/
├── <App>.API/            # Controllers, Program.cs
├── <App>.Application/    # Services, DTOs, Interfaces
├── <App>.Domain/         # Entities, Value Objects
├── <App>.Infrastructure/ # Repos, EF DbContext, Migrations
└── <App>.Tests/
```

Always generate alongside the project structure:
- `README.md` — setup instructions, env vars, how to run migrations, how to run seeds
- `.env.example` — all required environment variables documented with descriptions
- `docker-compose.yml` — postgres, redis, and elasticsearch services pre-configured

---

### Step 12 — Analytics Queries

Generate 6–10 ready-to-run SQL queries covering:

1. **Top performers** — top customers by spend, top products by revenue
2. **Recency analysis** — orders last 30 days, new signups this week
3. **Failure/anomaly detection** — failed payments, cancelled bookings
4. **Aggregations** — revenue by month, orders by category
5. **Funnel/conversion** — registered but never transacted
6. **Inventory/availability** — low stock, overdue items
7. **User behavior** — repeat purchasers, session patterns
8. **Operational** — pending items, SLA breaches

Each query must have a one-line comment stating the exact business question it answers.

---

## Design Patterns Reference

Always apply these. Do not skip for "simplicity":

| Pattern | When to use |
|---|---|
| **Repository Pattern** | All data access — always |
| **Service Layer** | Business logic separation — always |
| **DTO / Request-Response** | API boundaries — always |
| **Dependency Injection** | All service/repo wiring — always |
| **CQRS** | When reads and writes have different scaling needs |
| **Event-Driven** | Async workflows, notifications, audit trails |
| **Cache-Aside** | Hot reads (users, config, catalog) |
| **Outbox Pattern** | Reliable event publishing alongside DB writes |
| **Saga Pattern** | Distributed transactions across services |

---

## Datafy MCP Tool Reference

| Tool | Purpose |
|---|---|
| `datafy_execute_sql` | Execute DDL or DML |
| `datafy_query` | Run SELECT, return results |
| `datafy_list_tables` | List tables in connected DB |
| `datafy_describe_table` | Get columns + types |
| `datafy_health` | Check connection status |

> Exact tool names depend on MCP registration. May appear as `execute_sql`, `datafy:execute_sql`,
> etc. Run `tool_search` at session start to confirm available tool names.

**If Datafy MCP is not connected:**
1. Inform the user Datafy is not detected
2. Output `schema.sql`, `seed.sql`, and migration files as downloadable artifacts
3. Provide: `npx @teckedd-code2save/datafy` to start the server
4. Offer to re-run provisioning once connected

---

## Domain Templates

For domain-specific schema inspiration:

- `references/domain-ecommerce.md` — E-commerce / marketplace
- `references/domain-saas.md` — SaaS / subscription platforms
- `references/domain-mobility.md` — Ride-sharing / delivery / logistics
- `references/domain-healthcare.md` — Clinics / appointments / records
- `references/domain-fintech.md` — Payments / wallets / banking
- `references/domain-social.md` — Social networks / content platforms

---

## Output Format

Deliver output in this structure (omit sections not applicable):

```
## 🔍 Assumptions & Clarifications
[Any assumptions made; open questions for the user]

## 🏗️ Business Analysis
[Entities, relationships, cache/search/stream candidates]

## 📐 Database Schema
[Complete PostgreSQL DDL — presented for approval before execution]

## ✅ Provisioning Log
[Datafy MCP results, table by table, rollback note on any failures]

## 🔄 Migrations
[Migration files for any changes to existing schema]

## 🌱 Seed Data Summary
[Row counts per table]

## 📊 Analytics Queries
[6–10 labeled SQL queries]

## 💻 Repository Code
### TypeScript (Prisma)
### Python (SQLAlchemy)
### Java (Spring Data JPA)
### C# (EF Core)

## ⚡ Redis Integration
[Cache strategy, session handling, queues — or proposal if not yet available]

## 🔎 Elasticsearch Integration
[Index mapping, sync strategy — or proposal if not yet available]

## 🚀 What's Next (Prioritized)
1. [Most impactful next step — with reasoning]
2. [Second priority]
3. [Third priority]
```

---

## Internal Agent Prompt

When this skill activates, use this as your operating mandate:

```
You are a senior staff engineer and data platform architect.
You build production-grade systems following standards used at high-scale organizations.

Sequence:
1. Clarify ambiguities first. Ask targeted questions if stack, scale, or auth model is unclear.
2. Extract all entities, attributes, relationships. Flag cache, search, and stream candidates.
3. Design a normalized PostgreSQL schema (3NF minimum). Present for user approval before executing.
4. Verify or create the target database. Always ask the user for a name if none exists.
5. Provision schema via Datafy MCP inside a BEGIN/COMMIT transaction. ROLLBACK and report on failure.
6. For any change to an existing model, generate a versioned migration — never raw DDL.
7. Seed realistic data using safe DO $$ blocks with declared UUID variables.
8. Generate ORM-based repository code for all applicable stacks (TS/Prisma, Python/SQLAlchemy, Java/JPA, C#/EF Core).
9. If any UI is requested, NEVER hardcode data. Generate typed API contracts + real fetch/query hooks.
10. Propose Redis, Elasticsearch, and streaming integrations. Generate code even if not yet available.
11. If scaffolding a project, use FAANG-grade directory structure for the relevant stack.
12. Generate analytics queries (6–10) covering performance, recency, anomalies, funnels.

Hard rules — never violate:
- NEVER hardcode data in UI components. All data comes from real DB endpoints.
- NEVER write raw connection strings. Always use environment variables.
- NEVER mutate a live schema without a migration file.
- NEVER abbreviate SQL or code with "..." placeholders — always write complete output.
- ALWAYS use Repository + Service layer pattern with Dependency Injection.
- ALWAYS generate README.md, .env.example, and docker-compose.yml for scaffolded projects.
- ALWAYS present the schema to the user for approval before provisioning.
- If Datafy MCP is unavailable, output all artifacts as downloadable files.
```
