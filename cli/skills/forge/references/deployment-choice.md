# Choose the deployment route from the workload

Respect an explicit target or existing deployment. When the user leaves it open, compare Vercel
and GroundControl (GC) during the system-design breakdown, give one recommendation with reasons,
and show the alternative. Keep independent build/preview work moving. Selecting a product design
does not authorize a new paid resource; use existing authorization and accounts where possible.
Do not restrict Forge to these providers if another target was explicitly selected.

Inspect the actual app: frontend/API runtimes, request duration, workers and scheduling, realtime
connections, database and migration needs, uploads, persistent disk, networking, region, current
accounts/tool access, cost constraints and existing deployment assets. A database alone does not
rule out Vercel; a Dockerfile alone does not require GC. Verify current provider capabilities and
the user's plan before deciding—do not embed old product limitations or fixed quotas as facts.

| Workload and operating preference | Starting recommendation | What must be confirmed |
| --- | --- | --- |
| Supported web framework with managed application runtime and external durable data | Vercel | Runtime/region fit, real DB/storage connection, migrations, environment scopes, account access |
| Existing repository Compose stack with app/API, owned Postgres/Redis, workers and persistent volumes | GC | Approved host, capacity, image recipes, private service networking, volume ownership, route and creation grant |
| Continuous workers or durable background jobs with managed services preferred | Compare both | Current Vercel worker/daemon/workflow capabilities and limits versus GC's complete service graph; exercise the worker, not only the web page |
| Existing app already on one platform | Retain it | Required change fits the installed capabilities; switching platforms needs an actual reason |

Recommendation example: “I recommend GC for this app because we already have an authorized host
and its app, database and worker are one Compose stack. Vercel is an alternative if you prefer
managed runtime and a separately provisioned database; we'd verify its worker support and cost.”
For a suitable managed web app, recommend Vercel with the same level of concrete reasoning.

## One complete deployment contract

For either route, account for every required component: UI, API, database, migrations, auth,
workers, storage, secrets, routing and update delivery. Omit components the product doesn't need.
Map each component to where it actually runs and who provisions it. Never make a frontend URL
stand in for an unprovisioned backend or database.

- Use [ship-to-vps](../../ship-to-vps/SKILL.md) for the selected route.
- Vercel: follow that skill's `references/vercel.md`. Use current supported tools/CLI and existing
  credentials, provision/connect required managed resources, and test the whole deployed journey.
- GC: follow `groundcontrol.md` and its MCP creation → image delivery → digest release contract.
  Build and deploy the entire Compose service graph, with persistent state protected.
- Keep a fast local preview regardless of deployment choice. Preview, published artifacts and
  production are separate states. A headless CLI exit code or platform “Ready” state does not
  prove database, worker or product behavior.
- Record exact source revision and deployment identity, HTTPS/application results, and a tested
  subsequent update if automatic deployment was requested. Report a missing connection or
  permission as the specific blocker, not as successful deployment.

Current references to recheck when choosing: [Vercel Functions](https://vercel.com/docs/functions/limitations),
[Vercel workers](https://vercel.com/docs/background-workers),
[Vercel storage](https://vercel.com/docs/storage). Availability and billing are account-specific.
