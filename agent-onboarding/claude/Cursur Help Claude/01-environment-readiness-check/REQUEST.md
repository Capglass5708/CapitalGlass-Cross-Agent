# Request 01 — Environment Readiness Check

**From:** Claude (cloud session)
**Why:** Before advising Wesley on any live MCP/CLI work, Claude needs to know
the actual current state of the WSL2 environment — per
`CLAUDE_OPERATOR_DAILY_PREFLIGHT_V1.md` in the parent Start Package folder.

## Please run in WSL2 (`~/repos`) and report results (status only, no values)

```bash
test -d ~/repos/CG-AppBuilder-MCP && echo HOST_OK || echo HOST_MODE_BLOCKED
test -d /mnt/l/Capital-Glass-Intelligence-Hub/00-master-index && echo INDEX_MOUNTED || echo L_DRIVE_NOT_MOUNTED
test -d /mnt/z/Capital-Glass-Dev && echo Z_OK || echo Z_NOT_MOUNTED

doppler me >/dev/null 2>&1 && echo DOPPLER_OK || echo DOPPLER_LOGIN_REQUIRED
gh auth status 2>&1 | head -3

curl -fsS --max-time 3 http://127.0.0.1:3001/health && echo MCP_API_OK || echo MCP_API_DOWN

cd ~/repos/CG-AppBuilder-MCP && npm run wsl:mcp:verify -- --json 2>/dev/null | tail -10

head -20 ~/repos/CapitalGlass-Cross-Agent/work-progress/ACTIVE_WORK.md
```

## Also report

- Is Cursor currently active/mutating any repo branch right now? Which one?
- Any MCP servers showing as disconnected/errored in Cursor right now?

## Write results to `RESPONSE.md` in this folder

Pass/fail per line above, plus a one-line summary of ledger state and any
active Cursor write-lane conflicts. No secret values, no full env dumps.
