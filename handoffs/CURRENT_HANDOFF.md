# Current Handoff

Read these files first:

1. `AGENT_START_HERE.md`
2. `work-progress/WORKSPACE_CONTEXT.md`
3. `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md`
4. `work-progress/ACTIVE_WORK.md`
5. `work-progress/projects/INDEX.md`
6. `work-progress/2026-08-02_MASTER_WORK_DOCUMENT.md`

Current focus:

- L: master index is canonical machine-readable front door.
- Cross-Agent is the human ledger and coordination memory.
- RYZEN9DESK owns RTX 5080 activation proof for the opening stack.
- Rosewood parser run closeout still needs to be captured when complete.
- CG Platform Intelligence Bible reads need connector reauthentication if `oauth_refresh_token_missing` appears.


## WSL MCP / Cursor hardening - 2026-08-02

WSL MCP / Cursor hardening is now a live project file:

```text
work-progress/projects/2026-08-02_wsl-mcp-cursor-doppler-promptops-hardening-v1.md
```

Current state:

- WSL MCP repair Waves 1-3 are reported complete.
- WSL2 shell/bootstrap infrastructure is now in place.
- Doppler MCP is repaired and verified; secrets are not stored here.
- AppBuilder PR #267 and CapitalGlassRevu PR #5 are merged.
- Windows-host MCP is now disabled (`mcp.json` -> `mcp.json.windows-disabled`).
- WSL `~/.cursor/mcp.json` is now the only active MCP authority.
- Seed mission ledger slice is complete: compact PASS, L: mirror PASS, Supabase projection `IN_SYNC` at `5ddd274` / `9eb1c562...`.
- Remaining recommendation: reopen from `/home/wesle/repos/CG-AppBuilder-MCP` or the WSL `.code-workspace`, then reload MCP if needed.
- Remaining separate items: Vercel MCP auth, Cloudflare `127.0.0.1:15170` loopback conflict, optional `RAILWAY_API_TOKEN`, and `mcp:attest` auth/index parity.


## Cursor seeding handoff

Cursor should seed the WSL MCP / Cursor / Doppler / PromptOps backfill through:

```text
handoffs/2026-08-02_cursor-seed-wsl-mcp-backfill.md
```

Seed work package:

```text
cross-agent-seed-wsl-mcp-backfill-v1
```

Run seeding/ingest from `/home/wesle/repos/CG-AppBuilder-MCP`, not from `/mnt/c/Developer/repos`.


Watch item: If terminal flashes return, check whether `C:\Users\wesle\.cursor\mcp.json` was recreated and caused Windows-host MCP reconnects.


## L: seed blocker

L: is now reachable in WSL at `/mnt/l/Capital-Glass-Intelligence-Hub/00-master-index`. The seed compact was promoted to L:, but structured-ledger ingest is still on HOLD because the current Cursor workspace is `/mnt/c/Developer/repos/CG-AppBuilder-MCP` and ingest hit `BLOCKED_OPERATOR_APPROVAL`.

Before running `cross-agent-seed-wsl-mcp-backfill-v1`:

1. Open Cursor from `/home/wesle/repos/CG-AppBuilder-MCP`.
2. Map Windows L: when WESLEYDESK is reachable.
3. Run:

```bash
sudo bash ~/repos/CG-AppBuilder-MCP/scripts/ci/install-wsl-hub-drive-fstab.sh
bash ~/repos/CG-AppBuilder-MCP/scripts/ci/ensure-wsl-l-hub-mount.sh
```

4. Confirm `L:\Capital-Glass-Intelligence-Hub\00-master-index` is readable.


## Seed mission status: ledger slice PASS

- `cross-agent-notes:seed --apply` PASS.
- `cross-agent-notes:verify` PASS.
- L: mirror written: `/mnt/l/Capital-Glass-Intelligence-Hub/02-catalog/cross-agent-notes/wsl-mcp-cursor-doppler-promptops-hardening-v1.json`.
- Structured-ledger ingest APPLIED through `doppler run` from `cg-mcp/dev`.
- Drift probe `IN_SYNC` at commit `5ddd274` / content hash `9eb1c562...`.
- Supabase event appended: `5b090a49-acf4-43a3-8ffe-6705e65d7634`.
- Prior `SUPABASE_PROJECTION_MISSING` was a local CLI-auth false negative caused by bare Supabase CLI 401.
- Host check still `HOST_MODE_BLOCKED` because PWD was `/mnt/c/Developer/repos/CG-AppBuilder-MCP`.

## Wave 4 durable repair status: implemented locally

MCP drift prevention is implemented in `CG-AppBuilder-MCP` / `Cursor-MCP-Kit`:

1. New command: `npm run mcp:repair:cursor`.
2. Flow: `wsl:mcp:repair` -> app-spoke wiring -> MCP JSON normalization -> Doppler sync -> WSL path overrides -> hard verify.
3. Machine-readable command: `npm run mcp:repair:cursor:json`.
4. Receipt: `~/.cursor/backups/mcp-repair-cursor-*.json`.
5. Verified on WESLEY_WORK: `mcp:repair:cursor` PASS and `wsl:mcp:verify` PASS.

Operator next: Cursor -> Settings -> MCP -> Restart, then optional `npm run mcp:ack-cursor-restart`.

Remote promotion next: commit and push ext4 changes in `~/repos/CG-AppBuilder-MCP` and `~/repos/Cursor-MCP-Kit` if Wesley wants them on GitHub.

Keep Vercel MCP auth, Cloudflare OAuth loopback, Railway token fallback, and `mcp:attest` as separate items.