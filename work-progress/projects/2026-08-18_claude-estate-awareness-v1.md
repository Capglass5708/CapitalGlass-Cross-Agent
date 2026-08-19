# Claude Estate Awareness Pack v1

**Project ID / work package:** `claude-estate-awareness-v1`  
**Date:** 2026-08-18  
**Owner repo:** `CapitalGlass-Cross-Agent`  
**Mission class:** docs  
**Status:** **PUBLISHED_TO_Z** — operator Claude upload pending

## Summary

Estate-wide investigation produced a Claude onboarding package: human-readable orientation pack, machine compact JSON, operator handoff, and optional Cross-Agent note seed for Intelligence Hub promotion.

## Problem

Wesley is starting to use Claude. Unlike Cursor (MCP + repo access) and the existing ChatGPT harvest lane, Claude had no bounded, truthful estate orientation — risking invented paths, wrong authority, and stale blockers.

## Solution

| Deliverable | Path |
| --- | --- |
| **Published operator folder** | `Z:\Capital-Glass-Dev\Claude Start Package\` |
| Primary Claude upload | `Z:\Capital-Glass-Dev\Claude Start Package\CLAUDE_ESTATE_AWARENESS_PACK_v1.md` |
| Operator front door | `Z:\Capital-Glass-Dev\Claude Start Package\START_HERE.md` |
| Machine compact | `Z:\Capital-Glass-Dev\Claude Start Package\claude-estate-awareness-v1.json` |
| Git regeneration source | `CapitalGlass-Cross-Agent/agent-onboarding/claude/` |
| Operator handoff | `Z:\Capital-Glass-Dev\Claude Start Package\2026-08-18_claude-estate-awareness.md` |
| Note seed (candidate) | `Z:\Capital-Glass-Dev\Claude Start Package\claude-estate-awareness-seed.json` |

## Investigation sources

| Source | Commit / timestamp | Role |
| --- | --- | --- |
| L: Intelligence Hub index | `updatedAt` 2026-08-17T14:44:17.200Z | Apps, MCPs, blockers, open actions |
| Cross-Agent ledger | `ACTIVE_WORK.md` through 2026-08-13 | Active projects, storage remediation |
| Cross-Agent handoff | `CURRENT_HANDOFF.md` | Failover contract, top open work |
| AppBuilder | `caf83871…` hint | Auto v3.2, seeding commands |
| Cross-Agent | `4ae8fede…` hint | Coordination repo tip |
| Office Admin MCP | preflight 2026-08-18 | Secrets, host, north star overlay |

## Scope included

- Suite app map (12 apps) and platform repo roles (7)
- Authority model (Governance / AppBuilder / Cross-Agent / owner repos)
- Secrets policy (Doppler + IT Vault)
- Host rules (WSL ext4, L:/Z: layers, two-desk, Direct Connect)
- Indexed blockers and top active projects
- Agent protocols (ledger updates, Auto v3.2 advisory, 3-way composer pointer)
- MCP inventory orientation
- Research library ladder
- Suggested Claude prompts

## Scope excluded (by design)

- Full project index (470+ harvest rows) — pointer to `projects/INDEX.md` only
- Secret values, vault contents, Doppler configs
- Full Application Bible bodies
- Implementation code

## Verification

| Check | Result |
| --- | --- |
| L: mount for hub slices | PASS — `/mnt/l/Capital-Glass-Intelligence-Hub/00-master-index` |
| Blockers match `active-work-blockers.json` | PASS — 5 domain blockers |
| No secrets in pack | PASS — names/paths only |
| Cross-Agent implementation boundary respected | PASS — docs only |

## Next action

Wesley reviews and uploads `CLAUDE_ESTATE_AWARENESS_PACK_v1.md` to Claude Project; commit Cross-Agent when satisfied; optional `cross-agent-notes:seed` promotion.

---

## Agent Fast Path

- **Upload from:** `Z:\Capital-Glass-Dev\Claude Start Package\CLAUDE_ESTATE_AWARENESS_PACK_v1.md`
- **Live ledger:** `work-progress/ACTIVE_WORK.md` + `handoffs/CURRENT_HANDOFF.md`
- **Blockers slice:** L: `BY-KIND/active-work-blockers.json` (5 indexed)
- **Never implement** in Cross-Agent; owner repo + Cursor for code
- **Secrets:** Doppler + IT Vault; never in Claude project files
- **Stale rule:** Git ledger beats this pack; refresh after material ledger edits
- **Seed id:** `claude-estate-awareness-v1` (classification: `reusable_knowledge`)
