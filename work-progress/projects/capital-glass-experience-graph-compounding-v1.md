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
- **Track C:** EG-06 report parsing pilot — `experience-report-parsing-population-live-proof-v1` (live proof complete)

## Fourth business expansion wave (ACTIVE)

| Lane | Work package | Priority | Status |
| --- | --- | --- | --- |
| B | `experience-opening-estimating-v1` | PRIMARY | **DURABLE_COMPLETE** (DE `main` @ `b7655da`) |
| A | `experience-business-outcome-correlation-v1` | PARALLEL | IN_PROGRESS (EG-06 harvest on `main`) |
| Rosewood loop | `experience-estimator-bid-composer-loop-v1` | PRIMARY (completed) | **DURABLE_COMPLETE** (BC `455e72d`, DE `1f054e6`) |
| **Follow-on** | **`experience-beacon-hill-proposal-generator-loop-v1`** | **PRIMARY (controlling)** | **LAUNCHED** |

### Ledger distinction (Rosewood loop closeout)

| Layer | Status |
| --- | --- |
| Business / product milestone | `experience-estimator-bid-composer-loop-v1` = **DURABLE_COMPLETE** |
| CapitalGlass-BidComposer `main` | merged ✅ |
| Data-Extraction `main` | merged ✅ |
| Post-merge business-loop proof | PASS ✅ |
| Cross-Agent coordination / Harvest publication | PR housekeeping — merge when convenient |
| Human disposition | `SIMULATED_TEST_DISPOSITION` for integration; `REAL_HUMAN_DISPOSITION` = later ops proof |

## Hard invariants

- `DISTINCT_VALID_EXPERIENCE_SUPPRESSION = FORBIDDEN`
- `UNKNOWN != ZERO`
- `MODEL_INFERRED != AUTHORITY`
- `EXPERIENCE_GRAPH != AUTONOMY_AUTHORITY`
- `main` = integrated code authority
