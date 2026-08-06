# Harvest summary — derived view

**Authority:** `harvest-manifest-v1.json` (`78d05cdc0a16…`)
**Work package:** `harvest-2026-08-06-harvest-protocol-self-learning-lane-closeout-v1`
**Mission class:** `chat-thread-closeout-autopsy-harvest-v1`
**Verdict:** `HARVEST_COMPLETE`
**Retrieval:** `INDEX_HIT`

> This file is a generated view. Do not edit independently — update the manifest.

## Packets harvested

| Packet | State | Verdict | Owner |
| --- | --- | --- | --- |
| `lane-c-cross-agent-export-shipped-v1` | COMPLETE | SHIPPED | CapitalGlass-Cross-Agent |
| `lane-c-data-extraction-pipeline-shipped-v1` | COMPLETE | SHIPPED | Data-Extraction |
| `lane-c-protocol-docs-aligned-v1` | COMPLETE | DOCUMENTED | CapitalGlass-Cross-Agent |
| `lane-c-production-acceptance-v1` | COMPLETE | RETRIEVAL_PASS | Data-Extraction |
| `lane-c-all-spokes-go-with-warn-v1` | COMPLETE | GO_WITH_WARN | CapitalGlass-Cross-Agent |
| `mistake-verify-republished-empty-v1` | FIXED | PASS | Data-Extraction |
| `mistake-z-mirror-overwrote-protocol-v1` | OPEN | WARN | CapitalGlass-Cross-Agent |
| `faster-path-l-protocol-stale-v1` | RESOLVED | SYNCED | CapitalGlass-Cross-Agent |
| `blocker-test-harvest-z-mirror-v1` | OPEN | DEFERRED | Data-Extraction |

## Global doNotAdvance

- Claim Lane C protocol changes merged to Git without Governance approval
- Run harvest:sync-z-mirror until docs/runbooks includes Lane C
- Treat L catalog protocol hand-edits as authority over harvest/protocol Git
- Export app/CI packets to Lane C — protocolImprovementCandidates only
- Run index:publish or harvest:publish-hub-seed from Cursor

## Projection sync

Status: `synced` (hub: `published`)

