# Cross-Agent repo hygiene and agent investigation playbook

**Work package:** `cross-agent-repo-hygiene-and-agent-investigation-v1`  
**Date:** 2026-08-03  
**Owner repo:** `CapitalGlass-Cross-Agent` (coordination only)  
**Mission class:** docs + governance cleanup

## Purpose

Any agent (Cursor, ChatGPT, or other) investigating Capital Glass coordination state should get **one truthful startup path** without contradictory HOLDs, stale index rows, or conflicting retrieval rules.

This plan tracks the material audit findings and the correction order.

---

## How to investigate this repo (agent fast path)

### Step 0 — Confirm you are in the meeting repo

You are in **coordination only**. No implementation, MCP servers, or app code here.

### Step 1 — Read (in order)

1. `AGENT_START_HERE.md`
2. `handoffs/CURRENT_HANDOFF.md` (reconciled snapshot)
3. `work-progress/ACTIVE_WORK.md` (live ledger; newest entries at top)
4. `work-progress/projects/INDEX.md` (project catalog)
5. Open the **specific project file** for your work package

### Step 2 — Resolve host mode

```bash
test -d /home/wesle/repos/CapitalGlass-Cross-Agent && echo EXT4_OK || echo HOST_MODE_BLOCKED
```

If blocked: stop implementation; reconnect Cursor via WSL Suite workspace.

### Step 3 — Compact retrieval (suite / blockers / active work)

```bash
test -d /mnt/l/Capital-Glass-Intelligence-Hub/00-master-index && echo L_MOUNTED || echo L_MISSING
```

| L: mount | Action |
| --- | --- |
| Mounted | Read `BY-KIND/active-work-blockers.json`, `active-work-open-actions.json`, `whats-active-now.json` |
| Missing | Fall back to Supabase projection via AppBuilder `active-ledger:sync:check` + `whats-active-now`; then Git `ACTIVE_WORK.md` |

**Revu / estimating / MCP deep topics:** L: mount is **required** (`L_DRIVE_NOT_MOUNTED_IN_WSL` = stop). Supabase fallback does **not** apply to those slices.

### Step 4 — Find implementation

Use `repo-map/REPOSITORY_ROLES.md` and project file **Owner repo** column. Implement only in the owner repo.

### Step 5 — After material ledger changes

Follow `runbooks/AGENT_LEDGER_UPDATE_RUNBOOK.md` and republish L: + Supabase (commands in `CURRENT_HANDOFF.md`).

---

## Audit findings and correction status

| # | Finding | Correction | Status |
| --- | --- | --- | --- |
| 1 | `ryzen9desk-managed-executor-v1` absent from remote index | Register in `INDEX.md`, `ACTIVE_WORK.md`; push to `origin/main` | **Done** in index; verify remote |
| 2 | Synology productionization hidden from index | Add `project-folder-synology-primary-v1` + dev lane rows with HALTED/ACTIVE status | **Done** in index |
| 3 | `CURRENT_HANDOFF.md` contradictory HOLD vs IN_SYNC | Rewrite from current facts; remove cleared blockers | **Done** (this pass) |
| 4 | `INDEX.md` duplicate stale status (`active-ledger-drain`) | Align owner-repo sections with Complete / Phase 5 PASS | **Done** (this pass) |
| 5 | `DECISION_LOG.md` incomplete | Add formal decision IDs from project files | **Done** (this pass) |
| 6 | No-artifacts rule vs `artifacts/agent-runs/` | Clarify approved exception in `AGENT_START_HERE.md` | **Done** (this pass) |
| 7 | Broken evidence path references (404) | Owner-qualify paths in project files | **In progress** — see backlog |
| 8 | WSL-first vs `C:\Developer\repos` commands | Label by host in `AGENT_START_HERE.md` | **Done** (this pass) |
| 9 | Public repo operational metadata exposure | Operator review: private vs redact vs accept | **Open** — operator decision |
| 10 | L: fail-closed vs Supabase fallback conflict | Single failover table in handoff + this plan | **Done** (this pass) |
| 11 | Z-cache + Z-drive recurrence missing from index | Add index rows for `z-ai-cache-*` and `z-drive-disconnect-*` | **Done** (this pass) |

---

## Remaining backlog (ordered)

### P1 — Evidence path repair

For each project file `Evidence` table row:

- If path is under **another repo**, prefix with `Owner: <repo>` and use repo-relative path from that root.
- If receipt is **local-only** (not committed), mark `LOCAL_ONLY — not in git` and cite commit that should contain it.
- Do not leave bare paths that 404 in Cross-Agent without owner qualification.

**Files to audit:**

- `work-progress/projects/2026-08-02_z-drive-disconnect-recurrence-v1.md`
- `work-progress/projects/project-folder-synology-primary-v1.md`
- Any row referencing `artifacts/agent-runs/` in Cross-Agent vs AppBuilder

### P2 — Index ↔ ACTIVE_WORK sync automation

Add a lightweight check in `CG-AppBuilder-MCP`:

- Every `projects/INDEX.md` active row has a matching recent `ACTIVE_WORK.md` entry
- Every open blocker in `whats-active-now` appears in index or cross-cutting table

### P3 — Canonical intelligence-hub-first-read update

Update **canonical** rule in `CG-AppBuilder-MCP/agent-packs/three-way-agent/rules/intelligence-hub-first-read.mdc`:

- Add explicit **structured-ledger Supabase fallback** for suite-status/blockers only when L: unmounted
- Keep **fail-closed** for Revu/estimating keyword topics

Then: `npm run sync:three-way-agent-rule` from AppBuilder.

### P4 — Public visibility review

Repo is public. Options:

1. Make private (GitHub settings)
2. Redact machine names / internal IPs in committed docs (ongoing discipline)
3. Accept risk with explicit `SECURITY_POSTURE.md` pointer

No agent should commit secrets; metadata reconnaissance remains a concern.

### P5 — Managed executor operator execution

`ryzen9desk-managed-executor-v1` is registered but runner bootstrap is **operator work** on RYZEN9DESK — track in project file until `executor-smoke` PASS.

### P6 — Synology dev lane proof

Drive `project-folder-synology-primary-v1-dev-environment` to gate PASS before lifting HALT on production package.

---

## Definition of done (this work package)

- [x] `CURRENT_HANDOFF.md` single coherent state
- [x] `INDEX.md` owner sections match active table for completed projects
- [x] `DECISION_LOG.md` includes durable decision IDs
- [x] `AGENT_START_HERE.md` WSL commands + artifacts policy
- [x] Investigation playbook (this file)
- [ ] All evidence paths owner-qualified (P1)
- [ ] intelligence-hub-first-read canonical sync (P3)
- [ ] Operator decision on public visibility (P4)

---

## ChatGPT-specific instructions

When Wesley asks you to **investigate Cross-Agent**:

1. Do **not** implement code in this repo.
2. Start with `handoffs/CURRENT_HANDOFF.md` and `ACTIVE_WORK.md`.
3. Use `projects/INDEX.md` to find the project file; quote status from **project file + ledger**, not chat memory.
4. If L: paths are cited, ask whether WSL mount is available before claiming index freshness.
5. When distilling Cursor output, update ledger via the runbook fields — never paste full logs.
6. For Bible/AppBuilder gates, use WSL path:

```bash
cd /home/wesle/repos/CG-AppBuilder-MCP
doppler run -p cg-mcp -c dev -- npm run bible:authority:gate
```

---

## Related decisions

See `decisions/DECISION_LOG.md` for formal IDs including ledger front door, Z-cache authority, WSL default, and retrieval failover.
