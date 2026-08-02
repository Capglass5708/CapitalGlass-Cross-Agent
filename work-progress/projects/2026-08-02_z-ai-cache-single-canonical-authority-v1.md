# Project: z-ai-cache-single-canonical-authority-v1

## Summary

Suite-wide AI-cache release authority is singular on Z. Host-local roots (S/D/C) are producers/replicas only; L is retrieval mirror only; Supabase holds metadata and telemetry only. Three-host attestation reached `Z_MASTER_THREE_HOST_AI_CACHE_ALIGNED` on 2026-08-02.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | `z-ai-cache-single-canonical-authority-v1` |
| Work package | `z-ai-cache-single-canonical-authority-v1` |
| Date opened | 2026-08-02 |
| Authority repo | CG-Platform-Governance-MCP |
| Execution repo | CG-AppBuilder-MCP |
| Coordination repo | CapitalGlass-Cross-Agent |
| Status | **Pushed** — implementation on AppBuilder `main` |

## Agent Fast Path

**Decision ID:** `CAD-20260802-z-ai-cache-single-canonical-authority`  
**Authority:** CG-Platform-Governance-MCP (registry-approved)  
**Canonical release authority:** `Z:\Capital-Glass-Intelligence-Hub\AI-Cache-Authority` — sole suite-wide AI-cache release authority.  
**CURRENT rule:** only the Z promotion owner writes global `CURRENT\current-ai-cache-release.json`.  
**Host-local producers/replicas only:** WESLEY_WORK (`D:\AI Cursur Cache`), WESLEYDESK (`S:\AI Cursur Cache`), RYZEN9DESK (`C:\AI Cursur Cache`).  
**RYZEN9DESK:** publishes candidates to `Z:\...\AI-Cache-Authority\intake\RYZEN9DESK` — not a second canonical root.  
**L:** retrieval mirror only (`L:\Capital-Glass-Intelligence-Hub`); never authority fallback or CURRENT promotion.  
**Supabase:** metadata/pointer/telemetry only (`agentops.authority_cache_*`); never canonical cache bodies.  
**Tier-1 cache:** requires Z release binding (`evaluateAiCacheReleaseBinding`) or explicit verified-local read-only state (`PASS_OFFLINE_VERIFIED_LOCAL_RELEASE`).  
**Three-host truth verdict:** `Z_MASTER_THREE_HOST_AI_CACHE_ALIGNED` — probe via `npm run ai-cache-z-master:three-host-status -- --json`.  
**Governance contract:** `CG-Platform-Governance-MCP/docs/platform/CROSS_AGENT_NOTE_AUTHORITY_DECISION_CONTRACT.md`  
**Work package:** `CG-AppBuilder-MCP/docs/work-packages/z-ai-cache-single-canonical-authority-v1.md`  
**Cache contract:** `CG-AppBuilder-MCP/docs/AUTHORITY_CACHE_SUPABASE_CONTRACT.md`  
**Do not:** treat L:, host-local S/D/C, Supabase rows, or chat as suite AI-cache authority; do not create a second canonical root.

## Evidence (pointers only)

| Evidence | Path | Result |
| --- | --- | --- |
| Work package closeout | CG-AppBuilder-MCP `docs/work-packages/z-ai-cache-single-canonical-authority-v1.md` | Pushed `main` @ `b3ae65d2` |
| Three-host status | `Z:/Capital-Glass-Intelligence-Hub/AI-Cache-Authority/health/three-host-ai-cache-status.json` | `Z_MASTER_THREE_HOST_AI_CACHE_ALIGNED` |
| Release ID | Z CURRENT | `AI-CACHE-RELEASE-20260731-a7456ad58195` |
| Remote sync proofs | CG-AppBuilder-MCP `artifacts/runs/z-ai-cache-single-canonical-authority-v1/*-remote-sync-proof.json` | WESLEY_WORK / WESLEYDESK / RYZEN9DESK CURRENT |

## Update Log

### 2026-08-02 — Cross-Agent note seed candidate

- Human source prepared for `cross-agent-notes-seeding-v1` compact `authority_decision` projection.
- Full note body remains canonical here; agent layer receives pointers only.
