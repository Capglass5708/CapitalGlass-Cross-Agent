# Cursor Seeding Handoff - WSL MCP Backfill

## Purpose

Prepare the pasted WSL MCP / Cursor / Doppler / PromptOps results to be seeded by Cursor through the existing Cross-Agent structured-ledger pipeline.

Cross-Agent is the human ledger. Do not implement here. Cursor should use this repo as source material, then run the seeding/ingest/drift steps from the owning execution repo, `CG-AppBuilder-MCP`.

## Read first

In `CapitalGlass-Cross-Agent`, read in this order:

1. `AGENT_START_HERE.md`
2. `work-progress/WORKSPACE_CONTEXT.md`
3. `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md`
4. `work-progress/ACTIVE_WORK.md`
5. `work-progress/projects/INDEX.md`
6. `work-progress/projects/2026-08-02_wsl-mcp-cursor-doppler-promptops-hardening-v1.md`
7. `handoffs/CURRENT_HANDOFF.md`

## Source project to seed

```text
work-progress/projects/2026-08-02_wsl-mcp-cursor-doppler-promptops-hardening-v1.md
```

This project file backfills the pasted Cursor results for:

- WSL MCP repair Waves 1-3.
- Cursor terminal flashing / Azure hook diagnosis.
- WSL path-coherence verdict `PARTIAL`.
- Doppler MCP repair and no-secret receipt locations.
- PromptOps CI root cause and PR #267 merge.
- CapitalGlassRevu PR #5 merge.
- Remaining actions: reopen Cursor from WSL ext4 root, reload MCP, handle Vercel auth, keep Cloudflare stdio disabled or fix loopback conflict, optional Railway token, separate `mcp:attest` investigation.

## Required operator precondition

Before seeding from Cursor, close the current Windows/NTFS workspace window and reopen Cursor from WSL ext4:

```text
/home/wesle/repos/CG-AppBuilder-MCP
```

or the WSL `.code-workspace` under `~/repos`.

Do not seed from:

```text
/mnt/c/Developer/repos/CG-AppBuilder-MCP
```

## Cursor mission prompt

```text
Mission: seed · Work package: cross-agent-seed-wsl-mcp-backfill-v1

Goal:
Seed the newly backfilled Cross-Agent WSL MCP / Cursor / Doppler / PromptOps project notes into the structured ledger / derived projection pipeline.

Rules:
- Do not implement code in CapitalGlass-Cross-Agent.
- Do not store secrets, token values, vault file contents, copied Bibles, raw logs, or app source code in Cross-Agent.
- Treat Cross-Agent Git as the human canonical ledger.
- Treat Supabase / derived projection as operational index only.
- Run seeding/ingest/drift from CG-AppBuilder-MCP, not Cross-Agent.
- Use WSL ext4 `/home/wesle/repos` as canonical repo root.
- If the workspace is opened from `/mnt/c`, stop and report HOST_MODE_BLOCKED.

Step 1 - Confirm host/root
Report:
- current workspace path
- shell
- `CG_REPOS_ROOT`
- whether `/home/wesle/repos/CG-AppBuilder-MCP` is the active root

If the active root is `/mnt/c/Developer/repos`, stop and tell Wesley to reopen from WSL.

Step 2 - Read Cross-Agent source files
Read:
- `work-progress/ACTIVE_WORK.md`
- `work-progress/projects/INDEX.md`
- `work-progress/projects/2026-08-02_wsl-mcp-cursor-doppler-promptops-hardening-v1.md`
- `handoffs/CURRENT_HANDOFF.md`

Extract only:
- project ID / work package ID
- repos involved
- status
- decisions
- verification results
- blockers and warnings
- commits / PRs
- next actions

Step 3 - Run structured-ledger ingest
From `~/repos/CG-AppBuilder-MCP`, run the established Cross-Agent ingest flow.
Prefer the repo's current commands if names differ, but look for these first:

- `npm run cross-agent-ledger:ingest -- --apply`
- `npm run cross-agent-ledger:drift-probe`
- any project-specific verify command for Cross-Agent projection

If exact script names differ, inspect `package.json` and run the current equivalent.

Step 4 - Publish/update retrieval surfaces
If the established pipeline supports it, update the derived projection / hub slices so future agents see the new WSL MCP project file in:

- open actions
- blockers
- project index references
- current handoff pointers

Do not write implementation code or secrets.

Step 5 - Verification
Return:

1. VERDICT
   - PASS / HOLD / FAIL

2. SEEDED
   - project ID
   - event/projection count if available
   - derived projection status

3. DRIFT
   - IN_SYNC / DRIFT / UNKNOWN

4. EVIDENCE
   - command results
   - artifact paths

5. NEXT ACTION
   - one next action only
```

## Expected seed outcome

| Item | Expected value |
| --- | --- |
| Project ID | `wsl-mcp-cursor-doppler-promptops-hardening-v1` |
| Seed work package | `cross-agent-seed-wsl-mcp-backfill-v1` |
| Coordination repo | `CapitalGlass-Cross-Agent` |
| Execution repo | `CG-AppBuilder-MCP` |
| Status | Active; repair Waves 1-3 complete; path coherence `PARTIAL` |
| Top blocker | Cursor must reopen from `/home/wesle/repos/CG-AppBuilder-MCP`, not `/mnt/c/Developer/repos` |
| Secondary blockers | Vercel auth, Cloudflare loopback, optional Railway token, `mcp:attest` auth/index parity |

## Do not seed as complete

Do not mark the whole work package complete until these are resolved or explicitly deferred:

- Cursor reopened from WSL ext4 root and MCP reloaded.
- Vercel MCP auth either completed or explicitly deferred.
- Cloudflare stdio remains disabled or loopback conflict is fixed.
- `mcp:attest` BLOCKED state is investigated or documented as separate.

## Notes for future agents

- The repeated pasted Doppler/Wave 3 blocks were intentional evidence and have been deduped into the project file.
- No token values were copied.
- The vault paths are pointers only.
- Windows-side Cursor config remains compatibility surface; WSL-side config is the active authority for this workflow.


## Current blocker update

| Check | Status (2026-08-02 CT) |
| --- | --- |
| L: hub `/mnt/l/.../00-master-index` | **PASS** — `\\wesleydesk\CapitalGlass-L` via Tailscale |
| Cursor workspace ext4 root | **HOLD** — reopen from `/home/wesle/repos/CG-AppBuilder-MCP` |

Seed pipeline may proceed for structured ledger + L: compact mirror. Operator should still reopen Cursor on ext4 for material MCP work.


## Seed run result

| Field | Value |
| --- | --- |
| Verdict | HOLD (partial PASS) |
| Compact seed | PASS |
| Verify | PASS |
| L: mirror | `/mnt/l/Capital-Glass-Intelligence-Hub/02-catalog/cross-agent-notes/wsl-mcp-cursor-doppler-promptops-hardening-v1.json` |
| Structured-ledger ingest | `BLOCKED_OPERATOR_APPROVAL` |
| Drift | UNKNOWN / `SUPABASE_PROJECTION_MISSING` |
| Host mode | `HOST_MODE_BLOCKED`, PWD `/mnt/c/Developer/repos/CG-AppBuilder-MCP` |

Rerun after Cursor is reopened from `/home/wesle/repos/CG-AppBuilder-MCP` and Governance ext4 schema approval state is available.
