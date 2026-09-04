# Project: pg-estimate-sections-door-money-rollups-v1

## Summary

Wesley asked (2026-09-04) for the Proposal Generator PDF preview roll-ups to show Interior, Exterior, and Retail as three sections, with the Door Module breaking door and hardware cost out per section so that door hardware pricing follows each door into its assigned section. First pass over-scoped this into a 5-PR governance program with five open decisions; Wesley rejected that ("I didn't ask for all this") and named Smith Ranch as the pilot with a direct go-ahead to push. Confirmed live against Smith Ranch's real Supabase row (`4402eb63-3b81-465e-8220-f30cd0854509`, `CG-2037-26`): it is already `dynamic_sections_v1` with active sections Exterior / Interior / Retail and 17 real doors, but `pricingBySectionId` was entirely empty — every section's Doors line was $0 because no write path ever bridges the door schedule into the section ledger. Implemented and pushed directly to `Cursor-ProposalGenerator` as a single, narrowly-scoped PR: a read-time money overlay (no persisted write, no schema change) that folds each door's material + fabrication + hardware + labor onto its resolved section for the Pricing Summary, Markup Report, and project total alike. Superseded the original plan below.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | `pg-estimate-sections-door-money-rollups-v1` |
| Work package | `pg-estimate-sections-door-money-rollups-v1` |
| Date opened | 2026-09-04 |
| Source | Wesley (ask) / Claude Code agent (investigation, plan, then direct implementation) |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | Cursor-ProposalGenerator (frozen contracts under `docs/contracts/estimate-sections/`) |
| Execution repo | Cursor-ProposalGenerator |
| Status | **Implemented — PR #228 open (draft), watched** |

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
| 2026-09-04 | Original 5-PR/5-open-decision plan rejected by Wesley as over-scoped | "I didn't ask for all this" — the ask was a direct fix, not a governance program |
| 2026-09-04 | Confirmed Smith Ranch's real DB state before writing any code | Direct SQL against the `Capital Glass DataBase` Supabase project: `dynamic_sections_v1`, 3 active sections (Exterior/Interior/Retail), 17 real doors, `pricingBySectionId` and `estimateSectionRecordAssignments` both entirely empty — the actual, confirmed root cause |
| 2026-09-04 | Read-time overlay instead of a persisted ledger write | Doors save through a canonical multi-section autosave transaction this session doesn't own; a persisted write would need new OCC/reassignment/erasure-guard plumbing on a live financial document. A pure overlay computed fresh every render (same math everywhere it's consumed) gets the correct customer-facing result with zero new invariant surface and no schema change |
| 2026-09-04 | Hardware stays folded into the `doors` ledger category; issued/approved output excluded from the overlay | Frozen fingerprint category order unchanged; an approved snapshot must stay exactly what was captured (`INVARIANT_ISSUED_SECTION_SNAPSHOT_IMMUTABLE`) |
| 2026-09-04 | Legacy `legacy_ie_v1` projects stay untouched | Out of scope; Smith Ranch and the ask are both dynamic-model |

## Delivered / reported complete

- Read-only investigation of Cursor-ProposalGenerator at `140c9552`, then live confirmation against Smith Ranch's actual Supabase row.
- Implemented `computeDoorSectionMoney` / `mergeDoorMoneyIntoSectionLedger` and threaded doors/elevations through the shared dynamic financial path (calculate → markup report → document model → output bundle → intelligence document, plus the interactive Markup Report page).
- Fixed `buildDoorRecordAttributions` (issue-readiness) to use the same full money formula instead of `fabricationCost` alone.
- 9 new tests (`door-section-money.test.ts`) plus full `npm run test:all`, `typecheck` (0 errors), `lint` (0 errors), and `build` all green on Cursor-ProposalGenerator.
- Pushed branch `claude/smith-ranch-section-door-money-9j0pgk`; opened draft PR #228; subscribed for CI/review events.

## Evidence / artifact paths

| Artifact | Path / link | Status |
| --- | --- | --- |
| Superseded plan (for the investigation record only) | `plans/2026-09-04_pg-estimate-sections-door-money-rollups-v1.md` | SUPERSEDED |
| Implementation PR | Cursor-ProposalGenerator PR #228 (`claude/smith-ranch-section-door-money-9j0pgk`) | OPEN (draft) |
| New money overlay | Cursor-ProposalGenerator `src/lib/estimate-sections/elevations-doors/door-section-money.ts` | MERGED-pending |
| Live Smith Ranch confirmation | Direct query, Supabase project `wvidyxufvcrtezzkwwse` (`Capital Glass DataBase`), `public.projects` / `proposal_core.project_state` / `proposal_core.estimate_sections` / `proposal_core.doors` / `proposal_core.editable_workspace` for project `4402eb63-3b81-465e-8220-f30cd0854509` | CONFIRMED |

## Verification

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm run test:all` (Cursor-ProposalGenerator) | PASS | exit 0, zero failures |
| `npm run typecheck` | PASS | 0 errors, whole repo |
| `npm run lint` | PASS | 0 errors, 320 pre-existing warnings unchanged |
| `npm run build` | PASS | clean production build |
| `npm run test:estimate-sections-elevations-doors` | PASS | 34/34 (25 pre-existing + 9 new) |
| `test:estimate-sections-financial-ledger/-markup-report/-proposal-output/-assignment/-activation/-imports-po/-section-manager/-provenance/-concurrency`, `test:financial-integrity-core`, `test:pdf-mapping-baseline`, `test:proposal-composition` | PASS | unmodified |
| `section-visibility-regression.test.ts` pricing-label case | PRE-EXISTING FAIL | Reproduced identically on unmodified `origin/main`; unrelated to this change, not fixed here |

## Blockers / warnings

None currently blocking. Known, documented follow-up: the approval financial fingerprint is still built from the persisted ledger only, so a door price edit *after* approve-for-output won't yet trigger the re-approval-required drift check. Not reachable today (Smith Ranch has no approval history); becomes relevant only once a dynamic project both uses door pricing and has been approved for output.

## Commits / PRs

| Repo | Commit / PR | Status |
| --- | --- | --- |
| CapitalGlass-Cross-Agent | branch `claude/proposal-pdf-rollups-sections-9j0pgk`, PR #60 (plan/ledger, docs-only) | open (draft), superseded in substance by PR #228 |
| Cursor-ProposalGenerator | `1c14ea8` on branch `claude/smith-ranch-section-door-money-9j0pgk`, PR #228 | open (draft), watched |

## Next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Review/merge PR #228 | Wesley / Cursor-ProposalGenerator | Open |
| 2 | Price at least one door in each of Smith Ranch's three sections (hardware set + costs) and confirm the PDF preview shows real Interior/Exterior/Retail dollars | Wesley (in-app) | Open |
| 3 | If a hardware line item on the Markup Report/PDF is wanted later, that is a contract amendment (deferred, not blocking) | Cursor-ProposalGenerator | Deferred |

## Reusable lessons

- Before designing a "new" section feature in Proposal Generator, check `estimateModelVersion` routing first: legacy and dynamic projects have different authorities, and most section machinery already exists on the dynamic side.
- When a user rejects scope, check whether the ORIGINAL diagnosis was still right before re-scoping — it usually is; the fix is to narrow the *execution* plan, not to re-investigate from zero.
- Querying the actual production database directly (when access exists) beats inferring live state from code alone — it turned "door money bridge, five open decisions" into one confirmed, narrow defect (`pricingBySectionId` empty on a real live project) with an obvious low-risk fix.
- Not every gap needs a persisted-ledger write. A read-time overlay computed from existing, already-correct pieces (the resolver, the door schedule) can be lower-risk and just as correct as a new write path, especially inside a financial application with heavy existing invariant machinery.
- In the dynamic model, section assignment and section money are separate ledgers (`estimateSectionRecordAssignments` vs `estimateSectionRecordAttributions` + `pricingBySectionId`). A record can be assigned yet carry no money; check both.
- The legacy two-row Pricing Summary folds door sell into Exterior/Interior by hardware dollar ratio; it cannot show a third section without conversion.

## Update log

### 2026-09-04 — Claude Code agent (plan)

- Opened project from Wesley's ask; investigated PG at `140c9552`; wrote a 5-PR plan; ledger and index updated.

### 2026-09-04 — Claude Code agent (direct implementation, same day)

- Wesley rejected the plan's scope, named Smith Ranch as pilot, gave go-ahead to push to Cursor-ProposalGenerator. Confirmed Smith Ranch's live DB state (dynamic, 3 sections, 17 doors, empty ledger). Implemented the read-time door-money overlay, fixed issue-readiness, added tests, verified full CI-equivalent checks locally, pushed, and opened draft PR #228.
