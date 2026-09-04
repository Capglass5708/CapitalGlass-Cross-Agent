# Project: pg-estimate-sections-door-money-rollups-v1

## Summary

Wesley asked (2026-09-04) for the Proposal Generator PDF preview roll-ups to show Interior, Exterior, and Retail as three sections, with the Door Module breaking door and hardware cost out per section so that door hardware pricing follows each door into its assigned section. Read-only investigation of `Cursor-ProposalGenerator` at `140c9552` shows the three-row roll-up and door-to-section assignment already exist for `dynamic_sections_v1` projects; what is missing is the money bridge from the door schedule into the per-section ledger, plus the per-section break-out on the Door Module. Plan: `plans/2026-09-04_pg-estimate-sections-door-money-rollups-v1.md`.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | `pg-estimate-sections-door-money-rollups-v1` |
| Work package | `pg-estimate-sections-door-money-rollups-v1` (child of `proposal-generator-dynamic-estimate-sections-v1`, after `pg-estimate-sections-elevations-doors-v1`) |
| Date opened | 2026-09-04 |
| Source | Wesley (ask) / Claude Code agent (investigation and plan) |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | Cursor-ProposalGenerator (frozen contracts under `docs/contracts/estimate-sections/`) |
| Execution repo | Cursor-ProposalGenerator |
| Status | Planned |

## Repositories involved

| Repo | Role |
| --- | --- |
| Cursor-ProposalGenerator | Owner: door module, estimate sections ledger, proposal output; all implementation and tests |
| CapitalGlass-Cross-Agent | Plan, project file, ledger; no code |

## Authority / ownership rule

Cursor-ProposalGenerator owns the implementation and the three frozen estimate-sections contracts. Cross-Agent describes the work and records decisions. Nothing in this package changes governance authority; any contract amendment (open decision O1) goes through the program's ship/pivot decision path, not this repo.

## Valuable decisions

| Date/time | Decision | Reason |
| --- | --- | --- |
| 2026-09-04 | Scope this as a money bridge on the existing `dynamic_sections_v1` machinery, not a new section model | The three-row PDF roll-up (`buildDynamicSectionPriceBreakoutTable`) and door section assignment on the Doors page already exist; only door money is missing from `pricingBySectionId` |
| 2026-09-04 | V1 keeps hardware inside the `doors` ledger category; hardware break-out is display-only on the Door Module | The fingerprint category order `metal, glass, labor, doors` is frozen in the contract; promoting `hardware` is a contract amendment (open decision O1) |
| 2026-09-04 | Legacy `legacy_ie_v1` projects stay untouched | Contract: legacy output and Markup Report unchanged; conversion is the deferred `pg-estimate-sections-conversion-v1` |

## Delivered / reported complete

- Read-only investigation of Cursor-ProposalGenerator at `140c9552` (door module, door bridge, estimate sections ledger, proposal output, contracts).
- Implementation plan with design, write paths, invariants, PR slicing, verification, and five open decisions.
- No implementation yet.

## Evidence / artifact paths

| Artifact | Path / link | Status |
| --- | --- | --- |
| Plan | `plans/2026-09-04_pg-estimate-sections-door-money-rollups-v1.md` | READY |
| Existing three-row roll-up | Cursor-ProposalGenerator `src/lib/estimate-sections/proposal-output/resolve-proposal-output-bundle.ts`, `src/components/proposal-preview/PricingSummaryStack.tsx` | EXISTS |
| Existing door section assignment | Cursor-ProposalGenerator `src/lib/estimate-sections/elevations-doors/door-inheritance.ts`, `assignment-mutations.ts`, `src/app/api/projects/[projectId]/estimate-sections/assign-records/route.ts` | EXISTS |
| Missing door money bridge | Cursor-ProposalGenerator `src/lib/financial/door-bridge-sync.ts` writes only legacy `scopes.doors`; `elevations-doors/readiness-integration.ts` attributes only `fabricationCost` | GAP |
| Frozen contracts | Cursor-ProposalGenerator `docs/contracts/estimate-sections/*.v1.json` | FROZEN |

## Verification

| Command / check | Result | Notes |
| --- | --- | --- |
| Investigation of PG source at `140c9552` | DONE | Findings in plan §2 and §3 |
| `npm run test:estimate-sections-elevations-doors` and siblings, `npm run validate` in PG | NOT RUN | Belongs to implementation PRs A–E |

## Blockers / warnings

| Blocker | Owner repo | Required action |
| --- | --- | --- |
| Only `dynamic_sections_v1` projects can carry a Retail section | Cursor-ProposalGenerator | Confirm the acceptance project is dynamic (open decision O4); otherwise pull `pg-estimate-sections-conversion-v1` forward |
| Dynamic ledger applies no markup or tax | Cursor-ProposalGenerator | Decide door sell derivation (O2) before PR A |

## Commits / PRs

| Repo | Commit / PR | Status |
| --- | --- | --- |
| CapitalGlass-Cross-Agent | branch `claude/proposal-pdf-rollups-sections-9j0pgk` | pushed (this plan) |
| Cursor-ProposalGenerator | none yet | — |

## Next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Wesley decides O1–O5 in the plan (hardware line, sell derivation, job-level allocation, target project, IE suggestion) | Wesley | Open |
| 2 | Open a Cursor-ProposalGenerator session with `CG_AUTO_V32_WORK_PACKAGE=pg-estimate-sections-door-money-rollups-v1` and implement PR A (financial core) | Cursor-ProposalGenerator | Planned |
| 3 | PR B write paths, PR C Door Module view, PR D proposal output, PR E docs/gates | Cursor-ProposalGenerator | Planned |
| 4 | Staging acceptance on a dynamic project with Exterior / Interior / Retail and doors in each | Cursor-ProposalGenerator | Planned |

## Reusable lessons

- Before designing a "new" section feature in Proposal Generator, check `estimateModelVersion` routing first: legacy and dynamic projects have different authorities, and most section machinery already exists on the dynamic side.
- In the dynamic model, section assignment and section money are separate ledgers (`estimateSectionRecordAssignments` vs `estimateSectionRecordAttributions` + `pricingBySectionId`). A record can be assigned yet carry no money; check both.
- The legacy two-row Pricing Summary folds door sell into Exterior/Interior by hardware dollar ratio; it cannot show a third section without conversion.

## Update log

### 2026-09-04 — Claude Code agent

- Opened project from Wesley's ask; investigated PG at `140c9552`; wrote the plan; ledger and index updated.
