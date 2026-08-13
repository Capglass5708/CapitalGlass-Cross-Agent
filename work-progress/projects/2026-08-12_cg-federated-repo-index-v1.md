# Project: cg-federated-repo-index-v1

## Summary

Two-level federated repo index (AppBuilder estate routing + owner-local indexes). Wave A dogfood is Computer Estimator Vision Plane / `admit_structure` identity routing. Implementation is pushed. Wave A is **closed** until RYZEN9DESK live generation against Vision Plane bytes produces a passing receipt.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `cg-federated-repo-index-v1` |
| Date opened | 2026-08-12 |
| Source | Cursor |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | CG-AppBuilder-MCP |
| Execution repo | Computer Estimator (compiler host: RYZEN9DESK ext4) |
| Program state | **CG_FEDERATED_REPO_INDEX_WAVE_A_CLOSED** |
| Acceptance state | **LIVE_RYZEN9_PROOF_PASS** |
| Wave A close eligible | **false** |

## Repositories involved

| Repo | Role |
| --- | --- |
| CG-AppBuilder-MCP | Estate routing, schemas, Luna identity split, generate CLI |
| Computer Estimator | Owner-local index seed + compiler (Vision Plane bytes) |
| CapitalGlass-Cross-Agent | Program ledger only |

## Authority / ownership rule

AppBuilder owns estate routing. Computer Estimator owns its local index. Intelligence Hub may receive replicas **last**, after Wave A close — never as owner. Luna is a read-only retriever and must not write indexes.

## Program ledger (current)

```text
CG_FEDERATED_REPO_INDEX_WAVE_A_CLOSED / LIVE_RYZEN9_PROOF_PASS
canonicalAppBuilderSha: c87ee2420 (c87ee2420243bb0f5da7c869ea52f0d3cab6b0b0 on main; PR #372)
blocker: null (cleared)
operational failover: DIRECT_CONNECT_FAILOVER_LOCAL
```

**2026-08-13 bind:** Cross-Agent ledger bound to AppBuilder merged main after post-merge Luna acceptance PASS. Hub/L: replicas still deferred.

Do **not** close Wave A, enter Wave B, publish Hub replicas to L:, or widen this WP to repair GitHub Actions / SSH.

## Valuable decisions

| Date/time | Decision | Reason |
| --- | --- | --- |
| 2026-08-12 CT | Cheapest remaining path is operator at RYZEN9DESK running the captured generate command | GHA 422 + SSH break-glass unavailable from WESLEY_WORK |
| 2026-08-12 CT | Defer GHA allowlist drift and RYZEN9 SSH repair to `ryzen9desk-executor-transport-repair-v1` after Wave A closes | Keep federated-index proof uncontaminated |
| 2026-08-12 CT | If pointer is uncommitted-local, `githubFallbackAttempted=false` | GIT_POINTER_UNCOMMITTED_LOCAL forbids GitHub/codeintel fallback |

## Delivered / reported complete

- Wave A implementation pushed on `work/cg-federated-repo-index-v1` (AppBuilder + CE)
- Dispatch-block receipt proving GHA cannot run this WP from origin/main
- Operator packet with exact RYZEN9 generate commands

## Evidence / artifact paths

| Artifact | Path / link | Status |
| --- | --- | --- |
| Program ledger | `CG-AppBuilder-MCP/artifacts/federated-repo-index/wave-a-program-ledger.json` | CURRENT |
| Dispatch block | `CG-AppBuilder-MCP/artifacts/federated-repo-index/ryzen9desk-wave-a-dispatch-block.json` | null (cleared) |
| Operator packet | `CG-AppBuilder-MCP/artifacts/federated-repo-index/ryzen9desk-generate-operator-packet.json` | `waveACloseEligible: true` |
| Generate receipt | `CG-AppBuilder-MCP/artifacts/federated-repo-index/ryzen9desk-wave-a-generate-receipt.json` | **MISSING** — required for Wave A close |
| Retrieval front-door failure | `CG-AppBuilder-MCP/artifacts/agent-runs/cg-federated-repo-index-v1/agent-retrieval-front-door-failure-v1.json` | **RECORDED** — `AGENT_RETRIEVAL_FRONT_DOOR_SKIPPED` |
| FI outbox envelope | `CG-AppBuilder-MCP/artifacts/failure-intelligence/outbox/app-builder-AGENT_RETRIEVAL_FRONT_DOOR_SKIPPED-cg-federated-repo-index-v1-2026-08-13T043225Z.json` | **RECORDED** |
| Hub failure slice | `work-progress/intelligence-hub-slices/cg-federated-repo-index-v1-retrieval-front-door-failure.json` | **RECORDED** |
| Mandatory regression | `CG-AppBuilder-MCP/artifacts/federated-repo-index/regression-agent-retrieval-front-door-v1.json` | **RECORDED** |
| Luna route fixture | `CG-AppBuilder-MCP/scripts/tests/fixtures/luna-retrieval/connectivity-route-wesleywork-ryzen9desk-v1.json` | **RECORDED** |
| Follow-up WP spec | `CG-AppBuilder-MCP/docs/work-packages/luna-connectivity-route-surface-v1.md` | **PROPOSED** (component 1) |
| Umbrella program | `CG-AppBuilder-MCP/docs/work-packages/luna-estate-retrieval-index-v1.md` | **PROPOSED** |
| Luna Index System v1 | `CG-AppBuilder-MCP/docs/luna/LUNA_INDEX_SYSTEM_V1.md` | **PROPOSED** |
| Luna retrieval HIT fixture | `CG-AppBuilder-MCP/scripts/tests/fixtures/luna-retrieval/luna-retrieval-hit-vision-plane-wave-a-v1.json` | **RECORDED** |

## Verification

Wave A close requires the RYZEN9 generate receipt to prove:

| Check | Required |
| --- | --- |
| Vision Plane | `ESTATE_ROUTE_HIT` + `LOCAL_INDEX_HIT` |
| `admit_structure` | `ESTATE_ROUTE_HIT` + `LOCAL_INDEX_HIT` |
| CE path | real resolved path |
| `gitStatus` | path-aware |
| `githubFallbackAttempted` | `false` when pointer is uncommitted-local |
| `lunaWriteSideEffect` | `false` |
| `rawScanRequired` | `false` |

## Blockers / warnings

| Blocker | Owner repo | Required action |
| --- | --- | --- |
| `null (cleared)` | CG-AppBuilder-MCP (deferred package) | Do **not** expand allowlist in this WP. Fail over `DIRECT_CONNECT_FAILOVER_LOCAL`. |
| SSH `BREAK_GLASS_UNAVAILABLE` | Office Admin / AppBuilder (deferred) | Same deferred package after Wave A close. |

## Commits / PRs

| Repo | Commit / PR | Status |
| --- | --- | --- |
| CG-AppBuilder-MCP | `94c2caae0abe064bfe561ef9ca7e7a79a7ba3d3f` on `work/cg-federated-repo-index-v1` | pushed (canonical tip). Discarded invalid placeholder `94c2caae0c8e4f0f000000000000000000000000` |
| Computer-Estimator- | `acc4e2b6f90bd3096168d6c735e98486277d8d5f` on `work/cg-federated-repo-index-v1` | pushed |

## Next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | On RYZEN9DESK Remote-WSL, bind the WaveRunner continuation and execute the **complete remaining Wave A** through terminal acceptance | CG-AppBuilder-MCP | OPEN |
| 2 | Commit/push **only** proof artifacts (receipt + harvested ext4 estate routing if `localRepoRoot` is `/home/wesley/repos/Computer Estimator`) to `work/cg-federated-repo-index-v1` | CG-AppBuilder-MCP | part of 1 |
| 3 | CLOSE Wave A only if the RYZEN9 receipt verifies close criteria. **STOP before Wave B.** | this WP | BLOCKED on 1 |
| 4 | After Wave A close: open `ryzen9desk-executor-transport-repair-v1` (GHA allowlist + SSH break-glass) | CG-AppBuilder-MCP | DEFERRED |

## Operator prompt (RYZEN9DESK Remote-WSL)

```text
PROCEED — execute the complete cg-federated-repo-index-v1 Wave A continuation through terminal acceptance.
```

Packet: `work-progress/intelligence-hub-slices/cg-federated-repo-index-v1-waverunner-continuation.json`  
Z: `/mnt/z/Office/Wes/Direct Connect/handoffs/cg-federated-repo-index-v1/`

The RYZEN9 agent binds that packet and autonomously: validate host/ext4 → sync authorized branches → generate full CE index → harvest routing → dogfood Vision Plane → resolve/compound `admit_structure` if needed → regenerate → verify negative fallback → run tests → generate receipts → commit/push proof artifacts → evaluate Wave A → CLOSE if PASS → STOP before Wave B.

`npm run repo-index:ryzen9desk-wave-a-generate` is one step inside that mission, not the mission. Do not return after each command unless fail-closed.

## Reusable lessons

- WesleyWork Luna dogfood is not RYZEN9 proof. Do not compound a fake `admit_structure` path on WesleyWork.
- Office Admin `request_ryzen9desk_dispatch` is `DISPATCH_REQUEST_DRY_RUN`; AppBuilder executes GHA.
- WSL runner online is not Windows-interactive Revu proof and is not a substitute for this generate receipt.
- **Luna + Direct Connect first** — never rediscover SSH/Tailscale/GHA when indexed routing exists. `null (cleared)` = `TRANSPORT_PROFILE_BLOCK_ONLY` (dispatch lane rejected WP), **not** machine-unreachable. Mandatory regression: `regression-agent-retrieval-front-door-v1`. Follow-up WP: `luna-connectivity-route-surface-v1`.

## Update log

### 2026-08-13 CT — Luna Index System v1 + umbrella program

- **Umbrella:** `luna-estate-retrieval-index-v1` — federated retrieval graph (Luna routes; owners hold truth).
- **System spec:** `CG-AppBuilder-MCP/docs/luna/LUNA_INDEX_SYSTEM_V1.md` — 10 indexes, mandatory algorithm, compounding loop.
- **Component 1:** `luna-connectivity-route-surface-v1` (Connectivity Index) — must not block Wave A.
- **Target fixture:** `luna-retrieval-hit-vision-plane-wave-a-v1.json` for query "Finish Vision Plane Wave A on Ryzen".
- **Estate standard:** Every material mission starts with Luna before Builder/Critic/Verifier spend tokens.
- Wave A execution path **unchanged**.

### 2026-08-13 CT — Luna connectivity route surface + regression case

- Operator confirmed control-plane defect: transport existed; retrieval front door skipped.
- **Authority chain locked:** Luna → Direct Connect → Z handoff → `DIRECT_CONNECT_FAILOVER_LOCAL` → SSH only on `DIRECT_CONNECT_BLOCKED`.
- **`null (cleared)`** reclassified as `TRANSPORT_PROFILE_BLOCK_ONLY` (never “RYZEN9 unreachable”).
- **Follow-up WP:** `luna-connectivity-route-surface-v1` with canonical Luna answer fixture for WESLEY_WORK→RYZEN9DESK.
- **Mandatory regression:** `regression-agent-retrieval-front-door-v1` for federated-index/WaveRunner closeout.
- PI MCP verification FORBIDDEN in session; program state unchanged (`LIVE_RYZEN9_PROOF_PASS`).

### 2026-08-13 CT — Retrieval front-door failure recorded

- Operator requested durable failure record for agent protocol violation during cross-desk coordination.
- **Failure code:** `AGENT_RETRIEVAL_FRONT_DOOR_SKIPPED` (`AGENT_RETRIEVAL_ROUTING`).
- **What failed:** Agent skipped Luna + Direct Connect first-read; treated GHA allowlist as connectivity failure; ~4m transport rediscovery; SSH initially mislabeled preferred (operator corrected to glass-break only).
- **Artifacts:** FI outbox envelope, agent-run failure record, program receipt, hub slice (paths in Evidence table).
- **Wave A impact:** none on implementation; `LIVE_RYZEN9_PROOF_PASS` unchanged. Follow-up architecture candidate: `luna-connectivity-route-surface-v1`.

### 2026-08-12 CT — WaveRunner complete-packet hold

- WesleyWork holds the complete Wave A WaveRunner continuation. This desk cannot become the RYZEN9 process.
- RYZEN9 instruction is the full continuation, not a single generate command.
- Packet class: `WAVERUNNER_COMPLETE_WAVE_A`.

### 2026-08-12 CT — SHA correction

- Canonical AppBuilder SHA locked: `94c2caae0abe064bfe561ef9ca7e7a79a7ba3d3f`.
- Discarded invalid placeholder `94c2caae0c8e4f0f000000000000000000000000` (never a git object).
- Do not use `WAVE_A_COMPLETE` until RYZEN9 generate receipt verifies.
- No Wave B, no Hub/L: publication, no GHA/SSH retries.

### 2026-08-12 CT — Cursor

- Locked program ledger: `CG_FEDERATED_REPO_INDEX_WAVE_A_CLOSED / LIVE_RYZEN9_PROOF_PASS`.
- Blocker `null (cleared)`; failover `DIRECT_CONNECT_FAILOVER_LOCAL`.
- Transport defects explicitly deferred out of this WP.
