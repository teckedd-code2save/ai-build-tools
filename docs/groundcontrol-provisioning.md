# Forge → GroundControl automatic provisioning

Status: design and preparation contract, not a shipped automatic provisioner. The current local
Forge reliability changes do not create cloud resources or change any running GC instance.

## Product decision

Forge orchestrates the product lifecycle: understand the request, inspect existing work, design,
implement, test, collaborate, provision, deploy and iterate. Codex is Edward's chosen execution
workspace for the recording, not Forge's required input channel or sole supported agent.

GitHub supplies repository history, issues, branches, pull requests, CI results and release artifacts
when that workflow uses GitHub. GC supplies infrastructure discovery, resource planning/provisioning,
deployment and runtime operations through its supported, authorized capabilities. Forge coordinates
these systems; it does not become only a GC deployment wrapper. See [the responsibility model](forge-architecture.md).

The first integration rehearsal uses the existing authorized GC server. That test choice does not
limit Forge to new apps, one app, Postgres, Docker, an existing server, GC, or a single cloud provider.
Broader resource/provider support remains part of the architecture, with actual capability support
reported honestly. GC handles infrastructure mechanics when selected so Forge does not duplicate
its SSH, secrets, proxy and runtime implementation.

## Verified current boundary

Read-only source review: GC revision `570b4f7758cb60a4fadb0132674dac3ea27e98c9`.

- `docs/projects-and-deployments.md`: projects can import source without deploying; Linux-server
  templates support multi-service launches. New deployment creation is an authenticated UI flow.
- `templates/vps-caddy-commerce-secure.yml` and other templates include Postgres and named storage.
  Database support exists; this is not a requirement to buy a hosted database.
- `src/app/mcp/route.ts` and the currently connected tool catalog: deployment inspection,
  configuration metadata, health, build/publish, release, source deploy and durable operations are
  available for approved deployments. A general creation/enrollment tool is absent.
- `AGENTS.md`: OAuth grants are scoped to approved deployment IDs. New creation cannot be added
  safely by pretending that an existing deployment grant authorizes a new workload or host.

These are source/catalog findings, not a new live test of the Azure validation VM or proof that
this local GC revision is deployed there. Its installer/access rehearsal remains a separate gate.

## User-facing flow

1. Start with a brief, an existing repository, an issue/change request or context available to a
   supported agent. Forge inspects what exists and develops the required product or change; users
   do not need to restate an app description in Codex. The agent retrieves GitHub context through
   available authorized tools; this is not a claim of a built-in issue-ingestion service.
2. Preserve the selected source/review workflow and infrastructure target. For the GC rehearsal,
   choose the connected GC instance and existing host, then reuse that choice for the project.
3. GC reviews a concrete plan: source revision, app and database, persistent storage, route,
   environment key names, backup policy and resource requirements. Existing-host capacity is not
   free or infinite; do not advertise a zero-cost guarantee.
4. The owner authorizes that plan once. GC creates the isolated resources, generates and injects
   credentials, runs migrations, starts the app, configures its authorized route and verifies it.
5. Forge follows the durable operation and reports the verified endpoint or workload status and acceptance evidence.
   Retry resumes the same operation; it does not duplicate databases, volumes or routes.

Today step 4 uses Projects → Add deployment. The next engineering milestone is to expose the
reviewed first launch through scoped GC automation, retaining that same ownership boundary.
Do not advertise `forge --deploy groundcontrol` until this end-to-end path is implemented.

## Next implementation slice (proposed interfaces, not existing tools)

- Forge emits a versioned launch manifest containing source revision, recipe paths, services,
  ports, volume ownership, secret references, migration command and acceptance checks. It contains
  no credential values and no arbitrary host-level shell command.
- GC accepts a planning request scoped to one authorized host/project/environment. Resolve recipes
  server-side, validate ownership and proxy conflicts, and return a plan digest with expiry.
- Add explicit new-workload authorization to the OAuth/grant model. Existing deployment read/write
  grants do not silently gain host-wide create rights. Bind consent to the host and reviewed digest.
- Apply records a durable operation and ownership journal before mutation. Use an idempotency key;
  concurrent requests and retries return the same operation. Reconcile uncertain outcomes before
  further mutation; never infer failure merely from a network timeout.
- Reuse existing GC template, secret, Compose, routing and verification modules. Add generated
  credentials and automatic connection wiring within GC; do not copy secrets into the Forge manifest.
- Create/reuse the authorized app DB, wait for actual readiness, run the declared migration job,
  launch the exact source/image, then verify both HTTPS and a database-dependent application action.
- Keep failure evidence and owned data. Do not prune, delete shared networks/volumes, rewrite
  firewalls, replace listeners or automatically destroy a partially initialized database.
- After creation, grant the specifically created deployment for subsequent normal GC operations.

## Acceptance before recording

Exercise Forge through Edward's chosen Codex workspace and GC on an authorized isolated deployment.
This is the first test fixture, not a restriction on Forge's supported product/workflow scope:

- Start from an existing repository or GitHub change request as well as a fresh brief; retain source
  identity and relevant CI evidence instead of forcing a new project description or repository.

- Fresh launch produces app + Postgres + persistent volume, with no manually pasted connection URL.
- Repeated and concurrent apply create only one deployment and one database volume.
- Unauthorized host or changed plan digest fails before any host mutation.
- Lost response after creation reconciles to the existing operation; no duplicate resources.
- Unavailable image, occupied route and failed migration preserve unrelated workloads and data.
- Failed TLS or app/database health cannot produce a success URL.
- Read/write flow works; duplicate RSVP fails; competing requests cannot overbook the last seat.
- App restart preserves registrations. A separate restore rehearsal proves database recoverability.
- Evidence names exact source/image revisions and distinguishes local tests from live outcomes.

No live resource creation, release, VM change or provider signup was performed for this design.
