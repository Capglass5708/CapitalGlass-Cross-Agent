# Program: capital-glass-experience-graph-compounding-v1

**Status:** FOUNDATION_IN_PROGRESS  
**Wave:** Initial parallel wave — Track B (B1 core contracts)

## North star

Capital Glass converts operational and business experience into reusable, measurable, economically ranked intelligence through the Experience Graph compounding loop.

## Authority model

| Owner | Responsibility |
| --- | --- |
| Product repos | Business behavior, product-specific observations |
| CapitalGlass-Cross-Agent | Harvest coordination, experience registry, compact retrieval |
| Data-Extraction | Correlation, normalization, root-cause, Gold Mine candidates |
| CG-MASTER-GRAPH | Graph validation, canonical projection |
| CG-AppBuilder-MCP | Orchestration, runtime consumption |
| CG-Platform-Governance-MCP | Autonomous-execution authority |

## Foundation milestones (B1–B4)

| Milestone | Branch | Owner | Status |
| --- | --- | --- | --- |
| B1 EG-01 Core contracts | `work/experience-graph-foundation-and-economic-value-v1` | Cross-Agent | IN_PROGRESS |
| B2 EG-02 Episode correlation | `work/experience-episode-correlation-v1` | Data-Extraction | PLANNED |
| B3 EG-03 Relationship foundation | `work/experience-relationship-foundation-v1` | Data-Extraction + Master Graph | PLANNED |
| B4 EG-04 Gold Mine V2 | `work/gold-mine-economic-value-v2` | Data-Extraction | PLANNED |

## Contracts (B1)

- `contracts/experience/experience-observation-v1.schema.json`
- `contracts/experience/experience-episode-v1.schema.json`
- `contracts/experience/experience-pattern-v1.schema.json`
- `contracts/experience/experience-relationship-v1.schema.json`
- `contracts/experience/experience-economic-impact-v1.schema.json`
- `contracts/experience/business-workflow-observation-v1.schema.json`
- `contracts/experience/experience-harvest-adapter-v1.md`

## Parallel tracks

- **Track H:** Harvest Engine (`harvest-git-durability-and-protocol-convergence-v1`) — CG-AppBuilder-MCP
- **Track A:** Governance promotion Slice 1 (`reflex-autonomy-governance-promotion-v1`) — CG-AppBuilder-MCP
- **Track B:** Experience Graph foundation (this program) — Cross-Agent
- **Track C:** EG-06 report parsing pilot — starts after B1–B4 foundation acceptance

## Hard invariants

- `DISTINCT_VALID_EXPERIENCE_SUPPRESSION = FORBIDDEN`
- `UNKNOWN != ZERO`
- `MODEL_INFERRED != AUTHORITY`
- `EXPERIENCE_GRAPH != AUTONOMY_AUTHORITY`
- `main` = integrated code authority
