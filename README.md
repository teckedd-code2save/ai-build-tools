# b2dp

**Describe your product. Get the backend foundation.**

`b2dp` is a CLI and agent-skill ecosystem for turning plain-English product requirements into production-minded backend workflows.

Instead of manually wiring every skill, MCP server, and agent rule yourself, `b2dp` installs and configures the ecosystem your AI coding tools need to help with:

- schema design
- migrations
- repository scaffolding
- integration tests
- frontend data contracts
- infrastructure scaffolding

It is not just a single prompt or a toy code generator. It is the setup layer for a broader backend-delivery workflow.

## What b2dp actually is

`b2dp` is an **ecosystem bootstrapper**.

It helps you:
- detect supported AI agents/editors
- install the core business-to-data-platform orchestrator skill
- install sibling skills used for architecture, testing, frontend generation, and IaC
- configure MCP servers like Datafy
- verify that everything is wired correctly

Once installed, your configured AI agent can use that ecosystem to generate real backend artifacts from a business or product specification.

## What it helps generate

With the full ecosystem configured, your agents can work toward outputs like:

- business/domain modeling
- PostgreSQL schema proposals
- migrations
- repository and service code
- analytics queries
- integration tests
- frontend-facing data contracts
- Docker / Kubernetes / CI scaffolding

## Supported environments

The CLI is designed to work with supported agent/editor setups such as:

- Claude Code / Claude Desktop
- Cursor
- VS Code / Copilot-style workflows
- Gemini CLI
- Antigravity

## Quick start

### Install

```bash
npm install -g @teckedd-code2save/b2dp
```

### Run setup

```bash
b2dp setup
```

Or accept detected defaults automatically:

```bash
b2dp setup --yes
```

To scope configuration to the current repository:

```bash
b2dp setup --project
```

### Verify configuration

```bash
b2dp check
```

### Explore installed skills

```bash
b2dp skills list
b2dp skills info business-to-data-platform
```

## Core commands

### `b2dp setup`
Installs skills, configures MCP servers, and writes agent rules.

Useful flags:
- `--yes` — accept detected defaults
- `--project` — configure only the current repository
- agent-specific flags such as `--claude`, `--cursor`, etc.

### `b2dp check`
Checks whether your agents, skills, and MCP integrations are configured correctly.

### `b2dp skills`
Inspect available skills and view skill details.

## Datafy MCP setup

The ecosystem relies heavily on `@teckedd-code2save/datafy`, which gives AI assistants database-aware capabilities such as schema inspection, SQL execution, and code generation.

Example MCP config:

```json
{
  "mcpServers": {
    "datafy": {
      "command": "npx",
      "args": [
        "@teckedd-code2save/datafy@latest",
        "--config",
        "/path/to/your/dbhub.toml",
        "--transport",
        "stdio"
      ]
    }
  }
}
```

## Example `dbhub.toml`

```toml
[sources.pet_market]
type = "postgres"
url = "postgres://user:pass@localhost:5432/pet_market"
description = "Pet market database"

[sources.session_storage]
type = "redis"
url = "redis://localhost:6379"
description = "Redis for session storage"

[sources.logs_and_analytics]
type = "elasticsearch"
host = "localhost"
port = 9200
lazy = true
description = "Elasticsearch for logs and analytics"
```

## The skill ecosystem

The `business-to-data-platform` skill acts as the orchestrator, but the full workflow is broader than one skill.

### Core sibling skills
- `cloud-solution-architect`
- `api-test-generator`
- `frontend-data-consumer`
- `infrastructure-as-code-architect`

### MCP integrations
- `@teckedd-code2save/datafy` — required for database operations and code generation
- Context7 MCP — optional for current documentation/patterns
- Prisma MCP — optional for migrations and DB exploration
- GitHub MCP — optional for repository discovery and CI/CD setup

## Positioning

The shortest version:

> **b2dp turns product requirements into backend delivery workflows.**

Not by pretending one package does everything alone — but by installing and coordinating the skills and MCP tooling your AI agents need to do the work properly.

## Repository

GitHub: https://github.com/teckedd-code2save/ai-build-tools

## License

MIT
