# autonomous-sdlc-durability-friction-hardening-v1

**Status:** PLANNED — **blocked on** `estate-hot-cache-layer-alignment-v1`  
**Mission class:** `MILESTONE_WAVE`  
**Owner repo:** `CG-AppBuilder-MCP`  
**Coordination:** `CapitalGlass-Cross-Agent` (receipts / harvest pointers only if contracts change)  
**Provenance:** `harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1` (ROI backlog + open blocker `uh-z-drvfs-publish-eperm-v1`)

## End state (one sentence)

An **already-authorized** milestone reaches **`DURABLE_COMPLETE`** without routine operator rescue on: WSL drvfs Z publish, benign agent-run artifact dirt, redundant push approval, async test regressions, or stale index freshness after a publication follow-up commit.

## Path under hardening

```text
authorized milestone → execute → publish → push → refresh index → prove freshness → DURABLE_COMPLETE
```

All five deliverables are **one wave** — failures on the same path, not unrelated fixes.

## In scope (single MILESTONE_WAVE)

| # | Deliverable | Implementation bar | Closes |
| --- | --- | --- | --- |
| 1 | **drvfs-safe Z publish fallback** | `union-publish.mjs` detects drvfs `/mnt/z`; safe copy (`cp -r` or equivalent); verify `promoteZAiCacheRelease` / CURRENT | `uh-z-drvfs-publish-eperm-v1` |
| 2 | **Artifact hygiene preflight** | Before `sdlc:cursor:execute`, detect/manage untracked `artifacts/agent-runs/*` — no silent `BLOCK_BASELINE_DIRTY` | `gmp-uh-artifact-dirty-block` |
| 3 | **Push approval autonomy** | **Not docs-only.** Authorized milestone satisfies `THREE_WAY_PUSH_APPROVED` (or equivalent) from authorization context — no second operator prompt | ROI rank 3 |
| 4 | **Missing-await regression guard** | Lint, typed wrapper, or test rule for `runSdlcCursorPipeline` in same wave | `WM-UH-001` / `ED-UH-003` |
| 5 | **Index freshness auto-repair** | If Hub publication advances Git and HEAD ≠ last published SHA, orchestrator runs `index:publish` + `index:freshness-gate` (or fails closed) **before** claiming `DURABLE_COMPLETE` | Learned from `93e91fa` → `73b2fe2` drift |

## AMCR regression gate (proof wave — mandatory)

Proof wave receipt must record **all** of the following as `false` / `0`:

| Metric | Required value | Meaning |
| --- | --- | --- |
| `operatorRescueCount` | `0` | No manual cp, tree cleanup, re-push approval, or index republish by operator |
| `humanKnowledgeLeak` | `false` | No durable truth only in chat; receipts + git authority |
| `agentStopsBeforeDurableCloseout` | `false` | No stop at READY / tests-only / harvest-recorded-only |
| `falsePass` | `false` | No DURABLE_COMPLETE without full path proof |

**Acceptance:** Wave is **not** complete when each fix passes in isolation. Must prove the **entire path** under conditions that previously required intervention:

- drvfs Z publication from WSL
- benign artifact dirt in tree
- inherited push authorization (no redundant prompt)
- async execution correctness
- Git advancing after Hub publication → freshness restored automatically

## Proof commands (indicative)

```bash
npm run test:sdlc-protocol-cursor
npm run sdlc:cursor:execute -- --work-package=<proof-wp> --closeout=<path> --json
# Receipt: verdict === DURABLE_COMPLETE, AMCR fields above, distinctValidSuppressed === 0
```

## Explicitly out of scope

| Work package | Items |
| --- | --- |
| `gold-mine-projection-schema-hardening-v1` | 14 Gold Mine projection warnings (#7–12) — warn-only, do not mix into this wave |
| Operator lane | Prompt harvest review (`PROMPT_HARVEST_PENDING_REVIEW`, 9 candidates) |
| `CG-Platform-Governance-MCP` | Governance authority merge |
| Estate | Z mirror parity when Z mountable; **estate hot-cache alignment is precursor WP, not in this wave** |

## Locked execution order (suite)

1. **`estate-hot-cache-layer-alignment-v1`** — clear `layerAlignment: DRIFT`
2. **`autonomous-sdlc-durability-friction-hardening-v1`** — this wave
3. **`gold-mine-projection-schema-hardening-v1`** + separate operator/authority lanes

## Hub seeds (published L:)

- `IH-SDLC-DURABLE-EXECUTE-001` — runbook candidate
- `IH-Z-DRVFS-PUBLISH-001` — failure-pattern candidate (closes when #1 ships)

## Do not advance

- Claim wave complete without AMCR gate fields on durability receipt
- Merge Gold Mine schema cleanup into this milestone
- Skip estate alignment and run proof wave under `layerAlignment: DRIFT`

## Update notes

- **2026-08-07:** Charter locked post `harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1` `DURABLE_COMPLETE` @ `73b2fe2`. AMCR gates added per operator autonomy-lane requirement.
