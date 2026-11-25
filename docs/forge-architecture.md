# Forge responsibility model

Forge is the orchestration layer for building and evolving products. It coordinates the relevant
agent skills and connected tools from understanding a request to implementation, validation,
collaboration, infrastructure work, release and iteration. Each task uses only the phases it needs.

| Component | Responsibility |
| --- | --- |
| Forge | Interpret goals and existing context, plan the work, coordinate implementation/testing/review, request infrastructure operations, and gather acceptance evidence. |
| Agent workspace | Run Forge's skills and tools. Codex is Edward's selected workspace; the product is not Codex-only. Tool availability and authentication depend on the host. |
| GitHub | Source/history, issues, branches, PR review, CI, releases and artifacts where the user chooses GitHub. Source and test evidence feed both implementation and deployment. |
| GroundControl | Assist with infrastructure discovery, resource planning/provisioning, environment configuration, deployments, runtime inspection and recovery through supported authorized capabilities. |

## Inputs and iteration

A task may begin with a product brief, design, local repository, GitHub issue, bug report, failed CI
run or runtime problem. The agent can retrieve authorized context and invoke the Forge skill; no
second app description in Codex is required. Existing projects should be inspected and evolved,
not automatically recreated. Requirements and runtime evidence can feed the next change/review cycle.

Do not confuse this responsibility model with implemented entry points: the current `forge generate`
CLI takes a prompt and launches Claude, Gemini or Codex; skill use can work with context available
to a supported host agent. There is no new native GitHub webhook/issue-ingestion service in this
change. Setup support for an editor is also distinct from a CLI runner for that editor.

## Infrastructure scope

GC is the selected infrastructure integration for this effort. It should help Forge allocate and
configure resources as well as deploy and operate applications. Resources may include compute,
databases, persistent storage, networking and other services as supported. Existing or newly
provisioned resources, providers and runtime types should be expressed through capability-aware
interfaces, rather than hardcoded as one VPS/Postgres/Compose product shape.

The current GC catalog does not expose general new-workload creation. That remains the concrete
next integration gap. The first app/Postgres launch on the existing server is an acceptance fixture
for the shared planning, permission and durable-operation mechanism. It does not restrict later
workflows or silently add broader provisioning powers to existing deployment grants.

GitHub and GC cooperate: a reviewed source revision or built artifact identifies what GC deploys;
GC returns operation and runtime evidence that Forge can use to verify the change. The selected
workflow determines whether builds happen in CI or through an available GC build capability.
GitHub use must not be confused with permission to publish every branch, PR, release or deployment.

## Immediate work

Keep the completed local Forge reliability fixes. Implement the GC first-launch planning/execution
service and scoped agent interface, then connect Forge to it. Validate both fresh work and changes
to an existing repository. Preserve target choice, source identity, test evidence, secrets and
resource ownership throughout. Report unsupported capabilities precisely and complete independent
preparation without pretending the missing operation succeeded.
