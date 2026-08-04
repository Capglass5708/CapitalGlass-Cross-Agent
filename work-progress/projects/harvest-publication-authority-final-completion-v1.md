# Harvest publication authority — mission progress

**Mission ID:** `harvest-publication-authority-final-completion-v1`  
**Status:** Waves 8–10 implemented — regression + PR pending  
**Start verdict:** `WAVE7_ACCEPTED`

## Wave ledger

| Wave | Package | Verdict | Commit |
|------|---------|---------|--------|
| 8 | `harvest-publication-single-flight-v1` | `WAVE8_ACCEPTED` (pending commit) | — |
| 9 | `harvest-git-retention-enforcement-v1` | `WAVE9_ACCEPTED` (pending commit) | — |
| 10 | `harvest-publication-authority-dogfood-v1` | `WAVE10_ACCEPTED` (pending commit) | — |

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

1. Three wave commits + push (`THREE_WAY_PUSH_APPROVED=YES`)
2. Full regression receipt
3. Security audit
4. PR create/update
5. `MERGE_READY` decision packet
