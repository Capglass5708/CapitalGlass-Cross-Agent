# Wave 8 — harvest publication single-flight

**Work package:** `harvest-publication-single-flight-v1`  
**Target:** `HARVEST_SINGLE_FLIGHT_PASS`  
**Verdict:** `WAVE8_ACCEPTED`

## Scope

- `harvest-publication-lock-v1` schema and lock lib under L:`_operations/locks/harvest-publication/`
- Atomic exclusive `lock.json` creation (`wx`)
- Phase B and Phase C scoped locks with post-lock reread / `NOOP_CURRENT`
- Subprocess contention via `lock-worker.mjs`
- Tests: `test:harvest:single-flight` (10/10)

## Gates

All `SINGLE_FLIGHT_*` acceptance gates pass (see test output).
