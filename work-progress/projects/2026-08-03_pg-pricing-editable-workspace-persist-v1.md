# Project: pg-pricing-editable-workspace-persist-v1

## Summary

Product fix for **pricing authority** between Mark Up Report UI, `proposal-editable-workspace` server record, and preview/print cover working price.

## Root causes (from harvest autopsy)

1. **Client → server:** Mark Up edits do not persist when `canPersistWorkspacePayload` requires `workspaceSynced === true` (often false on expired 360 Power pilot).
2. **Server → UI:** Hydration and `resetLocalProposalState` do not restore full server pricing (outside costs / subcontractor); preview cover reads $0 or door-only total.
3. **E2e alignment risk:** PUT from stale/zero localStorage can wipe server grand — guard localGrand > 100 and localGrand == UI.

## Status

| Field | Value |
| --- | --- |
| Verdict | **BLOCKED** — `PRODUCT_FIX_REQUIRED` |
| Owner repo | `Cursor-ProposalGenerator-1` |

## Key files

- `src/lib/projects/can-persist-workspace-payload.ts`
- `src/lib/projects/resolve-authoritative-proposal-pricing.ts`
- `src/lib/projects/proposal-workspace-local-cache-v6.ts`
- `e2e/helpers/estimator-trust.ts` (test-only server-sync fallback)

## Advancement gate

Client persist converges within e2e wait **or** hydrate loads server grand into Mark Up UI and preview cover without $0 cover after reset.

## Do not advance

- Treat e2e `syncSubcontractorCostToServer` PUT as production behavior
- PUT alignment from zero/stale localStorage
