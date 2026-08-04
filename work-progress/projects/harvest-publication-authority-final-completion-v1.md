# Harvest publication authority — mission progress

**Mission ID:** `harvest-publication-authority-final-completion-v1`  
**Status:** Waves 8–10 implemented — regression + PR pending  
**Start verdict:** `WAVE7_ACCEPTED`

## Wave ledger

| Wave | Package | Verdict | Commit |
|------|---------|---------|--------|
| 8 | `harvest-publication-single-flight-v1` | `WAVE8_ACCEPTED` | `19e63a8` |
| 9 | `harvest-git-retention-enforcement-v1` | `WAVE9_ACCEPTED` | `4674561` |
| 10 | `harvest-publication-authority-dogfood-v1` | `WAVE10_ACCEPTED` | `e946c8e` |

**Branch head:** `e946c8e` (pushed)

## Wave 8 — single-flight

- **Builder:** lock lib, schema, CLI, Phase B/C integration, subprocess contention tests
- **Critic:** locks under `_operations/locks`, exclusive `wx` create, stale recovery evidence retained
- **Verifier:** `test:harvest:single-flight` 10/10, gates `HARVEST_SINGLE_FLIGHT_PASS`

## Wave 9 — Git retention

- **Builder:** retention lib, CLI, Phase C pre-commit gate, compact manifest write
- **Critic:** historical trees warn-only; forbidden payloads blocked
- **Verifier:** `test:harvest:git-retention` 12/12, gates `HARVEST_GIT_RETENTION_PASS`

## Wave 10 — dogfood

- **Builder:** incident scenarios 1,2,4,5,8 + full lifecycle synthetic
- **Verifier:** `test:harvest:authority-dogfood` 6/6

## Next

1. ~~Three wave commits + push~~ **DONE** (`e946c8e`)
2. ~~Full regression receipt~~ **FULL_REGRESSION_PASS** (113 + 10 AppBuilder)
3. ~~Security audit~~ **SECURITY_AUDIT_PASS**
4. ~~PR create/update~~ PR #278 (AppBuilder), PR #4 (Cross-Agent)
5. **MERGE_READY** — awaiting operator approval
