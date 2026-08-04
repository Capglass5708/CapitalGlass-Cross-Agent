# Project: intelligence-hub-thread-autopsy-publication-v1

## Summary

Thread autopsy harvest seeds published to L: Intelligence Hub catalog and `BY-KIND/thread-autopsy-index.json`.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `intelligence-hub-thread-autopsy-publication-v1` |
| Owner repo | CapitalGlass-Cross-Agent |
| Status | **HUB_CATALOG_POPULATED_FRESHNESS_DRIFT** |
| Verdict | **PARTIAL_PASS** |

## Publication evidence (2026-08-04)

| Layer | Verdict | Detail |
| --- | --- | --- |
| Catalog seeds on L: | **12/12 PASS** | `02-catalog/knowledge-objects/cross-agent-harvest/` |
| `thread-autopsy-index.json` | **Updated** | 3 harvests indexed |
| Manual publish receipt | `PUBLISH_PASS` @ `a833852` | 8 seeds |
| Pipeline publish receipt | `PUBLISH_PASS` @ `ae1c427` | 4 seeds (wesleydesk closeout) |
| `index:freshness-gate` | **FAIL** | L: ledger `a833852` ≠ git `ae1c427` |

## Do not advance

- `FULLY_SEEDED` without `index:freshness-gate PASS` at current HEAD
- Treat catalog presence as ledger parity

## Next action

Run `npm run index:publish` at current HEAD to clear freshness drift.
