# CG Harvest-to-Graph Harvest Lane v1

Lane ID: `CG-HARVEST-TO-GRAPH-HARVEST-LANE-v1`

Owner: **CapitalGlass-Cross-Agent**

Graph schema authority: **CG-MASTER-GRAPH** — `docs/CG-HARVEST-TO-GRAPH-CONTRACT-v1.md`

## Purpose

Define how Cross-Agent harvests produce **graph extraction packets** without owning canonical graph truth.

## When to emit `graph-extraction.json`

Material harvests that change operational understanding should emit an extraction packet when any of the following apply:

- New or changed repository, application, or authority participation
- New work package with cross-repo dependencies
- Verified integration or wiring change
- Blocker resolution that affects suite topology
- Decision that alters ownership or publication path

Trivial harvests (typo-only docs, no topology impact) may emit an empty nodes/edges packet with warnings for audit continuity.

## Required packet shape

Pin schemas from `CG-MASTER-GRAPH` at commit or release tag:

```text
packetKind: graph-extraction
schemaVersion: cg-master-graph-extraction-v1
extractionId: extraction:<harvest-slug>
harvestId: <harvest packet id>
workPackageId: <work-package-id>
producer:
  repositoryId: repo:capitalglass-cross-agent
  capability: harvest-graph-extraction
nodes: [...]
edges: [...]
provenance: { ... }
```

Validate before handoff:

```bash
cd "$HOME/repos/CG-MASTER-GRAPH"
npm run graph:validate-extraction -- /path/to/graph-extraction.json
```

Cross-Agent automation (after `harvest:sync-derived`):

```bash
npm run harvest:build-graph-extraction -- <harvest-id>
npm run harvest:validate-graph-extraction -- <harvest-id>
npm run harvest:promote-graph-seed -- <harvest-id>   # copies to CG-MASTER-GRAPH/graph/seeds
```

## Harvest orchestration flow

```text
Agent / operator mission
  → harvest packet (Cross-Agent)
  → graph extraction builder
  → schema validation (graph repo CLI or CI)
  → graph collect input (graph/seeds or ingestion path)
  → compiler promote (operator-triggered)
  → publication coordination (Cross-Agent)
```

Cross-Agent does **not** call `graph:compile` autonomously in production without operator or CI gate.

## File placement

During development, reference extractions may live in:

```text
CapitalGlass-Cross-Agent/artifacts/agent-runs/<harvest-id>/graph-extraction.json
```

Long-term ingestion path is owned by the harvest contributor work package (`cross-agent-master-graph-harvest-contributor-v1`).

## SPLIT boundary

| Concern | Owner |
| --- | --- |
| Packet JSON schema, node/edge/provenance schemas | CG-MASTER-GRAPH |
| When to harvest, packet registry, publication coordination | Cross-Agent |
| Source file OCR/transcription → contribution envelope | Data-Extraction |
| Canonical graph release | CG-MASTER-GRAPH compiler |

## Related program doc

Enterprise intake program (multi-repo): `docs/master-graph/CG-MASTER-GRAPH-ENTERPRISE-KNOWLEDGE-INTAKE-PLAN-v1.md`
