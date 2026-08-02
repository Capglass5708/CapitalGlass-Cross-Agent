# Phase 0 ROI Report — Active Ledger Drain

**Work package:** `active-ledger-drain-and-intelligence-hub-sync-v1`  
**Generated:** 2026-08-03T03:30:00Z  
**Status:** Before/after projection — trimmed ledger **not yet activated**

---

## Baseline (operator-recorded, pre-drain)

| Metric | Value |
| --- | --- |
| Ledger lines | 419 |
| Words | 2,480 |
| Estimated tokens | ~5,968 |
| Progress log entries (live) | 16 (operator); 13 verified in snapshot |
| Open next actions | 5 |
| Cross-cutting blockers (INDEX) | 7 |
| Pending project file updates | 3 |
| Default machine preflight | Full Markdown parse |

**Source:** `work-progress/ACTIVE_WORK.md` at commit `14536296a976848cdf4a9d356ed161a4e605f317`  
**Snapshot:** `archive/2026-08/ledger-snapshots/phase-0-pre-drain/ACTIVE_WORK-2026-08-02-pre-drain.md`

---

## Proposed post-activation (trimmed ledger — not active)

| Metric | Proposed value | Target | Meets target? |
| --- | --- | --- | --- |
| Ledger lines | **80** (57 non-blank) | Under 150 | Yes |
| Words | **487** | — | — |
| Estimated tokens | **~1,169** | Under 1,600 | Yes |
| Token reduction | **80.4%** | At least 73% | Yes |
| Progress log entries (live) | **3** | Maximum 3 | Yes |
| Pending project updates | **0** | 0 | Yes (Phase 0) |
| Default machine preflight | Compact JSON slices | Compact JSON slices | Pending Phase 1 |

**Proposed file:** `archive/2026-08/ledger-snapshots/phase-0-pre-drain/ACTIVE_WORK.proposed-trimmed.md`

---

## Knowledge drain coverage (no loss)

| Category | Items | Drained to | Verified |
| --- | ---: | --- | --- |
| Ledger sections | 12 | Runbooks, Governance contract, canonical map, archive | Yes |
| Progress log entries | 13 | Project files, archive, L: master work | Yes |
| Open actions | 5 | Trimmed ledger + `active-work-open-actions.json` (Phase 1) | Mapped |
| Blockers | 7 | INDEX + `active-work-blockers.json` (Phase 1) | Mapped |
| Authority rules | 3 | Governance contract + canonical map | Yes |
| Commit/evidence rows | 8 | Project files + agent-runs | Yes |
| GPU host authority | 2 hosts | `CANONICAL_KNOWLEDGE_LOCATIONS.md` + `host-authority.json` | Yes |

---

## Token savings model

| Surface | Before (tokens) | After (tokens) | Savings |
| --- | ---: | ---: | ---: |
| Live ledger (agent read) | ~5,968 | ~1,169 | 80% |
| Default preflight (Phase 1) | ~5,968 (full MD) | ~400 (open-actions + blockers slices) | ~93% |
| On-demand full export | N/A | ~2,200 (structured JSON, no Markdown noise) | Retrieval-only |

---

## Phase 0 gate results

| Criterion | Required | Actual | Pass |
| --- | --- | --- | --- |
| Entries classified | 100% | 27/27 (100%) | PASS |
| Pending project files | 0 | 0 | PASS |
| Unresolved destinations | 0 | 0 | PASS |
| Pre-drain snapshot | Verified | SHA256 `5e5e59d7...` | PASS |
| Secrets detected | 0 | 0 | PASS |
| Current ledger modified | NO | NO | PASS |
| Governance authority doc | Ready | `ACTIVE_LEDGER_RELEASE_AUTHORITY_CONTRACT.md` | PASS |

---

## Activation blockers (intentional)

Trimmed ledger and L: publication remain **blocked** until:

1. Governance contract **APPROVED**
2. Phase 1 export reproduces all open actions, blockers, host authority, provenance
3. Schema validation PASS
4. L: atomic publish + read-back PASS
5. Rollback version preserved

---

## Enhancement recommendations

| ID | Class | Recommendation |
| --- | --- | --- |
| ER-1 | immediate-fix | Operator approve Governance contract to unblock Phase 1 |
| ER-2 | next-work-package | `cross-agent-get-active-work-mcp-v1` read tool on compact slices |
| ER-3 | architecture-candidate | Weekly drain cadence tied to `closeout:gate` advisory lint |
