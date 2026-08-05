# Work package plan: scraper-data-extraction-improvements-v1

**Status:** Active — governed implementation  
**Long-form spec:** [work-packages/scraper-data-extraction-improvements.md](../../work-packages/scraper-data-extraction-improvements.md)  
**Mission control:** [work-progress/mission-control/scraper-data-extraction-improvements-v1.json](../../work-progress/mission-control/scraper-data-extraction-improvements-v1.json)

## Objective

Establish a governed pipeline:

```text
Source → Scraper (immutable evidence) → Data-Extraction (validate/normalize/ack)
→ contribution envelope → CG-MASTER-GRAPH (validate/promote)
```

Cross-Agent coordinates; owner repos implement.

## Waves

| Wave | Milestone | Owner focus |
| --- | --- | --- |
| A | `SCRAPER_DE_CONTRACTS_LOCKED_V1` | Cross-Agent contract pointers |
| B | `SCRAPER_DE_HANDOFF_RELIABLE_V1` | Scraper + Data-Extraction handoff |
| C | `SCRAPER_EVIDENCE_COMPLETE_V1` | Scraper evidence + policy |
| D | `SCRAPER_DE_FLOW_INTELLIGENCE_V1` | DE normalization + incremental replay |
| E | `SCRAPER_DE_GRAPH_CONTRIBUTION_ACTIVE_V1` | DE exporter + MG intake |
| F | `SCRAPER_DATA_EXTRACTION_GRAPH_PIPELINE_VALIDATED_V1` | Cross-Agent e2e proof |

## Contract mode

`pointer-only` — authoritative schemas remain in owner repositories.
