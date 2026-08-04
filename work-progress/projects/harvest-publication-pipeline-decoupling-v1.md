# Work package: harvest-publication-pipeline-decoupling-v1 (Wave 3)

**Branch:** `feat/harvest-publication-authority-v1`  
**Depends on:** Wave 2 `L_DURABLE_BUNDLE_PUBLISHER_PASS`  
**Verdict:** `PHASE_B_ORCHESTRATOR_PASS`

## Lifecycle correction

Phase B and Phase C remain separate:

| Phase | Actions | Git |
|-------|---------|-----|
| **B** | L: → Z: → Supabase → verify → L: `_operations` receipt + pointer **candidate** | unchanged |
| **C** | Read candidate → validate → commit `harvest-publication-pointer-v1.json` | separate commit |

`receiptCommit` stays `null` until Phase C.

## Commands

```bash
npm run harvest:run-phase-b -- --harvest-id=<id> --payload-hash=<sha256:...> --json
npm run harvest:publish-intelligence-full -- --pipeline=phase-b-v2 --harvest-id=<id> --payload-hash=<sha256:...> --json
npm run harvest:materialize-pointer -- --harvest-id=<id> --payload-hash=<sha256:...> --dry-run
npm run test:harvest:phase-b
```

Legacy pipeline (prohibited for real harvest publication until Wave 10):

```bash
npm run harvest:publish-intelligence-full -- --pipeline=legacy --harvest-id=<id>
```

## Modules

| Module | Role |
|--------|------|
| `phase-b-publication-orchestrator-lib.mjs` | Injectable orchestrator |
| `publication-layer-verdict-lib.mjs` | Layer state + Phase B verdicts |
| `publication-pointer-candidate-lib.mjs` | L: pointer candidate writer |
| `z-cache-publication-adapter-lib.mjs` | Z: from L: identity |
| `supabase-projection-adapter-lib.mjs` | Compact Supabase projection |
| `publish-intelligence-phase-b-lib.mjs` | `publish-intelligence-full` phase-b-v2 entry |

## Acceptance gates

| Gate | Proof |
|------|-------|
| PHASE_B_L_FIRST_PASS | L: durable always first stage |
| PHASE_B_Z_FROM_L_PASS | Z adapter input is L: context only |
| PHASE_B_SUPABASE_COMPACT_PASS | No payload bodies in projection |
| PHASE_B_GIT_UNCHANGED | Git porcelain unchanged |
| PHASE_B_POINTER_CANDIDATE_PASS | Candidate on L: with `receiptCommit: null` |
| PHASE_B_NO_FALSE_OPERATIONAL | Required failures → DEGRADED/BLOCKED |
| PHASE_B_RESUME_PASS | Interrupted downstream resumes without L: republish |
| PHASE_B_NOOP_PASS | Identical rerun → `NOOP_CURRENT` |
| PHASE_B_HEAD_INDEPENDENT_PASS | `authoritySourceCommit` from manifest |
| LEGACY_PIPELINE_NOT_ACTIVATED | Default legacy; real harvests not republished |

## Do not advance (Wave 3)

- Do not auto-run Phase C (`materialize-publication-pointer` validates only)
- Do not republish Slice 6 or historical harvests
- Do not call `index:publish`, ledger ingest, or legacy full publish for real harvests
