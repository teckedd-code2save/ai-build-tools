---
name: ship-to-vps
description: >
  Prepare and deliver web apps to the user's selected deployment target. For GroundControl,
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
- **Direct SSH-managed VPS explicitly selected:** read [direct-vps.md](references/direct-vps.md)
  and its [direct contract](references/direct-vps-contract.md). Its SSH, Caddy, Infisical and
  Cloudflare templates are specific to that route.
- **Another managed target selected:** retain it and use its supported delivery tools. Do not
  convert it to GC or direct SSH just because this skill was invoked.
- If the target cannot be inferred from the request or repository, prepare portable assets first
  and resolve the target before provisioning or deploying.

For GC, skip the direct-VPS checker and `templates/github/workflows/deploy.yml`: that template
performs SSH deployment. Do not add a second release job, bootstrap image, Infisical account,
SSH key, proxy installation or new provider account as a prerequisite to the GC route.
Skill-relative paths resolve from this installed skill, including in Codex; never assume Claude.

## GroundControl workflow

### 1. Confirm the instance and existing state

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

Reuse only the intended approved deployment. For the first deployment, prepare the repository,
branch, Compose recipe, environment key names, database/migration plan, routing and rollback
material for **Projects → Add project → Add deployment → Launch a new deployment** in GC.
Use the repository Compose template for the app's services. The current owner-reviewed UI path
prepares the target and queues the unified delivery pipeline. If GitHub is not connected, guide
the owner through GC's supported connection/repository selection.

Do not invent a general MCP `deployment.create` tool. Inspect current capabilities in case this
boundary changes. After first-launch review, the external agent grant must explicitly include the
new deployment. UI ownership or an internal pipeline grant does not imply an external MCP grant.
A scoped denial is not a reason to switch to SSH, admin shell or a different GC instance.

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
