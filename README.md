# AI Build Tools

A collection of AI build tools and skills that help you do things faster.

## Datafy MCP Server Setup

The `@teckedd-code2save/datafy` Model Context Protocol (MCP) server allows AI assistants to interact with your databases, extract schema information, execute SQL, and generate code.

To use the Datafy MCP server, you need to configure your AI assistant with the following MCP settings:

```json
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
```

*(Note: Replace `/path/to/your/dbhub.toml` with the absolute path to your `dbhub.toml` configuration file).*

The server requires a `dbhub.toml` configuration file to define your data sources. Here is an example:

```toml
[sources.pet_market]
type = "postgres"
url = "postgres://user:pass@localhost:5432/pet_market"
description = "Pet market database"

[sources.ride_sharing]
type = "postgres"
url = "postgres://user:pass@localhost:5432/ride_sharing"
description = "Ride sharing database"

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

### Adding to Claude Desktop

1. Open Claude Desktop Settings -> Developer
2. Click "Edit Config"
3. Add the `datafy` server configuration to the `mcpServers` object in your `claude_desktop_config.json`:

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
4. Restart Claude Desktop.

### Adding to Cursor

1. Open Cursor Settings -> Features -> MCP
2. Click "+ Add New MCP Server"
3. Name: `datafy`
4. Type: `command`
5. Command: `npx @teckedd-code2save/datafy@latest --config /path/to/your/dbhub.toml --transport stdio`
6. Click Save and reload the window (or restart Cursor).

### Adding to VS Code / Windsurf

1. Follow the respective editor's MCP integration guides to add a standard stdio-based MCP server.
2. Provide the exact same `npx` command and arguments as shown above.
3. Reload the editor window to ensure the new MCP server is detected.

### Adding to Gemini CLI / Antigravity

For command-line tools and agents that support `mcp_config.json` (like Antigravity or Gemini CLI extensions):
1. For **Gemini CLI**, open or create `~/.gemini/settings.json`.
2. For **Antigravity**, open or create `~/.gemini/antigravity/mcp_config.json`.
3. Add the `datafy` server configuration inside the `mcpServers` key:

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

## Including the `business-to-data-platform` Skill

The `business-to-data-platform` skill transforms any business description into a production-grade database, schema, repository code, and data seeded through Datafy.

If you want to use this skill, ensure the `business-to-data-platform/SKILL.md` file is placed in the specific directory monitored by your AI assistants:
- **Claude**: Place skills in `~/.claude/skills/`
- **Cursor**: Embed skill logic inside `.cursorrules` or project-specific system prompts.
- **Gemini CLI**: Place skills in `~/.gemini/skills/`
- **Antigravity**: Place skills in `~/.gemini/antigravity/skills/` or `.agent/workflows/` in your workspace.

## Full Dependency Stack (The Orchestrator Ecosystem)

The `business-to-data-platform` skill acts as an **Orchestrator**. To achieve the full production-grade workflow (automated design, testing, UI generation, and IaC provisioning), you should also include the following sibling skills and MCP servers:

### Mandatory Sibling Skills
- **cloud-solution-architect**: Designs the Docker/K8s + GitHub Actions stack.
- **api-test-generator**: Generates comprehensive integration tests for the scaffolded backend.
- **frontend-data-consumer**: Scaffolds Vite/Next.js components using Tailwind CSS and Shadcn/UI for the frontend.
- **infrastructure-as-code-architect**: Generates Dockerfiles, K8s manifests, and GitHub Actions workflows.

### Integrated MCP Servers
- **Datafy MCP** (`@teckedd-code2save/datafy`): Required for all database operations and code generation.
- **Context7 MCP**: (Optional) Fetches latest best practices and patterns for the chosen stack.
- **Prisma MCP**: (Optional) For migrations and database exploration if using Prisma.
- **GitHub MCP**: (Optional) For repository discovery and CI/CD setup.
