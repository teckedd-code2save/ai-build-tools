# Ideas — Forge

Ideas, experiments, and directions for the Forge CLI and skill ecosystem. Not a roadmap — a scratchpad.

---

## CLI & UX

1. **Interactive `forge init` wizard** — A guided TUI (Bun or Ink-based) that walks new users through detecting their agent, installing skills, and configuring MCP servers step by step. Replaces the current flag-based setup.

2. **`forge status` dashboard** — A single command showing the health of the entire ecosystem: installed skills, MCP server connectivity, active agent config, and pending updates. Color-coded output (green/yellow/red).

3. **`forge update` with diff preview** — Before updating a skill or config, show what changed (file diffs). Let the user approve or reject each change.

4. **Shell completions** — Add zsh/bash/fish completions for `forge install`, `forge list`, `forge verify`, and `forge doctor`.

5. **`forge doctor --fix`** — Auto-fix common issues: missing dependencies, stale config, misaligned skill copies. Could run as a pre-flight hook before any other command.

## Skill Ecosystem

6. **Skill marketplace** — A registry of community-contributed skills, searchable via `forge search`. Skills could be hosted on npm or GitHub and installed by name: `forge install prisma-postgres`.

7. **Skill version pinning** — Allow `forge install skill@1.2.3` to pin a specific version. Support `forge update skill` to bump within semver range.

8. **Skill dependencies** — Skills that depend on other skills (e.g., `ship-to-vps` depends on `docker-compose-basics`). `forge install` resolves and installs the dependency tree.

9. **Skill scaffolding template** — `forge new skill` that generates the directory structure, SKILL.md frontmatter, and a basic MCP tool definition.

## Integration & Agents

10. **Cursor + Windsurf support** — Detect and configure for Cursor and Windsurf in addition to Claude Code and Codex. Each has different MCP config paths.

11. **OpenAI Codex deep integration** — Generate `.clinerules` files and Codex-specific skill config. Detect Codex's project structure conventions.

12. **Multi-agent workspaces** — Configure a team of agents (Claude Code + Codex + an MCP server) that share skills but have different file write permissions.

13. **GitHub App integration** — A GitHub App that runs `forge doctor` on push, detects config drift, and opens issues or PRs to fix misalignments.

## Deployment & Infrastructure

14. **Multi-provider deploy** — Beyond VPS (ship-to-vps), add deploy targets for Railway, Fly.io, and AWS ECS. Auto-detect the target from the repo or flag.

15. **Preview environments** — Generate ephemeral preview deployments from PR branches. Teardown when the PR closes.

16. **Deployment rollback skills** — A skill that adds rollback commands and canary gate analysis, similar to Convoy's approach. Could share code or config formats.

17. **Secret management** — Integrate with 1Password CLI, Doppler, or a local `.env` vault to inject secrets during scaffolding instead of placeholder values.

## Testing & Reliability

18. **Integration test suite** — End-to-end tests that scaffold a dummy product, run `forge install`, verify all skills are in place, generate a deploy, and confirm the output works.

19. **Snapshot testing for generated code** — When `forge` generates a boilerplate backend, snapshot the output files. Regression test detects when the templates drift from expected output.

20. **CI for skills repo** — A workflow that runs on every skill PR: installs the skill in a fresh environment, runs its tests, and validates the SKILL.md frontmatter.

---
*Last updated: July 2026*
