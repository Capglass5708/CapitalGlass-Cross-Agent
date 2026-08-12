# Current Handoff

**Last reconciled:** 2026-08-12
**Ledger commit anchor:** `8e4fd40` (verify with `git rev-parse HEAD` in this repo)

Read these files first, in order:

1. `AGENT_START_HERE.md`
2. `work-progress/WORKSPACE_CONTEXT.md`
3. `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md`
4. `work-progress/ACTIVE_WORK.md`
5. `work-progress/projects/INDEX.md`
6. `plans/2026-08-03_cross-agent-repo-hygiene-and-agent-investigation-v1.md` (investigation playbook)

---

## Host and path authority (WSL-first)

| Item | Canonical path |
| --- | --- |
| Agent repos | `/home/wesle/repos` (ext4) |
| Default workspace | `/home/wesle/Capital-Glass-Suite.WSL.code-workspace` |
| Env authority | `~/.config/capital-glass/cursor-wsl.env` |
| Intelligence Hub (L:) | `/mnt/l/Capital-Glass-Intelligence-Hub/00-master-index` |
| AI cache authority (Z:) | `/mnt/z/Capital-Glass-Intelligence-Hub/AI-Cache-Authority` |

**Do not** use `C:\Developer\repos` or `/mnt/c/Developer/repos` for agent work. If Cursor opens from `/mnt/c`, treat as `HOST_MODE_BLOCKED` and reconnect via WSL Suite shortcut.

Verification (from `~/repos/CG-AppBuilder-MCP`):

```bash
npm run cursor:wsl-default:verify
```

---

## Retrieval failover (single contract)

Use this order for **suite status, blockers, and active work** — not for Revu/estimating deep dives (those stay L:-first per `intelligence-hub-first-read`):

| Priority | Source | When |
| --- | --- | --- |
| 1 | L: `BY-KIND/*.json` | `/mnt/l/.../00-master-index` is mounted |
| 2 | Supabase structured-ledger projection | L: missing; run drift probe from AppBuilder with Doppler |
| 3 | Git ledger | `work-progress/ACTIVE_WORK.md` + `projects/INDEX.md` in this repo |

**Cleared (do not re-block on):** structured-ledger ingest HOLD, `/mnt/c` host blocker, `SUPABASE_PROJECTION_MISSING` false negative — all resolved at WSL ext4 + Doppler ingest. Re-run ingest only after **new** `ACTIVE_WORK.md` edits.

---

## Index preflight estate rollout (2026-08-03)

| Item | Status |
| --- | --- |
| Estate rule propagation | **PASS** — `cross-agent-index-preflight-estate-wide-v1` (26 targets SYNCED) |
| Office Admin absorption | **Partial** — rule on `chore/cross-agent-index-preflight-estate-wide-v1` @ `17ab7ae`; merge/rebase into owner branch before absorbed |
| Next gate | **`FRESH_CURSOR_INDEX_DOGFOOD_PASS`** — `sessionReceiptPath` + first-action index evidence + `rawScanRequired` honored (fresh session only) |

Artifacts: `CG-AppBuilder-MCP/artifacts/agent-runs/cross-agent-index-preflight-estate-wide-v1/`

---

## Top open work (from project index)

| Priority | Project | Status | Next action |
| --- | --- | --- | --- |
| 1 | `estimating-spine-ryzen9-activation-v1` | WSL_EXECUTOR_READY_ESTIMATING_PARTIAL | RYZEN9 desk: CE opening stack + Revu Windows handoff |
| 1b | `smith-ranch-ce-revu-full-set-v1` | PHASE_A_READY_FOR_REMOTE_DISPATCH | Merge AppBuilder `cd807ac8f` → dispatch `smith-ranch-ce-batch`; Phase B Revu queued |
| 2 | `ryzen9desk-managed-executor-v1` | MANAGED_EXECUTOR_ONLINE | Maintain runner; optional `wsl2-canonical-setup` for full repo pin |
| 3 | `project-folder-synology-primary-v1-dev-environment` | ACTIVE | Deploy DC to dev URL; prove claim/complete on `L:\Capital-Glass-Projects-Dev` |
| 3 | `project-folder-synology-primary-v1` | HALTED — prod productionization failed | No prod until dev lane gates pass |
| 4 | `wesleywork-drive-mount-task-dedupe-v1` | IMPLEMENTED — live deploy pending | Elevated Windows deploy on WESLEY_WORK |
| 5 | `suite-ci-healing-v1` | PARTIAL PASS | Align `EXPECTED_DOCUMENT_CENTER_GIT_SHA` or redeploy DC; rerun smokes |

`ryzen9desk-wsl2-canonical-workspace-v1` is **BLOCKED** — route through managed executor (`job_profile: wsl2-canonical-setup`).

---

## Completed / recurring only

| Project | Status |
| --- | --- |
| `active-ledger-drain-and-intelligence-hub-sync-v1` | **Complete — closeout PASS** (Phase 5 done); recurring L: publish after ledger edits |
| `cross-agent-structured-ledger-projection-v1` | MILESTONE PASS — ingest + drift probe after ledger updates |
| `wsl-mcp-cursor-doppler-promptops-hardening-v1` | PASS — WSL default active; `mcp:repair:cursor` PASS |

---

## Operator watch items

- **MCP restart** if Governance tools missing in Cursor
- **Auto v3.2 env vars** — clear `CG_AUTO_V32_*` before full `closeout:gate`
- **Vercel / Cloudflare MCP** — separate auth items; not ledger blockers
- **Z: pre-session** — `z-drive-disconnect-recurrence-v1`; use Office Admin ForceRemap, not repo grep

---

## Publish after ledger edits

From `/home/wesle/repos/CG-AppBuilder-MCP` with `INTELLIGENCE_HUB_ROOT` set:

```bash
export INTELLIGENCE_HUB_ROOT=/mnt/l/Capital-Glass-Intelligence-Hub
npm run active-ledger:export -- --repo=/home/wesle/repos/CapitalGlass-Cross-Agent
CROSS_AGENT_LEDGER_INGEST_APPROVED=1 doppler run --project cg-mcp --config dev -- npm run cross-agent-ledger:ingest -- --apply --repo=/home/wesle/repos/CapitalGlass-Cross-Agent
npm run active-ledger:sync:check -- --repo=/home/wesle/repos/CapitalGlass-Cross-Agent
```

Expect **IN_SYNC** at current `HEAD` when L:, Supabase, and Git agree.
