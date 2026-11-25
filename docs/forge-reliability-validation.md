# Forge reliability pass — 2026-11-23

Base: `aaeb15652ed3a5f5017bb47844e5876e54a769e6`.
Local branch: `local/forge-first-run-20261123`. No push, PR, npm publication or deployment.

## Changes

- Install complete skill folders, including references, executable helpers and templates. Reinstall
  repairs resources omitted by older installers even when SKILL.md has not changed.
- Reject malformed JSON/TOML and unreadable configuration before setup writes. Preserve the original
  file and avoid printing parser excerpts that may contain secrets. Propagate setup write failures.
- Codex gets a managed block in its active AGENTS.md or nonempty AGENTS.override.md, preserving user
  instructions. Reinstall does not duplicate the block. Global config/guidance respects CODEX_HOME.
  This follows [Codex instruction discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
- Check can target one agent and fails for absent, invalid or placeholder MCP entries. It explicitly
  checks configuration only; credentials, tools and live database connections remain unverified.
- Await generation and deployment subprocesses; propagate errors and nonzero exits. Reject empty
  output, preserve partial work on Ctrl-C, and prevent deployment after failed or cancelled generation.
  An agent exiting zero is not presented as an independently verified application.
- Preserve an explicit GC target in skill guidance. Remove hardcoded Claude-only sibling paths and
  document GC's actual new-deployment boundary and the next provisioning implementation slice.
- Align the Node engine requirement with dependencies. The release workflow now uses npm ci and
  gates publication with skill sync, typecheck, lint, build and CLI tests. Versions were not bumped.

## Executed evidence

- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm test` (build + Vitest), Node 24.22.3: 24 tests pass in four files.
- `npm exec --yes --package=node@22 -- node node_modules/vitest/vitest.mjs run`,
  Node 22.23.5: the same 24 tests pass.
- `bash scripts/check-skills-sync.sh`: pass. rsync was unavailable, so the two changed skill assets
  were copied to the package mirror directly and the normal sync guard verified exact agreement.
- `git diff --check`: pass.
- Private `npm pack --ignore-scripts` output was extracted into a disposable consumer directory.
  Real bundled `setup --codex --project --yes` succeeded; reinstall preserved instruction bytes;
  GC guidance, design checklist, VPS contract and executable rollback helper matched source bytes.
  `check --project --agent codex` correctly exited 1 for the unfilled Datafy path.

The 14 new CLI tests exercise the real built entry point with a minimal environment and fake agent
and deployment executables. They prove config preservation, support-file repair, custom guidance
preservation, failed setup/check/generation/deployment exits, and the cancellation race where the
stopped agent exits zero. They do not call a real model, Docker, MCP or cloud deployment.

## Limits and exact next integration gate

These fixes are local source, not the currently published npm 1.2.5. The private test tarball retains
that package version solely for inspection; it must not be confused with or published over npm 1.2.5.
No claim is made that Edward's Mac has received these changes or that the Azure VM runs them.

No new database, provider account, VM change, firewall rule, GC release or recording was created.
Application tests, live DB migration and HTTPS acceptance still require the actual app and an
authorized target. The connected GC surface cannot create/enroll a new workload yet. The next
implementation slice is GC's reviewed, scoped, idempotent first-launch operation and Forge's
manifest handoff, as detailed in `groundcontrol-provisioning.md`. Until it exists, the truthful
first-launch step is GC Projects → Add deployment, followed by explicit deployment authorization.
