# Claude — MCP and Protocol Guide v1

**Work package:** `claude-full-estate-platform-integration-v1`  
**Audience:** Claude running **in parallel** with Cursor on Capital Glass  
**Execution host:** WSL2 Ubuntu bash — `/home/wesley/repos`  
**Night Owl:** deferred — not in this guide

---

## 1. How Claude fits the estate

Capital Glass is a **multi-agent platform**. You are not a separate product stack.

| Client surface | Typical role | Authority |
| --- | --- | --- |
| **Cursor** | Implementation, MCP execution, gates, live repo edits | Same platform |
| **Claude** | Planning, investigation, coordination, reviews, ledger distillation | Same platform |
| **ChatGPT** | Plans, reviews, harvest distillation when asked | Same platform |
| **Human (Wesley)** | Approvals, promotion, secrets, Windows admin | Final operator |

```text
Claude  ──┐
Cursor  ──┼──► Capital Glass Platform (MCP + CLI + Hub + Git) ──► GitHub truth
ChatGPT ──┘
```

**You consume the same MCPs, protocols, and ledger as Cursor** — you do not invent parallel rules.

---

## 2. Three MCP authorities (never merge)

| MCP | Owns | Claude uses it for |
| --- | --- | --- |
| **Office Admin MCP** | Machines, endpoints, network, vault **policy**, Direct Connect | Office/IT missions before any script |
| **Doppler MCP** | System/application secret **names** and metadata — never values in chat | Env contract discovery |
| **SharePoint MCP** | M365 lists, drive ops where authorized | PO/tenant/document workflows |

Constitutional / build / diagnostic MCPs are **separate** — see sections 3–4.

---

## 3. MCP catalog — what you need when

### Tier 0 — Every material session (read first)

| MCP | Cursor ID | When | First tools / calls |
| --- | --- | --- | --- |
| **Intelligence Hub scout** | CLI equivalent: `npm run agent:index:scout` | Before expensive discovery | Compact slices; log `INDEX_HIT` / `INDEX_MISS` |
| **Luna retrieval** | CLI: `npm run luna:retrieve -- --director` | Before builder-level work | `LUNA_RETRIEVAL_HIT`; no repo grep first |
| **Failure Intelligence** | `user-failure-intelligence-mcp` | Before retrying a failed approach | `failure.preflight`, `failure.search_similar` |
| **Cross-Agent ledger** | Git read | Always for live status | `ACTIVE_WORK.md`, `CURRENT_HANDOFF.md` |

Run from **`~/repos/CG-AppBuilder-MCP`** in WSL bash unless mission names another owner repo.

### Tier 1 — Control plane (platform / multi-repo)

| MCP | Cursor ID | Role | Key tools |
| --- | --- | --- | --- |
| **CG App Builder** | `user-cg-app-mcp` | Scaffold, build, knowledge, intelligence | `full_build_preflight`, `knowledge_search_units`, `intelligence.get_agent_context` |
| **CG Platform Governance** | `user-cg-platform-governance-mcp` | North Star, constitutional authority | `governance_get_north_star_authority` |
| **CG Diagnostic** | `user-cg-diagnostic` | Health, preflight probes, env contracts | `preflight_plan`, `health_status`, `doppler_cli_check` |
| **CG Suite Wiring** | `user-cg-suite-wiring` | App topology, bridges | `resolve_wiring_path`, `list_suite_bridges`, `describe_bridge` |
| **Agent Loop** | `user-agent-loop` | Missions, loops, glass preflight | `glass_preflight`, `procedure_preflight`, `get_verification_playbook` |

### Tier 2 — Office / network (Office Admin repo missions)

**Mandatory sequence** before endpoint, device, tenant, Tailscale, or network work:

1. `office.get_agent_preflight` (pass `material: true` on material runs)
2. `office.get_security_rules`
3. `office.get_it_vault_policy`
4. `office.get_slice_roadmap`
5. `office.get_network_admin_index` (when network scope)

Cross-desk: `office.get_direct_connect_auto_connect_profile` → handoff bus on Z: — **not SSH first**.

| MCP | Cursor ID | Role |
| --- | --- | --- |
| **Office Admin** | `user-office-admin-mcp` | Endpoints, vault policy, Direct Connect, Synology refs |

Office Admin MCP is **read-only knowledge** in v1 — it does not execute scripts.

### Tier 3 — Implementation & deploy

| MCP | Cursor ID | When |
| --- | --- | --- |
| **GitHub** | `user-github` | PRs, issues, repo ops (governed — no bypass of branch protection) |
| **Doppler** | `user-doppler` | Secret **names** only; never paste values |
| **Supabase** | `user-supabase` / `user-supabase-mcp-control` | App DB vs control plane |
| **Vercel** | `user-vercel` | Deploy / project ops |
| **Railway** | `user-railway` | Railway services |
| **SharePoint** | `user-sharepoint` | Lists, PO diagnostics, M365 |
| **Azure** | `plugin-azure-azure` | Azure ops, App Insights traces |
| **Resend** | `plugin-resend-resend` | Email API |

### Tier 4 — Domain / app-local (use the owning app’s MCP)

Each suite app publishes a read-only **Application Bible MCP**. Call **`app.get_agent_preflight`** first in that app’s repo context.

| App | Cursor MCP (typical) | Production URL |
| --- | --- | --- |
| Apps Hub | `user-hub-app-mcp` | https://capitalglasstxapps.com |
| Project Dashboard | `user-dashboard-app-mcp` | https://projects.capitalglasstxapps.com |
| Purchase Orders | `user-po-app-mcp` | https://po.capitalglasstxapps.com |
| Contacts | `user-contacts-app-mcp` | https://contacts.capitalglasstxapps.com |
| Proposal Generator | `user-proposal-generator-app-mcp` | https://proposal.capitalglasstxapps.com |
| Document Center | `user-document-center-app-mcp` | https://documents.capitalglasstxapps.com |
| Calendar | `user-calendar-app-mcp` | https://calendar.capitalglasstxapps.com |
| Email | `user-email-app-mcp` | https://email.capitalglasstxapps.com |
| Computer Estimator | `user-cg-computer-estimator-mcp` | local / integration |
| CapitalGlassRevu | `user-bluebeam-revu` | local — **production workflow locked** |
| Failure Intelligence | `user-failure-intelligence-mcp` | estate-wide playbooks |

**Wiring reference (no secrets):** `Z:\Capital-Glass-Dev\Cursor-MCP-Kit\mcp-inventory.json`  
**Catalog mirror:** L: `00-master-index/BY-KIND/mcp-servers.json`

---

## 4. Protocol stack — run in this order

### A. Session open (every agent, every client)

| Step | Protocol | Command / action | Log |
| --- | --- | --- | --- |
| 1 | Host check | `test -d ~/repos/CG-AppBuilder-MCP && echo EXT4_OK` | `HOST_MODE_BLOCKED` if fail |
| 2 | Declare mission | work package id + mission class + **clientSurface=CLAUDE** | — |
| 3 | Hub scout | `npm run agent:index:scout -- --json` | `INDEX_HIT` / `INDEX_MISS` |
| 4 | Read ledger | Cross-Agent `ACTIVE_WORK.md` + `CURRENT_HANDOFF.md` | — |
| 5 | Luna director | `npm run luna:retrieve -- --query="<mission>" --director --json` | `LUNA_RETRIEVAL_HIT` |

Mission classes (Auto v3.2 AG-31): `investigate` | `fix` | `closeout` | `ownership` | `deploy` | `docs` — **one per session**.

### B. Material work (code, closeout, deploy)

From **`~/repos/CG-AppBuilder-MCP`** (or `CG_AUTO_V32_REPO` for cross-repo):

```bash
export CG_AUTO_V32_WORK_PACKAGE='<work-package-id>'
export CG_AUTO_V32_MISSION_CLASS='fix'   # or investigate, closeout, etc.
export CG_AUTO_V32_MATERIAL='true'
# export CG_AUTO_V32_REPO='/home/wesley/repos/<owner-repo>'

npm run agent:preflight:auto-v32 -- --run-compile --json
npm run agent:preflight:app-builder-mcp
npm run execution-context:resolve -- --work-package=<id> --json
```

| Protocol | Purpose |
| --- | --- |
| **Auto Protocol v3.2** | Material gates, cache read-through, session closeout |
| **Execution context** | Repo, branch, HEAD, host, eligibility GO/NO_GO |
| **Context compile** | `npm run agent:context:compile -- --work-package=<id>` when required |
| **App Builder MCP doctor** | Validates MCP + Bible freshness after auto-v32 |

Canonical doc: `CG-AppBuilder-MCP/docs/protocol-governance/Capital_Glass_Auto_Protocol_v3.2_AGENT.md`  
Operator mirror: `Z:\Capital-Glass-Dev\Chat GPT Instructions\Auto-Protocol\Auto v3.2\`

### C. WaveRunner missions

When operator says *Run WaveRunner regarding &lt;milestone&gt;*:

```bash
cd ~/repos/CG-AppBuilder-MCP
npm run sdlc:waverunner -- --milestone=<id> --json
# or resolve-only first:
npm run sdlc:waverunner:resolve -- --milestone=<id> --json
```

Authority: `scripts/sdlc-protocol-cursor/lib/waverunner-orchestrate.mjs`  
Capability registry: `scripts/sdlc-protocol-cursor/waverunner-capability-registry-v1.json`

WaveRunner composes: milestone lock, execution context cache, MCP overlay, harvest handoff, receipts.

### D. Intelligence Hub publish (after ledger edits)

From AppBuilder with Doppler when ingest approved:

```bash
export INTELLIGENCE_HUB_ROOT=/mnt/l/Capital-Glass-Intelligence-Hub
npm run active-ledger:export -- --repo=/home/wesley/repos/CapitalGlass-Cross-Agent
CROSS_AGENT_LEDGER_INGEST_APPROVED=1 doppler run --project cg-mcp --config dev -- \
  npm run cross-agent-ledger:ingest -- --apply --repo=/home/wesley/repos/CapitalGlass-Cross-Agent
npm run active-ledger:sync:check -- --repo=/home/wesley/repos/CapitalGlass-Cross-Agent
```

Expect **IN_SYNC** when L:, Supabase, and Git agree.

### E. Session close (material missions)

```bash
npm run auto:v3:session-closeout -- --work-package=<id> --payload=./closeout.json --json
```

Receipt: `artifacts/agent-runs/<work-package-id>/session-closeout-v3.2.json`  
Include **`clientSurface: "CLAUDE"`** in closeout payload when recording Claude-originated work.

### F. Office Admin 3-way (network/material IT)

Material changes in **CapitalGlass-Office-Admin** use Network 3-Way Composer:

```text
Controller → Builder → Critic → Verifier (PASS only from Verifier)
```

Only **Verifier** assigns PASS. Claude may plan or review; **Cursor subagents** often execute builder/critic/verifier roles today.

### G. Retrieval codes (mandatory vocabulary)

Use the **same codes as Cursor** — do not invent new ones:

| Code | Meaning |
| --- | --- |
| `INDEX_HIT` / `INDEX_MISS` | Hub compact slice outcome |
| `CACHE_HIT` / `CACHE_MISS` | Compiled context pack reuse |
| `LUNA_RETRIEVAL_HIT` | Luna director answered without raw scan |
| `DIRECT_CONNECT_HIT` | Cross-desk routing via Direct Connect |
| `HOST_MODE_BLOCKED` | Workspace on `/mnt/c` or forbidden path |
| `FAILOVER_GIT_LEDGER` | Hub missing; used Cross-Agent Git ledger |

---

## 5. Task → MCP routing matrix

| If the mission is… | MCP / CLI first | Owner repo |
| --- | --- | --- |
| Suite status / blockers | Hub scout + ledger | Cross-Agent |
| App feature / deploy gate | App-local MCP + Diagnostic | Owning app repo |
| Cross-app wiring | Suite Wiring + App Builder | CG-AppBuilder-MCP |
| Platform governance | Governance MCP + auto-v32 | CG-Platform-Governance-MCP |
| Office / endpoint / network | Office Admin MCP (full preflight) | CapitalGlass-Office-Admin |
| Failure / retry | Failure Intelligence MCP | CG-Failure-Intelligence-MCP |
| GitHub PR / CI | GitHub MCP + gh CLI | Owner repo |
| Secrets **names** | Doppler MCP | — |
| Estimating / Revu deep | Computer Estimator MCP + Hub L: (**fail closed** without L:) | Computer Estimator / Revu |
| Multi-step autonomous wave | WaveRunner CLI | CG-AppBuilder-MCP |
| Agent mission / loop | Agent Loop MCP | capital-glass-agent-ops |

---

## 6. What Claude cannot do through MCP alone

| Limit | Workaround |
| --- | --- |
| MCP wired in Cursor today | Wesley runs WSL CLI equivalents; or wire MCP in **Claude Code** from same `Cursor-MCP-Kit` inventory |
| Execute Office Admin scripts | MCP is read-only — operator/Cursor runs scripts; you plan and verify |
| Read vault contents | Forbidden — policy paths only |
| Bypass branch protection | Never — same as Cursor |
| Mutate Cross-Agent with code | Ledger markdown only — no `src/`, `scripts/`, MCP servers |

---

## 7. Claude connection checklist (operator)

For **full** integration Claude needs **knowledge + connection**:

| Layer | Claude Project upload | Claude Code / operator |
| --- | --- | --- |
| Estate awareness | `CLAUDE_ESTATE_AWARENESS_PACK_v1.md` | — |
| WSL policy | `CLAUDE_WSL_EXECUTION_POLICY.md` | Run commands in WSL bash |
| MCP + protocols | **This file** | Connect MCPs from `Cursor-MCP-Kit` inventory |
| Parallel rules | `CLAUDE_PARALLEL_OPERATION_GUIDE_V1.md` | Shared ledger + lane discipline |
| Live status | Refresh pack or paste `ACTIVE_WORK.md` | Git pull on Cross-Agent |

Repair MCP on WSL (Cursor parity reference):

```bash
cd ~/repos/Cursor-MCP-Kit   # or CG-AppBuilder-MCP repair scripts
# Operator runs documented repair — see Cursor-MCP-Kit/TODO.md
```

---

## 8. Agent Fast Path

- **Tier 0 every session:** scout → ledger → Luna → log retrieval codes
- **Material:** auto-v32 → app-builder preflight → execution-context → owner repo work → closeout
- **MCP:** Office Admin triple + slice for IT; app MCP for apps; Suite Wiring for cross-app
- **clientSurface:** `CLAUDE` on all receipts you originate
- **WSL bash only** for platform CLI; see `CLAUDE_WSL_EXECUTION_POLICY.md`
- **Same platform as Cursor** — no Claude-only protocols
