# Project: three-way-agent-improvement-intelligence-v1

## Summary

Three-way agent improvement intelligence program — all scoped PRs merged; awaiting hub publication gates.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `three-way-agent-improvement-intelligence-v1` |
| Owner repo | CG-AppBuilder-MCP |
| Coordination pointer | `work-progress/pointers/three-way-agent-improvement-intelligence-v1.json` |
| Status | **SLICE6_RUNNER_VERSION_FAIL** |

## Verdict lineage

| Verdict | When |
| --- | --- |
| Previous | `MERGED_PENDING_SLICE6_PUBLICATION` |
| Current | **HOLD** — run `30861642734` failed (runner 2.323.0 / node24) |

## Publication (blocked @ WESLEYDESK)

| Field | Value |
| --- | --- |
| Target SHA | `3e51aa754576f7d148901e440365f714f56be455` |
| Failed run | `30861642734` — conclusion **failure** |
| Blocker | WESLEYDESK runner must be **2.336+**; complete AppBuilder clone |

## Gates (not complete)

1. Publication workflow → **FAIL** (30861642734)
2. Layer parity → not run
3. Post-publication blind retrieval → not run
4. Live idempotency → not run

## Merge stack (complete)

| Order | Repo | PR | Merge commit |
| --- | --- | --- | --- |
| 1 | CG-Platform-Governance-MCP | #15 | `6c44cbc` |
| 2 | CapitalGlass-Cross-Agent | #2 | `990abe9` |
| 3 | CG-Platform-Governance-MCP | #16 | `270148c` |
| 4 | CG-Failure-Intelligence-MCP | #12 | `0136815` |
| 5 | CG-AppBuilder-MCP | #277 | `49aa77f` |
| 6 | CapitalGlass-Cross-Agent | #3 | `22c8704` |

Receipt: `artifacts/agent-runs/three-way-agent-improvement-intelligence-v1/merge-completion-receipt-v1.json`

## Publication (superseded — see blocked section above)

Historical note: prior draft claimed operational; superseded by `harvest-2026-08-03-direct-connect-slice6-autopsy-v1`.

## Gates (historical draft removed)

## Not claimed

- `AUTO_PUBLISHER_V1_1_ACTIVE` (scheduled publisher — separate work package)

## Recorded fixes

- Publication idempotency fixture PASS
- Deterministic UUID v5 harvest artifact IDs
- FI outcomes conflict markers removed; FI `npm test` 72/72 PASS

## Required labels (honest)

| Label | Meaning |
| --- | --- |
| `PREPUBLICATION_BLIND_RETRIEVAL_FIXTURE_PASS` | Fixture-only — not post-publication IH acceptance |
| `PUBLICATION_IDEMPOTENCY_PASS` | Requires unchanged replay counters |
| `IMP-0001..0004` | Immutable via allocator and manifest/index |

## Do not advance

- ~~`THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL` until all four publication gates pass~~ **CLEARED** @ `acd94ba` (see slice6-closeout-receipt-v1.json)
- Re-dispatch cancelled workflow run `30861202361`
