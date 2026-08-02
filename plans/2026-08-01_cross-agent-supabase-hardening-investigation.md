# Cross-Agent Investigation Report

Status: PHASE 0 COMPLETE — PROJECTION WP OPEN

## Executive Verdict

The Cross-Agent repository has appropriate boundaries as a coordination repo. Phase 0 platform registry onboarding is complete. Remaining hardening should add a structured projection into Supabase while preserving Git as the human-readable source of truth.

## Key Findings

- Cross-Agent is a coordination repository, not an implementation repo.
- Governance should remain protocol authority.
- AppBuilder should remain the execution adapter.
- `ACTIVE_WORK.md` is becoming large and should evolve toward append-only events plus a current-state projection (`active-ledger-drain-and-intelligence-hub-sync-v1`).
- ~~Cross-Agent is not represented as a first-class project in Supabase.~~ **Resolved Phase 0** — see below.
- No Supabase Edge Functions currently exist for automated ingestion.
- Existing agent tables are too specialized for general cross-agent coordination.

## Phase 0 — Platform registry onboarding (COMPLETE)

| Field | Value |
| --- | --- |
| Work package | `cross-agent-registry-onboard-v1` |
| Owner repo | `CG-AppBuilder-MCP` |
| Commit | `38a162da` |
| Supabase project | MCP control plane (`xjivcwcyyimjujbchwdf`) |
| `repo_key` | `capital-glass-cross-agent` |
| Registry id | `f43b1467-7226-4eb5-9acb-7862a0a6bbd6` |
| Classification | `control_plane` |
| RI registry | `capital-glass-cross-agent` repo #14, `ledgerOnly: true` |
| Register script | `npm run roi:cross-agent:register` (requires `PLATFORM_REGISTRY_IMPORT_APPROVED=1`) |
| Evidence | `CG-AppBuilder-MCP/artifacts/agent-runs/cross-agent-registry-onboard-v1/cross-agent-registry-onboard.json` |
| Project file | `work-progress/projects/2026-08-02_cross-agent-registry-onboard-v1.md` |

Phase 0 covers **identity in `registry.repositories`** and suite/RI parity. It does **not** implement event ingestion or projections.

## Phase 1+ — Structured ledger projection (OPEN)

Work package: `cross-agent-structured-ledger-projection-v1`

Acceptance:

1. Governance-owned schema contract.
2. AppBuilder ingestion adapter.
3. Append-only event model.
4. Current-state projection.
5. Drift detection between Git and Supabase.
6. Platform Health dashboard integration.
7. Git remains canonical; Supabase is a derived operational index.

## Related work packages

| Work package | Role | Status |
| --- | --- | --- |
| `cross-agent-registry-onboard-v1` | Platform registry identity | **Complete** (`38a162da`) |
| `cross-agent-structured-ledger-projection-v1` | Event/projection model | Open |
| `active-ledger-drain-and-intelligence-hub-sync-v1` | Drain `ACTIVE_WORK.md` to durable owners | Phase 0 PASS — Governance approval pending |
