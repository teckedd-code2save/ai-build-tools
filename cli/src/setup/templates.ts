export const RULE_CONTENT = `---
alwaysApply: true
---

# Forge Orchestrator

This project uses the **forge** skill as the central orchestrator. When building any backend feature, database schema, or data-driven system:

1. **Invoke \`forge\`** as the primary skill — it drives architecture design, schema creation, ORM setup, testing, frontend scaffolding, and infra provisioning.
2. **Never hardcode data in UI components.** All data must come from real DB queries or API endpoints.
3. **Always use Datafy MCP** for database operations — never raw psql in the terminal.
4. **Follow the workflow** defined in the orchestrator skill — from architecture design through infrastructure provisioning.

## Deployment target
Respect the chosen target. For GroundControl, read the forge skill's references/groundcontrol.md.
Forge coordinates the full product workflow from a brief, existing code or a change request; the
agent workspace is a choice. Use GitHub for authorized source, issue, review, CI and artifact work
when selected. GC assists with resources, provisioning, deployment and runtime operations. Prepare
the requested resource/deployment plan using its actual capabilities, preserving the selected
provider and existing resources. New deployment creation may require Projects → Add deployment. Never claim provisioning happened
because files were generated, and never invent an MCP creation tool.

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
- \`ship-to-vps\` → Deliver through GitHub/GHCR and GroundControl, or the explicitly selected direct VPS route
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
