# Project: bid-composer-upgrade-roadmap-v1

## Summary

Large Bid Composer upgrade roadmap. Phase 1 shipped revision integrity and estimator dashboard foundation in `CapitalGlass-BidComposer`. Remaining phases cover document authority, parser normalization, Revu overlays, scope assemblies, pricing, risk, proposal output, and estimating memory.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | `bid-composer-upgrade-roadmap-v1` |
| Phase shipped | Phase 1 - revision integrity + estimator dashboard foundation |
| Date opened | 2026-08-01 |
| Source | Wesley / Cursor |
| Coordination repo | CapitalGlass-Cross-Agent |
| Owner repo | `CapitalGlass-BidComposer` |
| Related repos | Document Center, Computer Estimator, CapitalGlassRevu, Visual Asset Engine, Data-Extraction |
| Status | Phase 1 implemented; migration pending shared-dev |
| Mission class | Product upgrade / estimating spine |

## Phase 1 Shipped

### Bid integrity and revision control

| Deliverable | Detail |
| --- | --- |
| Migration | `supabase/migrations/20260801120000_bid_revision_control_and_pipeline.sql` |
| `bid_workspaces` | Project-wide bid families |
| `bid_revision_events` | Immutable who/what/when timeline |
| `bid_merge_records` | Duplicate merge audit with evidence manifest |
| `bid_intakes` additions | `revision_number`, `lineage_kind`, `pipeline_stage`, `revision_relation`, `authoritative_source_document_id`, `is_revision_locked`, etc. |
| `bid_issued_proposals` additions | `revision_number`, `source_document_id`, `revision_relation`, `is_locked` |
| Rev badges | Replaced fake group-index math with stored `revision_number` |
| Revision fork API | `POST /api/bids/[bidId]/revisions/create` with reason required |
| Timeline API | `GET /api/bids/[bidId]/revision-timeline` |
| Merge API | `POST /api/bids/merge`; relocates evidence and marks source as `merged_source` |
| Issuance locks | Issue flow records timeline events and locks the bid |
| Revisions UI | Timeline, reason-required rebid creation, side-by-side diff links |

### Bid dashboard and navigation

| Deliverable | Detail |
| --- | --- |
| Estimator bid cards | Project, GC, due date, amount, estimator, pipeline stage, readiness %, next action |
| Pipeline stages | Intake -> Takeoff -> Review -> Pricing -> Proposal -> Ready -> Issued -> Lost/Awarded |
| Saved filters | Due this week, blocked, unpriced, ready to issue |
| Sorting | Due date, value, risk, estimator, last activity |
| Executive dashboard | Active pipeline value, ready/blocked/overdue counts, closing probability |
| Issue vs Review blockers | Green Issue only when ready; otherwise Review blockers |

## Tests / Verification

| Check | Result |
| --- | --- |
| Pipeline stage resolver tests | `scripts/tests/bid-revision-pipeline.test.mjs` - 5 passing |
| Typecheck | Passes |

## Required Before Shared-Dev Works

Apply migration through the shared database migration process:

```text
supabase/migrations/20260801120000_bid_revision_control_and_pipeline.sql
```

Do not assume shared-dev works until the migration is applied.

## Outstanding Roadmap

| Area | Status |
| --- | --- |
| Document Center intake, drag-drop, content hashes, authority levels | Not started |
| Parser assembly normalization, source-vs-parsed screen, bulk correction | Not started |
| Revu takeoff overlays, quantity variance, Open in Revu | Staging exists; not wired to dashboard |
| Scope assemblies UI: `bid_scope_objects` ↔ claims | Schema exists; UI not built |
| Full pricing lines: waste factors, vendor quotes, margin vs markup | Partial - pricing builder exists |
| RFI risk register, financial exposure, review batches | RFIs exist; risk register not built |
| Visual proposal editor, Word export, email delivery tracking | Partial - PDF issue path exists |
| Estimating memory from awarded actuals | Memory index exists; feedback loop not built |

## Suggested Next Work Package

```text
bid-composer-phase2-document-authority-v1
```

Scope:

- Document Layer intake.
- Drag/drop bid document intake.
- Content-hash deduplication.
- Authority levels for documents.
- GPT advisory labeling.
- Plan-sheet completeness detection.

## Phase Options

| Option | Meaning |
| --- | --- |
| Phase 2 | Document authority + intake |
| Phase 3 | Parser assembly normalization |
| Shared-dev activation | Apply migration and smoke-test dashboard |

## Decisions / Warnings

- Phase 1 is implemented in `CapitalGlass-BidComposer`, but shared-dev requires the migration before the new schema-backed workflow works.
- Revision numbers must come from stored data, not list/group index math.
- Issued proposals lock revisions; rebids should fork with a reason and timeline event.
- Green Issue should only appear when readiness is clean; otherwise route to Review blockers.
- This is a Bid Composer product upgrade, not a Cross-Agent implementation.

## Update Log

### 2026-08-01 CT - Phase 1 shipped

- Cursor reported Phase 1 complete: revision integrity + estimator dashboard foundation.
- Migration created: `supabase/migrations/20260801120000_bid_revision_control_and_pipeline.sql`.
- Tests passing: pipeline resolver 5/5 and typecheck.
- Next recommended work package: `bid-composer-phase2-document-authority-v1`.
