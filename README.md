# Forge

**Describe your product. Get the backend foundation.**

Forge is a CLI and agent-skill ecosystem for turning plain-English product requirements into production-minded backend workflows.

Instead of manually wiring every skill, MCP server, and agent rule yourself, the `forge` CLI installs and configures the ecosystem your AI coding tools need to help with:

- schema design
- migrations
- repository scaffolding
- integration tests
- frontend data contracts
- infrastructure scaffolding

It is not just a single prompt or a toy code generator. It is the setup layer for a broader backend-delivery workflow.

## What Forge actually is

Forge is an **ecosystem bootstrapper**.

It helps you:
- detect supported AI agents/editors
- install the core Forge orchestrator skill
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
npm install -g @teckedd-code2save/forge
```

### Run setup

```bash
forge setup
```

Or accept detected defaults automatically:

```bash
forge setup --yes
```

To scope configuration to the current repository:

```bash
forge setup --project
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
