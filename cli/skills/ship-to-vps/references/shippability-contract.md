# Delivery contract: Forge → ship-to-vps → selected target

This contract separates repository readiness from live acceptance. Select the deployment route
before applying provider-specific requirements. For explicit direct SSH/VPS delivery, use
[the direct contract](direct-vps-contract.md). The checklist below is for GroundControl.

## GroundControl repository readiness

- [ ] Retain the selected GC instance, host, repository, deployment branch and application identity.
- [ ] Document a fast local preview command and exercise a real database-dependent smoke flow.
      A dev server or local Compose is suitable; preview containers are not production artifacts.
- [ ] Describe each custom app/API/worker/migrator: build context, Dockerfile, runtime command,
      configuration keys, internal port and health endpoint. Include only required services.
- [ ] Repository-owned Compose gives each custom build service an explicit
      `image: ghcr.io/OWNER/NAME`. Build context and Dockerfile stay inside the repository.
      Monorepo paths and multiple Dockerfiles are supported; a repo-root Dockerfile is not required.
- [ ] Use upstream versioned dependency images (Postgres/Redis, when needed), private service
      networking, health checks and persistent volumes. Do not expose database ports publicly or
      reuse another application's volume.
- [ ] A clean checkout can build all custom images, including runtime dependencies, migrations
      and copied assets. Run appropriate noninteractive checks for the installed stack/version.
- [ ] Validate Compose using actual tooling without printing expanded secrets. Report unavailable
      Docker/database checks as pending instead of claiming success from file inspection.
- [ ] Choose one publisher: Actions or GC/agent. For Actions, record the exact workflow name and
      branch; failed required checks prevent publishing. Publish all custom images tagged with the
      full commit SHA, OCI revision set to that SHA and OCI source set to the repository URL.
- [ ] Actions uses `GITHUB_TOKEN` with `packages: write`; GC has package pull access. If GC/agent
      publishes instead, it also needs write access. Inspect capabilities, never request raw tokens.
- [ ] Separate public build-time configuration from runtime secrets. Store secrets through the
      approved GC path; commit only key names and secret-free examples. Check tracked files for
      real credentials, including nested env files. Datafy and Infisical are optional integrations.
- [ ] Commit versioned migrations and record when they run, idempotent startup, readiness gates,
      seed policy and a tested backup/restore approach. Test migrations on an authorized disposable
      database. An image rollback is not a database rollback.
- [ ] Record routing, resource needs, previous digests if any, and the application health URL.
      Preserve the existing proxy, other workloads and host configuration.

## First delivery and automatic delivery evidence

- [ ] First deployment is owner-reviewed through GC Projects using the repository Compose template,
      or an actually exposed and authorized creation capability. The external MCP grant includes
      the intended new deployment before the agent mutates it.
- [ ] A successful exact-commit named Actions workflow and matching published image revisions are
      verified, or the selected GC/agent build has completed with explicit test evidence.
- [ ] Follow both the build/publish operation and its child digest release to completion. Confirm
      the running images correspond to the intended commit; do not accept only a published tag.
- [ ] Verify public HTTPS, real app/database behavior, and persistence after a safe authorized
      restart. Keep the exact observed results; HTTP 200 alone is not full-stack acceptance.
- [ ] If automatic delivery is requested, verify the selected branch subscription and exercise one
      subsequent authorized branch update. Until that succeeds, label it configured but unproven.

`check-shippability.sh` is a legacy direct-VPS scaffold check; it cannot certify this GC contract.
Do not add SSH, Infisical or legacy ESLint files to make a GC repo pass that unrelated checker.
Do not call the product deployment-ready while required build or migration evidence is missing.
