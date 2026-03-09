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

## Adding Skills

If you have specific `SKILL.md` files or skill directories, ensure they are placed in the specific directories monitored by your AI assistants:
- **Claude**: Place skills in `~/.claude/skills` or provide them via project-level prompt files.
- **Cursor**: Embed skill logic inside `.cursorrules` or project-specific system prompts.
- **Gemini CLI**: Place skills in `~/.gemini/skills`.
- **Antigravity**: Place skills in `~/.gemini/antigravity/skills` or `.agent/workflows` in your workspace.
