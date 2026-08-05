# System Advancement Findings — harvest-2026-08-05-chat-harvest-system-v1

**Protocol:** `chat-thread-system-advancement-harvest-chatgpt-v1`  
**Mission:** `chat-thread-system-advancement-harvest-chatgpt-v1`  
**Lane:** `ADVANCEMENT_SYNTHESIS`  
**Start verdict:** `UNSYNTHESIZED_THREAD`  
**Output verdict:** `DRAFT_ADVANCEMENTS_FOR_CURSOR_VALIDATION`  
**Intelligence kind:** ADVANCEMENT (not OBSERVED)

## 1. Executive advancement summary

- **Original thread goal:** Define a governed Chat Thread System Advancement lane that converts completed conversations into new capabilities, not just lessons learned.
- **System constraints revealed:** OBSERVED and ADVANCEMENT lanes must stay separate; ChatGPT pushes to `chat-gpt-harvest` only; L: move is GitHub Action; Data-Extraction ingest is Phase 2; advancement ingest parser not shipped.
- **Top three recommended builds:** ADV-001 one-command harvest completion; ADV-003 tiered closeout classifier; ADV-008 novelty/duplication classifier.
- **Most valuable bold idea:** Generalized governed execution framework (cross-thread synthesis of preflight → authority → action → evidence → verdict).
- **Expected impact:** Medium–high operator time savings; medium token savings on repeat harvest closeouts; low–medium risk reduction on false publication claims.

## 2. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

## 3. Scope ledger

- **primary mission:** Advancement harvest platform design + protocol update + pilot candidate evaluation (ADV-001–010)
- **completed lanes:** Protocol docs updated (Git→L pipeline, T0–T3); commit `fa4bcb4` rebased and pushed to `chat-gpt-harvest`
- **open lanes:** Phase 2 `harvest:ingest-chatgpt-advancement`; Data-Extraction `advancement:ingest` from L: staging
- **blocked lanes:** Operator approval center (ADV-009) — product-scale; advancement portfolio dashboard (ADV-004) — needs structured JSON ingest first
- **deferred work:** Automated T3 thread detection (ADV-004 Phase 4)
- **do-not-merge boundaries:** Do not treat advancement candidates as implemented; do not merge `chat-gpt-harvest` to `main` without Cursor validation

## 4. Correction ledger

### COR-001

- **priorAssumption:** Advancement runs use `advancement-*` directory prefix
- **correction:** Operator chose `harvest-*` run dirs; distinguish lanes by findings filename only
- **correctedModel:** `artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/system-advancement-findings-source.md`
- **affectedFindings:** [ADV-001, EVT-003]
- **futurePrevention:** Protocol documents harvest-id convention explicitly

## 5. Advancement cycle assessment

- **harvestRelationship:** `NEW_SYNTHESIS`
- **priorAdvancementRefs:** [harvest-2026-08-04-chat-gpt-harvest-protocol-v1, advancement-ingest-parser-not-shipped-v1]
- **rationale:** Thread invents advancement portfolio lane; prior harvest shipped OBSERVED/ADVANCEMENT protocol split but not pilot artifact or ROI-ranked ADV-001–010 evaluation

## 6. Thread event inventory

### EVT-001

- **summary:** User supplied Conceptual Plan v1 for advancement harvest lane (sections 1–23)
- **evidenceClassification:** `CHAT_DIRECT`

### EVT-002

- **summary:** Cursor implemented protocol updates and committed docs on `chat-gpt-harvest`
- **evidenceClassification:** `CHAT_DIRECT`

### EVT-003

- **summary:** Operator selected `harvest-*` run id over `advancement-*` prefix
- **evidenceClassification:** `CHAT_DIRECT`

## 7. Opportunity map

| Observation | Opportunity |
| --- | --- |
| Multiple manual harvest validation commands | `COMBINE` + `AUTOMATE` (ADV-001) |
| OBSERVED vs ADVANCEMENT confusion risk | `SIMPLIFY` + `DELEGATE` (ADV-003) |
| Phase 2 ingest not shipped | `AUTOMATE` (ADV-001, ADV-008) |
| Repeated novelty/duplication manual checks | `GENERALIZE` + `CENTRALIZE` (ADV-008) |
| ChatGPT push without L: awareness | `SIMPLIFY` (protocol Git→L section — shipped) |
| No measured ROI feedback loop | `PREDICT` + `SELF_HEAL` (ADV-010) |
| Branch watcher partially exists (GHA on push) | `COMBINE_WITH_EXISTING` (ADV-002) |

## 8. Advancement candidate inventory (ADV-001–010)

See `advancement-candidates-v1.json` for machine-readable records. Summary:

| ID | Title | Category | Novelty (draft) | Size | Top band |
| --- | --- | --- | --- | --- | --- |
| ADV-001 | One-command ChatGPT harvest completion | AUTOMATION_CANDIDATE | PARTIAL_OVERLAP | M | ADVANCE_TO_DESIGN |
| ADV-002 | Automatic harvest branch watcher | AUTOMATION_CANDIDATE | PARTIAL_OVERLAP | S | HOLD_FOR_RESEARCH |
| ADV-003 | Tiered closeout classifier T0–T3 | PROTOCOL_UPGRADE | NOVEL (protocol) | XS | ADVANCE_TO_EXPERIMENT |
| ADV-004 | Advancement portfolio dashboard | PRODUCT_CANDIDATE | PARTIAL_OVERLAP | L | PARK |
| ADV-005 | Self-improving protocol generator | PLATFORM_CAPABILITY | PARTIAL_OVERLAP | XL | PARK |
| ADV-006 | Cross-thread concept synthesis engine | PLATFORM_CAPABILITY | NOVEL | L | ADVANCE_TO_DESIGN |
| ADV-007 | Organizational learning loop | ARCHITECTURE_CANDIDATE | SYNTHESIZED | L | ADVANCE_TO_DESIGN |
| ADV-008 | Automatic novelty/duplication classifier | AUTOMATION_CANDIDATE | PARTIAL_OVERLAP | M | ADVANCE_TO_EXPERIMENT |
| ADV-009 | Operator approval center | PRODUCT_CANDIDATE | PARTIAL_OVERLAP | XL | PARK |
| ADV-010 | Measured-benefit feedback system | PLATFORM_CAPABILITY | NOVEL | M | ADVANCE_TO_DESIGN |

## 9. Ranked advancement portfolio

See `advancement-portfolio-v1.json`. **Top 3 for implementation planning:**

1. **ADV-003** — Tiered closeout classifier (score 82, `ADVANCE_TO_DESIGN` → experiment: classify 5 past threads)
2. **ADV-008** — Novelty/duplication classifier (score 79, wire Data-Extraction `novelty-check` + Cross-Agent duplication-preflight for advancement JSON)
3. **ADV-001** — One-command harvest completion (score 76, orchestrate existing `harvest:*` chain; do not rebuild)

## 10. Do-not-build list

| Item | Reason |
| --- | --- |
| Duplicate `harvest:duplication-preflight` under new name only | Extend existing lib with `mode=advancement` |
| Full Operator Approval Center (ADV-009) before ingest parser | Product without structured candidate JSON |
| Advancement dashboard (ADV-004) before Phase 2 ingest | UI without data contract |
| Second document engine for harvest files | CapitalGlass-Cross-Agent owns harvest authority |
| Claim Data-Extraction ingest operational in ChatGPT footer | Deferred per protocol |

## 11. Cross-thread synthesis

**Synthesis target:** Generalized Governed Execution Framework

```text
Preflight → authority resolution → capability check → controlled action
→ readback → evidence digest → deterministic verdict → safe promotion
```

Sources: harvest preflight chain, Auto v3.2 material gates, document layer contract checks, suite advancement graph lane. **Owner:** CG-AppBuilder-MCP (pattern) + Cross-Agent (harvest application). **Status:** CANDIDATE — needs ADR, not implementation in this harvest.

## 12. Cursor validation handoff

See `cursor-validation-handoff-v1.md`. Cursor must:

1. Run novelty registry lookup for each ADV-001–010 against `work-progress/`, compact records, Data-Extraction `pilot-concepts-registry-v1.json`
2. Confirm ADV-002 overlaps `.github/workflows/chatgpt-harvest-move-to-l.yml`
3. Scope Phase 2 `harvest:ingest-chatgpt-advancement` from this artifact shape
4. Register harvest in `registry/advancement-harvest-ids.v1.json`

```bash
# Phase 2 (when shipped):
npm run harvest:ingest-chatgpt-advancement -- \
  --input=artifacts/agent-runs/harvest-2026-08-05-chat-harvest-system-v1/system-advancement-findings-source.md \
  --harvest-id=harvest-2026-08-05-chat-harvest-system-v1
```

## 13. Novelty self-check

- [x] ≥1 SYNTHESIZED concept (ADV-007 organizational learning loop; governed execution framework)
- [x] ≥1 INVENTED evidence-linked concept (ADV-006 cross-thread synthesis engine as platform service)
- [x] ≥1 failure-class removal (ADV-003 prevents wrong-lane harvest waste)
- [x] ≥1 token/context reduction (ADV-001 reduces repeated manual command discovery)
- [x] ≥1 gated-wave improvement (ADV-003 T0–T3 maps to closeout depth)
- [x] Top-3 acceptance proofs defined in JSON artifacts
- [x] Not summary-only

## 14. Publication truth

See `publication-truth-v1.json`.

| Layer | State |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | pending commit for this artifact |
| L: draft staging (GitHub Action) | `not-run` |
| Cursor ingest | `not-run` |
| Novelty verification | `not-run` |
| Architecture verification | `not-run` |
| L: Hub publication | `not-run` |
| Z: cache projection | `not-run` |
| Supabase projection | `not-run` |
| Data-Extraction advancement ingest | `not-run` |
| Backlog creation | `not-run` |
| Implementation authorization | `not-run` |

```text
Advancement status: CANDIDATE
Publication: NOT_RUN_BY_CURSOR
Implementation: NOT_AUTHORIZED
```
