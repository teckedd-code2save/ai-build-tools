# Connection and session handoff

Forge owns the explanation of the whole workflow, including delivery connections. The user should
not have to relay known URLs, choose between transport details or diagnose an OAuth error.

## Recover context before asking

At entry or resume, read the available conversation, project AGENTS/README, `.forge/build-status.md`
and supported connection metadata. Reuse the selected provider, control-plane URL, host, repo and
publisher when those facts are already recorded. Inspect only the relevant non-secret config fields;
never dump auth files, tokens, cookies or environment values. Do not search private session stores.
A skill cannot read another chat automatically; use the current workspace's handoff and authorized
context sources. Ask once only if the required identity is genuinely missing or conflicting.

Prefer the connected plugin when its tools cover the task. A direct MCP endpoint is an alternative
for a client that supports it, not an authentication bypass or inherently more capable transport.
Do not add a duplicate connection, switch instance, enable a disabled rehearsal server or broaden
a grant to work around authentication. An endpoint in config does not prove access or permission.

## Explain the actual boundary

Make one safe read through the current connection and distinguish the result:

- **Reauthentication required:** identify the known instance, use the host's supported reconnect
  flow, and say exactly what the user needs to do there. Never request keys or tokens in chat.
  Suspend calls that need that connection while independent local build/tests and authorized
  GitHub preparation continue. After reconnection, repeat a safe read to verify access.
- **Missing creation consent:** the connection works, but first deployment needs explicit host
  permission. Explain the additional scope and selected host through the supported consent flow.
  A grant for existing deployments is not creation consent.
- **Missing tools:** inspect the current catalog and, when available, public discovery for the
  selected instance. Distinguish an older server from a stale client catalog. State what was
  observed; never claim a source merge is a live rollout. Refresh through supported mechanisms.
- **Unreachable service:** state the failed check without calling it an authentication problem.
  Retain the recipe and retry only when there is new evidence or a bounded useful check.

The user-facing update should combine the stage, verified fact, one required action, and work
continuing in parallel. Example (only when supported by actual evidence):

> Deliver — the repository and image are ready. The connection to your recorded GC instance
> requires sign-in again. Use the reconnect action offered by this client for GroundControl;
> then I will verify host permission and launch the prepared recipe. Local tests can continue.

Do not universally tell users to use “Apps” or a CLI command: name the reconnect control provided
by their actual host. Do not pretend to have triggered a prompt if no tool exposed one.

## Leave a usable handoff

Update `.forge/build-status.md` at meaningful stage changes. Keep it concise and non-secret:

- Product/workspace and current stage; what is implemented, tested, published and live separately.
- Selected provider; verified control-plane URL and MCP endpoint (without auth query/fragment),
  connection identifier, intended host/deployment, evidence source and time checked.
- Current-session connection status, observed catalog and required permission. These are historical
  observations on resume, not proof that the next session is authorized.
- Repository, branch, exact SHA, Compose path, publisher/workflow, image digests and durable operation
  IDs when known; environment key names only and the selected routing/health checks.
- Any pending user action, independent work that can continue, and exact next verification.

Link this handoff from project instructions when appropriate. Read and refresh it on resume rather
than making the user repeat setup. If moving to another workspace, prepare the non-secret handoff
for the user; do not message another session, copy credentials or edit an active app without authority.
Never hard-code one operator's URLs into the distributable skill. Keep installation, server release,
client catalog refresh, consent and a successful real app deployment as separate evidence.
