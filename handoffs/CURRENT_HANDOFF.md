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

L: remains unavailable in WSL because `\\192.168.1.109\CapitalGlass-L` is unreachable. Z: is mounted at `/mnt/z`, but the Intelligence Hub front door lives on L:, not Z:.

Before running `cross-agent-seed-wsl-mcp-backfill-v1`:

1. Open Cursor from `/home/wesle/repos/CG-AppBuilder-MCP`.
2. Map Windows L: when WESLEYDESK is reachable.
3. Run:

```bash
sudo bash ~/repos/CG-AppBuilder-MCP/scripts/ci/install-wsl-hub-drive-fstab.sh
bash ~/repos/CG-AppBuilder-MCP/scripts/ci/ensure-wsl-l-hub-mount.sh
```

4. Confirm `L:\Capital-Glass-Intelligence-Hub\00-master-index` is readable.
