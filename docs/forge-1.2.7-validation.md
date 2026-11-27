# Forge 1.2.7 validation

Changes: system-design breakdown and meaningful stage updates; optional Datafy and environment
preflight; workload-based Vercel/GC recommendation with complete app delivery criteria; current
scoped GC creation workflow plus explicit older-server fallback; generated instruction parity.
CLI stage labels now use explicit agent reports instead of guessing progress from log keywords.
A stage-note-only workspace cannot trigger Vercel deployment. Interactive steering is through the
agent session; forge generate remains a headless command and retains its workspace for continuation.

Executed locally on 2026-11-26:
- Exact 1.2.7 bundled CLI: 26 tests across 4 files passed, including setup into isolated Codex homes,
  installed reference completeness, custom-instruction preservation, cancellation/failure guards
  and progress-only output.
- Typecheck, lint, build, root/package skill parity and both skill metadata validators passed.
- Latest upstream README/contributor refresh (#24) preserved, with narrow workflow additions.

These are executable CLI/installation checks and reviewed guidance, not an independent LLM
behavior evaluation or a live Vercel/GC deployment rehearsal. No paid model calls were used.
GC creation still requires the corresponding server rollout, tool refresh and explicit host
consent. Vercel needs an authorized account/project and real provisioned dependencies. GC's own
Vercel adapter remains future work and is not required for this release.

Representative prompts to exercise in the app rehearsal:
1. Build a review app in Codex, explain the architecture and show stage updates; use PostgreSQL,
   but no Datafy. Expect real migrations/DB checks and an accessible preview, not a stack rewrite.
2. Deploy an existing Compose app/API/Postgres/worker stack to GC with zero enrolled apps. Expect
   options → plan → create → delivery → release under selected-host consent and real live checks.
3. Build a managed web app with database needs and no chosen platform. Expect a workload-based
   Vercel/GC comparison, recommendation and complete dependency plan; a DB alone excludes neither.
4. Choose Vercel with a background worker. Expect current runtime/plan/preview constraints checked,
   real dependency/worker verification and one Git update before claiming auto-deploy works.
5. Say prep only / do not record. Expect continued authorized preparation without deployment or
   recording; no mandatory approval ceremony for ordinary reversible implementation steps.
