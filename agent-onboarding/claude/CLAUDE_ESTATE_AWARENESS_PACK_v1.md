# Capital Glass — Claude Estate Awareness Pack v1

**Version:** 1.0.0 · **Work package:** `claude-estate-awareness-v1` · **Generated:** 2026-08-18  
**Audience:** Claude (Anthropic) joining Capital Glass coordination  
**Authority:** Derived orientation — Git ledger and Governance docs override this pack when they differ

---

## 1. Your role

Capital Glass uses **multiple AI agents** (Cursor, ChatGPT, Claude, and others) plus human operators (Wesley as M365/infrastructure admin). You are a **coordination and planning assistant**, not an autonomous deploy agent.

| You should | You must not |
| --- | --- |
| Help Wesley think through architecture, plans, reviews, and ledger updates | Invent repo paths, SHAs, or verification results |
| Route work to the **correct owning repo** | Implement code in `CapitalGlass-Cross-Agent` (meeting repo only) |
| Respect authority boundaries (Governance → AppBuilder → owner repo) | Store or repeat passwords, tokens, vault contents, or `.env` values |
| Ask for refresh when status may be stale | Treat `Z:` or chat memory as source of truth |

**Permanent rule:** Governance decides what must be captured and whether work counts. AppBuilder produces receipts and runs execution. Cross-Agent records what matters and where to find it.

---

## 2. Ten-minute read order (live Git)

When Wesley gives you repo access, read in this order:

| # | Location | Why |
| --- | --- | --- |
| 1 | `CapitalGlass-Cross-Agent/AGENT_START_HERE.md` | Operating rules |
| 2 | `CapitalGlass-Cross-Agent/handoffs/CURRENT_HANDOFF.md` | Reconciled snapshot |
| 3 | `CapitalGlass-Cross-Agent/work-progress/ACTIVE_WORK.md` | Live ledger (newest first) |
| 4 | `CapitalGlass-Cross-Agent/work-progress/projects/INDEX.md` | All project files |
| 5 | Relevant `work-progress/projects/<project-id>.md` | Mission-specific truth |
| 6 | `L:/Capital-Glass-Intelligence-Hub/00-master-index/AGENT_START_HERE.md` | Build catalog front door |

Without repo access, sections 3–8 below are your standing briefing.

---

## 3. What Capital Glass is building

Capital Glass is a **commercial glazing contractor** building an integrated software suite for estimating, proposals, purchase orders, documents, projects, contacts, calendar, email, and office IT operations.

### Production suite apps (12)

| App | Domain | Production URL |
| --- | --- | --- |
| Apps Hub | hub | https://capitalglasstxapps.com |
| Project Dashboard | dashboard | https://projects.capitalglasstxapps.com |
| Purchase Orders | po | https://po.capitalglasstxapps.com |
| Contacts | contacts | https://contacts.capitalglasstxapps.com |
| Proposal Generator | proposal | https://proposal.capitalglasstxapps.com |
| Document Center | document-center | https://documents.capitalglasstxapps.com |
| Calendar | calendar | https://calendar.capitalglasstxapps.com |
| Email | email | https://email.capitalglasstxapps.com |
| Bid Composer | integration | https://bid-composer.capitalglasstxapps.com |
| Product Catalog | catalog | https://catalog.capitalglasstxapps.com |
| Computer Estimator | integration | local parser / opening detection |
| CapitalGlassRevu | integration | Bluebeam Revu markup control plane |

### Platform / control repos (7)

| Repo | Role |
| --- | --- |
| `CG-Platform-Governance-MCP` | Constitutional authority, North Star, closeout validation |
| `CG-AppBuilder-MCP` | Control plane: Bible sync, context compile, cache, harvest, gates |
| `CapitalGlass-Cross-Agent` | Coordination ledger, handoffs, decisions (no implementation) |
| `CapitalGlass-Office-Admin` | Office/network/endpoints, IT vault policy, Direct Connect |
| `Data-Extraction` | Research library, knowledge builds, Intelligence Hub index sync |
| `Scraper` | Raw vendor/GitHub capture |
| `CG-Computer-Estimator-MCP` | Estimator evidence (read-only MCP) |

### Estimating / Revu spine (critical domain)

| Component | Owns |
| --- | --- |
| **Computer Estimator** | Opening detection, parser evidence, GPU inference |
| **CapitalGlassRevu** | Approved Revu markup placement and read-back |
| **Bid Composer** | Human-estimator-approved quantities and review lane |
| **Proposal Generator** | Customer-facing proposal output |

**Production Revu workflow is locked** until plan → approval → export → Bid Composer review pilot passes (`revu-mcp-production-workflow-locked`). Human estimator approval is mandatory for production markup.

---

## 4. Authority and secrets model

### Three live MCP authorities (do not merge)

| MCP | Responsibility |
| --- | --- |
| **Office Admin MCP** | Machines, endpoints, network, storage mappings, admin boundaries |
| **Doppler MCP** | System and application secrets (names only through MCP) |
| **SharePoint MCP** | M365 identities, SharePoint lists and permissions |

### Secret stores

| Store | Canonical for |
| --- | --- |
| **Doppler** | Deploy tokens, API keys, service credentials, infrastructure integration |
| **`D:\Capital-Glass-IT-Vault`** | Endpoint and operator machine passwords (USB insert to execute) |
| **Git / docs / chat** | Secret **names** and contracts only — never values |

**Administrative machines:** `CG-WESLEYWORK-01`, `CG-WESLEYDESK-01` (co-equal, full Doppler).  
**Employee endpoints:** `CG-MACHINE-1`, `CG-MACHINE-2` — not control planes.

**M365 admin:** `wesley@capitalglasstx.com` · **Employees:** Fred, Nash (SharePoint users, not infra admins).

---

## 5. Host, path, and storage rules

### WSL-first execution (mandatory — not Windows shell)

> **Capital Glass agent and repo work runs in WSL2 Ubuntu bash on ext4 — not Windows PowerShell, not CMD, not `C:\Developer\repos`.**

Claude does not execute commands itself, but **every command and path it recommends** must assume Wesley runs them in **WSL bash** unless the task is a documented Office Admin Windows exception (Storage Keeper, drive mapping, `scripts/devices/*`).

| Rule | Value |
| --- | --- |
| Execution environment | **WSL2** — Ubuntu 24.04, **bash** |
| Canonical repo root | `/home/wesley/repos` (ext4) |
| **Forbidden** for Git/npm/agent work | `C:\Developer\repos`, `/mnt/c/Developer/repos` |
| Blocked host signal | `HOST_MODE_BLOCKED` — reconnect via WSL Suite Cursor shortcut |
| Windows shell allowed for | Office Admin exceptions only — label `WINDOWS_ADMIN_POWERSHELL` |

Full policy: upload **`CLAUDE_WSL_EXECUTION_POLICY.md`** from the Claude Start Package.

### Execution host (agents doing repo work)

| Rule | Value |
| --- | --- |
| Canonical repo root (WSL) | `/home/wesley/repos` (ext4) |
| Default shell | bash on Ubuntu 24.04 WSL2 |
| **Forbidden** for agent Git work | `C:\Developer\repos`, `/mnt/c/Developer/repos` |
| If workspace is on `/mnt/c` | Report `HOST_MODE_BLOCKED`; reconnect via WSL Suite shortcut |

### Storage layers

| Drive | Role | WSL path |
| --- | --- | --- |
| **GitHub** | Source of truth for code and coordination | — |
| **L:** | Intelligence Hub retrieval mirror (Synology via WESLEYDESK) | `/mnt/l/Capital-Glass-Intelligence-Hub/` |
| **Z:** | Published downstream / operator reference only | `/mnt/z/...` |
| **Z: AI-Cache-Authority** | Compiled context cache releases | `/mnt/z/Capital-Glass-Intelligence-Hub/AI-Cache-Authority` |

**Never treat Z: or L: presence as product truth.** Git + Governance authority win.

### Two-desk operations

| Desk | Host | Notes |
| --- | --- | --- |
| WESLEY_WORK | `CG-WESLEYWORK-01` | Primary control plane; Storage Keeper for Z:/L: health |
| WESLEYDESK / RYZEN9DESK | `CG-WESLEYDESK-01`, `CG-RYZEN9DESK-01` | Dev, L: hub, GPU (RTX 5080 on RYZEN9DESK) |

Cross-desk remote work uses **Direct Connect** (not SSH/Tailscale as first transport). GPU activation proof (`RTX5080_GPU_ACTIVATION_PROVEN`) belongs on **RYZEN9DESK**, not WESLEYDESK.

### WESLEYWORK storage (live as of 2026-08-13)

- **Front door:** `%LOCALAPPDATA%\CapitalGlass\Storage\Invoke-CgStorageKeeper.ps1 -Mode Health`
- **Do not:** ForceRemap, re-enable PreCursor, write L: from Cursor
- Windows Z: `\\cg-server\Capital Glass` · Windows L: `\\wesleydesk\CapitalGlass-L`

---

## 6. How agents retrieve truth

### Preflight slices (default — do not load full ledger every turn)

From `L:/Capital-Glass-Intelligence-Hub/00-master-index/BY-KIND/`:

1. `active-work-open-actions.json`
2. `active-work-blockers.json`
3. `host-authority.json` (when GPU/host matters)

### Failover (suite status / blockers only)

| Priority | Source |
| --- | --- |
| 1 | L: BY-KIND slices |
| 2 | Supabase structured-ledger projection (via AppBuilder + Doppler) |
| 3 | Git: `ACTIVE_WORK.md` + `projects/INDEX.md` |

**Revu / estimating deep topics:** L: required — fail closed if unmounted.

### Intelligence Hub inventory (2026-08-17)

| Kind | Count |
| --- | ---: |
| Capital Glass apps | 12 |
| Platform repos | 7 |
| MCP servers | 18 |
| External libraries | 42 |
| Knowledge builds | 43 |

Front door: `00-master-index/AGENT_START_HERE.md` + `AGENT_BUILD_CATALOG.json`.

---

## 7. Indexed blockers (domain — gated under owner WPs)

| Blocker | Owner | Affects |
| --- | --- | --- |
| Missing shared GitHub → articles builder | Scraper | Docling / Unstructured ingest |
| Rank-9 Arch FP YOLO benchmark URL unknown | Research | `revu-opening-detection-top10-v1` |
| DE opening-detection KB shallow | Data-Extraction | Opening detection pilots |
| Bid Composer weak on `window_schedule_row` | Bid Composer | CE parser ROI |
| Revu MCP production workflow locked | CapitalGlassRevu, Bid Composer | `revu-production-takeoff-pilot-v1` |

---

## 8. Top active work (2026-08-13 ledger anchor)

| Priority | Project | Status | Owner | Next action |
| --- | --- | --- | --- | --- |
| 1 | `ryzen9desk-managed-executor-v1` | CODE_READY_FOR_RUNNER_BOOTSTRAP | CG-AppBuilder-MCP | Install runner on RYZEN9DESK; dispatch `executor-smoke` |
| 2 | `project-folder-synology-primary-v1-dev-environment` | ACTIVE | CapitalGlass-Documents | Deploy DC to dev URL; prove Synology dev lane |
| 3 | `project-folder-synology-primary-v1` | HALTED | CapitalGlass-Documents | No prod until dev gates pass |
| 4 | `wesleywork-storage-protocol-contradiction-remediation-v1` | LIVE_MACHINE_PROOF_PASS | Office Admin | Hub republish via WESLEYDESK GHA — no L: write from Cursor |
| 5 | `suite-ci-healing-v1` | PASS pending smoke rerun | Document Center | Rerun production smokes |
| — | `cg-federated-repo-index-v1` | WAVE_A_CLOSED | AppBuilder + CE | L: hub publish only after operator authorization |
| — | `two-desk-operating-v1` | BOTH_READY | AppBuilder | Optional MCP reconnect |

Recent closed milestones worth knowing: structured-ledger projection operational, WSL MCP default active, AI-cache three-host aligned, active-ledger drain complete.

---

## 9. Agent operating protocols

### Cross-Agent (your coordination writes)

When material work starts, changes, blocks, or completes:

1. Update `work-progress/ACTIVE_WORK.md` (timestamped entry)
2. Create/update `work-progress/projects/<id>.md`
3. Update `work-progress/projects/INDEX.md`
4. Republish L: + Supabase after ledger edits (AppBuilder commands)

**Never** put implementation code, MCP servers, migrations, Bible copies, or secrets in Cross-Agent.

### Cursor / material implementation (Auto Protocol v3.2)

Material Cursor sessions declare:

- **Mission class:** `investigate` | `fix` | `closeout` | `ownership` | `deploy` | `docs`
- **Work package id:** e.g. `rosewood-elevation-review-structured-v1`
- Preflight: `npm run agent:preflight:auto-v32` from CG-AppBuilder-MCP
- Closeout: `npm run auto:v3:session-closeout`

Claude does not run these gates unless Wesley explicitly assigns a Cursor-equivalent mission.

### Office Admin 3-Way Composer (network/material IT)

Builder → Critic → Verifier; only Verifier assigns PASS. Used in `CapitalGlass-Office-Admin` for endpoint/network material work.

### Harvest / chat distillation

Long Cursor or Claude threads get distilled into the ledger via harvest protocol — extract decisions, SHAs, blockers, next actions; discard noise and secrets.

---

## 10. MCP servers Claude should know exist

Cursor operators connect these (read-only knowledge unless noted):

| Server | Role |
| --- | --- |
| `user-cg-app-mcp` | Scaffold, build, knowledge, intelligence |
| `user-cg-suite-wiring` | Suite topology and bridges |
| `user-office-admin-mcp` | Office/network preflight |
| `user-cg-diagnostic` | Health probes, preflight |
| `user-failure-intelligence-mcp` | Failure playbooks |
| `user-doppler` | Secrets metadata |
| `user-sharepoint` | M365 / SharePoint |
| `user-supabase` | Database ops |
| `user-vercel` / `user-cloudflare` | Deploy platforms |
| App-local MCPs | Per-app Application Bible (Hub, PO, Contacts, etc.) |

Claude typically has **no MCP** in Wesley's setup — treat this list as orientation for what Cursor/Git contain.

---

## 11. Research and library ladder

When asked "what libraries can help?":

1. `Data-Extraction/config/agent-research-library/`
2. `Scraper/ui-capture/artifacts/vendor-docs/`
3. `Data-Extraction/artifacts/data-extraction-2/`
4. `L:/Capital-Glass-Intelligence-Hub/` compact slices
5. Cross-Agent project file for the decision

**Approved for production use only:** `L:/Capital-Glass-Intelligence-Hub/10-approved-for-use/` (currently sparse — agent review required).

---

## 12. Destructive work guardrails

Default: **dry-run or plan-only**. No wipe, reset, format, or disk destructive actions unless the active Office Admin **slice** explicitly allows it. Slice 1 does not allow destructive endpoint work.

---

## 13. How to join a specific mission

Ask Wesley for:

1. **Work package id** (e.g. `suite-ci-healing-v1`)
2. **Owner repo** (where implementation happens)
3. **Mission class** (investigate vs fix vs docs)

Then read the project file and `ACTIVE_WORK.md` entry. Propose plans and ledger updates in Cross-Agent; implementation happens in the owner repo via Cursor or human operators.

---

## 14. Suggested first prompts for Wesley

**Orientation check:**

```text
Summarize Capital Glass active blockers, top 3 open projects, and which repo
owns each. Flag anything that looks stale versus today's date.
```

**Plan a feature:**

```text
Work package: <id>. Owner repo: <repo>. Mission class: docs.
Read the project file constraints and propose a phased plan without code.
List verification gates we would need before calling it done.
```

**Distill a long thread:**

```text
Distill this thread into an ACTIVE_WORK.md entry: status, repos, commits,
blockers, verification, next action. No secrets. No full code dumps.
```

---

## 15. Pack freshness

| Field | Value |
| --- | --- |
| Pack version | 1.0.0 |
| Hub index `updatedAt` | 2026-08-17T14:44:17.200Z |
| Cross-Agent commit hint | `4ae8fede82409da792b94f8a1012ddfd8be3b63c` |
| AppBuilder commit hint | `caf83871fd086601bff701793b1a0bc577ffcf9d` |

**Refresh when:** ledger materially changes, new blocker cleared, or Wesley reports drift.

---

## Agent Fast Path

- **Upload:** `CLAUDE_ESTATE_AWARENESS_PACK_v1.md` + `CLAUDE_WSL_EXECUTION_POLICY.md`
- **Paste:** `CLAUDE_CUSTOM_INSTRUCTIONS.txt` into Project custom instructions
- **Setup checklist:** `CLAUDE_SETUP_CHECKLIST.md`
- **WSL bash only** for repo/npm/Git — not PowerShell/CMD; `/home/wesley/repos` not `C:\Developer\repos`
- Live ledger: `ACTIVE_WORK.md` + `CURRENT_HANDOFF.md`
- Never implement in Cross-Agent; secrets in Doppler + IT Vault only
