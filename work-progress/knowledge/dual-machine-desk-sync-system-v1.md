# WESLEY_WORK ↔ RYZEN9DESK — desk sync system (Intelligence Hub authority)

**Domain:** `office-infrastructure`  
**Kind:** `dual-machine-desk-sync`  
**Schema:** `intelligence-hub-dual-machine-desk-sync-v1@1.0.0`  
**Work package:** `dual-machine-desk-sync-hub-v1`  
**Git source of truth:** `CapitalGlass-Cross-Agent/work-progress/knowledge/dual-machine-desk-sync-system-v1.md`  
**Hub mirror:** `L:/Capital-Glass-Intelligence-Hub/03-domains/office-infrastructure/knowledge/dual-machine-desk-sync-system-v1.md`  
**Compact slice:** `00-master-index/BY-KIND/cross-desk-routing.json`  
**Published:** 2026-08-12  
**Status:** `CURRENT` — operator + agent retrieval authority for cross-desk alignment

---

## 1. Core principle

**Desks do not share repos over SSH, rsync, or UNC worktrees.**

WESLEY_WORK (`CG-WESLEYWORK-01`, integration captain) and RYZEN9DESK (`CG-RYZEN9DESK-01`, execution engine) stay connected through **stacked buses and gates**:

| Layer | Bus | Role |
| --- | --- | --- |
| Code | **Git** (`origin/main` on GitHub) | Canonical implementation SHA |
| Epoch | **Hop packet** (JSON) | Fast “same SHA?” proof at session open |
| Operator missions | **Z: Direct Connect handoffs** | Packets, receipts, human/agent contracts |
| Coordination | **Lane leases** (dual-machine mission) | Prevents dual-writer on same branch |
| Suite status | **Intelligence Hub / Cross-Agent ledger** | What is active — not code transport |
| Optional | **SSH break-glass** | WSL command on peer host — **not** the hop |

Implementation owner: **CG-AppBuilder-MCP** (`scripts/dual-machine/`).  
Office Admin MCP: Direct Connect front door (read-only delegation).  
Forbidden first transport: SSH / Tailscale SSH / SCP for cross-desk Git sync.

---

## 2. Physical connectivity

| Path | Role |
| --- | --- |
| `Z:\Office\Wes\Direct Connect\handoffs` | Handoff bus (WSL: `/mnt/z/Office/Wes/Direct Connect/handoffs`) |
| `INDEX.json` → `activeHandoff` | Points to dated folder (e.g. `8-12-26`) |
| LAN / mapped drives | Z:, L:, office surfaces |
| Tailscale | Reachability (e.g. Wesley `100.76.10.91`) |
| GitHub | Single publication authority for all clones |

**Office Admin MCP sequence (delegation only):**

1. `office.get_direct_connect_auto_connect_profile`
2. `office.get_ryzen9desk_connection_status`
3. `office.list_direct_connect_handoffs` / `office.get_direct_connect_handoff`
4. `office.evaluate_ryzen9desk_dispatch_eligibility`
5. `office.request_ryzen9desk_dispatch` → **CG-AppBuilder-MCP GHA** (not inline from Office Admin)

Preflight: `npm run direct-connect:preflight -- --json` (from CG-AppBuilder-MCP).

---

## 3. Git (code bus)

Each desk owns **WSL ext4** clones under `~/repos` (Ryzen may use `~/wesley/repos`). GitHub `main` is truth.

### Control-plane clone roles (WESLEY_WORK example)

| Clone | Path pattern | Role |
| --- | --- | --- |
| **Primary** | `~/repos/CG-AppBuilder-MCP` | Day-to-day editing; may be dirty/behind — **never reset for coordination** |
| **Unify worktree** | `~/repos/CG-AppBuilder-MCP-worktrees/protocol-40-estate-unify-v1` | Cross-desk authority probe — `fetch` + `reset --hard origin/main` when `main` moves |

Only **CG-AppBuilder-MCP** carries the named Protocol 40 unify worktree. Other suite repos align via normal `git fetch` on their working branches; estate-wide SHA checks are **fetch-only** on tier-1 control-plane unless a mission names more.

**Alignment rule:** both desks at the same `origin/main` SHA on unify worktree (or lane branch when leased).

**Forbidden for hop hygiene:** `git reset --hard` on dirty primary, `git worktree add -B main`, rsync/SCP peer trees.

---

## 4. Hop packet (mechanical sync epoch)

- **Schema:** `dual-machine-hop-packet-v1@1.0.0`
- **Code:** `CG-AppBuilder-MCP/scripts/dual-machine/lib/hop-packet-v1.mjs`

**Fields (material):** `appBuilderSha`, `authorityEpoch`, `writtenByMachine`, `laneId`, `missionId`, `piTip`, `writtenAt`.

**Locations:**

1. Repo: `CG-AppBuilder-MCP/artifacts/agent-runs/dual-machine-hop-packet-v1/latest.json`
2. Z: mirror: `{activeHandoff}/hop-packet-latest.json` (or versioned `hop-packet-latest-N.json`)

**After merge to `main` (publisher desk):**

```bash
npm run dual-machine:write-hop-packet -- --json
```

Peer desk validates via cheap session-start (below). Git remains authority; hop packet is the **fast epoch comparator**.

**Squash-merge rule:** After squash lands, reset unify worktree to **live** `origin/main` HEAD — do not treat PR HEAD as landed SHA. Rewrite hop packet to live HEAD.

---

## 5. Cheap session-start (machine hop gate)

**Every desk open or machine hop:**

```bash
cd ~/repos/CG-AppBuilder-MCP-worktrees/protocol-40-estate-unify-v1   # or control-plane context
npm run dual-machine:session-start -- --cheap --pull --json
```

Work package: `dual-machine-session-start-cheap-v1`.

| Probe | Enforces |
| --- | --- |
| Git behind vs lane-aware ref | `behind: 0`, aligned HEAD |
| Machine role | WESLEYWORK vs RYZEN |
| Lane lease + mission | No dual-writer |
| Bootstrap checklist | Doppler, governance, MCP, Z, L |
| PI tip vs HEAD | Local snapshot, no live PI import |
| Hop packet | Local SHA vs bus epoch |

**Skipped on cheap:** full Z projection, AI-cache host parity, ASG delta plan.

**Optional full:** `npm run dual-machine:session-start -- --full --json`

**Forbidden on SESSION_START:** `closeout:gate`, `all-systems-go`, `asg:converge`, material Auto v3.2 without authorization, PI `FULL_REBUILD`, peer filesystem copy.

---

## 6. SESSION_START vs MATERIAL_SHIP

| Mode | When | Stack |
| --- | --- | --- |
| **SESSION_START** | Open Cursor, hop desks, continue leased work | Cheap session-start only |
| **MATERIAL_SHIP** | Merge, closeout, deploy, control-plane mutation | `dual-machine:ship-matrix` + App Builder preflight + `closeout:gate` + `write-hop-packet` |

Auto-detect → MATERIAL_SHIP when `CG_AUTO_V32_MATERIAL=true`, mission class `closeout|deploy|ownership`, or dirty control-plane paths.

---

## 7. Z: operator handoff protocol

Beyond hop packet, **numbered mission folders** carry intent and proof:

```text
Z:\Office\Wes\Direct Connect\handoffs\
  INDEX.json
  {dated-folder}\
    wesleywork handoff\     inbound to Wesley
    RYZEN9DESK HANDOFF\    outbound to Ryzen
    hop-packet-latest.json
```

Each packet: `00-START-HERE-N.md`, `FULL-REPORT-N.md`, `INDEX-N.json`, `RESULTS-*-N.json`.

This is how Protocol 40 unify, PR validation, finish lanes, and SSH probes run **without copying repos**.

---

## 8. Execution planes

| Plane | Host | Use |
| --- | --- | --- |
| **WSL GHA executor** | RYZEN9DESK WSL | Runner jobs, bootstrap, verify |
| **WINDOWS_INTERACTIVE** | RYZEN9DESK Windows | Revu live proof, Windows MCP |
| **LOCAL_SAME_DESK** | Where operator sits | No cross-desk transport |

WSL runner online ≠ Revu working. Log `DIRECT_CONNECT_FAILOVER_LOCAL` only when operator is physically at target desk.

---

## 9. Suite knowledge sync (parallel, not code bus)

For **what to work on** (blockers, active packages), not desk SHA:

| Priority | Source |
| --- | --- |
| 1 | L: `00-master-index/BY-KIND/*.json` |
| 2 | Supabase structured-ledger projection |
| 3 | Git: `CapitalGlass-Cross-Agent/work-progress/ACTIVE_WORK.md`, `handoffs/CURRENT_HANDOFF.md` |

Z: `AI-Cache-Authority` — agent context compile/reuse lane.  
Index publication: WESLEYDESK GitHub Actions — not Cursor agents.

---

## 10. SSH break-glass (optional)

SSH does **not** complete or fail the Git hop.

| Item | WesleyWork |
| --- | --- |
| User | **`wesle`** (not `Wesley`) |
| Target | `wesle@100.76.10.91` |
| Admin keys | `C:\ProgramData\ssh\administrators_authorized_keys` |
| Tailscale SSH on Windows | **Unsupported** |

```bash
ssh -i ~/.ssh/cg-ryzen9desk-wesleywork-01 -o BatchMode=yes wesle@100.76.10.91
```

Never place private keys on Z:.

---

## 11. Operator checklist

| When | Action |
| --- | --- |
| Every desk open | `dual-machine:session-start -- --cheap --pull --json` — expect `READY`, `git.behind: 0` |
| After `main` advances | Publisher: `write-hop-packet`; both desks: sync unify worktree + cheap session-start |
| Cross-desk mission | New Z: folder + numbered packets + JSON receipts |
| Ryzen remote work | Office Admin dispatch eligibility → GHA on runner |
| Revu / Windows proof | `WINDOWS_INTERACTIVE` + handoff receipts |
| Never for hop | Reset dirty primary, `closeout:gate` on hop, rsync repos |

---

## 12. Agent retrieval

| Need | Read |
| --- | --- |
| Compact buses + SSH facts | `00-master-index/BY-KIND/cross-desk-routing.json` |
| Full system (this doc) | `03-domains/office-infrastructure/knowledge/dual-machine-desk-sync-system-v1.md` |
| Manifest pointer | `03-domains/office-infrastructure/manifests/dual-machine-desk-sync-v1.json` |
| Implementation | `CG-AppBuilder-MCP/docs/work-packages/dual-machine-session-start-cheap-v1.md` |
| Direct Connect rule | `direct-connect-first-read.mdc` (three-way-agent pack) |
| Office Admin knowledge | `CapitalGlass-Office-Admin/mcp/knowledge-index/cg-direct-connect-auto-connect.v1.json` |

**Retrieval codes:** `DIRECT_CONNECT_HIT` | `DIRECT_CONNECT_BLOCKED` | `DIRECT_CONNECT_FAILOVER_LOCAL` | `DIRECT_CONNECT_NOT_APPLICABLE`

---

## 13. Closure snapshot (2026-08-12 handoff `8-12-26`)

Evidence handoff: `HANDOFF-8-12-26-protocol-40-unify` · work package `dual-machine-hop-z-bus-persistence-v1`.

| Item | Value |
| --- | --- |
| Live `origin/main` SHA | `7513302f74371060789d3ffeddaae67bba2ce530` |
| Hop written by | `wesley_work` |
| Git hop verdict | **COMPLETE** at above SHA |
| Z: closure report | `8-12-26/RYZEN9DESK HANDOFF/FULL-REPORT-5.md` |

Re-run finish scripts only when `origin/main` advances again.

---

## Related authority

- `CG-AppBuilder-MCP/scripts/dual-machine/lib/hop-packet-v1.mjs`
- `CG-AppBuilder-MCP/scripts/dual-machine/lib/session-start-cheap-v1.mjs`
- `CapitalGlass-Cross-Agent/work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md`
- `CapitalGlass-Cross-Agent/handoffs/CURRENT_HANDOFF.md` (retrieval failover)
