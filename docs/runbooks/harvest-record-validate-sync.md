# Harvest record → validate → sync runbook

**Work package pattern:** `harvest-YYYY-MM-DD-<slug>-v1`  
**Authority:** `artifacts/agent-runs/<harvest-id>/harvest-manifest-v1.json`  
**Command index (machine):** `work-progress/command-index.json`

**Thread autopsy protocol:** [chat-thread-closeout-autopsy-harvest-v1.md](./chat-thread-closeout-autopsy-harvest-v1.md)  
**Intelligence Hub accommodation:** [thread-autopsy-hub-accommodation-v1.md](../intelligence-hub/thread-autopsy-hub-accommodation-v1.md)

Cross-Agent harvests record coordination state only. Implementation, SSH, runner install, and deploy mutations belong in owner repos.

---

## Command chain

| Step | Command | Repo | Purpose |
| --- | --- | --- | --- |
| 1 | Edit `harvest-manifest-v1.json` | CapitalGlass-Cross-Agent | Canonical machine authority |
| 2 | `npm run harvest:sync-derived` | CapitalGlass-Cross-Agent | Regenerate compact records, receipt, packet-index, coverage; refresh packet registry SHAs |
| 3 | `npm run harvest:render-index` | CapitalGlass-Cross-Agent | Update INDEX.md generated section |
| 4 | `npm run harvest:validate` | CapitalGlass-Cross-Agent | Gate before commit (includes thread autopsy when `threadAutopsy` set) |
| 4b | `npm run harvest:validate-autopsy -- --harvest-id=<id>` | CapitalGlass-Cross-Agent | Autopsy-only gate |
| 5 | `npm run test:harvest` | CapitalGlass-Cross-Agent | Regression tests |
| 6 | `npm run index:refresh-anchors` | CapitalGlass-Cross-Agent | Refresh handoff ledger anchor + continuity metadata |
| 7 | `npm run cross-agent-ledger:ingest -- --apply` | CG-AppBuilder-MCP | Supabase projection (requires `CROSS_AGENT_LEDGER_INGEST_APPROVED=1`) |
| 7b | `npm run active-ledger:sync -- --publish` | CG-AppBuilder-MCP | **Fallback** L: publish when Data-Extraction path unavailable |
| 8 | `npm run agent-research-library:publish-active-work-ledger` | Data-Extraction | Primary L: hub publish (operator approval) |
| 9 | `npm run index:freshness-gate` | CapitalGlass-Cross-Agent | **Required** — Git, Supabase, and L: must share `sourceCommitSha` |

**Operator one-shot** (steps 7–9): `npm run index:sync-publication` from Cross-Agent (Doppler + L: mount required) — **break-glass only** after v1.

**Automatic publication (v1.1):** `npm run index:publish` via GitHub Actions `index-publication.yml` on WESLEYDESK. Cursor preflight uses read-only `npm run index:preflight`.

Steps 7–9 are **not** part of harvest recording. Run after ledger or manifest edits and operator approval.

---

## Authority rules

1. **One manifest** — `harvest-manifest-v1.json` is the machine source of truth.
2. **Derived views** — `packet-index.json`, `receipt.json`, `HARVEST_SUMMARY.md`, `compact-records/`, `coverage.json` are generated.
3. **Registries** — `work-progress/harvest-packet-registry.json`, `owner-repo-boundary-index.json`, `harvest-verdict-registry.json` track cross-harvest continuity.
4. **Command index** — `work-progress/command-index.json` lists executable vs doc-only commands (`executable: false` for operator UI steps).
5. **INDEX section** — rows between `HARVEST-PACKET-INDEX:START/END` are generated only.
6. **No secrets** — forbidden keys: token, secret, password, authorization, bearer, apiKey, privateKey.

---

## Freshness gate (fail-closed)

After any Cross-Agent push that affects the ledger or harvest authority:

```bash
npm run cross-agent-ledger:ingest -- --apply    # CG-AppBuilder-MCP
npm run agent-research-library:publish-active-work-ledger  # Data-Extraction
npm run index:freshness-gate                      # CapitalGlass-Cross-Agent
```

Receipt: `artifacts/agent-runs/cross-agent-index-freshness-gate-v1/latest.json`

All three layers must report the same `sourceCommitSha` as `git rev-parse HEAD`.

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

Commit harvest changes only when validation PASS **and** `index:freshness-gate` PASS after publication sync.
