# AppBuilder implementation wave 1 — agentRuntime lane

**Work package:** `agent-workstation-mcp-hub-index-v1`  
**Authority chain:** `22ad7a3` (integration) → `e545ab3` (collector spec) → this document  
**Prerequisite:** admitted isolated AppBuilder worktree — **not** leased canonical checkout

## Architectural sentence

Platform code existing on a machine is **insufficient**. The machine must prove a **current, observed, generation-equal** realization of the common AI foundation before the estate admits it as converged.

## Responsibility boundary (locked)

| Layer | Role |
| --- | --- |
| `22ad7a3` | Architectural authority contract |
| `e545ab3` | Implementation-facing collector/output contract |
| Cross-Agent | Defines expected truth and schema |
| AppBuilder | Observes and evaluates |
| Worldview | Converges |
| `execution-context:resolve` | Single resolver |
| Agent Protocol Kernel / Lane 0 | Admission and enforcement |
| M8 | Governed GitHub mutation |
| Milestone engine | Derives P0–P7 state |

## Wave 1 scope — exactly A through G

| Step | Deliverable | Must not |
| --- | --- | --- |
| **A** | `scripts/worldview/lib/lanes/agent-runtime-lane.mjs` | bootstrap, repair |
| **B** | Register `agentRuntime` in `collectAuthorityLanes()` | new front door |
| **C** | `agent-runtime` node/edges in authority DAG | |
| **D** | REQUIRED/HOLD semantics in `derive-verdicts.mjs` | new admission vocabulary |
| **E** | `scripts/agent-runtime/evaluate-baseline-convergence.mjs` | collapse verdict states |
| **F** | Register `CG_AGENT_RUNTIME_DETERMINISM_V1` milestone profile | write lifecycle state |
| **G** | Adversarial + architectural regression tests | |

**Forbidden in wave 1:** bootstrap machines, repair drift in collector/evaluator, `agent_runtime_resolve()`.

## First proof target (before remediation)

The system must correctly report:

```
RYZEN9DESK                         = INCOMPLETE
AI_PLATFORM_BASELINE_CONVERGENCE   = HOLD
executionEligibility               = NO_GO  (baseline HOLD — via worldview blockers)
```

Machine remediation is a **separate admitted operation** after the evaluator proves it can detect the defect.

If the first three-machine run passes P0 before Ryzen is repaired → **evaluator defect**.

## Ideal proof sequence

```
e545ab3 contract
        ↓
AppBuilder implementation (A–G)
        ↓
harvest NIMO / WESLEY_WORK / RYZEN
        ↓
P0 expected HOLD
        ↓
prove exact realization drift
        ↓
authorized convergence repair
        ↓
re-harvest (same authority generation)
        ↓
P0 PASS
        ↓
P1–P7
        ↓
CG_AGENT_RUNTIME_DETERMINISM_V1_PASS (derived)
        ↓
M8 publication
```

## P0 split (locked)

**Per-host collector** reports HOST OBSERVATION only:

- machine
- authority generation
- foundation component generations
- local realization
- runtime drift
- freshness

**Estate evaluator** proves cross-machine convergence — see `registry/agent-runtime/authority/evaluate-baseline-convergence.v1.json`.

Profiles apply **only after** P0 PASS.

## Estate evaluator — three cases (frozen)

| Case | Condition | Outcome |
| --- | --- | --- |
| **1. SAME + CURRENT** | All three machines: same `foundationGeneration` digest, observation accepted at current authority generation, fresh | Component → **PASS** |
| **2. DIFFERENT** | Digests differ across machines at same authority generation | **DRIFT_BASELINE_GENERATION_MISMATCH** → gate **HOLD** |
| **3. MISSING / UNAVAILABLE / NOT_CHECKED** | Any required component not positively observed | **NOT PASS** — **do not** collapse into case 2 |

**Preserve verdict states:** `PASS`, `FAIL`, `UNKNOWN`, `NOT_CHECKED`, `UNAVAILABLE` through P0.

| Situation | Verdict | Drift |
| --- | --- | --- |
| Ryzen hook missing | FAIL | `DRIFT_BASELINE_FOUNDATION_MISSING` |
| Ryzen never harvested | NOT_CHECKED | (no generation mismatch code) |
| Probe error | UNKNOWN | |
| Host unreachable | UNAVAILABLE | |

## Publication

`22ad7a3` + `e545ab3` + wave-1 contract docs form a coherent **local authority chain**. M8 publication waits for governed path and repo admissions.

## References

- Collector spec: `APPBUILDER-AGENT-RUNTIME-LANE-COLLECTOR-SPEC.md`
- Output schema: `registry/agent-runtime/schema/agent-runtime-worldview-lane-output.v1.json`
- Estate evaluator contract: `registry/agent-runtime/authority/evaluate-baseline-convergence.v1.json`
