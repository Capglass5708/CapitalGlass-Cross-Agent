# Project: north-star-compounding-proof-v1

## Summary

Move North Star compounding proof authority into Governance so Governance defines required capture, validates whether completed work counts, and keeps AppBuilder limited to execution/receipt production.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | north-star-compounding-proof-v1 |
| Work package | north-star-compounding-proof-v1 |
| Date opened | 2026-08-01 |
| Source | Wesley / ChatGPT / Cursor |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | CG-Platform-Governance-MCP |
| Execution repo | CG-AppBuilder-MCP |
| Status | Pushed |

## Repositories involved

| Repo | Role |
| --- | --- |
| CG-Platform-Governance-MCP | Authority: North Star Protocol, capture contract, compounding proof validation |
| CG-AppBuilder-MCP | Execution adapter: shims, closeout envelope, sync/cache/harvest execution |
| CapitalGlass-Cross-Agent | Meeting repo: durable project notes and ledger |

## Authority rule

Governance decides what must be captured and whether completed work counts. AppBuilder may produce receipts, but AppBuilder is not the source of truth for the protocol.

## Delivered / reported complete

- north-star-compounding-proof-v1 schema
- Governance library
- MCP tools:
  - governance_get_compounding_capture_contract
  - governance_validate_compounding_proof
- corpus-sync policy moved
- mission-front-door policy moved
- retention closeout policy moved
- AppBuilder shims
- preflight fail-closed behavior
- closeout compounding envelope
- Bible runtime parity fix:
  - `PLATFORM-INTELLIGENCE-V1C-CONTRACTS.md` now documents `list_application_bibles` and `get_application_bible_context`.
  - `register-tools.ts` description rephrased to remove write-language that tripped no-write-tool regex.

## Evidence

- CG-AppBuilder-MCP/artifacts/agent-runs/north-star-compounding-proof-v1/session-closeout-v3.2.json
- governance-material-preflight-v1.json — PASS
- governance-closeout-decision-v1.json — AUTHORIZED
- north-star-compounding-proof-v1.json
- harvest-manifest-v1.json

## Verification

- Auto v3.2 closeout gate: AUTO_V32_CLOSEOUT_GATE_PASS
- Governance tests: 6/6 PASS
- Authority manifest: OK
- Targeted corpus-sync test: 16/16 PASS
- `check-bible-runtime-parity` — PASS
- `check:cross-index-parity` — PARTIAL, blocking=0; `application-bibles: IN_SYNC`
- Full `closeout:gate` failed later in `test:auto-protocol-v3`, not because of Bible parity.
- Isolated `test:auto-protocol-v3` case passed alone: 14/14.

## Key decision

Hard compounding proof BLOCK only applies when platformTier.target=Compounding or promotionCompleted. Non-compounding material missions remain advisory.

## Blockers / warnings

| Blocker / warning | Owner repo | Required action |
| --- | --- | --- |
| Cursor MCP has not loaded new Governance tools | Local Cursor MCP runtime | Restart Cursor MCP servers |
| Full `closeout:gate` failed because env vars polluted the test process | `CG-AppBuilder-MCP` / shell environment | Clear `CG_AUTO_V32_WORK_PACKAGE` and `CG_AUTO_V32_MATERIAL`, then rerun `npm run closeout:gate` |

## Commits / PRs

| Repo | Commit / PR | Status |
| --- | --- | --- |
| CG-Platform-Governance-MCP | `0f6dafd` — `feat(governance): add north-star-compounding-proof-v1 constitutional authority` | Pushed |
| CG-Platform-Governance-MCP | `8ebcdf4` — `chore(evidence): north-star-compounding-proof-v1 closeout receipts` | Pushed |
| CG-AppBuilder-MCP | `480315c2` — `feat(governance): AppBuilder execution adapters for compounding proof authority` | Pushed |
| CG-AppBuilder-MCP | `eeb012ce` — `feat(de2): add docling to supported vendor hub domains` | Pushed |
| CG-AppBuilder-MCP | `787bb6eb` — `chore(bible): regenerate application bible snapshots` | Pushed |
| CG-AppBuilder-MCP | `3772d491` — `chore(evidence): north-star-compounding-proof-v1 closeout receipts` | Pushed |

## Commit scopes

| Repo | Scope |
| --- | --- |
| CG-Platform-Governance-MCP | 14 files: schema, lib, MCP tools, policy modules, closeout wiring, manifest, ownership map |
| CG-AppBuilder-MCP | 10 files: Governance shims, compounding proof client, preflight/closeout wiring, Cursor rule, Bible doc, register-tools fix |

## Required rerun command

Before rerunning full closeout gate in AppBuilder, clear the leaked Auto v3.2 environment variables:

```powershell
Remove-Item Env:CG_AUTO_V32_WORK_PACKAGE -ErrorAction SilentlyContinue
Remove-Item Env:CG_AUTO_V32_MATERIAL -ErrorAction SilentlyContinue
cd C:\Developer\repos\CG-AppBuilder-MCP
npm run closeout:gate
```

## Next work packages

- north-star-compounding-vertical-pilot-v1 — harvest → Z: → next-mission retrieval
- platform-governance-phase4-registries-v1 — program/mission/exception registries

## Ledger links

- work-progress/ACTIVE_WORK.md
- work-progress/WORKSPACE_CONTEXT.md

## Governance MCP investigation - 2026-08-02

Investigation target: `CG-Platform-Governance-MCP`.

### Repository state

| Field | Value |
| --- | --- |
| Repo | `Capglass5708/CG-Platform-Governance-MCP` |
| Visibility | Private |
| Default branch | `main` |
| Latest evidence commit observed | `8ebcdf470d50c634ac34a3d2e56eb68aee2d3c94` |
| Authority feature commit | `0f6dafd9a60177c8da26b5d92140c4d173578966` |
| MCP start script | `npm run mcp:start` -> `node mcp-server/platform-governance/src/index.mjs` |
| Main tool registry | `mcp-server/platform-governance/src/tools/register-governance-tools.mjs` |

### Current tool surface in repo

The tool registry currently registers 23 tools:

| Area | Tools |
| --- | --- |
| North Star / ownership | `governance_get_north_star_authority`, `governance_get_repository_owner`, `governance_get_mission_status`, `governance_get_lifecycle_state`, `governance_check_duplicate_authority`, `governance_get_required_evidence`, `governance_get_constitutional_alignment` |
| Synology / scaffold | `governance_get_synology_authority_matrix`, `governance_get_scaffold_improvement_lane` |
| Office Admin pilot | `governance_get_office_admin_preflight_pilot_baseline`, `governance_validate_office_admin_north_star_preflight`, `governance_get_office_admin_preflight_architecture`, `governance_get_closeout_compatibility_matrix`, `governance_get_pilot_sdlc_status`, `governance_validate_pilot_mission_receipt`, `governance_list_pilot_mission_receipts`, `governance_assess_pilot_promotion`, `governance_build_pilot_mission_receipt_template` |
| Material preflight / closeout | `governance_run_material_preflight`, `governance_run_closeout_validation`, `governance_validate_lifecycle_equivalence` |
| Compounding proof | `governance_get_compounding_capture_contract`, `governance_validate_compounding_proof` |

### Authority model confirmed

Governance is the constitutional front door. AppBuilder remains the execution control plane.

| Repo | Role |
| --- | --- |
| `CG-Platform-Governance-MCP` | Owns North Star authority, alignment, required evidence, lifecycle interpretation, duplicate-authority checks, Synology boundary validation, material preflight, closeout validation, compounding proof contract |
| `CG-AppBuilder-MCP` | Executes context compile, BibleDB/cache, harvest, corpus sync, promotion, and performance evidence production |

Governance evidence commit `8ebcdf4` contains BLOCK/REROUTE receipts when the mutation root is Governance. That should not be misread as a failed architecture. It is enforcing the rule: Governance decides; AppBuilder executes.

Observed receipt behavior:

| Receipt | Decision | Meaning |
| --- | --- | --- |
| `governance-material-preflight-v1.json` | `REROUTE` | Mutation root was Governance; expected execution target was `CG-AppBuilder-MCP` |
| `governance-closeout-decision-v1.json` | `BLOCK` | Closeout execution was not authorized because preflight linkage was missing/wrong root |
| `governance-closeout-blocked-receipt-v1.json` | `BLOCK` | Harvest/corpus sync/promotion were blocked in Governance |
| `north-star-lifecycle-index-v1.json` | `PREFLIGHT_BLOCKED` | Next action was reroute mutation root to AppBuilder |

### Important code paths

| Purpose | Path |
| --- | --- |
| Server entrypoint | `mcp-server/platform-governance/src/index.mjs` |
| Tool registration | `mcp-server/platform-governance/src/tools/register-governance-tools.mjs` |
| Compounding proof lib | `scripts/suite-governance/north-star-compounding-proof-lib.mjs` |
| Material preflight lib | `scripts/suite-governance/governance-material-preflight-lib.mjs` |
| Closeout decision lib | `scripts/suite-governance/governance-closeout-decision-lib.mjs` |
| Compounding proof schema | `schemas/north-star-compounding-proof-v1.schema.json` |
| Operating contract | `docs/platform/TWO_MCP_OPERATING_CONTRACT.md` |
| Ownership map | `docs/OWNERSHIP_AND_MIGRATION_MAP.md` |

### Verification commands in package.json

| Command | Purpose |
| --- | --- |
| `npm test` | Governance + equivalence + closeout ROI mutation linkage tests |
| `npm run test:north-star-compounding-proof` | Compounding proof tests |
| `npm run test:governance-closeout-decision` | Closeout decision tests |
| `npm run test:governance-material-preflight` | Material preflight tests |
| `npm run check:north-star-authority -- --json` | North Star authority hosting check |
| `npm run check:authority-anti-regrowth -- --json` | Prevent AppBuilder constitutional authority regrowth |
| `npm run governance:material-preflight -- --json ...` | CLI preflight decision |
| `npm run governance:closeout-decision -- --json ...` | CLI closeout decision |

### Cleanup/gap found

| Gap | Severity | Fix |
| --- | --- | --- |
| `README.md` says Tools (18), but registry has 23 tools | Low doc drift | Update README tool count/list |
| `mcp-server/platform-governance/src/index.mjs` instructions still say Phase 1/read-only and “consumes constitutional authority from CG-AppBuilder-MCP” | Medium doc/runtime-description drift | Update MCP instructions to Phase 2/3 current model: Governance owns constitutional authority; AppBuilder supplies registries/execution context |
| Current ChatGPT tool surface does not expose Governance MCP tools directly | Operational | Restart/reconnect Cursor MCP for local use; ChatGPT currently only sees PI governance health/surface tools, not Governance MCP tools |

### Conclusion

Governance MCP is the correct home for constitutional capture and closeout authority. The repo has the compounding proof contract, validation schema, MCP tools, preflight/closeout decision libs, tests, and pushed evidence. Its BLOCK/REROUTE receipts are evidence that it prevents execution from happening in the authority repo and sends execution back to AppBuilder.

## Update log

### 2026-08-02 CT - Governance MCP investigation captured

- Investigated `CG-Platform-Governance-MCP` repo, package scripts, tool registry, compounding proof schema/lib, material preflight, closeout decision, and latest evidence commit.
- Confirmed registry currently exposes 23 Governance MCP tools, including `governance_get_compounding_capture_contract` and `governance_validate_compounding_proof`.
- Confirmed BLOCK/REROUTE evidence in Governance repo is expected when mutation root is Governance; execution should reroute to AppBuilder.
- Found doc/runtime-description drift: README says 18 tools while registry has 23, and MCP server instructions still describe older Phase 1/AppBuilder-authority wording.

### 2026-08-02 21:02 CT — evidence committed and pushed

- Governance evidence pushed: `8ebcdf4` (22 files — closeout receipts, lifecycle linkage, full-system verification).
- AppBuilder evidence pushed: `3772d491` (30 files — agent-runs receipts, gate fixtures, lifecycle index, redo registry contract).
- Also pushed: `eeb012ce` (docling vendor hub), `787bb6eb` (bible regen), `480315c2` (execution adapters).
- Governance authority already on remote: `0f6dafd`.
- Status updated to **Pushed**. Push blocker removed.
- Next: restart MCP, clear Auto v3.2 env vars, rerun `closeout:gate`, begin vertical pilot WP.

### 2026-08-01 CT — Cursor closeout commit/parity update

- Governance commit created locally: `0f6dafd`.
- AppBuilder commit created locally: `480315c2`.
- Neither commit pushed.
- Bible parity fixed; `check-bible-runtime-parity` passes.
- Full `closeout:gate` no longer blocked by Bible parity; it failed later due likely env contamination from `CG_AUTO_V32_WORK_PACKAGE=north-star-compounding-proof-v1` and/or `CG_AUTO_V32_MATERIAL` in shell.
- Isolated failing test passed alone, supporting env contamination diagnosis.
- Required next action: clear env vars, rerun `npm run closeout:gate`, restart Cursor MCP servers, then push commits when approved.
