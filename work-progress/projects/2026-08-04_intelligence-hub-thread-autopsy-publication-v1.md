# Project: intelligence-hub-thread-autopsy-publication-v1

## Summary

Thread autopsy harvest seeds published to L: Intelligence Hub catalog and `BY-KIND/thread-autopsy-index.json`. **Operational @ 57f443b.**

## Workspace

| Field | Value |
| --- | --- |
| Work package | `intelligence-hub-thread-autopsy-publication-v1` |
| Owner repo | CapitalGlass-Cross-Agent |
| Status | **PUBLICATION_COMPLETE** |
| Verdict | **PASS** |

## Publication evidence (2026-08-04 closeout)

| Layer | Verdict | Detail |
| --- | --- | --- |
| Catalog seeds on L: | **38+ files** | `02-catalog/knowledge-objects/cross-agent-harvest/` |
| `thread-autopsy-index.json` | **Updated** | Multiple harvests indexed |
| `index:publish` | **PUBLISH_PASS** | @ `57f443b` |
| `index:freshness-gate` | **PASS** | @ `57f443b` |
| `cross-agent-ledger:ingest` | **APPLIED** | After resolving BLOCKED_GIT_MUTATION |

## Do not advance

- `AUTO_PUBLISHER_V1_1_ACTIVE` — GHA scheduled publisher not proven
- Run `harvest:sync-derived` during `cross-agent-ledger:ingest --apply`

## Harvest authority

Latest closeout: `harvest-2026-08-04-harvest-publication-ingest-closeout-v1`
