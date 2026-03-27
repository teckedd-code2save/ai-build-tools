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

5. Command: `npx @teckedd-code2save/datafy@latest --config /path/to/your/dbhub.toml --transport stdio`
6. Click Save and reload the window (or restart Cursor).

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

### Adding to Codex

1. **CLI**: Use `codex mcp` to add and manage servers.
2. **Config**: Update `~/.codex/config.toml` (global).
3. **TOML Configuration**:
```toml
[mcp_servers.datafy]
command = "npx"
args = ["@teckedd-code2save/datafy@latest", "--config", "/path/to/your/dbhub.toml", "--transport", "stdio"]
```

## Including the `business-to-data-platform` Skill

> **b2dp turns product requirements into backend delivery workflows.**

If you want to use this skill, ensure the `business-to-data-platform/SKILL.md` file is placed in the specific directory monitored by your AI assistants:
- **Claude**: Place skills in `~/.claude/skills/`
- **Gemini CLI**: Place skills in `~/.gemini/skills/`
- **Antigravity**: Place skills in `~/.gemini/antigravity/skills/` or `.agent/workflows/` in your workspace.
- **Codex**: Place skills in `~/.agents/skills/` (global) or `.agents/skills/` (project).

## Repository

GitHub: https://github.com/teckedd-code2save/ai-build-tools

## License

MIT
