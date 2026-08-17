# Operational intelligence contracts — ownership

**Status:** ARCHITECTURE_LOCKED  
**Architecture authority:** `work-progress/projects/operational-intelligence-envelope-v1.md`  
**Work package:** `capital-glass-compounding-operational-measurement-v1`  
**Plan ID:** `operational-intelligence-envelope-v1`

## Roles

| System | Role | May own |
| --- | --- | --- |
| **CapitalGlass-Cross-Agent** | `INTELLIGENCE_OWNER` | Handoff consumer contract, envelope schema, mission ledger projection, derived objects, relationship graph, Hub compact compilation, shared-dev Hub publication semantics, provenance reconstruction, future Foundry input |
| **CG-AppBuilder-MCP** | `EVIDENCE_PRODUCER` | Ordinary closeout, `intelligence-handoff-v1` emit only |
| **Intelligence Hub** | retrieval plane | Store/index `DERIVED_INTELLIGENCE` — never progression authority |
| **WaveRunner / Git** | progression authority | Execution control only |

## Contracts in this directory

| File | Producer | Consumer | Purpose |
| --- | --- | --- | --- |
| `intelligence-handoff-v1.schema.json` | CG-AppBuilder-MCP | CapitalGlass-Cross-Agent | Minimal post-closeout evidence handoff |
| `operational-intelligence-envelope-v1.schema.json` | CapitalGlass-Cross-Agent | Intelligence Hub / ingest pipeline | OP-00A durable derived-intelligence envelope |

## Forbidden

- AppBuilder growing envelope builders, ledger projectors, Hub compact compilers, or `DERIVED_INTELLIGENCE` semantics
- Producer handoffs that include derived objects, ledger rows, or Hub payloads
- Registering `COMPOUNDING_INTELLIGENCE_PIPELINE` as an AppBuilder-implemented capability (downstream owner is Cross-Agent only)
- Collapsing `measurement.measurementQuality` into coarse observed/inferred buckets
- Using `HARVEST_AUTHORITY` publication path for derived operational intelligence

## Downstream capability (metadata only)

| Field | Value |
| --- | --- |
| AppBuilder capability | `INTELLIGENCE_HANDOFF` |
| Downstream pipeline owner | CapitalGlass-Cross-Agent |
| Downstream capability | `COMPOUNDING_INTELLIGENCE_PIPELINE` |

WaveRunner registry: `CG-AppBuilder-MCP/scripts/sdlc-protocol-cursor/waverunner-capability-registry-v1.json`.

## Change policy

Edits to these contracts require an explicit **superseding plan** — do not silently mutate the locked architecture in `operational-intelligence-envelope-v1.md`.
