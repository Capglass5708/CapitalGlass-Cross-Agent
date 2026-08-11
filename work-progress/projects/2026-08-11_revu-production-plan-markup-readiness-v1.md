# Project: revu-production-plan-markup-readiness-v1

## Summary

Operator-tracked critical path from **controlled Revu MCP proof** through **Rosewood single-sheet markup** into **Bid Composer Scope Review**. Coordinates Gate 1, Document Center open-path, CE parser package, takeoff pilot, and operator W22 signoff.

**Not in scope:** unattended production takeoff, auto-pricing, proposal issue.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | `revu-production-plan-markup-readiness-v1` |
| Date opened | 2026-08-11 |
| Coordination repo | CapitalGlass-Cross-Agent |
| Status | **ACTIVE — operator-led** |
| Parent milestones | `revu-estimating-spine-and-master-graph-integration-v1`, `estimating-spine-roi-convergence-and-operator-value-v1` |
| Target pilot WP | `revu-production-takeoff-pilot-v1` |
| Indexed blocker | `revu-mcp-production-workflow-locked` |

## Destination (done definition)

```text
Document Center canonical PDF (Rosewood)
  → open in Revu (MCP)
  → markup + read-back on one sheet (A.520.1 / W22)
  → structured export
  → Bid Composer Scope Review (parser + Revu context visible)
  → operator walkthrough signoff receipt
```

## Phase tracker

| Phase | Focus | Owner | Status | Exit gate |
| --- | --- | --- | --- | --- |
| 0 | WESLEYDESK desk + Revu Max + MCP | Operator | **PENDING** | Revu UI shows Max; smoke PASS |
| 1 | Gate 1 controlled fixture + provenance | CapitalGlassRevu + Operator | **PENDING** | `gate1:controlled-fixture` PASS |
| 2 | DC Rosewood open-path | CapitalGlass-Documents | **DEFERRED** | `ROSEWOOD_CANONICAL_BINARY_OPEN_PATH_PASS` |
| 3 | CE Rosewood parser package | Computer Estimator | **BLOCKED** | `parserEvidencePackage` READY on L: |
| 4 | Takeoff pilot + BC import | Revu + Bid Composer | **LOCKED** | One-sheet export in BC Scope Review |
| 5 | Operator W22 signoff | Estimator | **PENDING** | `operator-pilot-signoff-v1.json` not PENDING |

## Canonical Rosewood IDs

| Entity | UUID |
| --- | --- |
| Project | `f463b1e8-e21c-419c-80d0-ea63ec47fe60` |
| Plan set | `a2033260-0001-4000-8000-000000000001` |
| Document | `9ca73873-2697-49e6-b3a4-1f73aa7cc330` |
| Sheet | `b2033260-0001-4000-8000-00000000003b` (`A.520.1`, page 59) |
| Pilot bid | `633908da-7098-4509-b05a-91bd683b988f` |
| Scope item W22 | `c0519d87-7a7b-4923-8882-92f7c63c4473` |

## Phase 0 — Operator desk (WESLEYDESK)

- [ ] Open Cursor via **Capital Glass Cursor (WSL Suite).lnk** (Windows Desktop), not `/mnt/c` workspace alone
- [ ] Bluebeam Revu 21 running and signed in
- [ ] **Max** seat assigned (not Complete) — Revu UI must show Max
- [ ] Revu Admin → MCP enabled → official host selected for first proof
- [ ] Cursor MCP `user-bluebeam-revu` connected (31 tools)

**Smoke (Windows repo root):**

```powershell
cd C:\Developer\repos\CapitalGlassRevu
npm run revu:mcp:smoke
```

## Phase 1 — Gate 1 (controlled fixture)

**Playbook:** `CapitalGlassRevu/playbooks/gate1-live-mcp-block.md`

**Fixture PDF:**

```text
C:\Developer\repos\CapitalGlassRevu\fixtures\pdf\foundation-controlled-page.pdf
```

**MCP tool sequence (exact order):**

1. `open_file` — fixture path above
2. `get_page_count` — expect `1`
3. `set_page_scale` — `1/4 in` → `1 ft`, precision `100`, page 1
4. `add_markup` — Line / Length / label `GATE1-FIXTURE-LENGTH` / line `72 72 216 72`
5. `list_markups_in_pdf` — page 1; confirm markup ID matches `add_markup` output

**Capture + validate:**

```powershell
cd C:\Developer\repos\CapitalGlassRevu
npm run gate1:diagnose-mcp
npm run gate1:negative-path
npm run gate1:capture-provenance
npm run gate1:controlled-fixture
npm run operational-status:generate
npm run operational-status:verify
```

**Provenance path (immutable):**

```text
artifacts/runs/capital-glass-revu-control-plane-v1/live-evidence/gate1-mcp-provenance.json
```

**Forbidden:** `CG_REVU_MCP_ALLOWED`, `CG_GATE1_READBACK_JSON`, fabricated provenance.

**Unlock after Phase 1:** explicit operator production unlock per `contracts/production-document-policy.json`; promote `rosewood-r1b-window-v1` in `contracts/controlled-pilot-subjects.json`.

## Phase 2 — Document Center open-path

- [ ] Prove Rosewood plan opens from DC with storage backend (`active_storage_provider` resolved)
- [ ] Rerun Document Center production smokes (`suite-ci-healing-v1` SHA pin)
- [ ] Receipt: `ROSEWOOD_CANONICAL_BINARY_OPEN_PATH_PASS`

## Phase 3 — CE Rosewood parser

- [ ] Postgres healthy on parse host (RYZEN9DESK or operator-chosen host)
- [ ] Run parser with explicit input: `rosewood-permit-set.pdf` (not `vector_text_plan.pdf`)
- [ ] Complete package → `parserEvidencePackage@1.0.0` + `READY.json` on L:
- [ ] Relay import to BC shared dev

**Optional parallel:** RTX 5080 activation on RYZEN9DESK (`install_opening_stack_ryzen9desk.sh`)

## Phase 4 — Takeoff pilot (one sheet)

- [ ] Implement narrow workflow in `revu-production-takeoff-pilot-v1`
- [ ] `PARSER_EVIDENCE_IMPORT_ENABLED=1` on BC shared dev
- [ ] Enable controlled Revu capability flags after read-back receipts
- [ ] Markup A.520.1 / W22 → structured export → BC Scope Review

**BC route:** `https://bid.capitalglasstxapps.com/bids/633908da-7098-4509-b05a-91bd683b988f/scope-review`

## Phase 5 — Operator signoff

```bash
cd ~/repos/CapitalGlass-BidComposer
npm run estimating-spine:operator-pilot:signoff
npm run estimating-spine:operator-pilot:signoff -- --validate
```

**Receipt:** `artifacts/agent-runs/estimating-spine-operator-pilot-signoff-v1/operator-pilot-signoff-v1.json`

**Next milestone on pass:** `estimating-spine-estimator-productivity-and-learning-v1`

## Policy locks (do not bypass)

| Claim | Forbidden until |
| --- | --- |
| `UNATTENDED_PRODUCTION_MARKUP` | `revu-production-takeoff-pilot-v1` + human approval |
| Production document MCP mutation | Gate 1 strict order + explicit unlock |
| Bid Composer export | Pilot receipt + operator authorization |

## Cross-repo references

| Topic | Path |
| --- | --- |
| Spine architecture | `CapitalGlass-Cross-Agent/plans/2026-08-01-estimating-spine-architecture-v1/ESTIMATING_SPINE_ARCHITECTURE.md` |
| Opening detection WP | `work-progress/projects/2026-08-01_revu-opening-detection-top10-v1.md` |
| Revu operational status | `CapitalGlassRevu/artifacts/current/revu-operational-status.json` |
| Production document policy | `CapitalGlassRevu/contracts/production-document-policy.json` |
| Controlled pilot subjects | `CapitalGlassRevu/contracts/controlled-pilot-subjects.json` |
| ROI convergence status | `CapitalGlass-BidComposer/docs/platform/ESTIMATING_SPINE_ROI_CONVERGENCE_MILESTONE.md` |

## Update log

### 2026-08-11 — project file created

- Consolidated critical path from estimating spine + Revu operational truth investigation.
- Operator checklist embedded for Gate 1 on WESLEYDESK.
