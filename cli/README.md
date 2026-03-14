# b2dp CLI 🚀

> One-command setup for the Business-to-Data-Platform (b2dp) skill ecosystem across your favorite AI coding agents.

## What is b2dp?

**b2dp** is a powerful "Orchestrator" skill ecosystem designed for AI coding agents. It transforms high-level business requirements into production-grade technical implementations—from database schema and backend code to frontend components and Infrastructure as Code (IaC).

The `b2dp` CLI tool automates the installation and configuration of this entire ecosystem, ensuring your agents have the right skills and tools (MCP servers) to build complex software.

## Key Capabilities

- **Multi-Agent Support**: Automatically detects and configures [Antigravity](https://github.com), [Claude Code](https://claude.ai), [Cursor](https://cursor.com), [VS Code (Copilot)](https://code.visualstudio.com), and [Gemini CLI](https://github.com).
- **Skill Installation**: Provisions the core `business-to-data-platform` orchestrator along with mandatory sibling skills:
    - `cloud-solution-architect`
    - `api-test-generator`
    - `frontend-data-consumer`
    - `infrastructure-as-code-architect`
- **MCP Server Configuration**: Sets up necessary Model Context Protocol (MCP) servers like **Datafy** (database operations), **Context7** (documentation tracking), and **GitHub** (repository management).
- **Global & Project Scoping**: Install the ecosystem globally for personal use or scope it to a specific project repository.
- **Health Checks**: Quickly verify your configuration and missing dependencies across all supported agents.

## Quick Start

### Installation

```bash
npm install -g @teckedd-code2save/b2dp
```

### Full Ecosystem Setup

Run the setup command to interactively choose your agents and skills:

```bash
b2dp setup
```

Alternatively, use the auto-setup flag to install everything with detected defaults:

```bash
b2dp setup --yes
```

## Commands

### `setup`
Provision skills, configure MCP servers, and write agent rules.
- `--project`: Configure for the current directory only.
- `--claude`, `--cursor`, etc.: Force setup for a specific agent.

### `check`
Verify that your AI agents are correctly configured with b2dp skills and MCP servers.
- `--project`: Check project-level configuration.

### `skills`
Manage and explore the available b2dp skills.
- `skills list`: Show all available skills and their descriptions.
- `skills info <name>`: View details and content of a specific skill.

## License

MIT
