# Cross-Agent Investigation Report

Status: INVESTIGATION ONLY

## Executive Verdict
The Cross-Agent repository has appropriate boundaries as a coordination repo, but should be hardened with a structured projection into Supabase while preserving Git as the human-readable source of truth.

## Key Findings
- Cross-Agent is a coordination repository, not an implementation repo.
- Governance should remain protocol authority.
- AppBuilder should remain the execution adapter.
- ACTIVE_WORK.md is becoming large and should evolve toward append-only events plus a current-state projection.
- Cross-Agent is not represented as a first-class project in Supabase.
- No Supabase Edge Functions currently exist for automated ingestion.
- Existing agent tables are too specialized for general cross-agent coordination.

## Cursor Work Package
Work package: cross-agent-structured-ledger-projection-v1

Acceptance:
1. Governance-owned schema contract.
2. AppBuilder ingestion adapter.
3. Append-only event model.
4. Current-state projection.
5. Drift detection between Git and Supabase.
6. Platform Health dashboard integration.
7. Git remains canonical; Supabase is a derived operational index.
