# Project: intelligence-correlation-fabric-v1

## Architecture lock

| Field | Value |
| --- | --- |
| Status | **IMPLEMENTATION_IN_PROGRESS** |
| Owner | CapitalGlass-Cross-Agent |
| Producer | CG-AppBuilder-MCP |
| Work package | `capital-glass-intelligence-correlation-fabric-v1` |
| Plan ID | `intelligence-correlation-fabric-v1` |
| Terminal milestone | `CAPITAL_GLASS_INTELLIGENCE_CORRELATION_FABRIC_V1_LOCAL_RUNTIME_VALIDATED` |
| Supersedes | Extends `operational-intelligence-envelope-v1` (does not mutate handoff closed core) |
| Non-goals | Foundry, resident synthesis agent, production Hub publication, new progression tables |

**WaveRunner capability:** `INTELLIGENCE_CORRELATION_MARKERS` (`required: false`, emit + ingest + correlate CLI).

## Summary

Typed correlation markers on material closeout (`closeout.correlation`), projected into envelope `extensions.correlationMarkers`, Hub compact metadata, relationship edges, and exact intersection query via `npm run intelligence:correlate`. AppBuilder emits only; Cross-Agent owns semantics, validation, ingest projection, and query.

## Implementation checklist

| Step | Status |
| --- | --- |
| correlation-markers-v1 schema + registries | **COMPLETE** |
| Cross-Agent ingest projection + edges | **COMPLETE** |
| AppBuilder material closeout emit hook | **COMPLETE** |
| `intelligence:correlate` CLI | **COMPLETE** |
| Contract + correlate tests | **IN_PROGRESS** |
| Hub GIN migration (shared-dev) | **PENDING APPLY** |
| WaveRunner registry entry | **COMPLETE** |
| Local runtime acceptance milestone | **PENDING** |

## Contracts

- Schema: `contracts/intelligence/correlation-markers-v1.schema.json`
- Registries: `contracts/intelligence/registries/correlation-*-v1.json`
- Capability pointer: `correlation-capabilities-pointer-v1.json` → AppBuilder WaveRunner registry

## Commands

```bash
# Cross-Agent
npm run test:intelligence-correlation
npm run intelligence:correlate -- --marker=capability:CACHE --marker=repo:CG-AppBuilder-MCP --json

# AppBuilder
npm run test:correlation-markers-emit
```
