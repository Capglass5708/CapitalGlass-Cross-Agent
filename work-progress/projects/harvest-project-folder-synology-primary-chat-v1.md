# Harvest: project-folder Synology-primary program

**Harvest ID:** `harvest-project-folder-synology-primary-chat-v1`  
**Mission class:** harvest + index + publish  
**Verdict:** see `artifacts/agent-runs/harvest-project-folder-synology-primary-chat-v1/receipt.json`  
**Subject:** Synology-primary project-folder program (contract → dev → hardening → production → stabilization)

---

## Authority

| Layer | Path |
|-------|------|
| Machine manifest | `artifacts/agent-runs/harvest-project-folder-synology-primary-chat-v1/harvest-manifest-v1.json` |
| Q&A index | `artifacts/agent-runs/harvest-project-folder-synology-primary-chat-v1/qa-index.json` |
| Current-state compact | `artifacts/agent-runs/harvest-project-folder-synology-primary-chat-v1/compact-retrieval-records.json` |
| Timeline | `artifacts/agent-runs/harvest-project-folder-synology-primary-chat-v1/decision-timeline.json` |
| Evidence ledger | `artifacts/agent-runs/harvest-project-folder-synology-primary-chat-v1/evidence-ledger.json` |

**Transcript coverage:** `PARTIAL` — committed evidence + live verification; full Cursor transcript not re-ingested byte-for-byte.

---

## Current operational truth (verified harvest)

| Fact | Value |
|------|--------|
| Production promotion | **CLOSED** — `PRODUCTION_PROMOTION_PASS` |
| New-project provisioning | **LIVE** (observe-only stabilization) |
| Promotion deploy SHA | `5a436d1` (candidate `e3fe6ec`) |
| Live `/api/version` | May advance (e.g. `0f84735` descendant) |
| Production flag | `true` (prd) |
| Production worker | Running on WESLEYDESK |
| Historical migration | **Frozen** |
| SharePoint Slice 4 | **Frozen** |

---

## Related work packages

- [`project-folder-synology-primary-v1.md`](./project-folder-synology-primary-v1.md)
- [`project-folder-synology-primary-v1-dev-hosted-environment.md`](./project-folder-synology-primary-v1-dev-hosted-environment.md)
- [`project-folder-synology-primary-v1-dev-reproducibility-hardening.md`](./project-folder-synology-primary-v1-dev-reproducibility-hardening.md)
- [`project-folder-synology-primary-v1-production-promotion.md`](./project-folder-synology-primary-v1-production-promotion.md)
