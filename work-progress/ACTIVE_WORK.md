# Active Work Progress

This is the shared editable valuable-work ledger for Wesley, ChatGPT, Cursor, and other agents.

Purpose: keep current work, project IDs, status, blockers, evidence, commits, verification, and next actions in one durable place.

**Operating rules:** `runbooks/AGENT_LEDGER_UPDATE_RUNBOOK.md`  
**Entry format:** `work-progress/projects/README.md`  
**Canonical knowledge map:** `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md`

## Current active status

| Field | Value |
| --- | --- |
| Last updated | 2026-08-03 |
| Current focus | WSL MCP drift-proof repair implemented: `mcp:repair:cursor` PASS; Cursor MCP restart and optional commit/push remain |
| Primary authority repo | CG-Platform-Governance-MCP |
| Execution repo | CG-AppBuilder-MCP |
| Coordination repo | CapitalGlass-Cross-Agent |
| Project index | `work-progress/projects/INDEX.md` |

## Current saved work

| Repo | Commit | Status | Notes |
| --- | --- | --- | --- |
| CG-AppBuilder-MCP | PR #267 | Merged | PromptOps suite index refresh + ext4 repos-root fixes |
| CapitalGlassRevu | PR #5 | Merged | WSL root-fs preflight, application-bible/foundation CI fixes |
| CapitalGlass-Cross-Agent | `15f0e5e` | Pushed | Added WSL MCP hardening project file from pasted Cursor results |
| CG-AppBuilder-MCP | `63dbeb8c` | Pushed | Structured ledger Phase 1–3 milestone — ingest, drift probe, preflight wiring |
| CG-AppBuilder-MCP | PR #265 | Merged | ledgerOnly compact v2 + active-ledger spine (`c32c331f`; supersedes #264) |
| CG-Platform-Governance-MCP | `a5ce4c3` | Pushed | Structured ledger schema Phase 0 **CURRENT** |
| CapitalGlass-Cross-Agent | `7f1448f` | Pushed | Structured ledger milestone closeout in active ledger |
| Data-Extraction | `e6311b5` | Pushed | L: active-work publisher (Phase 1B) |

Full pre-drain commit table: `archive/2026-08/ledger-snapshots/phase-0-pre-drain/ACTIVE_WORK-2026-08-02-pre-drain.md`

## Operating rules (pointers)

| Rule | Authority |
| --- | --- |
| Governance decides what counts; AppBuilder executes | `CG-Platform-Governance-MCP/docs/platform/ACTIVE_LEDGER_RELEASE_AUTHORITY_CONTRACT.md` |
| Drained authority rules | `CG-Platform-Governance-MCP/docs/platform/ACTIVE_LEDGER_AUTHORITY_RULES.md` |
| Structured ledger schema | `CG-Platform-Governance-MCP/docs/platform/CROSS_AGENT_STRUCTURED_LEDGER_CONTRACT.md` | **CURRENT** |
| Bible-dependent work | `npm run bible:authority:gate` from CG-AppBuilder-MCP |
| GPU host authority | `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md` § GPU Host Authority |

## Open next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Reopen Cursor from `/home/wesle/repos/CG-AppBuilder-MCP` or WSL `.code-workspace`, not `/mnt/c/Developer/repos` | Cursor / operator | Required before seed |
| 2 | L: hub readable at `/mnt/l/Capital-Glass-Intelligence-Hub/00-master-index` | WESLEYDESK / WSL | Complete for seed report |
| 3 | WSL seed structured-ledger ingest and drift probe | CG-AppBuilder-MCP | Complete — `IN_SYNC` via Doppler-backed Supabase token |
| 3 | Reload Cursor MCP after WSL repair Waves 1-3 | Cursor / operator | Pending |
| 3 | Complete Vercel MCP auth only when Vercel connector is needed | Cursor / Vercel | Pending |
| 4 | Keep Cloudflare stdio disabled or fix `127.0.0.1:15170` OAuth loopback conflict | Cursor / Cloudflare | Pending |
| 5 | Commit and push Wave 4 `mcp:repair:cursor` changes from ext4 worktrees if remote promotion is desired | CG-AppBuilder-MCP / Cursor-MCP-Kit | Pending operator decision |
| 6 | Run Cursor seeding handoff `cross-agent-seed-wsl-mcp-backfill-v1` from `~/repos/CG-AppBuilder-MCP` | CG-AppBuilder-MCP | Pending |
| 7 | Re-run gated ingest after ledger updates (`cross-agent-ledger:ingest --apply`) | CG-AppBuilder-MCP | Recurring |
| 8 | Run drift probe when hub/projection may be stale | CG-AppBuilder-MCP | Recurring |
| 9 | Publish L: hub slices after ledger edits | Data-Extraction | Recurring |
| 10 | Restart MCP for Governance compounding tools | Cursor / local MCP | Pending |

**Default agent preflight (machine-readable):** `openActions` + `blockers` only — L: hub slices when available, else Supabase derived projection (`compact-slices-only`). Not full ledger. `currentFocus` human-only (`whats-active-now --include-current-focus`).

## Progress log (latest entries)

### 2026-08-03 CT — Wave 4 `mcp:repair:cursor` PASS

| Field | Value |
| --- | --- |
| Work package | `wsl-mcp-cursor-doppler-promptops-hardening-v1` follow-on |
| Status | **Implemented and verified locally** |
| Command | `npm run mcp:repair:cursor` |
| Machine output | `npm run mcp:repair:cursor:json` |
| Receipt | `~/.cursor/backups/mcp-repair-cursor-*.json` |
| Verification | PASS — 26 servers, 8 app spokes, ext4 paths, Doppler node-only wiring OK |
| Changed repos | `~/repos/CG-AppBuilder-MCP`, `~/repos/Cursor-MCP-Kit` |
| Operator next | Cursor -> Settings -> MCP -> Restart, then optional `npm run mcp:ack-cursor-restart` |
| Remote promotion | Pending if Wesley wants changes committed and pushed |

### 2026-08-03 CT — Wave 4 drift-proof MCP repair scoped

| Field | Value |
| --- | --- |
| Work package | `wsl-mcp-cursor-doppler-promptops-hardening-v1` follow-on |
| Status | **Implemented and verified locally** |
| Root cause class | Drift across Doppler truth, `integrations.env`, `mcp.json`, and WSL/Windows path semantics |
| Delivered slice | `npm run mcp:repair:cursor`: repair + app spokes + normalization + Doppler token sync + WSL path overrides + hard verify + receipt |
| Verification | `mcp:repair:cursor` PASS; `wsl:mcp:verify` PASS with 26 servers, 8 spokes, ext4 paths, Doppler wiring OK |
| Separate operator item | Add `RAILWAY_API_TOKEN` to Doppler for headless Railway fallback |

### 2026-08-03 UTC — WSL seed structured-ledger projection IN_SYNC

| Field | Value |
| --- | --- |
| Work package | `wsl-mcp-cursor-doppler-promptops-hardening-v1` / `cross-agent-seed-wsl-mcp-backfill-v1` |
| Status | **Ledger slice PASS** — compact PASS, L: mirror PASS, Supabase projection `IN_SYNC` |
| Supabase projection | `capital-glass-cross-agent/current` in project `xjivcwcyyimjujbchwdf` |
| Source commit | `5ddd274` |
| Content hash | `9eb1c56202067a7139aa264e6a13b6465525e3e6243a678491421a2c49c0e300` |
| Counts | 12 open actions / 10 blockers |
| Event | `5b090a49-acf4-43a3-8ffe-6705e65d7634` |
| Receipt | `~/repos/CG-AppBuilder-MCP/artifacts/agent-runs/cross-agent-structured-ledger-projection-v1/ingest-apply-receipt.json` |
| Note | Bare Supabase CLI returned 401; use `doppler run` from `cg-mcp/dev` so `SUPABASE_ACCESS_TOKEN` is injected |

### 2026-08-02 CT — WSL MCP / Cursor / Doppler / PromptOps hardening backfilled

| Field | Value |
| --- | --- |
| Work package | `wsl-mcp-cursor-doppler-promptops-hardening-v1` |
| Status | **Ledger seed slice PASS** — compact promoted to L: and verified; Supabase projection updated to `5ddd274` / `9eb1c562...`; drift `IN_SYNC`; host mode still `/mnt/c` remains separate |
| Project file | `work-progress/projects/2026-08-02_wsl-mcp-cursor-doppler-promptops-hardening-v1.md` |
| Verification | `wsl:mcp:smoke` 31/31 PASS; durable bootstrap 20/20 PASS; Doppler probe OK; path-coherence fallback `wsl:mcp:verify` PASS / `wsl:mcp:repair` NO_CHANGE |
| Next action | Reopen Cursor from `/home/wesle/repos/CG-AppBuilder-MCP`; keep Vercel MCP auth, Cloudflare loopback, and `mcp:attest` as separate follow-ups |

### 2026-08-02 CT — structured ledger projection Phases 1–3 milestone PASS

| Field | Value |
| --- | --- |
| Work package | `cross-agent-structured-ledger-projection-v1` |
| Status | **MILESTONE PASS** — ingest applied, drift `IN_SYNC`, derived-only verified |
| Evidence | `CG-AppBuilder-MCP/artifacts/agent-runs/cross-agent-structured-ledger-projection-v1/milestone-closeout-v1.json` |
| Commits | AppBuilder `63dbeb8c`; Governance `a5ce4c3` |
| Operating model | Git canonical; Supabase derived index; agents get blockers/actions only by default |

### 2026-08-02 CT — cross-agent registry + active-ledger drain closeout

| Field | Value |
| --- | --- |
| Work packages | `cross-agent-registry-onboard-v1`, `active-ledger-drain-and-intelligence-hub-sync-v1` |
| Status | **Closeout PASS** — governance authorized, corpus synced, lifecycle `CLOSEOUT_AUTHORIZED` |
| Evidence | `CG-AppBuilder-MCP/artifacts/agent-runs/active-ledger-drain-and-intelligence-hub-sync-v1/session-closeout-v3.2.json` |
| Next WP | `cross-agent-structured-ledger-projection-v1` Phases 1–3 **COMPLETE**; Phase 4 optional |

Registry onboard: AppBuilder `38a162da` / `48a1bff1`. Structured projection schema opened at Governance `dc49d9c`.

### 2026-08-02 CT — active ledger drain activated (trimmed live ledger)

| Field | Value |
| --- | --- |
| Work package | `active-ledger-drain-and-intelligence-hub-sync-v1` |
| Status | Phases 0–3 complete; Phase 5 closeout recorded |
| Repos | Cross-Agent `d25b79b`, AppBuilder `348b2133`/`cd4a9005`, Data-Extraction `e6311b5`, Governance `c40eb48` |

Project file: `work-progress/projects/2026-08-02_active-ledger-drain-and-intelligence-hub-sync-v1.md`

### 2026-08-02 21:02 CT — north-star-compounding-proof-v1 pushed with evidence

| Field | Value |
| --- | --- |
| Work package | `north-star-compounding-proof-v1` |
| Status | Pushed |
| Next action | Restart MCP; begin `north-star-compounding-vertical-pilot-v1` |

Older entries: `archive/2026-08/ledger-snapshots/phase-0-pre-drain/ACTIVE_WORK-2026-08-02-pre-drain.md`
