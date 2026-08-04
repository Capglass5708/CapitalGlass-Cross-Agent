# Project: three-way-agent-improvement-intelligence-v1

## Summary

Three-way agent improvement intelligence program — all scoped PRs merged; awaiting hub publication gates.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `three-way-agent-improvement-intelligence-v1` |
| Owner repo | CG-AppBuilder-MCP |
| Coordination pointer | `work-progress/pointers/three-way-agent-improvement-intelligence-v1.json` |
| Status | **THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL** |

## Verdict lineage

| Verdict | When |
| --- | --- |
| Previous | `MERGED_PENDING_SLICE6_PUBLICATION` |
| Current | **OPERATIONAL** — local WESLEYDESK publisher @ `acd94ba` (all four gates PASS) |

## Publication (complete @ WESLEYDESK local publisher)

| Field | Value |
| --- | --- |
| Published SHA | `acd94ba6d5855bda1298d248188f6ae4faa32edf` |
| Closeout receipt | `artifacts/agent-runs/three-way-agent-improvement-intelligence-v1/slice6-closeout-receipt-v1.json` |
| Authority note | GHA run `30861642734` failed pre-fix; superseded by closeout harvest |

## Gates (all pass @ acd94ba)

1. Publication workflow → `PUBLISH_PASS` ✓
2. Layer parity → freshness `PASS` ✓
3. Post-publication blind retrieval → `POST_PUBLICATION_BLIND_RETRIEVAL_PASS` ✓
4. Live idempotency → `NOOP_CURRENT` ✓

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

## Harvest authority

Reconciled by `harvest-2026-08-04-hub-publication-verify-autopsy-v1` — closeout receipt authority over thread-failed GHA run.

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

- `AUTO_PUBLISHER_V1_1_ACTIVE` (scheduled publisher — separate work package)
- Re-dispatch cancelled workflow run `30861202361`
