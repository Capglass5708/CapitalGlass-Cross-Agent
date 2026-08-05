# Advancement Cycle Taxonomy v1

**Owner:** CapitalGlass-Cross-Agent harvest protocol  
**Used by:** [chat-thread-system-advancement-harvest-chatgpt-v1.md](./chat-thread-system-advancement-harvest-chatgpt-v1.md)

Each system advancement harvest must classify its relationship to **existing Hub advancement intelligence** and prior harvests.

| Code | Meaning | Hub action |
| --- | --- | --- |
| `NEW_EVIDENCE` | Material change or learning since last harvest on this theme | New or updated observed inputs for synthesis |
| `NEW_SYNTHESIS` | Evidence supports a genuinely different design not already in Hub | New `ADV-###` candidate |
| `DUPLICATE_CONCEPT` | Same improvement already exists in registry or Hub | Link or reject; do not re-seed |
| `REFINEMENT` | Prior `ADV-###` became more specific or testable | Update candidate; preserve lineage |
| `VALIDATED_ADVANCEMENT` | Cursor/operator evidence supports promotion | Status toward work package (Cursor only) |
| `NO_NEW_ADVANCEMENT` | Thread adds no meaningful system improvement | Honest close; no forced invention |

## Anti-pattern

**Recursive paraphrasing** — each harvest must not blindly “improve the improvement” by restating prior advancement records. A harvest may legitimately end with `NO_NEW_ADVANCEMENT` when the thread only confirms existing designs.

## Record in findings

```text
## Advancement cycle assessment

- harvestRelationship: NEW_SYNTHESIS | ...
- priorAdvancementRefs: [ADV-..., hub stub ids if pasted]
- rationale: ...
```

Phase 2 ingest writes `advancement-cycle-assessment.json`.
