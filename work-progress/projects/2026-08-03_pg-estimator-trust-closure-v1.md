# Project: pg-estimator-trust-closure-v1

## Summary

**Estimator-trust business closure** for Proposal Generator on production **360 Power** (`721640c7-0351-4d3c-936e-6df02d7e2821`). Infra smokes 25/25 PASS does **not** satisfy closure. Required flow:

1. Change Mark Up Report total
2. Save, reload, Preview → **working** price
3. Approve, reload, export PDF → **issued** price
4. Change pricing again → visible **working vs issued** drift

## Status

| Field | Value |
| --- | --- |
| Work package | `pg-estimator-trust-closure-v1` |
| Owner repo | `Cursor-ProposalGenerator-1` |
| Verdict | **FAIL** — `ESTIMATOR_TRUST_BLOCKED` |
| Harvest | `harvest-2026-08-03-pg-estimator-trust-closure-v1` |

## Gate evidence (production, best run final9)

| Stage | Mark Up UI | Server editable-workspace | Cover / preview |
| --- | --- | --- | --- |
| Baseline after align | $5,545.44 | $5,545.44 | — |
| After +$5k subcontractor | $10,957.94 | $10,957.94 | via server-sync PUT |
| After reload | $0.00 or $5,545.44 | $10,957.94 | FAIL |
| Preview after resetLocalProposalState=1 | — | $10,957.94 | cover $0.00 FAIL |

## Proof command

```bash
PLAYWRIGHT_BASE_URL=https://proposal.capitalglasstxapps.com \
npm run test:e2e:estimator-trust-closure:doppler
```

## Do not advance

- `ESTIMATOR_TRUST_CLOSED`
- `PROPOSAL_GENERATOR_APP_CLOSED`
- Claim closure on infra smokes alone

## Next action

Fix pricing persist + hydrate (`pg-pricing-editable-workspace-persist-v1`); re-run gate with stage dollar logging.
