# Cursor validation handoff — harvest-2026-08-05-chat-harvest-system-v1

**Verdict:** `DRAFT_ADVANCEMENTS_FOR_CURSOR_VALIDATION`  
**Producer:** Cursor builder (pilot run from advancement lane conceptual plan thread)

## Novelty lookup requirements

| ID | Draft status | Cursor action |
| --- | --- | --- |
| ADV-001 | PARTIAL_OVERLAP | Confirm overlap with `harvest:publish-intelligence-full` |
| ADV-002 | PARTIAL_OVERLAP | Confirm overlap with `chatgpt-harvest-move-to-l.yml` |
| ADV-003 | NOVEL | Verify tier table in protocol docs at HEAD |
| ADV-004 | PARTIAL_OVERLAP | Check work-progress / Hub for similar dashboard concepts |
| ADV-005 | PARTIAL_OVERLAP | Check Auto v3.2 protocol governance overlap |
| ADV-006 | NOVEL | Check CG-MASTER-GRAPH for cross-thread synthesis nodes |
| ADV-007 | PARTIAL_OVERLAP | Check 3-way agent + North Star learning loop docs |
| ADV-008 | PARTIAL_OVERLAP | Run Data-Extraction `novelty-check` on sample candidate |
| ADV-009 | PARTIAL_OVERLAP | Check agent-loop `list_operator_actions` |
| ADV-010 | NOVEL | Confirm no ROI feedback artifact in suite-advancement runs |

## Recommended owner repos

| ID | Owner |
| --- | --- |
| ADV-001, ADV-002, ADV-003, ADV-007 | CapitalGlass-Cross-Agent |
| ADV-008, ADV-006, ADV-010 | Data-Extraction |
| ADV-005 | CG-AppBuilder-MCP |
| ADV-004, ADV-009 | cg-apps-hub (consumer UI — park) |

## Cheapest experiments (top 3)

1. **ADV-003:** Label 5 historical harvest ids T0–T3; document false-positive tier assignments.
2. **ADV-008:** `cd Data-Extraction && npm run advancement:ingest -- --source=<this findings md> --advancement-id=ADV-003-TIERED-CLOSEOUT-001 --json` (read-only ingest trial).
3. **ADV-001:** Script stub that prints ordered `npm run harvest:*` chain without executing publish.

## Registry updates

Add to `registry/advancement-harvest-ids.v1.json`:

```json
{
  "harvestSlug": "harvest-2026-08-05-chat-harvest-system-v1",
  "harvestNodeId": "harvest:chat-harvest-system-v1",
  "stableId": "harvest:chat-harvest-system-v1",
  "sourcePath": "artifacts/agent-runs/harvest-2026-08-05-chat-harvest-system-v1",
  "findingsFile": "system-advancement-findings-source.md"
}
```

## Do-not-advance

- Do not claim `harvest:ingest-chatgpt-advancement` operational
- Do not publish to Intelligence Hub without operator approval
- Do not implement ADV-009 dashboard in this work package
