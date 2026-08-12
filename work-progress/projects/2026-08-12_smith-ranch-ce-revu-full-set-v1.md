# Project: smith-ranch-ce-revu-full-set-v1

| Field | Value |
| --- | --- |
| Work package | `smith-ranch-ce-revu-full-set-v1` |
| Owner repo | `CG-AppBuilder-MCP` (executor) · `Computer-Estimator-glazing-spine` (CE phases) |
| Project | CG-2037-26 Smith Ranch Road |
| Status | **PHASE_A_READY_FOR_REMOTE_DISPATCH** |
| Phase B | **QUEUED_POLICY_GATE** (Revu — WINDOWS_INTERACTIVE) |

## Decisions

- Phase A runs on RYZEN9 WSL via governed profile `smith-ranch-ce-batch` only — no caller-controlled paths or shell.
- Expected architectural corpus: **235 PDFs**; drift emits `INPUT_CORPUS_DRIFT` unless operator approves.
- Phases 2–5 run on primary document (highest page count) after batch phase 1 — Morton Ranch model.
- Revu markup **not** in scope for this profile; `revuInvoked: false` by contract.

## Blockers

| Id | Severity | Action |
| --- | --- | --- |
| `appbuilder-profile-merge-required` | REQUIRED | Merge AppBuilder commit to trusted `main` before live GHA dispatch |
| `revu-production-takeoff-pilot-v1` | REQUIRED_FOR_PHASE_B | Human gate before Revu Phase B |

## Evidence / receipts

| Artifact | Path |
| --- | --- |
| Z handoff | `Z:\Office\Wes\Direct Connect\handoffs\smith-ranch-ce-revu-full-set-v1\` |
| Input manifest (staged) | `CG-AppBuilder-MCP/artifacts/agent-runs/smith-ranch-ce-revu-full-set-v1/smith-ranch-input-manifest.json` |
| Phase A receipts (post-run) | `CG-AppBuilder-MCP/artifacts/agent-runs/smith-ranch-ce-revu-full-set-v1/phase-a-*.json`, `ce-revu-handoff.json` |

## Implementation pointer

AppBuilder commit on branch `feat/cursor-wsl2-front-door-v1` — PR pending. Profile: `smith-ranch-ce-batch` · workflow: `ryzen9desk-executor-dispatch.yml`.

## Next action

1. Merge AppBuilder PR to `main`.
2. Dispatch: `gh workflow run ryzen9desk-executor-dispatch.yml -f work_package_id=smith-ranch-ce-revu-full-set-v1 -f job_profile=smith-ranch-ce-batch -f approval_ref=smith-ranch-ce-revu-full-set-v1`
3. After Phase A PASS, operator executes Revu Phase B on Windows interactive session.

## Intelligence Hub harvest

| Artifact | Path |
| --- | --- |
| Compact slice (Git) | `CapitalGlass-Cross-Agent/work-progress/intelligence-hub-slices/smith-ranch-ce-revu-full-set-v1.json` |
| Full chat harvest | `CG-AppBuilder-MCP/artifacts/agent-runs/smith-ranch-ce-revu-full-set-v1/intelligence-hub-harvest-v1.json` |
| Cross-desk routing pointer | `CapitalGlass-Cross-Agent/work-progress/intelligence-hub-slices/cross-desk-routing.json` → `smithRanchCeRevuFullSet` |
| Harvest id | `harvest-2026-08-12-smith-ranch-ce-revu-full-set-v1` |

**L: publication:** ingest via WESLEYDESK `index-publication.yml` after Cross-Agent commits land — do not hand-edit `BY-KIND` from Cursor.

### Key indexed facts

- **Executor profile:** `smith-ranch-ce-batch` · mutation · GPU · approval · 480m timeout
- **Corpus:** 235 PDFs · digest `64b404b7702a86f9fdd28861ed2367956813676d85b3c94334b8aa1f753e742e`
- **CE spine:** batch → primary doc query → phases 1–5 scripts in `Computer-Estimator-glazing-spine`
- **Revu:** not invoked by profile; Phase B `QUEUED_POLICY_GATE`
- **Operational:** L: `readdirSync` slow on WESLEY_WORK SMB; `find` used for staged manifest
- **AppBuilder commit:** `cd807ac8f` (push blocked by Remote Push Sentinel at harvest time)
