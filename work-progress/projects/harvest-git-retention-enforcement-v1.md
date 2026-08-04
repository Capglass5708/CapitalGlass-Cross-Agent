# Wave 9 — harvest Git retention enforcement

**Work package:** `harvest-git-retention-enforcement-v1`  
**Target:** `HARVEST_GIT_RETENTION_PASS`  
**Verdict:** `WAVE9_ACCEPTED`

## Scope

- Compact Git run directory policy: manifest + pointer + optional summary
- Forbidden payload/runtime artifact detection
- Phase C pre-commit retention gate + compact manifest materialization
- Tests: `test:harvest:git-retention` (12/12)

## Gates

All `GIT_*` acceptance gates pass (see test output).
