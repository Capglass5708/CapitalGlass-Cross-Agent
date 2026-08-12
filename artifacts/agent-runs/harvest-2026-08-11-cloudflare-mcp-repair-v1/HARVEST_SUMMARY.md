# Harvest summary — derived view

**Authority:** `harvest-manifest-v1.json` (`7b78911d4fff…`)
**Work package:** `harvest-2026-08-11-cloudflare-mcp-repair-v1`
**Mission class:** `platform-ops-incident-closeout-harvest-v1`
**Verdict:** `HARVEST_COMPLETE`
**Retrieval:** `INDEX_HIT`

> This file is a generated view. Do not edit independently — update the manifest.

## Packets harvested

| Packet | State | Verdict | Owner |
| --- | --- | --- | --- |
| `cloudflare-mcp-oauth-lock-v1` | RESOLVED | PASS | CG-AppBuilder-MCP |
| `cloudflare-mcp-health-layer-v1` | RESOLVED | PASS | CG-AppBuilder-MCP |
| `cloudflare-mcp-operator-sequence-v1` | RESOLVED | PASS | CG-AppBuilder-MCP |
| `cloudflare-mcp-wrangler-auth-v1` | OPEN_OPERATOR | HOLD | CG-AppBuilder-MCP |

## Global doNotAdvance

- Treat cloudflareState.overall (DNS) as MCP readiness
- Skip OAuth lock clear when port 15170 conflict is logged
- Run index:publish from Cursor without operator gate
- Conflate spawn EINVAL with OAuth lock failures

## Projection sync

Status: `not-run` (hub: `published`)

