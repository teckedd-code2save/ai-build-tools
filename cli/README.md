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
npx @teckedd-code2save/forge init
```

`init` is an alias for `setup`, so global installs can also use `forge setup`.

Alternatively, use the auto-setup flag to install everything with detected defaults:

```bash
forge init --yes
```

## Commands

### `setup` / `init`
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
