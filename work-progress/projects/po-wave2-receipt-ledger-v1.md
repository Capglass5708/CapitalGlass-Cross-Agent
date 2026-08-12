# PO Wave 2 — WP-21 receipt transaction ledger

**Work package:** `po-wave2-receipt-ledger-v1`  
**Owner repo:** `capital-glass-po-app`  
**Harvest:** `harvest-2026-08-12-po-wave2-receipt-ledger-wp21-v1`

## Scope

Append-only `purchase_order_receipt_events` ledger integrated into PO Command Center. Document Center remains canonical for delivery/invoice documents.

## Implementation state

| Item | Status |
| --- | --- |
| Schema + RLS migrations | Applied shared-dev (`wvidyxufvcrtezzkwwse`) |
| Server routes + rollup service | `2ad9600` on `feat/po-wave2-receipt-ledger-v1` |
| Client `PoReceiptLedgerPanel` | Wired in `PurchaseOrderWorkspace` |
| Contract smoke + typecheck/build | PASS |
| Live API smoke (`smoke-receipt-ledger-api.mjs`) | PASS after API restart |
| Operator browser proof | **Pending** |
| PR merge | Pending browser proof |

## Do not advance

- WP-22 (3-way match), WP-23 (exceptions), WP-24 (vendor performance) until WP-21 browser proof recorded
- `PO_WAVE2_PROCUREMENT_MONEY_CONTROL_V1_COMPLETE` until full wave closes

## Evidence

- `capital-glass-po-app/artifacts/agent-runs/po-wave2-receipt-ledger-v1/closeout-manifest.json`
- Branch: `feat/po-wave2-receipt-ledger-v1` @ `2ad9600`
