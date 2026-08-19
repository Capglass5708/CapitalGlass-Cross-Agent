# Claude Full-Estate Integration — Phase 0 Discovery

**Work package:** `claude-full-estate-platform-integration-v1`  
**Date:** 2026-08-18  
**Mission class:** investigate  
**Verdict:** **DISCOVERY_PHASE_0_COMPLETE** — parity **NOT PROVEN**  
**Matrix:** `CLAUDE_INTEGRATION_COVERAGE_MATRIX_V1.json`

---

## Executive summary

Capital Glass already has a **deep platform stack** that Cursor uses — but much of it is reached through **IDE-coupled paths** (Cursor MCP stdio config, Cursor hooks, Cursor subagents, `CG_AUTO_V32_*` session env).

Claude today has:

| Layer | Status |
| --- | --- |
| Estate **awareness** (orientation pack) | **CONNECTED** |
| WSL execution policy | **CONNECTED** |
| Platform **execution parity** | **NOT PROVEN** (0 capabilities at PROVEN) |

The correct integration path is **not** a Claude-only fork. It is:

1. Add `clientSurface = CLAUDE` to existing receipts and admission contracts.
2. Expose platform-neutral CLIs and MCP bridges Cursor already indirectly uses.
3. Remove accidental Cursor coupling where safe (scout hooks, MCP wiring, subagent launchers).
4. Prove parity phase-by-phase using existing fixtures.

---

## How Cursor actually gets capability (authority tracing)

### 1. Repository discovery and authorization

| What Cursor appears to do | Actual authority |
| --- | --- |
| Knows repo names | `capital-glass-platform-health/platform/repository-registry.json` (33 entries) |
| Knows apps/MCPs | L: `00-master-index/AGENT_BUILD_CATALOG.json` + BY-KIND slices |
| Knows local clones | WSL ext4 `~/repos` (operator-maintained library) |
| Knows if mutation allowed | `execution-context:resolve`, registry `agentDiscoverable`, target-repo admission, WaveRunner locks |

**Claude gap:** no admission receipt with `clientSurface=CLAUDE`.

### 2. Control-plane preflight

| Cursor path | Authority |
| --- | --- |
| Session start rules | Auto Protocol v3.2 — `npm run agent:preflight:auto-v32` |
| Master preflight | `npm run agent:preflight:app-builder-mcp` |
| Office/network | `office.get_agent_preflight` (Office Admin MCP) |
| North Star | CG-Platform-Governance-MCP |

**Coupling:** Material preflight uses `CG_AUTO_V32_*` env vars set in Cursor sessions.

### 3. Platform Intelligence / retrieval

| Cursor path | Authority |
| --- | --- |
| Scout lane (mandatory index first) | `npm run agent:index:scout` + Cursor hooks (`intelligence-hub-scout-inject.mjs`) |
| Luna director | `npm run luna:retrieve -- --director` |
| Federated repo index | `cg-federated-repo-index-v1` / Luna surfaces registry |
| Retrieval codes | INDEX_HIT, CACHE_HIT, DIRECT_CONNECT_HIT, etc. |

**Coupling:** Scout enforcement is injected via **Cursor hooks** — not yet a client-neutral gate Claude automatically runs.

### 4. MCP

| Cursor path | Authority |
| --- | --- |
| MCP server list | `Cursor-MCP-Kit` → `Repair-Cursor-McpJson-Wsl.sh` → `~/.cursor/mcp.json` |
| Server processes | Per-repo `services/*/run.mjs` stdio servers |
| WaveRunner MCP overlay | `build-waverunner-mcp-spoke-overlay.mjs` |

**Coupling:** **CRITICAL** — MCP invocation is Cursor-native today. Claude needs the same servers through a **platform MCP bridge** (agent-ops dispatch, shared stdio launcher, or HTTP MCP gateway) — not duplicate servers.

### 5. WaveRunner

| Cursor path | Authority |
| --- | --- |
| Operator command | `npm run sdlc:waverunner` |
| Orchestration | `scripts/sdlc-protocol-cursor/lib/waverunner-orchestrate.mjs` |
| Capability proof | `waverunner-capability-registry-v1.json` (mostly IMPLEMENTED_AND_PROVEN) |
| Receipts | `waverunner-admission-receipt.json`, execution context cache schemas |

**Good news:** Front door is **CLI/platform** — folder name `sdlc-protocol-cursor` is legacy; orchestration is not inherently Cursor-only.

### 6. Night Owl

**Phase 0 finding:** No canonical Night Owl protocol artifact located in:

- Git repos searched (AppBuilder, Cross-Agent, Governance, agent-ops)
- `Z:\Capital-Glass-Dev\Chat GPT Instructions`
- `Z:\Capital-Glass-Dev\Harvest` (sample)

Mission charter defines the expected lifecycle. **Status: BLOCKED** until canonical protocol is published to Cross-Agent or Governance.

### 7. Multi-agent / 3-way

| Pattern | Authority | Coupling |
| --- | --- | --- |
| Suite 3-way scout/builder/critic/verifier | `CG-AppBuilder-MCP/agent-packs/three-way-agent` | Medium |
| Office Admin network 3-way | `CapitalGlass-Office-Admin/agent-packs/office-admin-three-way` | Cursor subagents |
| Agent Loop missions | `capital-glass-agent-ops` + `user-agent-loop` MCP | MCP via Cursor |

### 8. Intelligence Hub publish

| Cursor path | Authority |
| --- | --- |
| Ledger edit | Cross-Agent `ACTIVE_WORK.md` |
| L: slice publish | `active-ledger:export`, Data-Extraction sync |
| Supabase projection | `cross-agent-ledger:ingest --apply` |
| Note seed promotion | `cross-agent-notes:seed` → Z AI-Cache-Authority |

Publish path is **platform** — Claude can use same CLIs from WSL once admitted.

### 9. Git / GitHub

| Cursor path | Authority |
| --- | --- |
| Local git | WSL bash in authorized repo |
| GitHub | `gh` CLI + `user-github` MCP |
| PR lifecycle | Branch protection + `closeout:gate` + CI |

Platform-neutral if Claude runs from WSL with same gates.

### 10. Runtime / machines

| Cursor path | Authority |
| --- | --- |
| WSL default | Office Admin + AppBuilder `cursor:wsl-default:verify` |
| Cross-desk | Direct Connect MCP + Z: handoff bus |
| RYZEN9 | `ryzen9desk-managed-executor-v1`, GHA runner |
| GPU hosts | L: `host-authority.json`, Luna connectivity routes |

---

## Cursor-specific coupling debts (repair targets)

| ID | Issue | Recommended fix |
| --- | --- | --- |
| `cursor_mcp_stdio_wiring` | MCP only in `~/.cursor/mcp.json` | Shared MCP launcher manifest + Claude connector |
| `cursor_scout_hooks` | Index-first enforced in Cursor hooks only | Mandatory `agent:index:scout` in all client admission paths |
| `cursor_subagent_definitions` | `.cursor/agents/network-*.md` | Role packs in `agent-packs/` with neutral launcher |
| `missing_client_surface_field` | Receipts don't record client | Add `clientSurface` enum: CURSOR, CLAUDE, CHATGPT, … |
| `night_owl_canonical_missing` | Protocol not in estate index | Publish to Cross-Agent `plans/` or Governance |

---

## Phase 1 recommended next steps (ordered by ROI)

| # | Action | Owner | Proof |
| --- | --- | --- | --- |
| 1 | Add `clientSurface` to Auto v3.2 closeout + WaveRunner admission receipt schemas | CG-AppBuilder-MCP | Schema test + sample receipt |
| 2 | Create `npm run agent:client:preflight -- --client=CLAUDE` wrapping scout + auto-v32 + execution-context | CG-AppBuilder-MCP | CLI receipt |
| 3 | Document platform MCP bridge plan (reuse Cursor-MCP-Kit servers, not duplicate) | Cursor-MCP-Kit + AppBuilder | Architecture note in this folder |
| 4 | Prove Claude can run `luna:retrieve` + `agent:index:scout` from WSL and emit standard retrieval codes | Operator + AppBuilder | Phase 1 receipt |
| 5 | Locate or author canonical Night Owl protocol | Cross-Agent / Governance | Published markdown + INDEX row |
| 6 | Prove bounded WaveRunner `--resolve-only` with `clientSurface=CLAUDE` | CG-AppBuilder-MCP | waverunner-admission-receipt |

---

## Relationship to prior work package

| WP | Relationship |
| --- | --- |
| `claude-estate-awareness-v1` | Phase 0 **onboarding** — subset of this mission (awareness only) |
| `claude-full-estate-platform-integration-v1` | **Umbrella** — full platform parity through `CAPITAL_GLASS_CLAUDE_FULL_ESTATE_INTEGRATION_V1_PROVEN` |

Keep both packs in this folder. Awareness pack remains the Claude Project upload for orientation; this mission drives engineering parity.

---

## Agent Fast Path

- Charter: `CAPITAL_GLASS_CLAUDE_FULL_ESTATE_PLATFORM_INTEGRATION_V1.md`
- Matrix: `CLAUDE_INTEGRATION_COVERAGE_MATRIX_V1.json`
- Phase 0: **30 DISCOVERED, 2 CONNECTED, 0 PROVEN, 3 BLOCKED**
- Do not claim PROVEN until matrix rows move with receipts
- MCP + scout hooks = top coupling debts
