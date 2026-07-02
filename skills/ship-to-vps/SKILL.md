---
name: ship-to-vps
description: >
  Ships any web app (Next.js / SvelteKit / Remix / FastAPI / etc.) to a Hetzner-class VPS via GitHub
  Container Registry, GitHub Actions, Caddy, and Cloudflare DNS. Auto-build → migrate → swap →
  smoke-test, with rollback and observability helpers. Trigger when the user says "ship it",
  "deploy this", "set up CI/CD", "wire this to my VPS", or "auto-build on push". Designed to take
  over right where `forge` leaves off — both skills share the
  `shippability-contract.md` handshake.
compatibility:
  requires:
    - The user has a reachable Hetzner-class VPS with host-level Caddy (auto-TLS) and Docker
    - SSH access via ~/.ssh/<your-deploy-key> (or equivalent named key) configured
    - Self-hosted Infisical instance per ~/.claude/rules/secrets.md
    - GitHub CLI (`gh`) authenticated with `write:packages` + `repo` + `workflow` scopes
    - Cloudflare API token with Zone:DNS:Edit on the target zone (if Cloudflare is the registrar)
  optional:
    - Datafy MCP for DB introspection
    - Prisma MCP for migration validation
---

# Ship-to-VPS Skill

Take a repo that satisfies `references/shippability-contract.md` and put it on the user's VPS, behind Caddy, with auto-deploy on push to `main`. Every step is idempotent — re-running the skill on an already-shipped repo verifies and reports drift, doesn't destroy.

## When to use

- After `forge` has scaffolded an app
- When the user says: "ship this", "deploy to my VPS", "wire up CI/CD", "set up auto-deploy"
- When an existing app needs to be migrated from manual `docker compose up` deploys to a CI flow

## Hard rules

1. **Never break the live container.** Every change is staged; the live container is only swapped after migrations succeed AND a new image is pulled. The previous image stays available as `:bootstrap` (or as the previous SHA tag) for one-command rollback.
2. **Never write a secret to a file outside `/opt/<slug>/.env` on the VPS.** Not to GH Secrets (except SSH/Infisical bootstrap), not to the repo, not to shell history.
3. **Never push to a GHCR package without the OCI source label.** Manual unlinked pushes break the deploy job's `GITHUB_TOKEN` auth path.
4. **Never assume the user's VPS has port X free.** Probe before binding.
5. **Never co-tenant another app's Docker network or volume.** Each app gets `/opt/<slug>/` + its own Docker network + its own postgres volume (if needed).
6. **Never commit `.env*`.** Already gitignored across user repos — verify, don't re-add.
7. **If the repo fails `references/shippability-contract.md`, do NOT proceed.** Either fix the violations (with user approval) or hand back to `forge` to re-scaffold.

## Inputs the skill needs

If unset, ask the user once and remember in a project memory:

| Input | Example | Where it lands |
|---|---|---|
| `<slug>` | `perfume-emporio` | repo name, Infisical project slug, `/opt/<slug>/`, container name, Caddy site filename |
| `<slug_underscored>` | derived: `perfume_emporio` | Postgres user/db name (Postgres rejects hyphens in identifiers) |
| `<domain>` | `example.com` | Cloudflare A-record, Caddy site `:443` host, `NEXT_PUBLIC_SITE_URL` |
| `<vps_host>` | `<your.vps.ip>` | GH Secret `VPS_HOST`, A-record value |
| `<vps_user>` | `root` | GH Secret `VPS_USER`, SSH user |
| `<ssh_key_path>` | `~/.ssh/<your-deploy-key>` | source for GH Secret `VPS_SSH_KEY` |
| `<ssh_key_relpath>` | `.ssh/<your-deploy-key>` | embedded in `bin/{logs,rollback}` as `$HOME/<relpath>` |
| `<ghcr_namespace>` | `teckedd-code2save` | image path `ghcr.io/<namespace>/<slug>` |
| `<framework>` | `nextjs` | Dockerfile template selection (`Dockerfile.nextjs-prisma7`) |
| `<framework_display>` | `Next.js 14` | AGENTS.md stack line |
| `<language>` | `TypeScript` | AGENTS.md stack line |
| `<orm>` | `Prisma 7` | AGENTS.md stack line |
| `<has_db>` | `true` | docker-compose includes postgres + migrations step |
| `<host_port>` | auto-picked from 13000–13999 | web container port binding |
| `<db_host_port>` | auto-picked from 15000–15999 | postgres port binding (127.0.0.1 only) |
| `<caddy_priority>` | `40`-`60` per existing sites | Caddy site filename ordering |
| `<infisical_project_id>` | derived from `.infisical.json` | AGENTS.md "Secrets UI" link |
| `<cloudflare_zone_id>` | derived from `<domain>` | Cloudflare API target |
| `<public_build_args>` | rendered from Infisical `NEXT_PUBLIC_*` keys | Dockerfile ARG/ENV block |
| `<public_build_args_yaml>` | same data as above, YAML form | deploy.yml `build-args:` lines |
| `<public_build_placeholders_yaml>` | placeholders for CI build | ci.yml `env:` block |

### Derivation rules

- `slug_underscored`: `slug` with `-` → `_`
- `ssh_key_relpath`: `ssh_key_path` with leading `~/` stripped
- `host_port` / `db_host_port`: Step 1 probes `ssh ... 'ss -tlnp'` and picks the lowest free port in range
- `caddy_priority`: list existing `/etc/caddy/sites/*.caddy` files, pick a 2-digit number not yet used (default 50)
- `infisical_project_id`: read from `.infisical.json` `workspaceId` field
- `cloudflare_zone_id`: extracted from domain via `curl ... /zones?name=<root_domain>`
- `public_build_args*`: query Infisical prod, filter keys matching `^NEXT_PUBLIC_`, render three forms:
  - Dockerfile: `ARG NEXT_PUBLIC_X\nENV NEXT_PUBLIC_X=${NEXT_PUBLIC_X}` per key
  - deploy.yml: `NEXT_PUBLIC_X=${{ vars.NEXT_PUBLIC_X }}` per key (indented under `build-args: |`)
  - ci.yml: `NEXT_PUBLIC_X: "ci-placeholder"` per key (or the real value if non-sensitive)

## Workflow

### Step 0 — Preflight & contract check
1. Verify SSH to VPS works: `ssh -i <ssh_key> <user>@<host> 'hostname; docker ps'`
2. Verify `gh auth status` shows `write:packages` + `repo` + `workflow` scopes
3. Verify Infisical project exists for this repo: `cat .infisical.json | jq .workspaceId`
4. **Run the shippability contract checker**: `~/.claude/skills/ship-to-vps/check-shippability.sh <repo-path>`. Exits 0 if shippable, prints PASS/FAIL per item. If any item fails, present the list and offer:
   - **a)** Fill the gaps via this skill (Step 3 will render templates for missing infra; app-level gaps like missing `package.json` scripts go back to forge)
   - **b)** Hand back to `forge` to re-scaffold the whole repo properly
5. Verify `<domain>` is on a Cloudflare-managed zone the user has API access to (if user opted into Cloudflare integration).

### Step 1 — VPS slot provisioning
1. Probe a free host port in 13000–13999: `ssh ... 'ss -tlnp | grep -oE ":1[3-4][0-9]{3}"' | sort -u`
2. Create `/opt/<slug>/` directory tree
3. Drop `templates/vps/docker-compose.yml` rendered with this project's variables
4. Render initial `/opt/<slug>/.env` from Infisical `prod` (Phase 5 of `infisical-flow.md`)
5. Drop `templates/vps/site.caddy` into `/etc/caddy/sites/` and reload Caddy
6. If `<has_db>`: bring up only the postgres service first, wait for healthcheck
7. **Do not start the web service yet** — there's no image in GHCR to pull yet (handled in Step 4)

### Step 2 — Cloudflare DNS
1. List existing A-records for the zone: `curl -H "Authorization: Bearer $CF_TOKEN" https://api.cloudflare.com/client/v4/zones/<zone_id>/dns_records?type=A`
2. If `<domain>` doesn't exist: create A-record pointing to `<vps_host>` with `proxied=false` (Caddy handles TLS termination)
3. If it exists pointing elsewhere: present diff, ask before overwriting
4. Verify: `dig +short <domain>` returns `<vps_host>` (may need ~60s)

### Step 3 — Repo: drop shippable artifacts
For each artifact, check if it exists. If yes, diff against template and ask before overwriting. If no, write fresh.

- `Dockerfile` — `templates/Dockerfile.<framework>-<orm>` (e.g. `Dockerfile.nextjs-prisma7`)
- `.eslintrc.json` (if Next.js, and missing)
- `.dockerignore` (if missing)
- `public/.gitkeep` (if Next.js + public/ empty)
- `.github/workflows/{ci,deploy,infisical-sync}.yml`
- `.github/ISSUE_TEMPLATE/{feature,bug,chore,config}.yml`
- `.github/pull_request_template.md`
- `AGENTS.md`
- `CONTRIBUTING.md` (3-liner pointing at AGENTS.md)
- `bin/{logs,rollback}` (chmod +x)

All artifacts are templated with `<slug>`, `<domain>`, `<ghcr_namespace>`, `<vps_host>`, `<host_port>`.

### Step 4 — GHCR bootstrap
1. **Locate an existing live image**, in this priority:
   1. `ssh ... 'docker ps --format "{{.Image}}" --filter "name=<slug>-web"'` → if it returns a tag, that's the live image. SSH there and `docker tag` + `docker push` from VPS. Most reliable.
   2. Local: `docker images --format "{{.Repository}}:{{.Tag}}" | grep -E "^(<slug>-web|<slug>):latest$"` → if matches, push from laptop.
   3. Neither exists: do a one-shot local `docker build .` of the repo, tag as `:bootstrap` + `:latest`, push.
2. **Login to GHCR for the push**: pipe `gh auth token` (must have `write:packages`) through `docker login ghcr.io -u <gh_user> --password-stdin`. Never put the token on a command line.
3. **Tag and push**: both `:bootstrap` (immutable rollback target) and `:latest`. Verify with `gh api users/<namespace>/packages/container/<slug>/versions --jq '.[0]'`.
4. **Verify image works**: `docker run --rm <bootstrap-ref> node -e "console.log('ok')"` (or framework-equivalent boot check).
5. **Walk user through linking the package to the repo** — this is a UI-only step:
   - Print: `Open https://github.com/users/<namespace>/packages/container/<slug>/settings → "Manage Actions access" → Add Repository: <slug> with Write role`
   - Wait for user confirmation before proceeding. Test the link worked by checking the package's `repository` field via `gh api`.
6. **Clean up GHCR docker creds from VPS** if Step 1's push happened from VPS: `ssh ... 'docker logout ghcr.io'`. The CI workflow re-auths fresh each run with ephemeral token.

### Step 5 — GitHub Secrets + Variables seeding
1. **GitHub Secrets** (`gh secret set` with stdin to keep secrets out of shell history):
   - `VPS_SSH_KEY` ← `cat <ssh_key_path>` piped via stdin (NOT `--body`, which lands on the command line)
   - `VPS_HOST` ← `<vps_host>` (low-sensitivity, `--body` ok)
   - `VPS_USER` ← `<vps_user>`
   - `INFISICAL_CLIENT_ID` ← `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID` from `~/.infisical/projects/<slug>.env`
   - `INFISICAL_CLIENT_SECRET` ← `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET` from same file
2. **Discover NEXT_PUBLIC_* keys** by querying Infisical prod env (these are public values safe to log):
   ```bash
   sec <slug> prod -- sh -c 'env | grep ^NEXT_PUBLIC_ | sort'
   ```
3. **GitHub Variables** — for each `NEXT_PUBLIC_*` key from step 2:
   ```bash
   gh variable set "$KEY" --repo <owner>/<repo> --body "$VAL"
   ```
4. **Generate `<public_build_args>`, `<public_build_args_yaml>`, `<public_build_placeholders_yaml>`** from the same discovered keys (see "Derivation rules" in Inputs section). These get baked into Dockerfile / deploy.yml / ci.yml when Step 3 re-renders them, OR if Step 3 already ran, edit them now and amend.

> If new `NEXT_PUBLIC_*` keys are added to Infisical later, the `infisical-sync.yml` workflow auto-re-mirrors them to GitHub Variables. But the Dockerfile + deploy.yml + ci.yml will still need a manual ARG/build-arg line added — same as `~/.claude/skills/ship-to-vps/references/infisical-flow.md` Phase 2 drift note.

### Step 6 — First commit + PR
1. Branch `chore/ship-to-vps-bootstrap`
2. Stage only the artifacts from Step 3
3. Commit with conventional message
4. Open PR — body explains everything, links to the shippability contract and Infisical flow
5. Wait for CI to pass

### Step 7 — Merge + first deploy
1. Merge with squash (after user confirmation, or auto if `--yolo`)
2. Wait for `deploy.yml` to fire; monitor job-by-job
3. If `Build & push` fails: usually GHCR auth — verify Step 4 link step
4. If `Roll VPS container` fails at `migrate deploy`: usually a deps issue — verify Dockerfile satisfies contract item 1
5. If smoke test fails: pull container logs via `bin/logs` and surface to user

### Step 8 — Post-deploy verification
1. `curl -sf -o /dev/null -w "%{http_code}\n" https://<domain>/` must return 200
2. `ssh ... docker ps` must show `<slug>-web` `Up <minutes>` with the new image ref
3. `gh run list --workflow=deploy.yml --limit 1` shows `success`
4. Print the deploy summary: domain, container, image ref, smoke result

### Step 9 — Enable drift sync
1. Confirm `infisical-sync.yml` is set to run hourly
2. Trigger once via `workflow_dispatch` to validate
3. Verify it's a no-op when nothing has changed (correct behavior)

### Step 10 — Wrap up
1. Optionally suggest follow-up issues: observability, smoke test expansion, custom domain TLS validation
2. Print runbook quick-reference:
   - Deploy: push to `main`
   - Watch: `gh run watch`
   - Logs: `bin/logs`
   - Rollback: `bin/rollback` (defaults to `:bootstrap`)
   - Manual sync: `gh workflow run infisical-sync.yml`

## Failure handling

If any step fails:
1. **Do not proceed.** Surface the failure to the user.
2. **Do not roll back what's already provisioned** — VPS slot, DNS record, GH secrets are all idempotent and safe to leave in place.
3. **Diagnose with `bin/logs`** if it's a runtime failure, with `gh run view --log-failed` if it's a CI failure.
4. **Loop back to Step 0 contract check** if the failure is shape-related (missing eslintrc, untracked dir, etc.). Often the right fix is to update the scaffold in forge, not patch around it here.

## Files this skill ships with

```
ship-to-vps/
├── SKILL.md                                    (this file)
├── references/
│   ├── shippability-contract.md                handshake spec
│   └── infisical-flow.md                       secrets lifecycle
└── templates/
    ├── Dockerfile.nextjs-prisma7
    ├── eslintrc.json
    ├── dockerignore
    ├── github/
    │   ├── workflows/{ci,deploy,infisical-sync}.yml
    │   ├── ISSUE_TEMPLATE/{feature,bug,chore,config}.yml
    │   └── pull_request_template.md
    ├── vps/
    │   ├── docker-compose.yml
    │   └── site.caddy
    ├── docs/AGENTS.md
    └── bin/{logs,rollback}
```

All template files use `{{name}}` markers. The skill's render step must handle two substitution patterns:

1. **Simple inline**: `{{slug}}` → `perfume-emporio`. Same-line replacement, no indentation handling needed.
2. **Multi-line block with indentation preservation**: `{{public_build_args}}`, `{{public_build_args_yaml}}`, `{{public_build_placeholders_yaml}}`. These expand to multiple lines that must inherit the indentation of the line containing the marker. A naive `sed s/X/Y/g` will collapse newlines into literal `\n` strings and break YAML/Dockerfile syntax.

A correct render function:

```python
def render(template_text, params):
    # Pattern 1: simple inline (no newlines in value)
    for k, v in params.items():
        if "\n" not in str(v):
            template_text = template_text.replace("{{" + k + "}}", str(v))
    # Pattern 2: multi-line block (preserve indentation of marker line)
    for k, v in params.items():
        if "\n" in str(v):
            marker = "{{" + k + "}}"
            for line in template_text.splitlines():
                if marker in line:
                    indent = line[: len(line) - len(line.lstrip())]
                    indented = ("\n" + indent).join(v.splitlines())
                    template_text = template_text.replace(line, line.replace(marker, indented))
    return template_text
```

The dry-run in `/tmp/ship-to-vps-dryrun/` uses a simple `sed`-based renderer that does NOT handle pattern 2 correctly — it's a validation harness only. The real skill must implement the proper renderer (or call out to one).
