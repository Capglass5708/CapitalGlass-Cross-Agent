# Harvest — Cursor Healthkeeper preflight integration + dedupe

**Harvest ID:** `harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1`  
**Milestones:** `cg-cursor-healthkeeper-preflight-integration-v1`, `cg-cursor-healthkeeper-preflight-dedupe-v1`  
**Verdict:** `PASS_DEDUPED` · Healthkeeper substrate-only v1.2

## Source (owner repo)

| Field | Value |
| --- | --- |
| Repo | CG-AppBuilder-MCP |
| Branch | main |
| Integration SHA | `bf6c38c73ed19e8faab36d7889dae9272abd6e01` |
| Dedupe SHA | `d18bb64358dd428bc7350337a3d12a599d5b4ff1` |
| Publication | **NOT PUSHED** — local only at harvest time |

## Architecture (current truth)

```text
agent:preflight:app-builder-mcp
  → cursor:health-preflight-gate (~4.6s, substrate only)
  → auto-v32 → z-drive → … → mcp:doctor (~70s full preflight)
```

Healthkeeper answers: *Can Cursor reliably operate in this WSL session?*  
Downstream preflight owns Hub, L:/Z storage authority, MCP doctor, Bible/contract gates.

## Key paths

- `L:/02-catalog/Cursur Health/cg-cursor-wsl-healthkeeper.sh` (canonical)
- `scripts/wsl/lib/cg-cursor-wsl-healthkeeper-evidence.mjs` (v1.2 schema)
- `scripts/lib/cursor-health-preflight-gate.mjs`
- `docs/wsl/CURSOR_SESSION_FAST_HEALTH_GATE.md`

## Out of scope (separate lanes)

- `mcp:doctor` failure
- `check:application-bibles-sync` failure
- `suite:contract-gate` failure

## Next operator action

Push `d18bb643` to `origin/main` when ready; run hub seed publish + `index:freshness-gate` after harvest validates.
