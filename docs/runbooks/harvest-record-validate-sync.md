# Harvest record → validate → sync runbook

**Work package pattern:** `harvest-YYYY-MM-DD-<slug>-v1`  
**Authority:** `artifacts/agent-runs/<harvest-id>/harvest-manifest-v1.json`

Cross-Agent harvests record coordination state only. Implementation, SSH, runner install, and deploy mutations belong in owner repos.

---

## Command chain

| Step | Command | Repo | Purpose |
| --- | --- | --- | --- |
| 1 | Edit `harvest-manifest-v1.json` | CapitalGlass-Cross-Agent | Canonical machine authority |
| 2 | `npm run harvest:sync-derived` | CapitalGlass-Cross-Agent | Regenerate compact records, receipt, packet-index, coverage |
| 3 | `npm run harvest:render-index` | CapitalGlass-Cross-Agent | Update INDEX.md generated section |
| 4 | `npm run harvest:validate` | CapitalGlass-Cross-Agent | Gate before commit |
| 5 | `npm run test:harvest` | CapitalGlass-Cross-Agent | Regression tests |
| 6 | `npm run cross-agent-ledger:ingest -- --apply` | CG-AppBuilder-MCP | Supabase projection (separate step) |
| 7 | `publish-active-work-ledger` | Data-Extraction | L: hub publish (operator approval) |

Steps 6–7 are **not** part of harvest recording. Run only after ledger edits and operator approval.

---

## Authority rules

1. **One manifest** — `harvest-manifest-v1.json` is the machine source of truth.
2. **Derived views** — `packet-index.json`, `receipt.json`, `HARVEST_SUMMARY.md`, `compact-records/`, `coverage.json` are generated.
3. **Registries** — `work-progress/harvest-packet-registry.json`, `owner-repo-boundary-index.json`, `harvest-verdict-registry.json` track cross-harvest continuity.
4. **INDEX section** — rows between `HARVEST-PACKET-INDEX:START/END` are generated only.
5. **No secrets** — forbidden keys: token, secret, password, authorization, bearer, apiKey, privateKey.

---

## Verdict separation

| Field | Meaning |
| --- | --- |
| `overallHarvestVerdict` | Did harvest recording complete? |
| `packetVerdict` | Domain outcome for the packet |
| `packetState` | Descriptive current state |
| `advancementGate` | Evidence required to promote |
| `doNotAdvance` | Forbidden premature claims |

---

## Validation gate

`npm run harvest:validate` writes:

`artifacts/agent-runs/<harvest-id>/validation-result.json`

Commit harvest changes only when validation PASS.
