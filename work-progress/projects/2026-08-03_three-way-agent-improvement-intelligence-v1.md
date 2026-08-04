# Project: three-way-agent-improvement-intelligence-v1

## Summary

Three-way agent improvement intelligence program — all scoped PRs merged; awaiting hub publication gates.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `three-way-agent-improvement-intelligence-v1` |
| Owner repo | CG-AppBuilder-MCP |
| Coordination pointer | `work-progress/pointers/three-way-agent-improvement-intelligence-v1.json` |
| Status | **MERGED_PENDING_SLICE6_PUBLICATION** |

## Verdict lineage

| Verdict | When |
| --- | --- |
| Previous | `PRECOMMIT_VERIFICATION_PASS_WITH_PREREQUISITE_GATE_REPAIRS` |
| Current | `MERGED_PENDING_SLICE6_PUBLICATION` (`ALL_SCOPED_PRS_MERGED`) |
| Blocked final | `THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL` |

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

## Publication (pending)

| Field | Value |
| --- | --- |
| Workflow run | **30861642734** (authoritative; run `30861202361` cancelled) |
| Pinned SHA | `3e51aa754576f7d148901e440365f714f56be455` |
| Host | WESLEYDESK self-hosted runner |

## Pending gates (all required before operational award)

1. Publication workflow → `PUBLISH_PASS`
2. Layer parity → `npm run index:freshness-gate`
3. Post-publication blind retrieval → `npm run harvest:blind-retrieval`
4. Live idempotency → `NOOP_CURRENT` on second publish

Closeout receipt: `artifacts/agent-runs/three-way-agent-improvement-intelligence-v1/slice6-closeout-receipt-v1.json`

## Not claimed

- `THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL`
- Post-publication blind retrieval (fixture-only pass does not count)

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

- `THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL` until all four publication gates pass
- Re-dispatch cancelled workflow run `30861202361`
