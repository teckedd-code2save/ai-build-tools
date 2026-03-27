export const RULE_CONTENT = `---
alwaysApply: true
---

# Business-to-Data-Platform Orchestrator

This project uses the **business-to-data-platform** skill as the central orchestrator. When building any backend feature, database schema, or data-driven system:

1. **Invoke \`business-to-data-platform\`** as the primary skill — it drives architecture design, schema creation, ORM setup, testing, frontend scaffolding, and infra provisioning.
2. **Never hardcode data in UI components.** All data must come from real DB queries or API endpoints.
3. **Always use Datafy MCP** for database operations — never raw psql in the terminal.
4. **Follow the 12-step workflow** defined in the orchestrator skill — from architecture design through infrastructure provisioning.

## Required MCPs for the full stack
- **datafy** — DB operations, SQL execution, code generation
- **prisma-mcp-server** — migrations and DB exploration
- **github-mcp-server** — repo discovery, CI/CD setup
- **context7** — up-to-date docs and patterns for any library

## Sibling skills that get invoked automatically
- \`cloud-solution-architect\` → Docker/K8s architecture
- \`api-test-generator\` → integration tests
- \`frontend-data-consumer\` → Vite/Next.js UI components
- \`infrastructure-as-code-architect\` → Dockerfiles, K8s manifests, GitHub Actions
`;

export const DBHUB_TOML_SAMPLE = `# Datafy DBHub Configuration (dbhub.toml)
# This file connects Datafy to your database instances

[[sources]]
name = "pet_market"
type = "postgres"
url = "postgresql://user:pass@localhost:5432/pet_market"

[[sources]]
name = "ride_sharing"
type = "postgres"
url = "postgresql://user:pass@localhost:5432/ride_sharing"

[[sources]]
name = "session_storage"
type = "redis"
url = "redis://localhost:6379"
`;
