# Project: three-way-agent-improvement-intelligence-v1

## Summary

Three-way agent improvement intelligence program — precommit verification with prerequisite gate repairs; Slice 6 on HOLD.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `three-way-agent-improvement-intelligence-v1` |
| Owner repo | CG-AppBuilder-MCP |
| Coordination pointer | `work-progress/pointers/three-way-agent-improvement-intelligence-v1.json` |
| Status | **PRECOMMIT_VERIFICATION_PASS_WITH_PREREQUISITE_GATE_REPAIRS** |

## Verdict lineage

| Verdict | When |
| --- | --- |
| Previous | `IMPLEMENTATION_REVIEW_PASS_WITH_PRECOMMIT_GATES` |
| Current | `PRECOMMIT_VERIFICATION_PASS_WITH_PREREQUISITE_GATE_REPAIRS` |

## Not claimed

- `THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL`
- Slice 6 advancement (remains **HOLD**)
- Program PRs (not created)

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

- Slice 6
- `THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL`
- Program PR creation without operator approval
