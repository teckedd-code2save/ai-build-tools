# Forge

**From product spec to live URL — scaffold a backend, ship it to your VPS.**

Forge is a CLI and agent-skill ecosystem that turns plain-English product requirements into deployed, production-grade backends. Describe your business in a sentence, and Forge's pipeline handles everything from schema design to GitHub Actions auto-deploy on your VPS.

Instead of manually wiring every skill, MCP server, and agent rule yourself, the `forge` CLI installs and configures the ecosystem your AI coding tools need. The same setup that scaffolds your data platform also provisions CI/CD, GHCR image builds, and Cloudflare DNS — so "describe and deploy" is one continuous flow.

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

1. **Scaffold with `forge`** — Describe your business. Forge (via the `b2dp` skill) generates schema, services, migrations, tests, and frontend data contracts. Dockerfile and CI workflow are included.

2. **Ship with `ship-to-vps`** — The `ship-to-vps` skill turns your GitHub repo into a live deployment: pushes the Docker image to GHCR, runs the CI pipeline on push, configures Caddy + Cloudflare DNS, and provides runbook commands for logs and rollbacks.

The `forge init` command configures both phases in a single pass. You describe your product once; Forge and ship-to-vps handle the rest.

## The 8 skills

| Skill | Description |
|---|---|
| **forge** | Converts business specs into a fully provisioned data platform and product implementation |
| **ship-to-vps** | Ships any web app to a Hetzner-class VPS via GHCR, GitHub Actions, Caddy, and Cloudflare DNS |
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
