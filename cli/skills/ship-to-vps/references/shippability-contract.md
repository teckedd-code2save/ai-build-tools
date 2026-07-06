# Shippable Web App Contract

The handshake between `forge` (scaffolds) and `ship-to-vps` (deploys). A repo that satisfies this contract can be auto-built, migrated, and rolled to a Hetzner-class VPS without human babysitting.

Every item in this contract corresponds to a failure that has happened in production. Skip nothing.

---

## 1. Dockerfile

**Required at repo root** (`./Dockerfile`). Multi-stage. For Next.js + Prisma, see `ship-to-vps/templates/Dockerfile.nextjs-prisma7`.

Must satisfy:

- **Multi-stage** with `deps`, `builder`, `runner` stages
- **OCI source label** on the final stage so GHCR auto-links the package to the repo and ephemeral `GITHUB_TOKEN` (with `packages: read`) can pull during deploy:
  ```dockerfile
  LABEL org.opencontainers.image.source="https://github.com/<owner>/<repo>"
  ```
- **NEXT_PUBLIC_* (or framework-equivalent) injected as ARG → ENV** in the `builder` stage. These are inlined into client bundles at build time and **must** be present then.
- **Runtime stage must include every dep migrations need.** For Prisma 7, that means the full `node_modules` tree (because `@prisma/config` requires `effect`, etc.). Don't try to copy a subset — you will be wrong.
- **Migrations invoked via `node ./node_modules/<orm-pkg>/bin.js` not `npx`.** The standalone runner doesn't ship `node_modules/.bin/` shims.
- **Run as a non-root user** with explicit UID/GID.

## 2. .eslintrc.json (or framework equivalent)

**Must exist** at repo root. `next lint` without config triggers an interactive prompt that hangs CI. For Next.js the minimum is:

```json
{ "extends": "next/core-web-vitals" }
```

## 3. .dockerignore

Must exist. Must NOT exclude:
- `prisma/` (needed for `migrate deploy`)
- `public/` (Next.js asset dir)
- any config file the Dockerfile COPYs (`prisma.config.ts`, etc.)

Should exclude: `node_modules`, `.next`, `.git`, `.env*`, `*.log`, `.DS_Store`, `.vscode`, `.idea`, `.claude`, `README.md`.

## 4. Tracked empty directories

`git` does not track empty directories. If the Dockerfile `COPY`s a directory, the directory **must** contain at least one tracked file. Add `.gitkeep` for any otherwise-empty dir the build needs:
- `public/.gitkeep` for Next.js apps without static assets

## 5. .infisical.json

Must exist at repo root with:
```json
{ "workspaceId": "<infisical-project-id>", "defaultEnvironment": "dev" }
```

Created at forge Step 0 when the Infisical project + machine identity are provisioned. See `references/infisical-flow.md`.

## 6. package.json scripts

At minimum:
```json
{
  "scripts": {
    "dev": "...",
    "build": "...",
    "start": "...",
    "lint": "next lint" /* or framework equivalent — must be non-interactive */
  }
}
```

## 7. Database connection convention

If a database is in use, the app must read its connection from `DATABASE_URL` (or the framework's standard env name). The VPS-side `docker-compose.yml` will provide it via `env_file: .env`.

## 8. Port convention

App listens on a single TCP port. Default to `3000` for Node/Next.js. The Caddy site config on the VPS reverse-proxies to this port; the VPS-side compose maps it to a per-app host port (e.g. `13000`) to avoid collisions with other apps on the same box.

## 9. Public values vs. secrets — strict separation

- **Public** (`NEXT_PUBLIC_*`, anything that ends up in the client bundle): kept in **GitHub Variables**, mirrored from Infisical at ship-to-vps setup
- **Private** (DB password, API keys, webhook secrets): kept in **Infisical**, projected to `/opt/<slug>/.env` on VPS by `infisical-sync.yml`
- **Deploy plumbing** (SSH key, VPS host/user): kept in **GitHub Secrets**

Never commit either kind to the repo.

## 10. AGENTS.md

The repo must ship with `AGENTS.md` describing: stack, local dev via `sec --`, branch naming, commit conventions, deploy path. Template at `ship-to-vps/templates/docs/AGENTS.md`.

---

## Checklist (forge's Step 5 must pass all of these)

- [ ] `Dockerfile` at root with OCI label, multi-stage, full deps for migrations
- [ ] `.eslintrc.json` (or equivalent) exists
- [ ] `.dockerignore` exists with correct exclusions
- [ ] `public/.gitkeep` (for Next.js) or equivalent tracked file in any `COPY`-ed dir that may be empty
- [ ] `.infisical.json` exists with valid `workspaceId`
- [ ] `package.json` has non-interactive `lint`, `build`, `start` scripts
- [ ] App reads `DATABASE_URL` from env
- [ ] App listens on a single port (default 3000)
- [ ] No `.env*` files committed
- [ ] `AGENTS.md` exists

If any box is unchecked, **the deploy will fail**. Fix in scaffold, not in CI.
