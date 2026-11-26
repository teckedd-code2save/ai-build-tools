# GroundControl deployment handoff

Use this path when the user chooses GroundControl (GC) for infrastructure and runtime work. Forge
can run in any supported agent workspace with the required tools; Codex is one such workspace.
The task may begin with a brief, existing code, a GitHub issue or another authorized source of
context. Forge coordinates the product workflow, GitHub supports source/collaboration/CI when
selected, and GC assists with resources, provisioning, deployment and operations.

Preserve the chosen stack and required resources. The existing-server app/Postgres rehearsal is
one integration fixture, not a product limit or a reason to rebuild an existing application.

## Establish the real capability boundary

Inspect the connected tool catalog and granted deployment inventory. An installed MCP entry is
not proof of a working connection. Current GC deployment tools operate on explicitly enrolled,
approved deployments. A missing app is not authorization to repurpose an unrelated deployment.

Discover whether this connection exposes `deployment.create_options`, `deployment.plan` and
`deployment.create`. These provide scoped first launch on explicitly approved hosts, including
when the deployment inventory is empty. An older server or cached connector may still expose only
existing-deployment operations. Upgrade/refresh or use its supported Projects UI when authorized;
name the real boundary and preserve the prepared recipe. Do not invent a tool, switch to SSH,
replay browser cookies or add a cloud subscription to bypass a missing capability or grant.

Select the connection by its verified control-plane URL, host identity and granted inventory,
not by a similar tool or server name. When the user names a live instance, confirm that identity
before any write. A stale rehearsal connection is not a fallback when the chosen instance is
unavailable; identify the missing connection instead.

## Prepare a concrete app and database recipe

Use the user's existing host and database when appropriate; do not assume an empty server. Record:

- Source repository and exact commit; build context, Dockerfile and Compose path; app service,
  internal port and health endpoint. For prebuilt images, record verified digests.
- Database type and version, new versus existing database, service name, application role and
  required environment **key names**. Use migrations committed with the application.
- For a new Postgres service, use a private Compose network, named persistent volume, health check,
  and version-appropriate data directory. Do not expose its database port publicly. Do not upgrade
  an existing database image or reuse an unrelated volume.
- Generate database credentials at provisioning time in GC's authorized secret handling path.
  Keep values out of source, logs, tool responses and chat. Project configuration should refer to
  the connection value by environment variable; no hand-edited placeholder is completion.
- Migration command, seed policy, idempotent startup and the point at which the app can become
  routable. Failed migration must block readiness and preserve database evidence.
- Existing proxy/routing choice and a verified HTTPS path. GC's management URL is not the app URL;
  a temporary setup tunnel is not a durable production identity. Never replace a shared listener.
- Data backup and tested restoration procedure, previous image digests, and rollback limitations.
  Container rollback does not automatically undo a schema migration. Preserve volumes on failure.

Validate the generated Docker/Compose configuration with actual tooling when available. Run build,
tests and migrations against an authorized disposable database. List precisely which checks ran;
if Docker or a database is unavailable, prepare the recipe and report the missing integration check.
Do not call a generated file a successfully provisioned resource.

## GitHub image delivery readiness

Derive the required services and delivery assets from the product brief and selected GC target;
the user should not need to enumerate infrastructure boilerplate. Map each custom app, API,
worker or migration service to its build context, Dockerfile, runtime command and configuration.
Include only dependencies the service actually needs.

Before calling the repository deployment-ready:

- Provide a fast, documented local preview using the stack's dev server or local Compose. Keep
  this separate from production GHCR artifacts. Run a database-dependent smoke flow locally.
- Every custom image service needs an in-repository build recipe and an explicit
  `image: ghcr.io/OWNER/NAME` in repository-owned Compose. Ensure copied assets, migrations and
  runtime dependencies survive a clean checkout and image build.
- PostgreSQL, Redis and similar dependencies use appropriate upstream versioned images; do not
  create custom images for them without a service-specific need. Keep data volumes persistent.
- Choose one build executor. For GitHub Actions, provide a named workflow on the deployment
  branch that runs required checks, then builds and publishes each custom image with the full
  commit SHA as its tag and `org.opencontainers.image.revision` set to that same full SHA.
  A failed check must prevent image publication. Set the OCI source label to the repository URL.
- Actions publishes with repository-scoped `GITHUB_TOKEN` and `packages: write`; GC needs package
  pull access. If GC/agent is the selected publisher, its registry credential also needs write
  access. Check configured capabilities without requesting secret values in chat.
- Record the branch, workflow name, image/service mapping, environment key names, migration
  command, health checks and routing. Validate Compose, run tests and exercise migrations on an
  authorized disposable database before committing the delivery recipe as ready. Report missing
  integration evidence explicitly; a file's existence is not validation.

Hand the selected target and evidence to `ship-to-vps` for its GC route. Its legacy SSH templates
and checker are for the explicit direct VPS route only; do not apply them here.
For first launch, use the current `ship-to-vps` GC workflow. When the connected server exposes them,
read `deployment.create_options`, preflight with `deployment.plan`, and queue `deployment.create`
under explicit host creation consent. Follow its `deliveryOperationId` and the build's
`releaseOperationId`. Existing grants do not imply permission to create; old servers/catalogs may
still require the supported Projects UI. State that boundary, do not invent a capability.
For prepared existing targets, use `deployment.build_publish` with `releaseAfterBuild: true` where
exposed; Actions images also require `verifyPublished: true` and `actionsWorkflowName`.
The first MCP route adds only the new target to its creation grant, generates new credentials by
key name server-side, and preserves existing shared resources. DNS/provider provisioning and
external secret entry still require supported configuration paths; do not claim they're automatic.

Confirm a successful exact-commit workflow, matching image revision and running digest, then
verify HTTPS and real application behavior. Finally, exercise one subsequent authorized branch
update to prove automatic delivery. Do not report generated workflows or fixture tests as live acceptance.

## Existing approved deployment

Inspect identity, source, host, environment and returned capabilities first. For an authorized
change, use supported `deployment.build_publish` and `deployment.release`, or
`deployment.source_deploy` when that saved workflow is supported. Mutations return an operation
handle; follow it using `operation.get`. A lost response or uncertain worker outcome requires
inspection/reconciliation, never blindly repeating creation or release.

After completion, inspect the exact running revision/digests, containers and health. Verify HTTPS,
the application's database-dependent behavior, and persistence after a safe app restart. For an
RSVP app, exercise duplicate signup rejection and two simultaneous attempts at the last seat.
A green container or HTTP 200 alone is not proof of working application behavior.

## Report

Separate prepared source, executed local tests, recorded GC operation evidence and live acceptance.
If creation is still a UI step, identify that one concrete step and preserve the prepared recipe.
