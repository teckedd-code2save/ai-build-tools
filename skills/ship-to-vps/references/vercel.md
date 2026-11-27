# Vercel: complete application delivery

Use when Vercel is selected or the workload-based recommendation is accepted. Preserve the existing
stack/project and discover the connected tool catalog first. Prefer supported Vercel tools; if a
required operation is unavailable, use the official CLI in an authorized environment. Check CLI
help/version before applying version-sensitive options. Do not invent MCP tool names or treat a
configured connection as authenticated. Use the supported login flow; never request tokens in chat.
[Vercel MCP documentation](https://vercel.com/docs/agent-resources/vercel-mcp).

## 1. Confirm runtime fit and ownership

Identify the correct Vercel account/team/project, GitHub repository, production branch, root directory,
framework, build/install commands and runtime regions. Inspect existing project settings before
changing them. Check current runtime and plan limits rather than hard-coding old quotas.
Vercel is not merely a static-site target. Evaluate the platform's current Functions, services,
workers and storage against this app; do not force everything into a request function.
[Functions limits](https://vercel.com/docs/functions/limitations),
[background worker choices](https://vercel.com/docs/background-workers).

For continuous workers, current Daemons documentation describes container-based long-running
processes. Check beta/plan/CLI requirements and preview/persistence constraints before selecting
them. A worker that is unavailable in preview must be exercised separately in an authorized
environment; don't label a web-only preview as whole-system acceptance.
[Daemons](https://vercel.com/docs/daemons).
If the workload requires a GC-style persistent Compose stack and the managed alternative does not
fit, explain the mismatch and recommend GC. Do not silently switch the user's chosen platform.

## 2. Provision every required dependency

Use existing appropriate resources where authorized. For a database, connect a supported managed
provider through the Vercel integration or authorized provider tools. Marketplace storage can
provision relational/key-value services and inject credentials into project environment variables;
verify the actual resource, region, ownership and credentials configuration. Never assume a DB was
created because a DATABASE_URL key or ORM schema exists. Do not provision a paid service without
cost authorization. [Storage and Marketplace](https://vercel.com/docs/storage).

Apply committed migrations against the intended database with the stack's supported command and
verify schema readiness. Separate preview and production data. Use safe test data; do not execute
production-destructive seeds. Configure appropriate connection pooling/TLS for the selected DB
and runtime. Provision uploads/object storage, auth callbacks, queues and workers only when needed,
and verify their permissions. Do not depend on ephemeral application files for durable user data.

## 3. Configure environments and Git delivery

Bind environment values to the intended development, preview and production environments through
supported secret-handling tools. Keep them out of Git, transcripts and build output. Verify names
and presence without exposing values; redeploy when a change requires it. A locally reachable
Postgres address is not a production database endpoint.
[Environment variables](https://vercel.com/docs/environment-variables).

Link/import the intended repository and branch through Vercel's Git integration. Prefer its native
build/deployment path for compatible apps; do not add GC-specific GHCR publishing or SSH deployment
jobs just because Forge also supports GC. Keep one effective deployment trigger per environment.
Confirm access to private repositories/packages and the selected branch's actual behavior.
[Environments and Git delivery](https://vercel.com/docs/deployments/environments),
[CLI Git connection](https://vercel.com/docs/cli/git).

## 4. Verify preview, then authorized production

Run the local build, migrations and meaningful tests first. For Vercel-specific behavior use its
supported local tooling. Within authorization, create a preview, wait for a terminal deployment
state and inspect build/runtime errors. Verify login, API behavior and a real write/read flow
against the preview DB; exercise required workers/uploads. Respect preview protection rather than
disabling it to make a check pass. [CLI deployment workflow](https://vercel.com/docs/projects/deploy-from-cli).

Deploy to production only when authorized. Verify its correct source revision, real production
configuration, HTTPS URL, auth callbacks, backend/database flow and required background work.
Keep previous deployment identity and the data backup/migration recovery plan. Platform rollback
does not undo database migrations. Prove one subsequent authorized Git update reaches the expected
production deployment before claiming auto-deploy is verified.

Report account/project, repository/branch/SHA, preview/production deployment IDs, app URL and actual
checks. Separate platform Ready from product acceptance. If blocked, retain the prepared assets and
name the missing account connection, resource, configuration or runtime capability precisely.

`forge generate --deploy vercel` currently provides a CLI deployment invocation after the agent
finishes; it is not an independent whole-app acceptance harness. The orchestrating agent still must
perform the dependency, environment and application checks above. In an interactive Codex session,
carry this workflow through the available Vercel tools and explain each meaningful stage.
