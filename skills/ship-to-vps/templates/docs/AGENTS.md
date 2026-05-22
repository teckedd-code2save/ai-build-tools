# Agent Playbook — {{slug}}

This is the operating manual for anyone (human or AI) picking up an issue in this repo. Read it before opening a PR.

## Stack at a glance

- **{{framework_display}}** · {{language}}
- **Postgres** (Hetzner VPS, Docker) · **{{orm}}**
- **Secrets:** self-hosted Infisical at `https://<your-infisical-domain>` — never commit `.env*` files
- **Hosting:** Hetzner VPS `{{vps_host}}`, Docker Compose at `/opt/{{slug}}/`, Caddy reverse proxy
- **Public URL:** `https://{{domain}}`

## Running locally

```bash
# Inject all secrets from Infisical — never make a .env file
sec -- npm run dev

# Other useful ones:
sec -- npm run build               # production build
sec -- npm run lint
```

## Picking up an issue

1. **Read the issue end-to-end.** If acceptance criteria are unclear, leave a comment before writing code.
2. **Create a branch** off `main`: `<type>/<issue-number>-<short-slug>` — e.g. `feat/42-admin-form`, `fix/57-retry`, `chore/61-sentry`.
3. **Self-assign:** `gh issue edit <N> --add-assignee @me`.
4. **Touch only what the issue asks for.** No drive-by refactors.

## Commit convention

Conventional commits, with the issue number in the trailer:

```
<type>(<scope>): <imperative summary, <72 chars>

<optional body — why, not what>

Refs #<N>            ← partial progress
Closes #<N>          ← fully resolves the issue
```

Types: `feat` · `fix` · `chore` · `refactor` · `docs` · `test` · `perf` · `security` · `build` · `ci`

Use `Closes #N` in the **PR description**, not just the commit, so squash-merges keep the link.

## Pull requests

- **Title:** same shape as the commit (`feat(scope): summary`).
- **Body:** fill in the PR template — Summary, Test plan, Closes #N.
- **Size:** under ~400 lines of diff when you can.
- **CI must be green** before requesting review.
- **One issue per PR.**

## Deploy flow

Push to `main` → GitHub Actions builds the Docker image, pushes to `ghcr.io/{{ghcr_namespace}}/{{slug}}`, SSHes the VPS, runs `prisma migrate deploy`, and rolls the container. No manual steps.

If a deploy needs a new secret:

1. Add the key to Infisical at https://<your-infisical-domain>.
2. Reference it in code as `process.env.MY_KEY`.
3. For build-time `NEXT_PUBLIC_*` vars: also add to `Dockerfile` ARG/ENV and `.github/workflows/deploy.yml` build-args.
4. The `infisical-sync.yml` workflow projects secrets to `/opt/{{slug}}/.env` on the VPS automatically (hourly + on dispatch).

## Operating

```bash
bin/logs              # tail web container, last 200 lines
bin/logs 500          # tail last 500 lines
bin/logs --since 10m  # last 10 minutes (no follow)
bin/logs db           # tail postgres
bin/rollback          # roll back to :bootstrap (original known-good image)
bin/rollback <sha>    # roll back to a specific SHA
```

## Things that are NOT okay

- Committing `.env*` files (gitignored, but double-check)
- Hardcoding API keys, even test ones
- Editing existing migration files
- Pushing directly to `main` (the workflow assumes PR-then-merge)
- Wide refactors mixed into a bugfix PR

## Where to find things

- **Issues / roadmap:** https://github.com/{{ghcr_namespace}}/{{slug}}/issues
- **Secrets UI:** https://<your-infisical-domain>/project/{{infisical_project_id}}/secrets/dev
- **Production logs:** `bin/logs` (or SSH the VPS and `docker logs {{slug}}-web -f`)
- **Caddy site config:** `/etc/caddy/sites/{{caddy_priority}}-{{slug}}.caddy` on the VPS
- **Compose file:** `/opt/{{slug}}/docker-compose.yml` on the VPS
