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
    - Prisma MCP (for migrations and DB exploration)
    - GitHub MCP (for repo discovery and CI/CD setup)
    - Context7 MCP (for up-to-date documentation and patterns)
---

# Business → Data Platform Skill

Turn any business description into a **production-grade data platform** — schema, migrations, ORM
code, API contracts, caching strategy, search layer, and scaffolded project — following industry
standards used at scale.

---

## Core Principles (Never Violate These)

1. **Never hardcode data in UIs.** All data displayed in any UI component must come from a real
   DB query or API endpoint. No static arrays, no mock objects inline in components.

2. **Always use real ORMs and live DB connections.** Repository code must use the stack-appropriate
   ORM with a real connection string. **Never write raw psql/pg/sqlite calls in the terminal or code.**
   Always use Datafy MCP tools if available.

3. **Follow FAANG-grade project structure.** Every scaffolded project must use the widely accepted
   directory layout for its stack. No flat file dumps.

4. **Use approved design patterns.** Repository pattern, Service layer, Dependency Injection,
   CQRS, Event-driven where appropriate.

5. **Migrations for every schema change.** Every change must be expressed as a versioned migration.
   Never mutate a live schema with raw DDL after initial provisioning.

6. **Proactively leverage other skills.** This skill is the "Orchestrator". When finishing the
   backend, you MUST trigger testing, frontend, and infra phases using `api-test-generator`,
   `frontend-data-consumer`, and `infrastructure-as-code-architect`.

7. **Proactively suggest Redis, Elasticsearch, and streaming solutions.** Identify where caching,
   search, or streaming would benefit the design and propose integration.

---

## Step-by-Step Workflow

### Step 0 — Architecture Design (cloud-solution-architect & github-mcp-server)

**MANDATORY:** Before any coding, invoke the `cloud-solution-architect` skill to design the platform.
1. **Repo Discovery:** Use `github-mcp-server` to search for existing repositories or identify where the new code should live.
2. Define the architecture style (Microservices for K8s, Web-Queue-Worker for simpler apps).
3. Select the technology stack focusing on **Docker** for containerization and **Kubernetes (K8s)** for orchestration.
4. Design the CI/CD pipeline leveraging **GitHub Actions**.
5. Document Architecture Decision Records (ADRs) for these choices.

---

### Step 1 — Clarify Before Building (context7-mcp)

Check for ambiguity: Stack, Scale, Existing schema, Auth model, Deployment target.
**Mandatory Question**: "What is your preferred technology stack (e.g., Next.js, FastAPI, Go)? Do you have a preferred Cloud provider and instance size for the K8s cluster?"

**Intelligence Layer:** Use `context7-mcp` to fetch the latest best practices and patterns for the chosen stack.
1. Call `resolve-library-id` for the main frameworks.
2. Call `query-docs` to ensure the proposed design follows up-to-date industry standards.

---

### Step 2 — Extract Entities

Identify core actors, resources, transactions, relationships, and state/events.
Flag candidates for Redis (hot reads), Elasticsearch (search), and Streaming (audit trails).

---

### Step 3 — Design the Schema

Generate 3NF PostgreSQL schema. UUID PKs, proper FK policies, NUMERIC for money, TIMESTAMPTZ.
Present for approval before executing.

---

### Step 4 — Provision Environment & Infrastructure (infrastructure-as-code-architect)

**MANDATORY:** Trigger `infrastructure-as-code-architect` to:
1. **Analyze Dependencies**: Check for Postgres, Redis, Elasticsearch, and other required services.
2. **Generate Dockerfiles**: Create production-ready `Dockerfile`s for all components.
3. **Provision Infrastructure**: 
   - Generate **Kubernetes (K8s) manifests/Helm charts** for the cluster.
   - (Optional) Generate **Terraform/Bicep** if deploying to managed cloud services.
4. **Setup CI/CD**: Generate **GitHub Actions deployment workflows**.
5. **Verify Connections**: Ensure that the infrastructure provides the necessary connection details for the application.

### Step 5 — Verify or Provision the Target Database (Datafy MCP)

1. **Check for existing connections**: Use `tool_search` or `list_mcp_tools` to find available `execute_admin_sql_<id>` tools.
2. **Provision Database**: If the target database doesn't exist, use an available `execute_admin_sql_<id>` tool to run `CREATE DATABASE <name>;`.
3. **Verify Success**: Confirm the database was created before proceeding.
4. **Update dbhub.toml**: If a new connection is required, modify `dbhub.toml` and prompt the user to restart their MCP server.

### Step 6 — Provision Tables & Logic (with Rollback)

Execute schema via Datafy in dependency order inside a `BEGIN; ... COMMIT;` block.

### Step 7 — Migrations (Not Raw DDL)

Generate versioned migrations for any change after initial setup.

### Step 8 — Seed Realistic Data

Use safe `DO $$ ... $$` blocks with declared UUID variables for FK chain safety.

### Step 9 — ORM Setup & Repository Code (prisma-mcp-server)

Generate repository code (Prisma, SQLAlchemy, JPA, EF Core).
**Prisma Integration:** If using Prisma, use `prisma-mcp-server` to validate the schema.

### Step 10 — Generate Integration Tests (api-test-generator)

**MANDATORY:** Invoke the `api-test-generator` skill to validate the scaffolded backend.

### Step 11 — Scaffold Frontend Features (frontend-data-consumer)

**MANDATORY:** Trigger `frontend-data-consumer` to build the UI with Tailwind and Shadcn/UI.

---

### Step 12 — Local Verification & Troubleshooting

1. **Test Locally**: Provide the command to start the dev server (`npm run dev`) and run tests.
2. **Troubleshooting Connectors**: If Datafy tools aren't showing up, use:
   `ps aux | grep dbhub.toml`
   to check the running process. Note the config path and version.
3. **Analytics Queries**: Provide 6–10 ready-to-run business impact queries.

---

## Internal Agent Prompt

Sequence:
1. **CALL `cloud-solution-architect` to design the Docker/K8s + GitHub Actions stack.**
2. Clarify ambiguities and cloud preferences.
3. Extract entities and relationships.
4. **CALL `infrastructure-as-code-architect` to provision the environment (Docker, K8s, GitHub Actions).**
5. Provision DB using `execute_admin_sql`; verify output carefully.
6. If modifying `dbhub.toml`, prompt user for MCP restart.
7. Provision tables via Datafy inside transactions.
8. Generate migrations for updates.
9. Seed realistic data using `DO $$` blocks.
10. Generate ORM-based repository code.
11. CALL `api-test-generator` to validate everything.
12. **CALL `frontend-data-consumer` to build the UI with Tailwind + Shadcn/UI.**
13. Generate analytics queries.

Hard rules:
- **NEVER use raw psql in the terminal.** Use Datafy MCP tools.
- **NEVER hardcode data in UI components.** Use real API hooks.
- **ALWAYS mandate Tailwind CSS and Shadcn/UI for frontend.**
- **ALWAYS provide Docker and Kubernetes configurations.**
- **ALWAYS include GitHub Actions CI/CD workflows.**
