# Forge

**From product spec to live URL — scaffold a backend, ship it to your VPS.**

Forge is a CLI and agent-skill ecosystem for building, evolving and deploying full-stack products. Start from a brief, existing code or a change request. Forge coordinates the relevant skills and connected tools for implementation, testing, source collaboration and infrastructure operations.

Instead of manually wiring every skill, MCP server, and agent rule yourself, the `forge` CLI installs and configures the ecosystem your AI coding tools need. Setup prepares the skills and MCP configuration. Building, provisioning, and deployment use the selected target and its authorized tools; setup itself does not create running infrastructure.

It powers outputs across the full delivery chain:
- schema design & migrations
- repository and service code
- integration tests
- frontend data contracts
- GitHub Actions CI/CD workflows
- GHCR container builds & VPS auto-deploy
- Cloudflare DNS provisioning
- runbook helpers (`bin/logs`, `bin/rollback`)

## What Forge actually is

Forge is an **ecosystem bootstrapper**.

It helps you:
- detect supported AI agents/editors
- install the Forge orchestrator skill and its sibling skills
- configure MCP servers like Datafy
- verify that everything is wired correctly

Once installed, your configured AI agent can use that ecosystem to generate real backend artifacts — and deploy them — from a business or product specification.

## From spec to live URL in 10 minutes

Forge works in two phases that together form an end-to-end pipeline:

1. **Scaffold with `forge`** — Describe your business. Forge (via the `forge` skill) generates schema, services, migrations, tests, and frontend data contracts. Dockerfile and CI workflow are included.

2. **Ship with `ship-to-vps`** — The `ship-to-vps` skill turns your GitHub repo into a live deployment: pushes the Docker image to GHCR, runs the CI pipeline on push, configures Caddy + Cloudflare DNS, and provides runbook commands for logs and rollbacks.

The `forge init` command installs the guidance for both phases. Connection setup and live verification remain required. When GroundControl is selected, use the GC handoff instead of the direct ship-to-vps workflow.

## The 8 skills

| Skill | Description |
|---|---|
| **forge** | Converts business specs into a fully provisioned data platform and product implementation |
| **ship-to-vps** | Delivers apps through GitHub/GHCR and GroundControl, or an explicitly chosen direct VPS route |
| **api-test-generator** | Generates comprehensive API integration tests from existing backend repos and schemas |
| **cloud-solution-architect** | Cloud architecture design following Azure Architecture Center best practices |
| **context7-mcp** | Library, framework, and API reference lookup for setup questions and code generation |
| **frontend-data-consumer** | Scaffolds typed React/Vue data components from backend API contracts |
| **frontend-design-review** | Reviews and creates production-grade frontend interfaces with design system compliance |
| **infrastructure-as-code-architect** | Translates local infra config into Terraform/Pulumi IaC for AWS, Azure, or GCP |

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
npm install -g @teckedd-code2save/forge
```

### Run setup

```bash
npx @teckedd-code2save/forge init
```

If you installed it globally, the same setup is available as:

```bash
forge setup
```

Or accept detected defaults automatically:

```bash
forge init --yes
```

To scope configuration to the current repository:

```bash
forge init --project
```

### Verify configuration

```bash
forge check
```

### Explore installed skills

```bash
forge skills list
forge skills info forge
```

5. Command: `npx @teckedd-code2save/datafy@latest --config /path/to/your/dbhub.toml --transport stdio`
6. Click Save and reload the window (or restart Cursor).

### `forge skills`
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

### Adding to Codex

1. **CLI**: Use `codex mcp` to add and manage servers.
2. **Config**: Update `~/.codex/config.toml` (global).
3. **TOML Configuration**:
```toml
[mcp_servers.datafy]
command = "npx"
args = ["@teckedd-code2save/datafy@latest", "--config", "/path/to/your/dbhub.toml", "--transport", "stdio"]
```

## Including the `forge` Skill

> **Forge turns product requirements into backend delivery workflows.**

If you want to use this skill, ensure the `forge/SKILL.md` file is placed in the specific directory monitored by your AI assistants:
- **Claude**: Place skills in `~/.claude/skills/`
- **Gemini CLI**: Place skills in `~/.gemini/skills/`
- **Antigravity**: Place skills in `~/.gemini/antigravity/skills/` or `.agent/workflows/` in your workspace.
- **Codex**: Place skills in `~/.agents/skills/` (global) or `.agents/skills/` (project).

## Repository

GitHub: https://github.com/teckedd-code2save/ai-build-tools

## License

MIT


## Codex reliability and GroundControl

Local development changes (not yet published): setup copies complete skill packages, refuses
invalid existing configuration, and reports write failures with a nonzero exit status. Codex
instructions are merged into the active `AGENTS.md` / `AGENTS.override.md` without replacing
existing user guidance. Start a new Codex session after setup to load them.

Use Node 22.13+ on the 22.x line, or Node 23.5+; Node 24 LTS is recommended for development.

`forge check --project --agent codex` checks configuration only, and exits nonzero for missing,
invalid or placeholder entries. It does not prove authentication or a live MCP/database connection.
`forge generate "..." --agent codex` propagates agent failures, rejects empty output and retains
partial work on interruption. A successful agent exit is explicitly distinct from app readiness.
The existing `--deploy vercel` option is an explicit production deployment request; it is never
run after failed, empty or interrupted generation. GroundControl is not yet a CLI `--deploy` target.

When GroundControl is selected, the Forge skill prepares an app/database recipe for the existing
GC host and respects its actual tool capabilities. New deployment creation currently uses
**Projects → Add deployment**; fully automatic first provisioning remains planned. See the
GroundControl handoff in `skills/forge/references/groundcontrol.md` for the current workflow.


## Forge, GitHub and GroundControl

Forge coordinates the product workflow across new and existing projects. A brief, repository or
issue/change request can supply the starting context through a supported agent and its authorized
tools; Codex is one workspace choice. GitHub supports source, issues, review, CI and artifacts.
GroundControl assists with resources, provisioning, deployment and runtime operations when selected.
The first GC rehearsal is a test case, not a limit on Forge's agents, inputs, stacks or providers.
Native issue ingestion and automatic GC first-launch tools are not implied by this architecture.
