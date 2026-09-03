# AppBuilder `agentRuntime` worldview lane — collector specification

**Work package:** `agent-workstation-mcp-hub-index-v1`  
**Status:** IMPLEMENTATION TARGET — frozen against Cross-Agent `22ad7a3`  
**Owner repo:** `CG-AppBuilder-MCP` (implementation only — this spec lives in Cross-Agent as contract companion)

## Architectural sentence

Make the existing Capital Glass AI control plane deterministically aware of workstation/runtime state and enforce drift through **worldview → execution eligibility → protocol kernel → Lane 0/M8**.

## Frozen upstream contract (do not mutate)

| Artifact | Commit |
| --- | --- |
| Lane I/O contract | `CapitalGlass-Cross-Agent/registry/agent-runtime/authority/worldview-lane-agent-runtime.v1.json` @ `22ad7a3` |
| Drift vocabulary | `registry/agent-runtime/schema/drift-class.v1.json` |
| P0–P7 gates | `registry/agent-runtime/authority/platform.v1.json` |
| Platform integration | `registry/agent-runtime/authority/platform-integration.v1.json` |
| Output JSON Schema | `registry/agent-runtime/schema/agent-runtime-worldview-lane-output.v1.json` |

Do **not** change `22ad7a3` unless implementation exposes an actual contract defect.

## Sequence (locked)

```
22ad7a3  LOCAL AUTHORITY CONTRACT (Cross-Agent)
    ↓
THIS SPEC
    ↓
admitted isolated AppBuilder worktree
    ↓
collectAgentRuntimeLane() implementation
    ↓
collectAuthorityLanes() + DAG registration
    ↓
drift → deriveAuthorityVerdicts() → executionEligibility
    ↓
P0–P7 milestone evidence profile (sdlc:milestone:status)
    ↓
three-machine baseline proof
    ↓
M8 publication
```

---

## Five boundaries (non-negotiable)

### 1. Collector is read-only

`collectAgentRuntimeLane()` **consumes**:

- Cross-Agent logical authority (`registry/agent-runtime/` — sibling checkout or Hub failover mirror)
- Machine-local **observations** (harvest receipts, peer-live-proof, settings hash probes, MCP surface checks)

It **must not**:

- repair drift
- run bootstrap (`claude40:bootstrap-preflight`, etc.)
- acquire mutation leases
- publish to Hub/GitHub
- admit missions or sessions

### 2. Worldview owns convergence

The collector returns **verified values + drift findings** in a lane snapshot.

Existing spine derives outcomes:

```
collectAuthorityLanes()
        ↓
deriveAuthorityVerdicts()     ← scripts/worldview/lib/derive-verdicts.mjs
        ↓
buildAuthorityConvergenceReceipt()
        ↓
executionEligibility GO | NO_GO | INDETERMINATE
```

The collector **does not** set `executionEligibility`.

### 3. Kernel / Lane 0 remain enforcement

- **No** new admission vocabulary
- **No** `agent_runtime_resolve()` or second session front door
- **No** lease acquisition in the collector
- Lane 0 + Agent Protocol Kernel consume `executionEligibility` downstream

### 4. Milestone remains derived

P0–P7 are an **evidence profile** consumed by:

```bash
npm run sdlc:milestone:status -- --milestone CG_AGENT_RUNTIME_DETERMINISM_V1 --json
```

The collector **never** writes lifecycle state, closeout milestone fields, or manual `*_PASS` flags.

### 5. Generation mismatch fails closed

| Rule | Behavior |
| --- | --- |
| `observationGeneration !== authorityGeneration` | Observation **rejected** — cannot satisfy current authority |
| Drift code | `DRIFT_AUTHORITY_GENERATION` and/or `DRIFT_OBSERVATION_STALE` |
| Lane impact | `executionImpact: HOLD` when observation would otherwise pass |

An observation stamped at generation **G−1** must not satisfy authority at **G**.

---

## Function signature (AppBuilder)

**Target file:** `scripts/worldview/lib/lanes/agent-runtime-lane.mjs`

```javascript
/**
 * Read-only agentRuntime worldview lane collector.
 * @param {object} options
 * @param {string} [options.repoRoot]
 * @param {Record<string, object>} [options.relevanceMap]
 * @param {string} [options.workPackageId]
 * @param {string} [options.crossAgentRegistryRoot] — override for tests
 * @param {string} [options.harvestReceiptPath] — override for tests
 * @returns {object} Standard lane envelope + snapshot (see output schema)
 */
export function collectAgentRuntimeLane(options = {}) {}
```

**Registration:** `scripts/worldview/lib/collect-authority-lanes.mjs`

```javascript
import { collectAgentRuntimeLane } from "./lanes/agent-runtime-lane.mjs";

const LANE_COLLECTORS = {
  // ...existing nine lanes...
  agentRuntime: (ctx) => collectAgentRuntimeLane(ctx),
};
```

Return value must include `lanes.agentRuntime` in `buildAuthorityConvergenceReceipt({ lanes })`.

---

## Collector output shape

Canonical schema: `registry/agent-runtime/schema/agent-runtime-worldview-lane-output.v1.json`

### Extended snapshot (logical contract)

```json
{
  "lane": "agentRuntime",
  "schemaVersion": "agent-runtime-worldview-lane-v1",
  "authorityGeneration": {},
  "observationGeneration": {},
  "machine": {},
  "client": {},
  "profile": {},
  "baseline": {
    "verdict": "PASS|FAIL|UNKNOWN|NOT_CHECKED|UNAVAILABLE"
  },
  "capabilities": [],
  "providers": [],
  "mcpBindings": [],
  "settings": {},
  "dependencies": {},
  "drift": [],
  "blockingDriftCount": 0,
  "fatalDriftCount": 0,
  "laneVerdict": "PASS|FAIL|UNKNOWN|NOT_CHECKED|UNAVAILABLE",
  "executionImpact": "NONE|DEGRADED|HOLD"
}
```

### Standard worldview lane envelope (required for `derive-verdicts`)

The collector **also** returns the same top-level fields as other lanes (`mcp-health-lane.mjs`, `git-lane.mjs`):

| Field | Source |
| --- | --- |
| `laneId` | `"agentRuntime"` |
| `resolutionStatus` | `RESOLVED` unless load error → `ERROR` / missing authority → `UNAVAILABLE` |
| `relevance` | From `relevanceForLane("agentRuntime", relevanceMap)` |
| `lineageStatus` | `ALIGNED` unless generation/drift mismatch → `DRIFT` |
| `freshnessStatus` | `FRESH` unless stale observation → `STALE` |
| `authoritySourceRef` | Path/ref to Cross-Agent authority generation used |
| `artifactDigest` | Hash of authority generation + accepted observation bundle |
| `generation` | Current `authorityGeneration.generationId` |
| `observedAt` | ISO timestamp |
| `operatorRequired` | `true` when `executionImpact === "HOLD"` |
| `snapshot` | Extended output object above |

### Mapping snapshot → convergence

| snapshot | derive-verdicts effect (when `relevance === REQUIRED`) |
| --- | --- |
| `executionImpact: NONE` | Does not block convergence |
| `executionImpact: DEGRADED` | Advisory only unless paired with blocking drift |
| `executionImpact: HOLD` | `laneBlocksConvergence()` true → `executionEligibility: NO_GO` |
| `fatalDriftCount > 0` | `executionImpact: HOLD` |
| `laneVerdict: FAIL` | `lineageStatus: DRIFT`, convergence blocked |
| `laneVerdict: UNAVAILABLE` | `lineageStatus: UNAVAILABLE`, convergence blocked |

Extend `buildLaneBlocker()` in `derive-verdicts.mjs` for `laneId === "agentRuntime"` with codes from Cross-Agent drift vocabulary (e.g. `DRIFT_BASELINE_FOUNDATION_MISSING`).

---

## Input loading (read-only helpers)

Suggested lib modules under `scripts/worldview/lib/agent-runtime/`:

| Module | Responsibility |
| --- | --- |
| `load-cross-agent-authority.mjs` | Read authority JSON from sibling `CapitalGlass-Cross-Agent/registry/agent-runtime/` or env override; compute `authorityGeneration` digest |
| `load-harvest-observation.mjs` | Read latest local harvest receipt (when present); validate generation stamp |
| `resolve-local-machine.mjs` | Map peer-live-proof → `cg_nimo_01` \| `wesley_work` \| `ryzen9desk` |
| `evaluate-lane-drift.mjs` | Apply drift codes from Cross-Agent schema only — **no new codes in AppBuilder** |
| `evaluate-local-baseline.mjs` | Local machine foundation checks (hooks, behavior hash, kernel package hash) |

**Forbidden:** any function named `agent_runtime_resolve`, `resolveAgentRuntime`, or session admission entrypoint.

---

## P0 — `AI_PLATFORM_BASELINE_CONVERGENCE` (special treatment)

P0 is **not** satisfied by a single-machine collector call alone.

### Local collector responsibility (per machine)

Each `collectAgentRuntimeLane()` run on a governed host emits:

```json
"baseline": {
  "verdict": "PASS|FAIL|...",
  "foundationGeneration": {
    "agentProtocolKernel": "<digest>",
    "governanceContract": "<digest>",
    "worldviewContract": "<digest>",
    "lane0Contract": "<digest>",
    "m8Contract": "<digest>",
    "globalBehaviorContract": "<digest>",
    "requiredHookContract": "<digest>",
    "requiredBaseMcpSurface": "<digest>"
  }
}
```

### Estate-wide P0 proof (separate evaluator)

**Target:** `scripts/agent-runtime/evaluate-baseline-convergence.mjs` (milestone evidence — not the lane collector)

Compare harvest/lane snapshots from **all three** authorized machines:

```
NIMO.foundationGeneration.agentProtocolKernel
    ==
WESLEY_WORK.foundationGeneration.agentProtocolKernel
    ==
RYZEN9DESK.foundationGeneration.agentProtocolKernel
```

Same equality required for all eight foundation components listed in `baseline-convergence.v1.json`.

**Then** evaluate profile separately:

| Case | Verdict |
| --- | --- |
| Identical foundation + different `gpuExecutor` / GPU capability | **ACCEPTED** profile difference |
| Missing hook on Ryzen with correct profile flags | **BLOCKING** — not profile |
| Stale foundation generation with current profile | **BLOCKING** — `DRIFT_PROFILE_PARITY_VIOLATION` / generation drift |

**Core invariant (executable):**

> A role difference can add or remove profile capabilities; it **cannot** waive the common AI foundation.

---

## P0–P7 promotion gates (milestone evidence only)

| Phase | Gate | Primary evidence source |
| --- | --- | --- |
| P0 | `AI_PLATFORM_BASELINE_CONVERGENCE` | Three-machine foundation equality + per-machine PASS |
| P1 | `RUNTIME_AUTHORITY_READY` | Cross-Agent registry + lane contract @ `22ad7a3` |
| P2 | `RUNTIME_CONTRACT_READY` | Launch/settings/dependency contracts |
| P3 | `ESTATE_OBSERVED` | Harvest receipts on all authorized machines |
| P4 | `DRIFT_ENFORCEMENT_READY` | Drift → convergence → HOLD path wired |
| P5 | `READ_PLANE_READY` | Hub slices + determinism gate |
| P6 | `GITHUB_MUTATION_PLANE_READY` | M8 + adversarial transport/lease tests |
| P7 | `SESSION_ADMISSION_READY` | Kernel consumes eligibility; Lane 0 per-repo lease |

Final derived state: `CG_AGENT_RUNTIME_DETERMINISM_V1_PASS` — **never** written by collector.

---

## Negative controls (required before P0 PASS)

| # | Scenario | Expected drift / outcome |
| --- | --- | --- |
| 1 | Remove required hook on Ryzen | `DRIFT_BASELINE_FOUNDATION_MISSING` → `executionImpact: HOLD` → `executionEligibility: NO_GO` |
| 2 | Ryzen has correct profile but stale foundation generation | `DRIFT_PROFILE_PARITY_VIOLATION` / generation drift → HOLD |
| 3 | NIMO/Ryzen identical foundation, GPU capability differs | **ACCEPTED** profile difference — no baseline drift |
| 4 | Use observation from generation G−1 against authority G | Observation rejected; `DRIFT_AUTHORITY_GENERATION` |
| 5 | AppBuilder leased by session A; session B mutates AppBuilder | AppBuilder DENIED; Cross-Agent + PG **independently** evaluated |
| 6 | Raw `git push` attempted | `DRIFT_GITHUB_PLANE_BYPASS` — out of lane collector scope but P6 adversarial |

**Test target:** `scripts/tests/run-agent-runtime-worldview-lane.test.mjs`

---

## Architectural regression tests (mandatory)

Before P4/P7 promotion, CI must assert:

```javascript
// 1. No parallel orchestrator
assert.noImplementationNamed('agent_runtime_resolve');

// 2. Lane registered through existing collector
assert.collectAuthorityLanesIncludes('agentRuntime');

// 3. Single resolver front door
assert.executionContextResolveUsesResolveWorldviewOnly();
// npm run execution-context:resolve → resolveWorldview → collectAuthorityLanes

// 4. No milestone writes from lane
assert.collectAgentRuntimeLaneDoesNotWriteMilestoneState();
```

Grep guard (suggested npm script `guard:no-agent-runtime-resolve`):

```bash
! rg -l 'agent_runtime_resolve|resolveAgentRuntime' scripts/ --glob '!**/run-agent-runtime-worldview-lane.test.mjs'
```

---

## DAG registration

Add to `scripts/worldview/lib/default-authority-dag.mjs`:

```javascript
{
  nodeId: "agent-runtime",
  role: DAG_NODE_ROLE.UPSTREAM_AUTHORITY,
  artifactRef: "agent-runtime-authority-snapshot",
  readOnly: true,
},
// edge: execution-context-resolve READS agent-runtime
```

---

## Integration with existing spine (reference)

```
collectAuthorityLanes()
        │
        ├── git
        ├── runtimePosture
        ├── mcpHealth
        ├── governance
        ├── env
        ├── milestone
        ├── pi
        ├── hub
        ├── cache
        └── agentRuntime          ← ADD (this spec)
                 │
                 ▼
       deriveAuthorityVerdicts()
                 │
                 ▼
       executionEligibility
                 │
                 ▼
       Agent Protocol Kernel
                 │
                 ▼
             Lane 0 / M8
```

**Existing entrypoint unchanged:**

```bash
npm run execution-context:resolve -- --work-package=<id> --json
```

Implementation inside: `resolveWorldview()` → `collectAuthorityLanes()` → `buildAuthorityConvergenceReceipt()`.

---

## Worktree implementation checklist

When AppBuilder admission permits an isolated worktree:

- [ ] `collectAgentRuntimeLane()` read-only collector
- [ ] Register in `collect-authority-lanes.mjs`
- [ ] `relevanceForLane("agentRuntime", …)` in `lane-relevance.mjs`
- [ ] `agentRuntime` blocker codes in `derive-verdicts.mjs`
- [ ] Include `agentRuntime` in `computeWorldviewDigest()`
- [ ] DAG node + edge in `default-authority-dag.mjs`
- [ ] `evaluate-baseline-convergence.mjs` for P0 estate proof
- [ ] Negative control test suite
- [ ] `guard:no-agent-runtime-resolve` script
- [ ] Register P0–P7 evidence profile in milestone engine
- [ ] **Do not** touch canonical leased checkout

---

## Related authority

- Cross-Agent platform integration: `PLATFORM-INTEGRATION-ARCHITECTURE.md`
- AppBuilder worldview: `scripts/worldview/lib/resolve-worldview-lib.mjs`
- AppBuilder derive verdicts: `scripts/worldview/lib/derive-verdicts.mjs`
- AppBuilder execution context CLI: `scripts/execution-context/resolve-execution-context.mjs`
- Milestone engine: `docs/work-packages/canonical-milestone-execution-state-machine-v1.md`
