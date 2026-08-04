# Active Work Progress

This is the shared editable valuable-work ledger for Wesley, ChatGPT, Cursor, and other agents.

Purpose: keep current work, project IDs, status, blockers, evidence, commits, verification, and next actions in one durable place.

**Operating rules:** `runbooks/AGENT_LEDGER_UPDATE_RUNBOOK.md`  
**Entry format:** `work-progress/projects/README.md`  
**Canonical knowledge map:** `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md`

## Current active status

| Field | Value |
| --- | --- |
| Last updated | 2026-08-04 |
| Current focus | **Wave A blocked (Block A)** — RYZEN9DESK runner restart + WESLEY_WORK drive-mount; parallel: DC smokes **PASS** (Agent 2) |
| Primary authority repo | CG-Platform-Governance-MCP |
| Execution repo | CG-AppBuilder-MCP |
| Coordination repo | CapitalGlass-Cross-Agent |
| Project index | `work-progress/projects/INDEX.md` |

## Current saved work

### 2026-08-04 CT — north-star-compounding-vertical-pilot-v1 (Agent 3 closeout)

| Field | Value |
| --- | --- |
| Work package | `north-star-compounding-vertical-pilot-v1` |
| Verdict | **VERTICAL_PILOT_CLOSEOUT_PASS** — Z bible sync CURRENT; Auto v3.2 material compile PASS; Governance closeout authorized |
| Z bible | `BIBLE-RELEASE-20260731-cf36e8116d90` — WESLEY_WORK CURRENT (542 files); required `sudo mount -t drvfs Z: /mnt/z` on WESLEY_WORK WSL |
| Auto v3.2 | `agent:preflight:auto-v32` PASS_WITH_WARNINGS; cache reuse ~98%; `closeoutRecorded: true` |
| Governance | `governance-closeout-decision-v1.json` → **PASS**; `session-closeout-v3.2.json` recorded |
| Index dogfood | `fresh-cursor-index-dogfood-v1/session-receipt.json` — INDEX_HIT_AI_CACHE, rawScanRequired=false |
| Corpus sync | **BLOCKED_DESTINATION_UNAVAILABLE** — `Z:/Capital-Glass-Dev/TOKEN Usage Reports` (needs full Z: tree on WESLEY_WORK) |
| Artifacts | `CG-AppBuilder-MCP/artifacts/agent-runs/north-star-compounding-vertical-pilot-v1/` |
| Next | `platform-governance-phase4-registries-v1`; Supabase drift probe repair; L: mount for hub publish |

### 2026-08-04 CT — infrastructure-executor-lane-v1 (Block A Waves A–E)

| Field | Value |
| --- | --- |
| Work package | `infrastructure-executor-lane-v1` |
| Verdict | **WAVE_A_BLOCKED_OPERATOR** — Waves C/E partial; B/D gated on A |
| Wave A | Runner **offline**; smoke [30924982497](https://github.com/Capglass5708/CG-AppBuilder-MCP/actions/runs/30924982497) **queued**; drive-mount verifier **FAIL** |
| Wave B | **GATED** — `wsl2-canonical-setup` after fresh `executor-smoke` receipt |
| Wave C | **PARTIAL_PASS** — Z: mounted; AI cache `Z_MASTER_THREE_HOST_AI_CACHE_ALIGNED`; L: not mounted |
| Wave D | Receipts written (`wave-gates-receipt-v1.json`); ingest after Wave A |
| Wave E | Auto-publisher **ACTIVE** on Z; Wave 2 blocked on runner + L: |
| Operator caution | Restart `~/actions-runner` on RYZEN9DESK — no duplicate registration |
| Receipt | `artifacts/agent-runs/infrastructure-executor-lane-v1/wave-gates-receipt-v1.json` |
| Next | Operator Wave A → **recheck** → Wave B–D closeout |

### 2026-08-04 CT — document-center-synology-dev-lane-v1 (Agent 2)

| Field | Value |
| --- | --- |
| Work package | `document-center-synology-dev-lane-v1` |
| Verdict | **LANE_CLOSEOUT_PASS** — production smokes green; dev alias repaired; SHA pins corrected |
| Production smokes | **PASS** — [run 30925269106](https://github.com/Capglass5708/CapitalGlass-Documents/actions/runs/30925269106) |
| SHA pins (Doppler `cg-documents/prd`) | `EXPECTED_DOCUMENT_CENTER_GIT_SHA` → `03f6d241ebf7c170c9f64d0bbfe50dd320fe231b`; `EXPECTED_PROJECT_DASHBOARD_GIT_SHA` → `1ad3312756e311a29f4a8162b9a4e2d2b0572283`; GitHub secrets synced |
| Dev alias regression | `documents-dev` had drifted to production `03f6d24` / claim **405** on wrong path |
| Dev alias repair | `vercel alias` → `dpl_8cve5SbrQowbVfT81Azh5LhEVzeR` (`7c0b76f`, preview); claim/complete unauthenticated **401** on internal routes |
| Production | **NOT touched** during repair — remains `03f6d24` / `dpl_F2ZTFTfb2UZ1GU4x73xyik6EebQ8` |
| Production Synology flag | **`PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=true`** in `cg-documents/prd` — **intentionally retained**; `PRODUCTION_PROMOTION_PASS` supersedes stale HALTED rows in this ledger |
| Receipt | `artifacts/agent-runs/document-center-synology-dev-lane-v1/receipt.json` |
| Next | Agent 3: `cross-agent-ledger:ingest --apply`; review stale AppBuilder PRs after DC green |

### 2026-08-04 CT — active-ledger-blocker-gate-sweep-v1

| Field | Value |
| --- | --- |
| Work package | `active-ledger-blocker-gate-sweep-v1` |
| Verdict | **BLOCKER_GATE_SWEEP_PASS** — 3 cleared, 5 domain-gated, 3 operator checklist |
| Cleared | Auto v3.2 env contamination; Document Center SHA (`f16b4ff` in Doppler + GitHub); `/mnt/c` regression (WSL default PASS) |
| Indexed blockers | 5 domain WPs remain in `INDEX.md` § Cross-cutting blockers |
| Gates | `check:auto-v32-session-env-policy` PASS; `active-ledger:sync` + L: publish; `cross-agent-ledger:ingest` |
| Receipt | `artifacts/agent-runs/active-ledger-blocker-gate-sweep-v1/blocker-gate-receipt.json` |
| Next | Rerun DC production smokes; operator MCP restart before compounding pilot |

### 2026-08-03 CT — Chat-thread harvest protocol hot-cache + ROI additions

| Field | Value |
| --- | --- |
| Work package | `chat-thread-harvest-protocol-hot-cache-roi-v1` |
| Verdict | **DOCS_ADDED** — protocol additions recorded in Cross-Agent |
| Runbook | `runbooks/CHAT_THREAD_HARVEST_PROTOCOL.md` |
| Artifacts | `artifacts/agent-runs/chat-thread-harvest-protocol-hot-cache-roi-v1/` |
| Added fields | `scoutHotCacheProof`, `recommendedRoi`, `commands`, `authorityLineage`, `staleAuthorityComparison` |
| Owner boundary | Cross-Agent records; AppBuilder implements tooling; Governance owns required protocol authority |
| Next | Implement schema/generator validation in AppBuilder if these become enforced fields |

### 2026-08-04 CT — harvest-2026-08-03-wesleydesk-runner-slice6-closeout-v1 (T2 autopsy)

| Field | Value |
| --- | --- |
| Work package | `harvest-2026-08-03-wesleydesk-runner-slice6-closeout-v1` |
| Verdict | **HARVEST_COMPLETE** — 3 packets, 4 seed candidates, 6 waste items |
| Artifacts | `artifacts/agent-runs/harvest-2026-08-03-wesleydesk-runner-slice6-closeout-v1/` |
| Thread | WESLEYDESK runner bootstrap, Slice 6 closeout, reboot persistence fix |
| Publication | Git only — hub `not-run` (operator: `harvest:publish-hub-seed` + `index:publish` on WESLEYDESK) |
| Next | Cold-reboot runner persistence proof; auto-publisher v1.1 activation |

### 2026-08-04 CT — intelligence-hub-capability-expansion-v1 wave 1

| Field | Value |
| --- | --- |
| Work package | `intelligence-hub-capability-expansion-v1` |
| Verdict | **WAVE1_SHIPPED** — `PUBLISH_PASS` @ `164bda7` |
| Artifacts | `artifacts/agent-runs/intelligence-hub-capability-expansion-v1/` (`milestone-receipt-v1.json`) |
| Publication | Git/Supabase/L: aligned; control slices on L: BY-KIND |
| Tests | `test:index-control-slices` 7/7 PASS; idempotency `NOOP_CURRENT` |
| Next | Wave 2 auto-publisher activation on WESLEYDESK |

### 2026-08-03 CT — harvest-current-cross-thread-state-v2 HARVEST_COMPLETE

| Field | Value |
| --- | --- |
| Work package | `harvest-current-cross-thread-state-v2` |
| Verdict | **HARVEST_COMPLETE** — 9/9 packets; `harvest:validate` PASS |
| Artifacts | `artifacts/agent-runs/harvest-current-cross-thread-state-v2/` |
| Preserved | `THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL` not claimed; hub published @ `164bda7` |
| Next | Post-publication blind retrieval for Slice 6 |

### 2026-08-03 CT — Cross-Agent index current + AI Cache Layer 0

| Field | Value |
| --- | --- |
| Work package | `cross-agent-index-current-ai-cache-v1` |
| Verdict | **CROSS_AGENT_INDEX_CURRENT_PASS**; **CROSS_AGENT_INDEX_AI_CACHE_LAYER0_PASS**; **FRESH_CURSOR_INDEX_DOGFOOD_PASS** |
| Publication | Git/Supabase/L: aligned @ `56e9a32` via `index:sync-publication` |
| AI Cache | Layer 0 mirror; operator `npm run agent:index:ai-cache:refresh` |
| Dogfood | `INDEX_HIT_AI_CACHE`, `freshnessVerdict=CURRENT`, `rawScanRequired=false` |
| Artifacts | CG-AppBuilder-MCP `artifacts/agent-runs/cross-agent-index-current-ai-cache-v1/` + `fresh-cursor-index-dogfood-v1/session-receipt.json` |

### 2026-08-03 CT — Cross-Agent index preflight estate-wide (rule propagation complete)

| Field | Value |
| --- | --- |
| Work package | `cross-agent-index-preflight-estate-wide-v1` |
| Verdict | **CROSS_AGENT_INDEX_PREFLIGHT_ESTATE_WIDE_PASS** — 26 SYNCED, 6 EXCLUDED |
| Artifacts | CG-AppBuilder-MCP `artifacts/agent-runs/cross-agent-index-preflight-estate-wide-v1/` (`coverage-table.json`, `operational-verdict.json`, `closeout-manifest.json`) |
| Preserved | `PREFLIGHT_INDEX_UTILIZATION_V1_PASS`; `PREFLIGHT_INDEX_3WAY_INTEGRATION_PASS`; `AUTO_PUBLISHER_V1_1_STAGED_NOT_ACTIVE` |
| Ledger note — Office Admin | Functionally covered; **not owner-branch absorbed**. Side branch `chore/cross-agent-index-preflight-estate-wide-v1` @ `17ab7ae` needs normal merge/rebase before absorption. |
| Next promotion | **`FRESH_CURSOR_INDEX_DOGFOOD_PASS`** — not more rule copying. Requires `sessionReceiptPath`, first-action evidence, `rawScanRequired=false` honored in a **fresh** Cursor session (build chats do not count). |

### 2026-08-03 CT — Cross-thread platform state harvest

| Field | Value |
| --- | --- |
| Work package | `harvest-2026-08-03-cross-thread-platform-state-v1` |
| Verdict | **HARVEST_COMPLETE** — 6/6 packets recorded |
| Artifacts | `artifacts/agent-runs/harvest-2026-08-03-cross-thread-platform-state-v1/` (`receipt.json`, `HARVEST_SUMMARY.md`, `packet-index.json`) |
| Project file | `work-progress/projects/2026-08-03_harvest-2026-08-03-cross-thread-platform-state-v1.md` |
| Constraints | No SSH, no runner install, no AppBuilder edits, no L: publish in harvest commit |
| Remaining | RYZEN9DESK bootstrap (AppBuilder mission); Office Admin indexing; Synology dev blockers; recurring ingest |

### 2026-08-03 CT — Cross-Agent repo hygiene and agent investigation playbook

| Field | Value |
| --- | --- |
| Work package | `cross-agent-repo-hygiene-and-agent-investigation-v1` |
| Verdict | **Docs PASS** — handoff reconciled; index/decision log expanded; investigation plan added |
| Files | `handoffs/CURRENT_HANDOFF.md`, `plans/2026-08-03_cross-agent-repo-hygiene-and-agent-investigation-v1.md`, `decisions/DECISION_LOG.md`, `projects/INDEX.md`, `AGENT_START_HERE.md` |
| Cleared blockers | Removed stale ingest HOLD and `/mnt/c` contradiction from handoff; unified retrieval failover contract |
| Remaining | Owner-qualify all 404 evidence paths; sync canonical `intelligence-hub-first-read` in AppBuilder; operator public-visibility review |
| Next | Commit/push Cross-Agent; republish L: + Supabase if ledger hash changes |

### 2026-08-03 CT — RYZEN9DESK managed executor (Phase 0 on `main`; bootstrap checkpoint)

| Field | Value |
| --- | --- |
| Work package | `ryzen9desk-managed-executor-v1` |
| Verdict | **RUNNER_BOOTSTRAP_CHECKPOINT_STARTED** — PR #268 merged `8fe7cf05`; bootstrap is CG-AppBuilder-MCP mission |
| Tooling | `.github/workflows/ryzen9desk-executor-dispatch.yml`, `scripts/executor/*`, `npm run ryzen9desk:executor:*` |
| Prior WP | `ryzen9desk-wsl2-canonical-workspace-v1` becomes first dispatched job (`wsl2-canonical-setup`) |
| Next | RYZEN9DESK install + `executor-smoke` — **do not claim** `MANAGED_EXECUTOR_ONLINE` until receipt |

### 2026-08-03 CT — RYZEN9DESK WSL2 canonical workspace (BLOCKED — superseded by executor dispatch)

| Field | Value |
| --- | --- |
| Work package | `ryzen9desk-wsl2-canonical-workspace-v1` |
| Verdict | `BLOCKED` — prepared on WESLEY_WORK; execute via managed executor on RYZEN9DESK |
| Tooling | `npm run ryzen9desk:wsl2-canonical`, machine profile `ryzen9desk.machine.json` |
| Receipts | `CG-AppBuilder-MCP/artifacts/agent-runs/ryzen9desk-wsl2-canonical-workspace-v1/` |
| Next | Dispatch `wsl2-canonical-setup` after runner online (see `ryzen9desk-managed-executor-v1`) |

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
| 1 | Elevated deploy: `Install-CgWesleyWorkDrivePersistence.ps1` + verifier on WESLEY_WORK (`wesleywork-drive-mount-task-dedupe-v1`) | CapitalGlass-Office-Admin | Ready — code implemented; live probe pending |
| 2 | Structured-ledger ingest after ledger edits (`cross-agent-ledger:ingest --apply`) | CG-AppBuilder-MCP / Agent 3 | **Ready** — post `document-center-synology-dev-lane-v1` ledger update |
| 3 | Review stale AppBuilder PRs #254, #252, #228, #227, #216 (`suite-ci-healing-v1` follow-up) | CG-AppBuilder-MCP | Ready — DC production smokes green |
| 2 | Use Windows Desktop `Capital Glass Cursor (WSL Suite).lnk`; close any Cursor windows opened from `/mnt/c` / `C:\Developer\repos` | Cursor / operator | Ongoing operating rule — WSL default verify PASS |
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

### 2026-08-04 CT — document-center-synology-dev-lane-v1 (Agent 2)

| Field | Value |
| --- | --- |
| Work package | `document-center-synology-dev-lane-v1` |
| Verdict | **LANE_CLOSEOUT_PASS** |
| Production smokes | **PASS** @ GitHub run `30925269106` after SHA pin correction to deployed `03f6d24` |
| Dev witness | Alias repair `documents-dev` → `7c0b76f` (`dpl_8cve5SbrQowbVfT81Azh5LhEVzeR`); internal claim/complete **401** without token |
| Production flag | Retained `true` per `PRODUCTION_PROMOTION_PASS` — do not revert on stale HALTED ledger text alone |
| Receipt | `artifacts/agent-runs/document-center-synology-dev-lane-v1/receipt.json` |

### 2026-08-03 CT — harvest-2026-08-03-cross-thread-platform-state-v1 HARVEST_COMPLETE

| Field | Value |
| --- | --- |
| Work package | `harvest-2026-08-03-cross-thread-platform-state-v1` |
| Verdict | **HARVEST_COMPLETE** — 6 packets: executor checkpoint, active-ledger CI PASS, Synology dev HOLD, retrieval failover PASS, WSL migration PARTIAL, Office Admin pointer |
| Receipt | `artifacts/agent-runs/harvest-2026-08-03-cross-thread-platform-state-v1/receipt.json` |
| Retrieval | `INDEX_HIT` (L: mounted) |
| Forbidden honored | No SSH, runner install, AppBuilder changes, or L: publish |

### 2026-08-03 CT — Synology-primary step #3: hosted dev HOLD

| Field | Value |
| --- | --- |
| Work package | `project-folder-synology-primary-v1-dev-hosted-environment` |
| Contract | **PASS** — `d8826e8` on CapitalGlass-Documents `main` |
| Hosted dev | **HOLD** — Vercel deploy `BLOCKED`; Supabase dev project not isolated (I2) |
| Doppler dev | Partial — roots, unique worker token, `CLAIMED_BY`, flag **off** |
| Stable alias | `documents-dev.capitalglasstxapps.com` registered; serves **stale f16b4ff** (not `d8826e8`); claim **405** |
| Production | **HALTED** / **NOT touched** |

### 2026-08-03 CT — Synology-primary: halt production, open dev-environment WP

| Field | Value |
| --- | --- |
| Work package | `project-folder-synology-primary-v1-dev-environment` (successor) |
| Parent | `project-folder-synology-primary-v1` → **PRODUCTIONIZATION_HALTED** |
| Root cause | Skipped hosted dev lane: local proof → production Vercel |
| Ops | `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=false` in Doppler `cg-documents/prd` + Vercel production |
| Dev roots | `L:\Capital-Glass-Projects-Dev` / Doppler `cg-documents/dev` |
| Production | Frozen until dev gates pass; promotion of proven commit only |

### 2026-08-03 CT — WESLEY_WORK drive-mount task dedupe IMPLEMENTED

| Field | Value |
| --- | --- |
| Work package | `wesleywork-drive-mount-task-dedupe-v1` |
| Verdict | **IMPLEMENTED / READY FOR LIVE DEPLOY** |
| Protocol | Office Admin Protocol v1.5 |
| Owner repo | CapitalGlass-Office-Admin |
| Root cause | Three 15m Health tasks without `IgnoreNew`/`Hidden` — duplicate flashing PowerShell windows |
| Fix | Keep `DriveMount-Health` only; remove `LanRecheck` + `User-Health`; hidden XML tasks + `-Quiet` |
| Unit tests | 7/7 PASS |
| Receipt | `artifacts/agent-runs/wesleywork-drive-mount-task-dedupe-v1/receipt.json` |
| Deploy | Elevated on WESLEY_WORK: `Install-CgWesleyWorkDriveMountPersistence.ps1` + `Test-CgWesleyWorkDriveMountTaskRegistration.ps1 -ExpectRegistered` |
| Live probe | Pending after deploy |

### 2026-08-03 CT — WESLEY_WORK WSL default layout PASS

| Field | Value |
| --- | --- |
| Work package | `capital-glass-cursor-wsl-default-v1` / `wsl-mcp-cursor-doppler-promptops-hardening-v1` follow-on |
| Status | **PASS** — Cursor WSL default active |
| Default workspace | `/home/wesle/Capital-Glass-Suite.WSL.code-workspace` |
| Full workspace | `/home/wesle/Capital-Glass-Full-Library.WSL.code-workspace` |
| Active repo root | `/home/wesle/repos` |
| Inventory | 39 active repos plus `_archive/` |
| Archived | 24 stale clones moved to `_archive/worktree-clones/` |
| Operator docs | `~/.config/capital-glass/README.md` |
| Env authority | `~/.config/capital-glass/cursor-wsl.env` |
| Layout manifest | `~/.config/capital-glass/wsl-layout.v1.json` |
| Windows launcher | `Capital Glass Cursor (WSL Suite).lnk` |
| Verify | `PASS: Cursor WSL default is active` |
| Repair sequence | `npm run cursor:wsl-organize`; `npm run cursor:wsl-default`; `npm run cursor:wsl-default:verify` |

### 2026-08-03 CT — suite CI healing partial PASS

| Field | Value |
| --- | --- |
| Work package | `suite-ci-healing-v1` |
| Status | **PARTIAL PASS** — three surfaces green; Document Center blocked on deployed-SHA secret mismatch |
| Green | `capital-glass-product-catalog` Validate; `Cursor-ProposalGenerator` drift canary; `CapitalGlass-Office-Admin` validate-code after PR #51 merge |
| Document Center | Workflow now uses `EXPECTED_DOCUMENT_CENTER_GIT_SHA`; production `/api/version` reports `f16b4ff` from `feat/storage-orchestrator-persistence-v1` |
| Required next | Update Doppler/GitHub secret to `f16b4ff334affe8c900cded6a6feac6480c0d848`, or redeploy from main and set expected SHA to that deploy |
| Backlog | Stale AppBuilder PRs #254, #252, #228, #227, #216; self-hosted nightly full closeout gate; Cross-Agent ext4 clone + ledger publish |
| Project file | `work-progress/projects/2026-08-03_suite-ci-healing-v1.md` |

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
| Next action | ~~begin `north-star-compounding-vertical-pilot-v1`~~ **DONE** — see 2026-08-04 vertical pilot closeout |

Older entries: `archive/2026-08/ledger-snapshots/phase-0-pre-drain/ACTIVE_WORK-2026-08-02-pre-drain.md`
