# Suite Advancement M1 Hardening — Cross-Agent

**Work package:** `cross-agent-advancement-lineage-export-v1`  
**Status:** COMPLETE (M1 wave A)

## Deliverables

- `registry/advancement-harvest-ids.v1.json` — 3 registered harvests
- `artifacts/advancement-lineage-refs-latest.json` — full export (3 harvests)
- Per-harvest `artifacts/agent-runs/<harvest-slug>/advancement-lineage-refs.json`

## Export command

```bash
npm run harvest:export-advancement-lineage-refs
```

Optional single harvest:

```bash
npm run harvest:export-advancement-lineage-refs -- --harvest-id=harvest-2026-08-05-chat-harvest-system-v1
```

## Boundary

Cross-Agent exports evidence only. No graph compile. Data-Extraction consumes via `--lineage-refs`.
