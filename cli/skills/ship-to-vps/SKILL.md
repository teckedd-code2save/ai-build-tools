---
name: ship-to-vps
description: >
  Prepare and deliver complete web apps to Vercel, GroundControl or the user's chosen target. For GroundControl,
  connect GitHub, build and publish custom images to GHCR, then release through GC's scoped
  deployment controls with verification and rollback evidence. Also supports explicitly chosen
  direct VPS deployments. Use for "ship it", "deploy this", "set up CI/CD", "wire this to my VPS",
  or "auto-build on push", including the delivery handoff from Forge. Preserve the chosen target.
metadata:
  optional-integrations:
    - GroundControl MCP and GitHub for managed delivery
    - SSH, Docker, Caddy and Infisical for the explicit direct VPS workflow
---

# Ship-to-VPS

Forge coordinates the product workflow. This skill prepares its delivery contract and carries an
existing repository through the selected deployment route. It can also start from a repository
without Forge. Derive the required assets from the actual services and product brief; do not make
the user list Dockerfiles, database plumbing or CI boilerplate.

## Select the route first

- **GroundControl selected or already managing this app:** use the GC workflow below. Existing
  VPS defaults in `~/.forge/ship-to-vps-config.json` do not override this choice.
- **Vercel selected or recommended and accepted:** read [the complete Vercel workflow](references/vercel.md). Cover the real backend, managed database, migrations, secrets, workers when needed, Git delivery and live product checks. Do not apply GC GHCR requirements to this route.
- **Direct SSH-managed VPS explicitly selected:** read [direct-vps.md](references/direct-vps.md)
  and its [direct contract](references/direct-vps-contract.md). Its SSH, Caddy, Infisical and
  Cloudflare templates are specific to that route.
- **Another managed target selected:** retain it and use its supported delivery tools. Do not
  convert it to GC or direct SSH just because this skill was invoked.
- If no target is specified, use [Forge’s workload comparison](../forge/references/deployment-choice.md) to offer Vercel and GC with a concrete recommendation. Prepare portable assets while the user decides. Respect another explicitly chosen target.

For GC, skip the direct-VPS checker and `templates/github/workflows/deploy.yml`: that template
performs SSH deployment. Do not add a second release job, bootstrap image, Infisical account,
SSH key, proxy installation or new provider account as a prerequisite to the GC route.
Skill-relative paths resolve from this installed skill, including in Codex; never assume Claude.

## GroundControl workflow

### 1. Confirm the instance and existing state

Read [Forge’s connection and session handoff](../forge/references/connection-handoff.md), including
when invoked directly. Recover known instance settings before asking, explain the exact reconnect
or consent step, and retain a non-secret continuation record.

Inspect the actual connected MCP catalog, approved deployment inventory and GitHub connection.
Verify the GC control-plane URL, host and deployment identity against the user's selected target
before any write. A stale rehearsal connection is not a fallback for the chosen live instance.
Inspect existing repository/branch, build executor, Compose template, registry access, resources,
routing and environment key names. Do not print credentials or change unrelated workloads.

### 2. Prepare and exercise the repository

Complete the [GC shippability contract](references/shippability-contract.md), fixing authorized
repository gaps. Preserve the user's stack, existing code, database and version choices. Provide
and exercise a fast local dev-server or Compose preview, with a real database-dependent smoke
flow. Local preview is separate from the production GHCR image and live acceptance.

Every custom service needs an in-repository build context and Dockerfile plus an explicit GHCR
image in repository-owned Compose. Dependencies such as Postgres and Redis use upstream versioned
images. Validate configuration, clean-checkout builds, runtime assets, migrations and health checks.
A generated Dockerfile or green static checker is not evidence that the image builds or runs.

### 3. Choose one image publisher

- **GitHub Actions:** configure one named workflow for the deployment branch. Required lint,
  tests and build checks must succeed before publication. Build each custom service, publish
  `ghcr.io/OWNER/NAME:FULL_COMMIT_SHA`, and set OCI source and revision labels. Use repository-scoped
  `GITHUB_TOKEN` with `packages: write`; GC needs pull access to each package. Confirm permissions
  and repository/package association through supported integrations without exposing tokens.
  The Actions workflow builds and publishes; GC performs the release. No SSH deployment job.
- **GC/agent publisher:** use GC's supported build/publish operation on the exact repository SHA
  and Compose recipe; confirm its configured registry credential can publish and pull. Record
  which checks actually ran; selecting this executor does not prove tests were executed.

Do not configure both publishers for the same automatic release. Preserve an existing suitable
workflow and use the selected branch, not a hard-coded `main` or mutable `latest` image as proof.

### 4. Prepare or select the deployment

Reuse only the intended approved deployment. For a first deployment, discover the connected MCP
catalog. When `deployment.create_options`, `deployment.plan` and `deployment.create` are exposed:

1. Read the creation options; choose the user's host and connected repository. First-deployment
   permission is explicit (`deployment:create` plus read/redeploy/operation scopes, selected hosts).
   An old grant over existing apps does not imply creation authority. If consent is required, use
   the supported connection flow and explain what new permission is being requested.
2. Prepare the exact repository/branch/full SHA, Compose path, app/environment name, new hostname,
   public service/loopback host port, health path and single publisher/workflow. Map these from the
   repo; don't ask the user to transcribe infrastructure settings. Use scoped named volumes and
   private database networking. Follow the current server schema and report unsupported recipes.
3. Run `deployment.plan`; resolve its actual missing prerequisites. `generatedEnvironmentKeys`
   generates new random app/database credentials privately. It cannot supply an existing provider
   API key or construct a connection URL. Put non-secret defaults and interpolation in Compose;
   external secrets use GC's supported configuration UI. Never request secret values in chat.
4. Within deployment authorization, call `deployment.create` once with stable idempotencyKey and
   the reviewed inputs. Follow `operation.get`, its `deliveryOperationId`, then `releaseOperationId`.
   Creation reserves a new target and adds only that target to the approving grant. A successful
   creation operation means preparation completed, not that the app is healthy or serving HTTPS.

The first MCP creation route uses the existing Caddy proxy with a new hostname; it does not change
DNS, cloud resources or firewall rules. Verify DNS points to the chosen host using authorized
provider tools, or report the precise missing configuration. Do not assume arbitrary provisioning
or routing is implemented. Never replace an existing listener, named volume, network or app.

If these tools are absent, identify the server/catalog or consent boundary explicitly. Do not claim
MCP first launch is available merely because it was implemented in source. A supported Projects UI
launch can be used if authorized; preserve the prepared recipe and then grant the new target. Do
not silently switch to SSH, an old rehearsal connection or an unrelated enrolled deployment.

### 5. Deliver and follow the actual release

Within the user's authorization, use the supported `deployment.build_publish` path. Where the
actual schema exposes them, set `releaseAfterBuild: true`; for Actions-built images also set
`verifyPublished: true` and `actionsWorkflowName` to the configured workflow. Do not assume fields
exist on an older server. Enable automatic delivery for the selected branch when requested.

Actions verification must match a successful workflow for the exact repository, branch and full
commit, plus each image's revision label and digest. A different workflow or a previous successful
commit is not sufficient. Follow the durable operation with `operation.get`, then follow its
`releaseOperationId` child. Successful publication is not a completed release. Reconcile a lost
response or uncertain outcome before retrying; do not blindly replay a mutation.

Use GC's configured digest release and routing. Do not build during the release or replace a shared
listener. Preserve persistent volumes; failed migrations or unhealthy images must not be reported
as ready. If the server cannot enforce the required verification, report that integration gap.

### 6. Prove the result and hand back to Forge

Confirm the exact running digest and revision, healthy services, HTTPS, and a real app flow that
writes and reads the database. Verify persistence through a safe app restart when authorized.
For automatic delivery, exercise a subsequent authorized branch update and confirm its new exact
commit reaches the running service. Otherwise report auto-delivery as configured but unproven.

Record repository/branch/SHA, workflow result or build operation, child release, image digests,
app URL and actual smoke results. Separate prepared files, local checks and live evidence. Preserve
previous digests and the backup/restore plan; image rollback does not reverse schema changes.
Use GC's supported logs and rollback operations for GC targets, not direct-VPS helper scripts.
If blocked, state the one missing capability or owner action and retain the prepared recipe.
