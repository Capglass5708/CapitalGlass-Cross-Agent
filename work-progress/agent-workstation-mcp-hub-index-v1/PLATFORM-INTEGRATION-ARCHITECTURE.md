# Platform integration architecture — agent-workstation-mcp-hub-index-v1

**Status:** LOCKED — supersedes any design that adds a competing AI control plane.

This work package **informs** the existing AppBuilder execution spine. It does **not** replace it.

## What we are NOT building

| Forbidden regrowth | Why |
| --- | --- |
| `agent_runtime_resolve()` as a new front door | `execution-context:resolve` already exists |
| Independent session-start resolver | Covered by worldview + Lane 0 |
| Claude-only vs Cursor-only governance forks | `@capital-glass/agent-protocol-kernel` is agent-neutral |
| Manual milestone states in closeout manifests | `sdlc:milestone:status` derives state read-only |
| Raw `git push` / `gh` as agent transport | M8 GitHub Plane required for remote mutation |

## Existing control spine (AppBuilder)

```
                 CONSTITUTION
          CG-Platform-Governance
                    │
                    ▼
           LOGICAL AUTHORITY
     Cross-Agent agent-runtime registry  ← this WP
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
   Office Admin           Repo intent
  device authority        contracts
         │                     │
         └──────────┬──────────┘
                    ▼
              CG-AppBuilder
    ┌───────────────────────────────┐
    │ Worldview / Authority DAG     │
    │ execution-context:resolve     │
    └───────────────┬───────────────┘
                    ▼
        authority-convergence-receipt
                    ▼
       @capital-glass/agent-protocol-kernel
         (mission admission, court, foundation)
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
     Cursor       Claude      other lanes
        │           │
        └─────┬─────┘
              ▼
           Lane 0 (`lane0:admit`)
    repo / worktree / machine admission
              ▼
    capability / operation classification
              │
      ┌───────┴────────┐
      ▼                ▼
 normal execution   GitHub mutation
                           ▼
                           M8
              Feature Plane F0–F7
                           ▼
              GitHub Plane G0–G8
                           ▼
                    GitHub actuator
                           ▼
                 remote verification + receipt
```

## Agent-neutral kernel (strongest existing evidence)

Package: `CG-AppBuilder-MCP/packages/agent-protocol-kernel/`

Owns: mission admission leases, snapshot hashing, continuation-context fingerprints, execution-court classification, foundation checks, protocol telemetry.

Anti-fork invariant: **both Cursor and Claude lanes import the same kernel.**

De-branded concept: `ESTATE_WIDE_ENFORCEMENT` — not Cursor-only.

## Worldview / execution context (integration point)

Command: `npm run execution-context:resolve`

Existing authority DAG lanes (`scripts/worldview/lib/default-authority-dag.mjs`):

- `git`, `governance`, `mcpHealth`, `env`, `milestone`, `pi`, `hub`, `cache`, `runtimePosture`

**Wave 4 integration:** extend `runtimePosture` **or** add `agentRuntime` as a first-class worldview lane fed by:

`CapitalGlass-Cross-Agent/registry/agent-runtime/` → compiled slices + generation hash

Drift codes defined in Cross-Agent; **evaluated in AppBuilder** → flow into:

```
authority convergence → executionEligibility → protocol kernel admission
```

Example: `DRIFT_GITHUB_PLANE_BYPASS` (FATAL, scope `GIT_MUTATION`) → HOLD mutation, session may continue read/test/compile.

## Lane 0 (checkout lease incident)

Command: `npm run lane0:admit`

Already resolves: machine identity, worktree context, local Git facts, origin/main, freshness, admission ALLOW/HOLD.

**Lease conflict on one repo must not deny unrelated repos** in a multi-repo publication batch — extend Lane 0 batch semantics, not a new lease system in Cross-Agent.

## M8 (downstream, not parallel)

Commands: `feature-plane:compile`, `github-plane:compile`, `m8:acceptance`, `m8:final-activation`

GitHub mutation stack: A2 changeset → G5 apply → G6 verify → G7 readiness → merge → G8.

M8 final activation already calls Lane 0 admission before proceeding.

Capabilities (`github.publish`, etc.) map to provider `mcp:m8-github-plane` — agents request capabilities, not transport commands.

## Common AI foundation vs profiles

```
                  COMMON AI FOUNDATION
           ┌────────────────────────────┐
           │ Agent Protocol Kernel      │
           │ Governance                 │
           │ Worldview                  │
           │ Execution Context          │
           │ Admission / Lane 0         │
           │ Drift                      │
           │ Milestone engine           │
           │ M8 GitHub Plane            │
           │ Intelligence / Cache       │
           └────────────────────────────┘
                │         │         │
                ▼         ▼         ▼
              NIMO    WESLEY_WORK   RYZEN
                │         │         │
          controller  integration  executor
           profile     captain      + GPU
                       profile      profile
```

Profile differences come **after** baseline convergence — never instead of it.

## Milestone: CG_AGENT_RUNTIME_DETERMINISM_V1

**Register** in existing milestone engine — do not write lifecycle state into closeout JSON.

```bash
npm run sdlc:milestone:status -- --milestone CG_AGENT_RUNTIME_DETERMINISM_V1 --json
```

### First gate: AI_PLATFORM_BASELINE_CONVERGENCE

Before profile or capability evaluation, every authorized machine must pass the **same common AI foundation** at the **same authority generation**:

```
BASELINE
    ↓
cg_nimo_01     PASS
wesley_work    PASS
ryzen9desk     PASS
    ↓
PROFILE DIFFERENCES  (controller, gpuExecutor, integrationCaptain)
    ↓
CAPABILITY DIFFERENCES
```

Authority: `registry/agent-runtime/authority/baseline-convergence.v1.json`

**This is not “Ryzen doesn't support the platform.”** The code already targets all three roles (`AUTHORIZED_ROLES` in `bootstrap-claude-wide-preflight-v1.mjs`; M8 three-mirror acceptance includes `RYZEN9DESK`). The gap was **rollout asymmetry** and **insufficient parity enforcement**.

| Diagnosis axis | State |
| --- | --- |
| Architecture | PRESENT |
| Platform code | PRESENT |
| Machine targeting | RYZEN SUPPORTED |
| Rollout | ASYMMETRIC (NIMO full bootstrap; Ryzen parity deferred) |
| Local realization | DRIFTED / INCOMPLETE on non-NIMO hosts |
| Parity enforcement | INSUFFICIENT until this milestone |

Two state categories must not be conflated:

| Category | Examples |
| --- | --- |
| Git / platform code | kernel, worldview, lane0, m8 scripts in checkout |
| Machine realization | `~/.claude/settings.json`, `~/.claude/CLAUDE.md`, peer-live-proof, MCP wiring, hooks, cache paths |

NIMO went through more of the second category during cold-start onboarding. Ryzen had the first available conceptually but local realization was not kept converged.

**Invariant:** missing control-plane component ≠ acceptable profile difference.

Evidence profile (derived, not manually asserted):

| Sub-milestone | Meaning |
| --- | --- |
| `AI_PLATFORM_BASELINE_CONVERGENCE` | All three machines: same foundation generation + hook + behavior hash + identity + MCP surface |
| `AUTHORITY_READY` | Cross-Agent registry + schema frozen |
| `RUNTIME_CONTRACT_READY` | launch/settings/dependency contracts (Wave 1.5+) |
| `ESTATE_OBSERVED` | harvest receipts on 3 hosts |
| `READ_PLANE_READY` | Hub slices + determinism gate PASS |
| `GITHUB_MUTATION_PLANE_READY` | M8 provider + adversarial raw-push DENY + per-repo lease |
| `SESSION_CONTROL_READY` | worldview lane + kernel admission wired |

Do **not** issue `CG_AGENT_RUNTIME_DETERMINISM_V1_PASS` without `GITHUB_MUTATION_PLANE_READY`.

## Repo-specific policy overlay

Proposal Generator `main`:

```
intent → repo policy → protocol-13b:ship-gate → operator approval? → M8 → remote verify
```

Governance decides **WHETHER**. M8 decides **HOW**.

## Four immediate plan changes (locked)

1. **No `agent_runtime_resolve()`** — extend `execution-context:resolve` with runtime authority inputs.
2. **Add `agentRuntime` worldview lane** (or extend `runtimePosture`) with machine/client/profile/capabilities/drift/generation.
3. **Drift guardrails:** Cross-Agent defines codes; AppBuilder evaluates → worldview → kernel admission.
4. **Milestone:** register `CG_AGENT_RUNTIME_DETERMINISM_V1` with `sdlc:milestone:status`; closeout manifest tracks evidence refs only.

## Wave mapping (revised)

| Wave | Owner | Deliverable |
| --- | --- | --- |
| 1 | Cross-Agent | Registry authority + Hub slice compiler (done locally) |
| 1b | Cross-Agent | Platform integration contracts (this doc + `platform-integration.v1.json`) |
| 2 | AppBuilder | `agentRuntime` worldview lane collector + drift evaluator |
| 3 | AppBuilder | Lane 0 per-repo batch lease + GitHub op classifier hook |
| 4 | AppBuilder | Wire into `execution-context:resolve` + kernel admission |
| 5 | AppBuilder | Register milestone evidence profile |
| Hub publish | WESLEYDESK GHA | `index-publication.yml` only |

## 2026-09-03 publication batch (evidence)

See `registry/agent-runtime/authority/publication-batch-2026-09-03.v1.json`.

Raw `git push` was wrong transport before lease blocked it. Correct path: M8 after Lane 0 + policy + capability resolution.
