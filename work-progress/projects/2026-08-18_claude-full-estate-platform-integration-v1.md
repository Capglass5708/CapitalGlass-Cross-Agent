# Claude Full-Estate Platform Integration v1

**Project ID / work package:** `claude-full-estate-platform-integration-v1`  
**Date:** 2026-08-18  
**Owner repo:** `CG-AppBuilder-MCP` (execution) · `CapitalGlass-Cross-Agent` (coordination)  
**Mission class:** investigate (Phase 0) → fix (phased)  
**Status:** **MCP_CONNECTED_HYGIENE_VERIFIED** — terminal stamp **not** achieved
**Published folder:** `Z:\Capital-Glass-Dev\Claude Start Package`

## Summary

Umbrella mission to integrate Claude as a first-class Capital Glass execution surface with parity to Cursor through **shared platform interfaces** — not a parallel Claude universe.

Phase 0 traced Cursor capabilities to underlying authorities and produced coverage matrix + coupling debt list.

## Terminal stamp

```text
CAPITAL_GLASS_CLAUDE_FULL_ESTATE_INTEGRATION_V1_PROVEN
```

**Not achieved.** 0 capabilities at PROVEN in matrix v1; core MCP invocation
is CONNECTED after bounded read-only proof.

## Published artifacts (Z:)

| Artifact | Path |
| --- | --- |
| Mission charter | `Z:\Capital-Glass-Dev\Claude Start Package\CAPITAL_GLASS_CLAUDE_FULL_ESTATE_PLATFORM_INTEGRATION_V1.md` |
| Coverage matrix | `Z:\Capital-Glass-Dev\Claude Start Package\CLAUDE_INTEGRATION_COVERAGE_MATRIX_V1.json` |
| Phase 0 discovery | `Z:\Capital-Glass-Dev\Claude Start Package\CLAUDE_INTEGRATION_DISCOVERY_PHASE0_V1.md` |
| Prior onboarding pack | `CLAUDE_ESTATE_AWARENESS_PACK_v1.md` (awareness subset) |

## Phase 0 findings (abbreviated)

| Category | Finding |
| --- | --- |
| Platform stack | Deep — WaveRunner, Luna, Auto v3.2, Hub, FI, registry exist |
| Cursor coupling | MCP stdio wiring, scout hooks, subagent launchers, session env vars |
| Claude today | Awareness pack CONNECTED; core MCP parity CONNECTED; formal receipt proof pending |
| Night Owl | Canonical protocol **not located** in estate index — BLOCKED |
| Revu production | Domain blocker — not Claude-specific |
| WSL | Policy CONNECTED; Claude Code MCP execution CONNECTED; formal receipt parity pending |

## Top coupling debts

1. Cursor MCP stdio → need platform-neutral MCP bridge  
2. Scout hooks → need client-neutral preflight CLI  
3. Missing `clientSurface` in receipts  
4. Night Owl canonical doc missing  
5. Cursor subagent definitions → move to neutral agent-packs launcher  

## Phase 1 next actions

1. Schema: `clientSurface=CLAUDE` in closeout + WaveRunner admission  
2. CLI: `agent:client:preflight -- --client=CLAUDE`  
3. Prove `luna:retrieve` + `agent:index:scout` from Claude-originated session  
4. Publish or locate Night Owl canonical protocol  
5. WaveRunner `--resolve-only` proof with Claude client surface  

## Relationship

| WP | Role |
| --- | --- |
| `claude-estate-awareness-v1` | Onboarding / orientation (complete for awareness) |
| `claude-full-estate-platform-integration-v1` | Full parity umbrella (this project) |

## Verification (Phase 0)

| Check | Result |
| --- | --- |
| Mission charter on Z: | PASS |
| Coverage matrix JSON | PASS |
| Cursor→authority tracing documented | PASS |
| Full parity proven | FAIL (expected until clientSurface receipt exists) |

---

## Agent Fast Path

- **Charter:** Z: `CAPITAL_GLASS_CLAUDE_FULL_ESTATE_PLATFORM_INTEGRATION_V1.md`
- **Matrix:** `CLAUDE_INTEGRATION_COVERAGE_MATRIX_V1.json` — 0 PROVEN
- **Execute in:** CG-AppBuilder-MCP; coordinate in Cross-Agent
- **WSL:** bash `/home/wesley/repos` — not PowerShell for platform work
- **Do not** build CLAUDE_NIGHT_OWL or Claude-only MCP clones
