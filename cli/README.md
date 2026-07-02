# Forge CLI 🚀

> One-command setup for the Forge skill ecosystem across your favorite AI coding agents.

## What is Forge?

**Forge** is a powerful orchestrator skill ecosystem designed for AI coding agents. It transforms high-level business requirements into production-grade technical implementations, from database schema and backend code to frontend components and Infrastructure as Code (IaC).

The `forge` CLI tool automates the installation and configuration of this entire ecosystem, ensuring your agents have the right skills and tools (MCP servers) to build complex software.

## Key Capabilities

- **Multi-Agent Support**: Automatically detects and configures [Antigravity](https://github.com), [Claude Code](https://claude.ai), [VS Code (Copilot)](https://code.visualstudio.com), [Gemini CLI](https://github.com), and [Codex](https://openai.com).
- **Skill Installation**: Provisions the core `forge` orchestrator skill along with mandatory sibling skills:
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
npm install -g @teckedd-code2save/forge
```

### Full Ecosystem Setup

Run the setup command to interactively choose your agents and skills:

```bash
forge setup
```

Alternatively, use the auto-setup flag to install everything with detected defaults:

```bash
forge setup --yes
```

## Commands

### `setup`
Provision skills, configure MCP servers, and write agent rules.
- `--project`: Configure for the current directory only.
- `--claude`, `--gemini`, `--codex`, etc.: Force setup for a specific agent.

### `generate`
Autonomously generate an application using the Forge orchestrator.
- `--agent <agent>`: Which agent to spawn (`claude`, `gemini`, `codex`).
- `--deploy <target>`: Deploy the result (e.g., `vercel`).

### `check`
Verify that your AI agents are correctly configured with Forge skills and MCP servers.
- `--project`: Check project-level configuration.

Manage and explore the available Forge skills.
- `skills list`: Show all available skills and their descriptions.
- `skills info <name>`: View details and content of a specific skill.

## License

MIT
