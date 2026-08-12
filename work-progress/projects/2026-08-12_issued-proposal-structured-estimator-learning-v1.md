# issued-proposal-structured-estimator-learning-v1

**Status:** **ACTIVE — foundation shipped; learning extraction not proven**  
**Parent program:** `capital-glass-proposal-learning-compounding-spine-v1`  
**Foundation WP:** `ce-issued-proposal-corpus-v1` (corpus admission — **not** DURABLE_COMPLETE)  
**Mission class:** `fix` (material, Tier 2/3)  
**Owner repos:** `capital-glass-estimating-parser` (structural extract), `CapitalGlass-Cross-Agent` (contracts + graph), `CapitalGlass-BidComposer` (parity gate), `Data-Extraction` (admission/normalization), `CG-MASTER-GRAPH` (precedent edges)

## North star

**“23 PDFs harvested PASS” ≠ “Capital Glass has learned from 23 issued proposals.”**

This work package converts the admitted corpus into **structured estimator-learning objects** with provenance, parity tests, contradiction preservation, and precedent retrieval — without treating issued prose as approved scope or proposal price as cost truth.

## Hard exit criterion (DURABLE_COMPLETE gate)

All must pass before closing this WP or allowing WaveRunner to mark the proposal-learning program complete:

1. **Frame/glass/doors/hardware structural extract** — per proposal where present: frame marks, quantities, dimensions, areas, openings, systems, glass makeup, glass quantities, doors, hardware-set references, base/alternate membership.
2. **`test:issued-proposal-corpus-parity`** — every corpus proposal has deterministic expectations for fields it actually contains; parser regressions fail closed.
3. **`PROPOSAL_LEARNING_RECORD_V1`** populated — one record per corpus PDF linking structural + scope intelligence with `sourceDocument` provenance (`contracts/proposal-learning/proposal-learning-record-v1.schema.json`).
4. **`ESTIMATOR_DECISION_EVENT_V1`** emitted — high-value judgments as atomic events with evidence (`contracts/proposal-learning/estimator-decision-event-v1.schema.json`): inclusions/exclusions, assumptions, substitutions, special conditions, owner-furnished, demolition/reuse, brake metal, reinforcement, finish uncertainty, alternate creation, detail-driven scope.
5. **Contradiction / anomaly records** — cover/detail conflicts, malformed quantities, inconsistent system descriptions preserved as explicit events (`CONFLICT_DETECTED`, `UNCERTAINTY_RECORDED`); no silent normalization.
6. **Boilerplate fingerprint** — standard Capital Glass framing/glazing/warranty language de-weighted; retrieval driven by project-specific decisions.
7. **Graph + precedent retrieval** — structured queries work: e.g. T14000 + Solarban 90 jobs, pair-door hardware precedents, sill brake metal carried, specified product substituted.
8. **Hub publication parity** — `agent-build-catalog-patch-v1.json` merged on L: via WESLEYDESK `index-publication.yml` (operator).

**Explicitly out of scope for this WP:** `full-plan-sets/` ↔ issued crosswalk (`plan-issued-proposal-crosswalk-v1`), human bid sheets join, award/loss/outcome learning.

## Maturity scorecard (baseline at WP open)

| Lane | Grade | Notes |
| --- | --- | --- |
| Corpus discovery/admission | **A** | 23 PDFs on Z:, manifest, hub slice, regression tiers |
| Reproducibility/regression foundation | **A-** | Harvest PASS; parity test not yet built |
| Proposal parsing | **B / early** | Executive summary only; schedule tables not extracted |
| Structured estimator-learning extraction | **C / partial** | Schemas exist; records not populated |
| Decision-event learning | **Not proven** | `ESTIMATOR_DECISION_EVENT_V1` not emitted from corpus |
| Plan↔proposal supervised learning | **Not built** | Next WP |
| Outcome learning | **Not built** | Later |

## Slice plan (mandatory order)

| Slice | Deliverable | Owner |
| --- | --- | --- |
| 0 | Scoped git commits + push (foundation) | Cross-Agent, Bid Composer, parser |
| 1 | L: catalog patch publication | Operator / WESLEYDESK GHA |
| 2 | Frame/glass schedule + door/hardware extractor | `capital-glass-estimating-parser` |
| 3 | `test:issued-proposal-corpus-parity` + fixture expectations | Bid Composer + parser |
| 4 | Populate `PROPOSAL_LEARNING_RECORD_V1` from extract + manifest | Cross-Agent / Data-Extraction |
| 5 | Emit `ESTIMATOR_DECISION_EVENT_V1` for judgment classes | Data-Extraction / Human Estimator concepts |
| 6 | Contradiction engine + anomaly records | parser + Cross-Agent |
| 7 | Boilerplate fingerprint + de-weight | Data-Extraction |
| 8 | Graph edges + precedent retrieval smoke | CG-MASTER-GRAPH |

## Contracts (already in git)

| Contract | Path |
| --- | --- |
| `PROPOSAL_LEARNING_RECORD_V1` | `contracts/proposal-learning/proposal-learning-record-v1.schema.json` |
| `ESTIMATOR_DECISION_EVENT_V1` | `contracts/proposal-learning/estimator-decision-event-v1.schema.json` |
| Provenance atom | `contracts/proposal-learning/provenance-atom-v1.schema.json` |

## Corpus authority (inherited)

| Field | Value |
| --- | --- |
| Corpus ID | `ce-sample-issued-proposals-v1` |
| Manifest | `artifacts/issued-proposal-corpus-v1/manifest.json` |
| Regression pack | `artifacts/issued-proposal-corpus-v1/regression-pack-v1.json` |
| Smoke tier | CG-1055-26, CG-1098-26 |

## Forbidden

- Closing `ce-issued-proposal-corpus-v1` or parent program as DURABLE_COMPLETE on harvest PASS alone
- Treating issued PDF text as estimator-approved scope without explicit review disposition
- Silent conflict resolution during normalization
- Hand-writing L: Intelligence Hub from Cursor
- Mixing unrelated Cross-Agent commits with corpus/learning slices

## Operator: L: publication (Slice 1)

1. WESLEYDESK: merge `artifacts/issued-proposal-corpus-v1/agent-build-catalog-patch-v1.json` into hub catalog per `index-publication.yml`.
2. Verify `BY-KIND` slice includes `issued-proposal-corpus-v1` after publish.
3. Record publication SHA in this file update log.

## Successor WP (after DURABLE_COMPLETE here)

`plan-issued-proposal-crosswalk-v1` — drawn → identified → proposed supervised learning using `full-plan-sets/` + issued manifest.
