# Master Graph planning (Cross-Agent index)

Cross-Agent owns **enterprise program planning**, harvest orchestration, and CG-EDF.  
**CG-MASTER-GRAPH** owns canonical graph schemas, compiler, and graph documentation.

## Canonical graph implementation

- Repository: https://github.com/Capglass5708/CG-MASTER-GRAPH
- Clone: `$HOME/repos/CG-MASTER-GRAPH`
- Foundation merge: `03e6630` (PR #1)
- Validate: `npm run validate` → `CG_MASTER_GRAPH_FOUNDATION_VALIDATED`

## Planning transfer

Do **not** merge `started-a-graph` wholesale. Use:

```text
artifacts/agent-runs/cg-master-graph-planning-transfer-v1/
  planning-transfer-manifest-v1.json
  document-authority-map-v1.json
  planning-transfer-receipt-v1.json
```

## Documents on `started-a-graph` (pointer only)

| Document | Classification |
| --- | --- |
| `CG-MASTER-GRAPH-STARTER.md` | DONE on graph `main` (`ea7758d`) |
| `CG-MASTER-GRAPH-GLOSSARY-v1.md` | DONE on graph `main` (`6a4e96e`) |
| `CG-MASTER-GRAPH-STATE-MODEL-v1.md` | DONE on graph `main` (`6a4e96e`) |
| `CG-MASTER-GRAPH-ROADMAP-v1.md` | REMAIN_CROSS_AGENT — on Cross-Agent `main` |
| `CG-MASTER-GRAPH-ENTERPRISE-KNOWLEDGE-INTAKE-PLAN-v1.md` | SPLIT — program doc on Cross-Agent `main` |
| `CG-HARVEST-TO-GRAPH-HARVEST-LANE-v1.md` | Cross-Agent harvest lane (split) |
| Graph harvest contract | `CG-MASTER-GRAPH/docs/CG-HARVEST-TO-GRAPH-CONTRACT-v1.md` |
| `CG-MASTER-GRAPH-CONSTITUTION-v1.md` | DONE in graph repo |
| `CG-REPOSITORY-CREATION-PROTOCOL-v1.md` | REMAIN_CROSS_AGENT |
| `CG-REPOSITORY-LIFECYCLE-STANDARD-v1.md` | REMAIN_CROSS_AGENT |

Full classification: `planning-transfer-manifest-v1.json`.
