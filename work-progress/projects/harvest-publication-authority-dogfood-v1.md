# Wave 10 — harvest publication authority dogfood

**Work package:** `harvest-publication-authority-dogfood-v1`  
**Target:** `HARVEST_AUTHORITY_DOGFOOD_PASS`  
**Verdict:** `WAVE10_ACCEPTED`

## Synthetic incidents proved

| Gate | Scenario |
|------|----------|
| `INCIDENT_1_TREADMILL_PREVENTED` | Git HEAD bump after Phase C; harvest stays `HARVEST_CURRENT` |
| `INCIDENT_2_PARTIAL_PUBLICATION_PREVENTED` | Incomplete L: blocks Phase B |
| `INCIDENT_4_LOW_QUALITY_BLOCKED` | Weak fixture fails knowledge gate |
| `INCIDENT_5_CONCURRENCY_PREVENTED` | Subprocess single-flight race |
| `INCIDENT_8_GIT_BLOAT_PREVENTED` | Autopsy file blocks retention |
| `FULL_LIFECYCLE_DOGFOOD_PASS` | End-to-end synthetic lifecycle operational |
| `UNCHANGED_REPUBLISH_NOOP_PASS` | Phase B rerun NOOP |
| `NO_EXISTING_HARVEST_REPUBLISHED` | Fixture-only synthetic harvest |

Tests: `test:harvest:authority-dogfood` (6/6)
