# Claude — Operator Daily Preflight v1

**When:** Before Claude acts on Wesley's behalf with CLI or MCP  
**Where:** WSL bash — `~/repos`  
**Time:** ~2 minutes

---

## Quick pass (all must OK)

```bash
# 1. Host
test -d ~/repos/CG-AppBuilder-MCP && echo HOST_OK || echo HOST_MODE_BLOCKED

# 2. Hub (optional but log result)
test -d /mnt/l/Capital-Glass-Intelligence-Hub/00-master-index && echo INDEX_MOUNTED || echo L_DRIVE_NOT_MOUNTED

# 3. Z: operator mirror
test -d /mnt/z/Capital-Glass-Dev && echo Z_OK || echo Z_NOT_MOUNTED

# 4. Auth (identity only — never retrieves a credential)
doppler me >/dev/null 2>&1 && echo DOPPLER_OK || echo DOPPLER_LOGIN_REQUIRED
gh auth status 2>&1 | head -3

# 5. MCP API
curl -fsS --max-time 3 http://127.0.0.1:3001/health && echo MCP_API_OK || echo MCP_API_DOWN

# 6. WSL MCP wiring
cd ~/repos/CG-AppBuilder-MCP && npm run wsl:mcp:verify -- --json 2>/dev/null | tail -5

# 7. Live ledger
head -20 ~/repos/CapitalGlass-Cross-Agent/work-progress/ACTIVE_WORK.md
```

If **MCP_API_DOWN**: operator runs `Start-CgMcpForCursor.ps1` on Windows, then retry.

If **DOPPLER_LOGIN_REQUIRED**: `doppler login` in WSL — never copy Windows integrations.env.

---

## Material mission block (add when doing code/deploy)

```bash
cd ~/repos/CG-AppBuilder-MCP
export CG_AUTO_V32_WORK_PACKAGE='<id>'
export CG_AUTO_V32_MISSION_CLASS='investigate'
export CG_AUTO_V32_MATERIAL='true'
export CG_AUTO_V32_CLIENT_SURFACE='CLAUDE'   # document in closeout until schema lands

npm run agent:index:scout -- --json
npm run agent:preflight:auto-v32 -- --run-compile --json
npm run execution-context:resolve -- --work-package=<id> --json
```

Check `GO`/`NO_GO` in execution-context output before advising destructive or deploy actions.

---

## Parallel with Cursor check

Ask Wesley (or read ledger):

1. Is Cursor actively mutating the **same repo branch**?
2. Who owns the **write lane** this session?
3. Is WaveRunner locked on a milestone Cursor is running?

If yes to dual-writer risk → Claude stays **read-only / plan-only** until lane assigned.

---

## Retrieval codes to log (every response)

`INDEX_HIT` | `INDEX_MISS` | `L_DRIVE_NOT_MOUNTED_IN_WSL` | `CACHE_HIT` | `CACHE_MISS` | `HOST_MODE_BLOCKED` | `DIRECT_CONNECT_NOT_APPLICABLE`

---

## When preflight fails — do not

- Invent alternate auth or secret locations
- Advise PowerShell for repo/npm work
- Run destructive Office scripts without slice approval
- Commit to Cross-Agent implementation repos
- Claim PROVEN integration without receipts

---

## Pass criteria — Claude may operate with full auth + CLI

| Gate | Required |
| --- | --- |
| WSL ext4 repos | Yes |
| Doppler CLI session | Yes |
| gh authenticated | Yes (for PR/git ops) |
| mcp-api :3001 | Yes (for App Builder MCP) |
| wsl:mcp:verify | PASS or documented repair |
| Ledger read | Yes |
| Parallel lane confirmed | Yes when Cursor open |
