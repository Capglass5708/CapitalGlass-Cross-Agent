# command-estate-hot-cache-v1

**Status:** IN_PROGRESS  
**Owner repo:** CG-AppBuilder-MCP (compiler) + CapitalGlass-Cross-Agent (manifest + command-index)  
**Mission class:** fix  
**Depends on:** `ACTIVE_LEDGER_HOT_CACHE_OPERATIONAL` (closed PASS)

## Objective

Expand Command Estate hot-cache dataset with full compact schema (mutation class, dry-run, env, receipts, FI links) and harden deterministic hot-cache root resolution for stripped scout-hook environments.

## Gates

- `HOT_CACHE_ROOT_RESOLUTION_PASS`
- `COMMAND_ESTATE_MANIFEST_PASS`
- `COMMAND_ESTATE_COMPILE_PASS`
- `COMMAND_ESTATE_COMPACT_PASS`
- `COMMAND_ESTATE_HOT_CACHE_PUBLISH_PASS`
- `COMMAND_ESTATE_SCOUT_ROUTING_PASS`
- `COMMAND_ESTATE_MUTATION_CLASSIFICATION_PASS`
- `COMMAND_ESTATE_NO_RAW_SCAN_PASS`

## Scout fixtures

1. what command publishes the Git Estate index
2. what is the safe dry-run command for bulk pull
3. which command verifies L hash alignment
4. does this command mutate production
5. what receipt does this command produce

## Hot-cache root resolution priority

1. `CG_AUTHORITY_CACHE_ROOT` (explicit, path exists)
2. Machine-profile (`cursor-wsl.env` + hook contract)
3. Mounted D:/S: host-local primary
4. Ext4 fallback `~/.local/share/capital-glass/hot-ai-cache`

Scout emits: `resolvedHotCacheRoot`, `hotCacheRootSource`, `fallbackUsed`, `hotCacheRootResolutionGate`.

## Operator republish (when D: mounted)

```bash
export CG_AUTHORITY_CACHE_ROOT="/mnt/d/AI Cursur Cache"
cd ~/repos/CG-AppBuilder-MCP
npm run hot-cache:publish -- --dataset=active-ledger
npm run closeout-index:publish-hot-cache
npm run command-estate:publish-hot-cache
npm run intelligence-hub:publish-hot-routing-index
```

## Next wave

`workflow-estate-hot-cache-v1` — link commands to workflows via stable IDs.
