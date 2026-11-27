export const RULE_CONTENT = `---
alwaysApply: true
---

# Forge Orchestrator

This project uses the **forge** skill as the central orchestrator. When building any backend feature, database schema, or data-driven system:

1. **Invoke \`forge\`** as the primary skill — it drives architecture design, schema creation, ORM setup, testing, frontend scaffolding, and infra provisioning.
2. **Never hardcode data in UI components.** All data must come from real DB queries or API endpoints.
3. Use the chosen stack’s versioned migrations and a real database. Datafy is optional; use it when connected, or the stack’s supported CLI/client in the authorized environment.
4. Follow Forge’s workflow. Start substantial builds with a concise system-design breakdown and show evidence-based stage updates: Design → Build & preview → Verify → Deliver → Live checks. Offer useful previews and decisions without making every stage an approval gate.
5. Check execution environment, dependency access and real database tooling early. Diagnose sandbox restrictions before changing the stack; use supported scoped execution or an authorized isolated container when needed. Never claim DB checks passed with mocks or a different database.

## Deployment target
When no target is chosen, read Forge’s references/deployment-choice.md and offer Vercel or GC based
on workload, existing resources and runtime fit. Both require the complete app: real backend/data,
migrations, required workers, secrets, routing and verified behavior. A frontend URL alone is not
full deployment. Respect the chosen target. For GroundControl, read the forge skill's references/groundcontrol.md.
Forge coordinates the full product workflow from a brief, existing code or a change request; the
agent workspace is a choice. Use GitHub for authorized source, issue, review, CI and artifact work
when selected. GC assists with resources, provisioning, deployment and runtime operations. Prepare
the requested resource/deployment plan using its actual capabilities, preserving the selected
provider and existing resources. Discover the actual MCP catalog: use deployment.create_options,
deployment.plan and deployment.create when available and explicitly authorized for the selected
host. Follow the creation, delivery and release operation chain. Older servers may require their
supported Projects UI; identify that boundary. Never claim provisioning or live acceptance from
generated files, and never invent a tool.

## Optional integrations — use what the selected stack needs
- **datafy** — optional DB operations, SQL execution, code generation
- **prisma-mcp-server** — migrations and DB exploration when Prisma is selected
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
