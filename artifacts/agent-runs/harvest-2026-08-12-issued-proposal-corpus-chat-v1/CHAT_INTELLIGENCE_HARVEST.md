# Chat Intelligence Harvest — Issued Proposal Corpus & Learning Program

**Harvest ID:** `harvest-2026-08-12-issued-proposal-corpus-chat-v1`  
**Chat transcript:** `628ebd5b-d678-45ea-b8e0-6941c62eab40`  
**Mission class:** investigate → docs → program routing  
**Output verdict:** `HARVEST_COMPLETE` (git authority; L: publication pending operator)  
**Lane:** `CURSOR_CHAT_CONTEXT` + live Z: corpus harvest

---

## 1. Executive summary

This thread established a **23-PDF issued Capital Glass storefront proposal benchmark corpus** on Z:, shipped reproducible harvest tooling, and **explicitly rejected** treating harvest PASS as proposal-learning DURABLE_COMPLETE.

**Controlling rule:** `23 PDFs harvested PASS` ≠ `Capital Glass has learned from 23 issued proposals`.

Foundation WP `ce-issued-proposal-corpus-v1` is **FOUNDATION_COMPLETE**. Successor WP `issued-proposal-structured-estimator-learning-v1` owns structured learning with hard exit criteria before program closeout.

---

## 2. Corpus facts (indexed)

| Field | Value |
| --- | --- |
| Corpus ID | `ce-sample-issued-proposals-v1` |
| Count | 23 PDFs (Jan–Jun 2026) |
| Windows path | `Z:\Capital-Glass-Dev\Computer Estimator Sample Documents\Proposals` |
| WSL path | `/mnt/z/Capital-Glass-Dev/Computer Estimator Sample Documents/Proposals` |
| Bid ID pattern | `CG-{####}-26` |
| Pages | 6–11 (median 8) |
| Base bid USD | $20,785 – $632,200 (median $61,590) |
| Dominant system | Tubelite T14000 Thermal 2"×4.5" storefront |
| Universal exclusion | Waterproofing beyond storefront (**23/23**) |

**Sibling folders (do not conflate):**

| Folder | Role |
| --- | --- |
| `bid-sheets/` | Human estimator upstream |
| `full-plan-sets/` | Plan evidence upstream |
| `Proposals/` | **Downstream issued output** — not CE plan batch intake |

---

## 3. Maturity scorecard (operator-approved)

| Lane | Grade |
| --- | --- |
| Corpus discovery/admission | **A** |
| Reproducibility/regression foundation | **A-** |
| Proposal parsing | **B / early** |
| Structured estimator-learning extraction | **C / partial** |
| Decision-event learning | **Not proven** |
| Plan↔proposal supervised learning | **Not built** |
| Outcome learning | **Not built** |

---

## 4. Work packages

| ID | Status | Role |
| --- | --- | --- |
| `ce-issued-proposal-corpus-v1` | **FOUNDATION_COMPLETE** | Manifest, hub slice, harvest, regression tiers |
| `issued-proposal-structured-estimator-learning-v1` | **ACTIVE** | Frame/glass extract, parity, PLR, decision events, graph |
| `capital-glass-proposal-learning-compounding-spine-v1` | Wave 8 **CORPUS_ADMITTED** | Parent program |
| `plan-issued-proposal-crosswalk-v1` | **PLANNED** | After structured learning DURABLE_COMPLETE |

---

## 5. Hard exit criterion (successor WP — do not skip)

1. Frame/glass/door/hardware structural extract (marks, qty, dims, areas, openings, systems, glass makeup, doors, hardware sets, base/alternate membership)
2. `test:issued-proposal-corpus-parity` — deterministic per-proposal expectations
3. `PROPOSAL_LEARNING_RECORD_V1` populated per PDF
4. `ESTIMATOR_DECISION_EVENT_V1` for judgments (inclusions, exclusions, assumptions, substitutions, OF/GC furnished, demolition/reuse, brake metal, reinforcement, finish uncertainty, alternates, detail-driven scope)
5. Contradiction/anomaly records — no silent normalization
6. Boilerplate fingerprint — de-weight standard framing/glazing/warranty prose
7. Graph precedent retrieval (T14000+Solarban, pair-door hardware, brake metal carried, substitutions)
8. L: hub publication parity (WESLEYDESK `index-publication.yml`)

---

## 6. Regression tiers (smoke first)

| Tier | Bid IDs |
| --- | --- |
| smoke | CG-1055-26, CG-1098-26 |
| multiBuilding | CG-1136-26, CG-1105-26 |
| alternates | CG-1055-26, CG-1138-26, CG-1137-26 |
| specialScope | CG-1131-26 |
| largeCommercial | CG-1061-26, CG-1105-26, CG-1122-26 |

---

## 7. Git publication evidence

| Repo | Branch | Commit |
| --- | --- | --- |
| CapitalGlass-Cross-Agent | `work/active-ledger-currentness-ingestion-and-harvest-v1` | `dde727a` |
| CapitalGlass-BidComposer | `main` | `92b0ea1` |
| capital-glass-estimating-parser | `main` | `6601bec` |

---

## 8. Commands

```bash
# Regenerate corpus (requires Z: + poppler-utils)
cd CapitalGlass-Cross-Agent && npm run harvest:issued-proposal-corpus

# Single-PDF executive summary smoke
python3 capital-glass-estimating-parser/scripts/extract-issued-proposal-executive-summary-v1.py --pdf "<path>" --json
```

---

## 9. Contracts (already in Cross-Agent git)

- `contracts/proposal-learning/proposal-learning-record-v1.schema.json`
- `contracts/proposal-learning/estimator-decision-event-v1.schema.json`
- `contracts/proposal-learning/provenance-atom-v1.schema.json`

---

## 10. Indexed blocker relief

| Blocker | Relief |
| --- | --- |
| `bid-composer-weak-on-window-schedule-row` | Partial — frame/glass schema + 23 examples; full import lane still Bid Composer |
| `de-opening-detection-kb-is-shallow` | Future — `plan-issued-proposal-crosswalk-v1` with `full-plan-sets/` |

---

## 11. Forbidden

- Closing proposal-learning program on harvest PASS alone
- Batch-processing `Proposals/` through CE plan pipeline
- Hand-writing L: Intelligence Hub from Cursor
- Treating issued PDF prose as estimator-approved scope without `bid_*` disposition

---

## 12. Operator next (L: hub)

Merge on WESLEYDESK `index-publication.yml`:

- `artifacts/issued-proposal-corpus-v1/agent-build-catalog-patch-v1.json`
- `artifacts/agent-runs/harvest-2026-08-12-issued-proposal-corpus-chat-v1/agent-build-catalog-patch-learning-program-v1.json`

Hub git failover slices (until L: publish):

- `work-progress/intelligence-hub-slices/issued-proposal-corpus-v1.json`
- `work-progress/intelligence-hub-slices/issued-proposal-learning-program-v1.json`
