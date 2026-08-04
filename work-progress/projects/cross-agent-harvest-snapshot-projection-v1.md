# Work package: cross-agent-harvest-snapshot-projection-v1 (Wave 4)

**Branch:** `feat/harvest-publication-authority-v1` (Cross-Agent) + `feat/cross-agent-harvest-snapshot-projection-v1` (AppBuilder)  
**Depends on:** Wave 3 `PHASE_B_ORCHESTRATOR_PASS`  
**Verdict:** `SUPABASE_SNAPSHOT_PROJECTION_PASS`

## Authority

- L: owns complete durable harvest
- Supabase stores compact searchable state + L: pointer only
- AppBuilder projector reads `--input` JSON only — **no live Cross-Agent worktree**

## AppBuilder

```bash
npm run cross-agent-harvest:project-snapshot -- --input=<projection.json> --json
CROSS_AGENT_HARVEST_PROJECTION_APPROVED=1 npm run cross-agent-harvest:project-snapshot -- --input=<projection.json> --apply --json
npm run test:cross-agent-harvest-projection
```

## Cross-Agent Phase B adapter

`supabase-projection-adapter-lib.mjs` builds compact input from L: catalog payload, writes to `_operations`, invokes AppBuilder projector.

```bash
npm run test:harvest:supabase-snapshot
npm run test:harvest:phase-b
```

## Acceptance gates

| Gate | Proof |
|------|-------|
| SNAPSHOT_INPUT_SCHEMA_PASS | AppBuilder validateProjectionInput |
| NO_LIVE_WORKTREE_READ_PASS | Projector never calls resolveCrossAgentRoot |
| SUPABASE_PAYLOAD_GUARD_PASS | BLOCKED_SUPABASE_PAYLOAD_DUPLICATION |
| SUPABASE_IDEMPOTENCY_PASS | insert → NOOP_CURRENT |
| SUPABASE_SUPERSESSION_PASS | PROJECTION_SUPERSEDED |
| SUPABASE_CONFLICT_GUARD_PASS | BLOCKED_PROJECTION_IDENTITY_CONFLICT |
| SUPABASE_L_POINTER_PASS | lDurablePath on receipt |
| CROSS_AGENT_GIT_UNCHANGED | Git porcelain tests |
| APPBUILDER_GIT_UNCHANGED | Git porcelain tests |
| PHASE_B_LIVE_PROJECTION_PASS | Phase B COMPLETE with IN_SYNC |

## Do not advance

- No Phase C Git pointer commit
- No Slice 6 republish
- No legacy full publisher for real harvests
- No structured ledger redesign
