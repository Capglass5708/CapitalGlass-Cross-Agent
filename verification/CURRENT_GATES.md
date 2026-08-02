# Current Gates

## Bible-dependent work

Run from `CG-AppBuilder-MCP`:

```powershell
cd C:\Developer\repos\CG-AppBuilder-MCP
doppler run -p cg-mcp -c dev -- npm run bible:authority:gate
```

| Result | Action |
| --- | --- |
| `PASS` | Proceed |
| `PASS_WITH_WARNINGS` | Proceed and record warnings |
| `BLOCKED` | Stop and fix the failing layer |

## Platform Intelligence Bible connector

Current known issue from 2026-08-02:

```text
UNAUTHORIZED
oauth_refresh_token_missing
TRIGGER_REAUTHENTICATION
```

The Bible tools are discoverable, but reads require CG Platform Intelligence reauthentication when this appears.
