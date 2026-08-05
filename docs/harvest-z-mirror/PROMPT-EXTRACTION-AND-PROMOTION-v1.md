# Prompt Extraction and Promotion — Harvest v1

**Work package:** `harvest-prompt-extraction-v1`  
**Parent protocol:** [CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md](./CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md)  
**Git authority:** `CapitalGlass-Cross-Agent/docs/runbooks/chat-thread-closeout-autopsy-harvest-v1.md`  
**Z: mirror:** `Z:\Capital-Glass-Dev\Harvest\protocol\PROMPT-EXTRACTION-AND-PROMOTION-v1.md`

---

## Flow

```text
THREAD CLOSEOUT
→ HARVEST CHAT
→ EXTRACT PROMPT CANDIDATES
→ CLASSIFY
→ DEDUPLICATE
→ REVIEW / PROMOTE
→ UPDATE PROMPT CATALOG
→ LINK EXECUTION PACKETS
→ INDEX
→ SUPABASE SEED
→ WRITE RECEIPT
```

## Authority

| Concern | Owner |
| --- | --- |
| Candidate discovery | Harvest (`scripts/harvest/lib/prompt-extraction-lib.mjs`) |
| Approved prompts | **PromptOps** manifests + suite prompt index |
| Hot-cache routing | Compact metadata only — no transcripts or full bodies |
| Supabase runtime | Approved projections only |
| Mutation authority | **Never** granted by harvest |

## Commands

| Step | Command | Repo |
| --- | --- | --- |
| Extract (automatic) | `npm run harvest:sync-derived` | CapitalGlass-Cross-Agent |
| Gate tests | `npm run test:harvest:prompt-extraction` | CapitalGlass-Cross-Agent |
| Z: protocol mirror | `npm run harvest:sync-z-mirror` | CapitalGlass-Cross-Agent |
| Approve | Add IDs to `manifest.promptHarvest.operatorApprovals`, re-sync | CapitalGlass-Cross-Agent |
| Supabase seed | `npm run promptops:project-harvest-prompts` | CG-AppBuilder-MCP |
| Prompt catalog | `npm run prompt-catalog:compile-index` | CG-AppBuilder-MCP |

## Per-harvest outputs

```text
artifacts/agent-runs/<harvest-id>/
  prompt-candidates.json
  prompt-deduplication-report.json
  prompt-promotion-decisions.json
  prompt-catalog-delta.json
  execution-packet-binding-delta.json
  prompt-harvest-index-slice.json
```

Receipt block: `receipt.json` → `promptHarvest`

## Verdicts

- `PROMPT_HARVEST_COMPLETE`
- `PROMPT_HARVEST_NO_CANDIDATES` (non-blocking)
- `PROMPT_HARVEST_PENDING_REVIEW`
- `PROMPT_HARVEST_FAILED`
