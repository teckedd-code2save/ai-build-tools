# Build conversation

Use this during a substantial build, whether it starts in the CLI, Codex or another agent. Scale it
to the work: a small bug fix does not need a whole architecture ceremony. The purpose is shared
understanding and useful steering, not more tokens or permission prompts.

## Start with the system the user is building

In roughly one screen, connect the product goal to a simple architecture. Use the chosen stack and
real requirements; don't invent services to fill a diagram. For an existing app, show the affected
parts and preserve established choices. Include:

- The people using it and the core journey the first working slice will support.
- A small diagram (usually 4–7 nodes) connecting interface, application/API, durable data and only
  the external services actually needed. Explain what each important component is responsible for.
- One request traced end to end, including validation/auth and persistence where relevant.
- The local preview path and the selected delivery path, kept distinct. For GC this is typically
  GitHub → one image publisher → GHCR → GC verified digest release → app HTTPS.
- One or two meaningful tradeoffs or assumptions, with your recommendation. Infer routine choices;
  ask only when the answer affects scope, cost, product behavior or an irreversible action.

Example level of explanation: “A reviewer submits feedback in the browser. The API checks their
role, saves the note and version link in PostgreSQL, and returns the updated review. The local
preview runs that same flow with a disposable database. GitHub Actions later tests and publishes
the app image; GC releases that exact image and retains the database volume.” Adapt it to the app.
Do not promise agents, paid models, queues or analytics that the brief does not need.

## Progress grounded in evidence

Use a short update when work changes stage, a useful slice becomes testable, a decision matters or
a check fails. Respect the host assistant's progress cadence. Prefer this shape:

**Build & preview — working:** review creation now saves and reloads against local PostgreSQL.
**Next:** add reviewer permissions and test an unauthorized edit.
**Try:** a verified local preview link, if the user can actually reach it.

Statuses are working / in progress / verified / blocked / not started; do not use fake percentages.
Distinguish implementation from proof: “migration written” is different from “migration applied to
an isolated PostgreSQL database”; “image published” is different from “app serving the new digest.”
For a longer build keep a concise `.forge/build-status.md` with the current stage, important decisions,
actual check results, exact revision/operation IDs and next action. Do not put secrets in it. Update
it at stage changes, not on every command. Re-read it when resuming instead of restarting planning.

## Useful moments for user input

Invite steering when there is something concrete to judge: the first usable screen, a working core
journey, a relevant product tradeoff, or the deployment review. Give a clear recommended default and
keep independent authorized work moving while the user responds. Do not ask the user to choose
infrastructure boilerplate or approve every file. If they only want preparation, stop at that
boundary; a preview does not authorize deployment or a recording.

## Stage exit evidence

| Stage | Evidence to show |
| --- | --- |
| Design | Actual components, request/data flow, important assumptions and first slice |
| Build & preview | Runnable local app and a representative database-dependent journey |
| Verify | Executed tests, migration checks and clean build results, with failures/pending checks |
| Deliver | Exact repo/branch/SHA, publisher result, image digests and GC operation chain |
| Live checks | Verified HTTPS, app/database behavior and running revision; automatic update only if exercised |

At handoff, say what the user can do now and the one remaining blocker if any. Do not call the
system “ready”, “live” or “auto-deploy verified” based only on generated files or fixture tests.
