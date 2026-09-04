# Plan: Proposal Generator — door + hardware money per estimate section, three-section PDF roll-ups

**Work package:** `pg-estimate-sections-door-money-rollups-v1`
**Parent program:** `proposal-generator-dynamic-estimate-sections-v1` (child of, and sequenced after, `pg-estimate-sections-elevations-doors-v1`)
**Owner repo (implementation):** `Cursor-ProposalGenerator` (GitHub `Capglass5708/Cursor-ProposalGenerator`)
**Coordination repo:** `CapitalGlass-Cross-Agent` (this plan; no code here)
**Requested by:** Wesley, 2026-09-04
**Evidence pinned to:** `Cursor-ProposalGenerator` commit `140c9552` (2026-09-04), read-only investigation
**Status:** PLAN READY — implementation not started

---

## 1. The ask (Wesley, 2026-09-04)

> In the proposal generator, the roll-ups on the PDF preview need to show interior, exterior, and retail — three different sections. In the financial roll-ups we have interior / exterior / doors. The door module will need to break out what that cost is to each section and be assignable to that. The organization of the doors and the hardware is done on the door module; the door hardware pricing then goes to its associated section.

Restated as acceptance:

1. The customer-facing Pricing Summary on the PDF preview (and print / export, which share the same projection) shows one roll-up row per section, and a project can carry **Interior**, **Exterior**, and **Retail** as those sections.
2. Door cost is no longer a separate third bucket next to Interior / Exterior. Each door's material, fabrication, hardware, and labor money lands in the section that door is assigned to.
3. Assignment of a door to a section happens on the Door Module, where doors and hardware sets are already organized. The hardware set chosen for a door carries its hardware pricing into that door's section.

---

## 2. What already exists (verified in code at `140c9552`)

Proposal Generator has two estimate models that coexist per project. `estimateModelVersion` is persisted on `proposal_core.project_state` and resolved only by `resolveEstimateModel()`; nothing may infer the model from field presence.

| Area | Legacy `legacy_ie_v1` (existing projects) | Dynamic `dynamic_sections_v1` (new projects after activation) |
| --- | --- | --- |
| Financial authority | `pricing.scopes.exterior / interior / doors` (three fixed buckets) | `pricing.pricingBySectionId[sectionId].categories.{metal, glass, labor, doors}` keyed by section UUID; `hardware`, `fabrication`, `other` exist as typed placeholders and are **not** in the V1 roll-up |
| Section registry | none (fixed Exterior / Interior / Doors) | `proposal_core.estimate_sections`; seeded Exterior + Interior; estimator creates more (Retail is an existing acceptance scenario: `estimate-sections-dynamic-create-retail-space-v1`) |
| PDF preview Pricing Summary | `PricingSummaryStack` → `buildScopedPriceBreakoutTable`: **two rows only**, "Exterior Price" and "Interior Price". Door scope sell is split into those two rows by the interior/exterior door-hardware dollar ratio (`resolveDoorScopeSellSplit` in `src/lib/pricing-calculator.ts`). No Retail row is possible. | `resolveProposalOutputBundle` → `buildDynamicProposalDocumentModel` → `buildDynamicSectionPriceBreakoutTable`: **one row per active section**, ordered by Section Manager sort order. This is the shape Wesley is asking for; it already exists for dynamic projects. |
| Door → section assignment | not applicable | Built and shipped in `pg-estimate-sections-elevations-doors-v1`: the Doors page (`src/app/doors/page.tsx`) embeds `DynamicEstimateSectionsElevationsDoorsSection`. Each door inherits its section from its single linked elevation, or takes a manual override via the shared `EstimateSectionSelector`. Resolver: `src/lib/estimate-sections/elevations-doors/door-inheritance.ts`. Mutations: `elevations-doors/assignment-mutations.ts` behind `POST /api/projects/[projectId]/estimate-sections/assign-records`. |
| Door money → financials | `computeDoorMarkupBridgeTotals` (`src/lib/doors/door-markup-bridge.ts`) rolls every door card into `scopes.doors.material.{doors, interiorDoorHardware, exteriorDoorHardware}` and `scopes.doors.labor`, quantity-weighted, split by the door's physical `interiorExterior` attribute. Dispatched from the store effect `SYNC_DOOR_SCOPE_FROM_SCHEDULE`. | **Nothing.** No bridge writes the `doors` category of any section from the door schedule. See §3. |
| Hardware pricing source | `resolveDoorHardwareSetTotals` (`src/lib/hardware-component-catalog.ts`) scales the hardware set's component cost/sell by leaf count into `door.hardwareCost` / `door.hardwareSell` when a set is picked on the door card. | same |
| Markup Report | Exterior / Interior / Doors columns (unchanged by contract) | `SectionGroupedFinancialTable`: per section Metal / Glass / Labor / Doors + Section Total; then Section Subtotal + Outside Costs + Admin Labor = Project Total |
| Issue / approve-for-output | n/a | `evaluateDynamicApproveForOutputGate` blocks when a money-bearing record is unassigned or ambiguous (`INVARIANT_MONEY_REQUIRES_SECTION_BEFORE_ISSUE`), then snapshots the ledger (`issuedEstimateSectionsSnapshot`) with financial + document-layout fingerprints |

Governing contracts (FROZEN, three files, no fourth without a ship/pivot decision): `docs/contracts/estimate-sections/estimate-sections-contract.v1.json`, `...-governance-contract.v1.json`, `...-ui-contract.v1.json`.

---

## 3. The gap, precisely

On a `dynamic_sections_v1` project today:

1. **Door money never reaches a section.** Writers of `pricingBySectionId` are only the Import PO paths (`import-po/assignment-mutations.ts`, `import-po/apply-metal-po-dynamic.ts`, category `metal`) and the generic `bridge-apply` route. The door schedule bridge still only writes the legacy `scopes.doors` buckets, which the dynamic financial engine ignores by design. Result: every section's "Doors" line is $0, the PDF roll-up rows exclude doors and hardware, and the project total is short by the whole door scope.
2. **Door assignment moves nothing.** `assign_door_manual`, `door_follow_elevation`, and elevation reassignment with inherited doors all call `reassignRecordMoney`, which moves whatever is in `estimateSectionRecordAttributions[doorRef]`. That entry is never written for doors, so the assignment changes the badge but no money.
3. **Readiness undercounts door money.** `buildDoorRecordAttributions` (`elevations-doors/readiness-integration.ts`) attributes only `fabricationCost` per door, ignoring `materialCost`, `hardwareCost` / `hardwareSell`, `laborCost`, and `quantity`. A door with hardware but no all-glass fabrication cost is treated as money-free and will not block issue while unassigned.
4. **Legacy projects cannot show Retail at all.** Their Pricing Summary is hard-wired to two rows, and conversion of legacy projects to dynamic is `pg-estimate-sections-conversion-v1`, deferred to V1.1+ by the frozen program. This ask is therefore satisfiable only on dynamic projects (see open decision O4).

Everything else Wesley described (three roll-up rows, section assignment on the Door Module, hardware organized on the Door Module) is already in place. This work package is the **money bridge** plus the Door Module break-out view.

---

## 4. Design (V1)

### D1. Door attribution record

For each door, compute a per-record attribution (quantity-weighted) and store it under the existing `estimateSectionRecordAttributions[doorRef]` ledger, keyed by the existing `door:<id>` record ref:

| Ledger category | Cost | Sell |
| --- | --- | --- |
| `doors` | `(materialCost + fabricationCost + hardwareCost) × quantity` | door leaf/fab sell derived per D2, plus `hardwareSell × quantity` |
| `labor` | `laborCost × quantity` | derived per D2 |

Hardware stays inside the `doors` category in V1 (this mirrors legacy, where hardware is part of `scopes.doors.material`, and keeps the frozen fingerprint category order `metal, glass, labor, doors`). The hardware-vs-leaf break-out that Wesley wants to *see* on the Door Module is derived for display from the door schedule and the resolver (D6); the ledger stays the single financial authority. Promoting `hardware` to its own active category is open decision O1.

Replace the body of `buildDoorRecordAttributions` with this V1 attribution so readiness and the bridge share one definition.

### D2. Sell derivation

The dynamic ledger is sell-denominated and `calculateDynamicProposalFinancials` applies no markup or tax (Import PO writes its stock total straight into `sell`). Door cards carry `hardwareSell` but no material or labor sell. V1 derives door leaf/fab sell and door labor sell by applying the Mark Up Report material and labor markup rates (`pricing.markupRates`) exactly as the legacy `rollupDoorScope` in `src/lib/financial/independent-financial-rollup.ts` does, so a dynamic project prices a door the same way a legacy project would. Hardware sell is taken from the door card. Record the derivation in the bridge provenance (`bridgeSource: door_schedule_sync:<doorRef>`). The wider question of markup and tax semantics across all dynamic categories is pre-existing and is open decision O2.

### D3. Section target

Section for each door = the existing resolver `resolveDoorSectionAssignment` (elevation inheritance or manual override). Unassigned or ambiguous doors carry **no** section money and are never coerced to Exterior (`INVARIANT_UNKNOWN_IS_NOT_EXTERIOR`). Their money is shown on the Door Module as "Not yet in a section" (D6) and continues to block approve-for-output through the existing readiness gate, which now sees real money because of D1. The door's physical `interiorExterior` attribute remains a display badge only (`INVARIANT_NO_IE_TO_SECTION_INFERENCE`).

### D4. Write paths (all server-side, all through the existing atomic operations)

| Trigger | Where | Mechanism |
| --- | --- | --- |
| T1 Door or elevation assignment change | `assign-records` route → `applyElevationSectionMutations` | Before moving, refresh the door's attribution from the door schedule the route already loads, so `reassignRecordMoney` carries the full D1 amount. On first assignment (no prior section) write through `applySectionScopedBridgeSync` for `doors` and `labor`, mirroring `assignImportRecord` in the Import PO path. |
| T2 Door schedule save | `POST /api/projects/[projectId]/door-schedule` after `saveDoorScheduleToDatabase`; also merge-review apply and Glazier PO / fab import apply | New pure module `src/lib/estimate-sections/elevations-doors/door-money-sync.ts`: recompute D1 for every door, diff against the stored attribution, and apply the delta (subtract old, add new) to the assigned section only, using the `applyAttributionDelta` pattern from `concurrency/record-reassignment.ts`. Removed doors subtract and drop their attribution. Guarded by sections registry revision and workspace `expectedUpdatedAt` like every other section write. |
| T3 Reconcile | New governed route `estimate-sections/door-money-sync` + a "Sync door pricing to sections" action on the Door Module | Same module as T2, run on demand. Needed once for dynamic projects that already have doors and assignments but zero door attributions. No silent mutation on open. |
| Legacy | `SYNC_DOOR_SCOPE_FROM_SCHEDULE` store effect | Unchanged. It already writes only `scopes.doors`, which is non-authoritative on dynamic projects (test 25 in `section-elevations-doors.test.ts`). Optionally gate it to legacy routing to stop needless writes; not required for acceptance. |

No client-side `supabase.from('proposal_core...')` writes; everything terminates in the BFF routes above (`GOV_INVARIANT_PROPOSAL_CORE_WRITES_VIA_GOVERNED_API`).

### D5. PDF preview roll-ups

Dynamic path: no structural change. Once D4 lands, the Interior / Exterior / Retail rows produced by `buildDynamicSectionPriceBreakoutTable` include door leaf, fabrication, hardware, and door labor. Two follow-on choices:

- Row description text is currently the generic "Section framing, entrances, door hardware, and glazing scope" for every row; consider a per-section description (optional polish).
- Job-level outside costs and admin labor are added to the project total but are **not** allocated into the section rows, so the three rows do not sum to the Proposal Value line the way legacy's two rows do. Open decision O3.

Legacy path: unchanged by contract (`proposalOutput.legacyUnchanged: true`).

### D6. Door Module break-out view

On dynamic projects, replace the two flat "Hardware Cost" / "Hardware Marked Up" summary cards with a **"Door pricing by section"** block: one row per active section (Section Manager order) showing Doors material, Hardware, Labor, and a section door total, plus a "Not yet in a section" row for unassigned / ambiguous doors. Values are derived from the door schedule plus the resolver; the block also reads the ledger's `doors` / `labor` values for the same sections and shows a drift badge with the "Sync door pricing to sections" action (T3) when they differ. Legacy projects keep the current flat cards. Use only the shared primitives from the UI contract (`EstimateSectionBadge`, `EstimateSectionSelector`, `PhysicalLocationBadge`).

### D7. Markup Report

The per-section "Doors" line becomes live and "Labor" includes door labor. A separate "Hardware" line per section requires activating the placeholder category, which changes the frozen fingerprint category order and the Markup Report V1 category list, so it is deferred to O1.

---

## 5. Invariants that bind this work package

From `estimate-sections-contract.v1.json` (all must keep passing):

- `INVARIANT_NO_CROSS_MODEL_CONTAMINATION`: door money writes go to `pricingBySectionId` on dynamic projects only; legacy saves never touch it.
- `INVARIANT_NO_IE_TO_SECTION_INFERENCE` and `INVARIANT_UNKNOWN_IS_NOT_EXTERIOR`: `interiorExterior` never picks a section; unassigned money stays out of every section.
- `INVARIANT_NO_CROSS_SECTION_VALUE_ERASURE`: the sync patches only the door's own section; absence of a door from a payload is not zero for any other section.
- `INVARIANT_SECTION_TOTALS_CONSERVE_PROJECT_TOTAL`: reassigning a door moves the same money out of one section and into another; `applyRecordReassignment` already checks project-total conservation.
- `INVARIANT_MONEY_REQUIRES_SECTION_BEFORE_ISSUE`: with D1, unassigned doors block issue.
- `INVARIANT_ISSUED_SECTION_SNAPSHOT_IMMUTABLE` and the financial fingerprint: any door money change after approval changes the financial fingerprint and requires re-approval (existing behavior, now correctly triggered by door edits).
- Governance: BFF-only writes, no new migration unless O1 is taken (then `pg_mcp_admit` applies).

---

## 6. Execution order in `Cursor-ProposalGenerator`

Slice per CONTRIBUTING ("no broad mixed-domain PRs"): each PR independently revertible, `npm run validate` green.

| Order | PR | Contents | Primary files |
| --- | --- | --- | --- |
| 1 | A — financial core | D1 attribution builder replacing the fabrication-only stub; D2 sell derivation; pure `door-money-sync.ts` (compute, diff, apply delta) built on `applySectionScopedBridgeSync` / `applyAttributionDelta`; unit tests | `src/lib/estimate-sections/elevations-doors/readiness-integration.ts`, new `elevations-doors/door-money-sync.ts`, `src/lib/estimate-sections/__tests__/section-elevations-doors.test.ts`, `financial-ledger.test.ts` |
| 2 | B — write paths | T1 pre-refresh in `applyElevationSectionMutations`; T2 post-save sync in the door-schedule route, merge-review apply, and Glazier import apply; T3 route + client method on `estimateSectionsClient` | `src/lib/estimate-sections/elevations-doors/assignment-mutations.ts`, `src/app/api/projects/[projectId]/door-schedule/route.ts`, `src/lib/doors/merge-review-apply-service.ts`, new `src/app/api/projects/[projectId]/estimate-sections/door-money-sync/route.ts`, `src/lib/estimate-sections/estimate-sections-client.ts`, API route authority manifest (`npm run generate:api-route-authority-manifest`) |
| 3 | C — Door Module UI | D6 "Door pricing by section" block, unassigned row, drift badge, sync action | `src/app/doors/page.tsx`, new component under `src/components/estimate-sections/` |
| 4 | D — proposal output | D5 description polish and the O3 decision; tests proving three rows (Exterior / Interior / Retail) with door money | `src/lib/proposals/intelligence-proposal/build-section-payloads.ts`, `src/lib/estimate-sections/__tests__/section-proposal-output.test.ts`, `section-markup-report.test.ts` |
| 5 | E — docs and gates | Work-package doc under `docs/work-packages/`, Application Bible sync, e2e scenario extension; if O1 is taken, contract amendment through the ship/pivot decision path | `docs/work-packages/proposal-generator-dynamic-estimate-sections-v1/`, `e2e/estimate-sections-section-manager-acceptance.spec.ts` |

Each Cursor session follows Auto Protocol v3.2 preflight and closeout with `CG_AUTO_V32_WORK_PACKAGE=pg-estimate-sections-door-money-rollups-v1`.

---

## 7. Verification

Unit and gate (run locally, all must pass before each PR):

```bash
npm run test:estimate-sections-elevations-doors
npm run test:estimate-sections-financial-ledger
npm run test:estimate-sections-proposal-output
npm run test:estimate-sections-markup-report
npm run gate:estimate-sections-forbidden-patterns
npm run gate:api-route-authority
npm run validate
```

New or extended test cases (numbering continues the existing suites):

- Door attribution equals D1 for single, pair, and quantity > 1 doors; a door with hardware only is money-bearing.
- First assignment writes `doors` and `labor` only on the target section; other sections' values unchanged (erasure guard).
- Reassigning a door moves the full D1 amount and conserves the project total; stale registry revision leaves no partial move.
- Hardware set change on an assigned door applies only the delta to that section; removing the door subtracts it.
- Unassigned door money appears in no section and blocks approve-for-output; assigning clears the block.
- Three active sections named Exterior, Interior, Retail with one door each → three breakout rows whose totals include door + hardware money, in Section Manager order; renaming or reordering sections changes no totals.
- Legacy project: `scopes.doors` behavior, two-row Pricing Summary, and totals unchanged.

Staging acceptance (browser, dynamic project): create Retail in Section Manager; assign at least one door to each of Exterior, Interior, Retail on the Doors page (one via elevation inheritance, one via manual override); pick hardware sets; confirm the Doors page break-out, the Markup Report per-section Doors lines, and the PDF preview three-row Pricing Summary agree; approve for output and confirm the snapshot carries the door money; change one door's hardware set and confirm re-approval is required.

---

## 8. Open decisions for Wesley

| ID | Decision | Recommendation |
| --- | --- | --- |
| O1 | Show hardware as its own line per section on the Markup Report and PDF (activate the placeholder `hardware` category; amends the frozen fingerprint category order and Markup Report V1 list) vs fold hardware into the Doors line with the break-out visible on the Door Module | V1: fold into Doors; break-out on the Door Module. Revisit as V1.1 with a contract amendment if the customer document needs a hardware line. |
| O2 | How door leaf/fab and door labor sell is derived on dynamic projects (the dynamic ledger stores sell and the engine applies no markup or tax) | Apply the Mark Up Report material and labor markup rates at bridge time, matching legacy door math. Treat dynamic-model markup and tax semantics for all categories as a separate decision. |
| O3 | PDF roll-up rows: allocate job-level outside costs and admin labor across sections so the three rows sum to the Proposal Value (legacy behavior), or leave rows as section subtotals with a separate project-level line | Allocate proportionally to section sell for the customer document only; the ledger and Markup Report stay unallocated. |
| O4 | Which project drives acceptance. Only `dynamic_sections_v1` projects can carry a Retail section; legacy projects need the deferred `pg-estimate-sections-conversion-v1` | Use a dynamic project (staging or a newly created one). If the target is an existing legacy project, the conversion work package has to be pulled forward first. |
| O5 | Whether a door's `interiorExterior` attribute should suggest a section candidate when an active section carries that exact name (the way elevation frame-set names do) | No. Doors inherit from their elevation; Retail and any other exceptions use the manual override already on the Doors page. |

---

## 9. Explicitly not in scope

- Converting legacy projects to dynamic sections (`pg-estimate-sections-conversion-v1`, deferred by the frozen program).
- Any change to the legacy `scopes.*` math, the legacy two-row Pricing Summary, or the legacy Markup Report.
- New normative contract files (three-file ceremony) or schema migrations, unless O1 is taken.
- Glass or metal bridges into the section ledger beyond what Import PO already does.
