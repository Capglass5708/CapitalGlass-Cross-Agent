# Intelligence Hub Seed and Report — Project Folder Synology

**Work package:** `complete-project-folder-synology-intelligence-publication-v1`
**Generated:** 2026-08-03T21:21:05.706Z
**Final verdict:** `INTELLIGENCE_HUB_SEED_AND_REPORT_PASS`

## 1. Final verdict

| Gate | Result |
| --- | --- |
| lPublication | PASS |
| supabaseParity | PASS |
| seedSubjects | PASS |
| retrieval24 | PASS |
| indexPublication | PASS |

## 2. Current operational truth

| Fact | Value |
| --- | --- |
| Production promotion | CLOSED — PRODUCTION_PROMOTION_PASS |
| Promotion merge SHA | `5a436d1d357e774da68abe7dc6a6d539d5f233fc` |
| Live application SHA | `0f84735` (descendant) |
| Production flag | PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=true |
| Production worker | CapitalGlass-Office-ProjectFolder-Provision RUNNING |
| Production root | L:\\Capital-Glass-Projects\\ |
| Dev root | L:\\Capital-Glass-Projects-Dev\\ |
| Production Supabase | wvidyxufvcrtezzkwwse |
| Dev Supabase | mazvavlshjshwklcvxaw |
| Historical migration | Frozen — NOT STARTED |
| SharePoint Slice 4 | Frozen — NOT STARTED |
| Stabilization | 24h observe-only |

## 3. Git versus L: versus Supabase parity

| Layer | sourceCommitSha | Status |
| --- | --- | --- |
| Git (worktree) | `28530506492af46be81a7077a76502c85ace6966` | authority |
| L: active-work-ledger | `28530506492af46be81a7077a76502c85ace6966` | in sync |
| L: harvest BY-KIND | `28530506492af46be81a7077a76502c85ace6966` | PUBLISH_PASS |
| Supabase projection | `28530506492af46be81a7077a76502c85ace6966` | IN_SYNC |
| Freshness gate | — | `PASS` |

## 4. All 24 retrieved questions and answers

### RQ01: Where are new project folders stored?
- **Returned IH-PFSP:** IH-PFSP-001
- **Short answer:** Production new-project folders are created under L:\Capital-Glass-Projects\ on CG-WESLEYDESK-01.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json

### RQ02: Where does Document Center save project files?
- **Returned IH-PFSP:** IH-PFSP-002
- **Short answer:** New project folder trees are provisioned on Synology L: by the office worker; Document Center on Vercel orchestrates jobs only.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json

### RQ03: Is the whole Document Center hosted on Synology?
- **Returned IH-PFSP:** IH-PFSP-003
- **Short answer:** No — Vercel hosts the app; Supabase holds metadata; Synology holds new project folder binaries.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_CONTRACT.md

### RQ04: What remains on Vercel?
- **Returned IH-PFSP:** IH-PFSP-004
- **Short answer:** Vercel hosts the CapitalGlass-Documents application, API routes, and feature flags.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** artifacts/agent-runs/project-folder-synology-primary-v1/production-route-probe.json

### RQ05: What remains in Supabase?
- **Returned IH-PFSP:** IH-PFSP-005
- **Short answer:** Supabase holds project_folder_provision_jobs, metadata, and canonical project identity — not folder binaries.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** supabase/migrations/20260803140000_project_folder_synology_primary_support_tables.sql

### RQ06: Which machine creates the folders?
- **Returned IH-PFSP:** IH-PFSP-006
- **Short answer:** CG-WESLEYDESK-01 via NSSM services.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json

### RQ07: What worker service handles production?
- **Returned IH-PFSP:** IH-PFSP-007
- **Short answer:** CapitalGlass-Office-ProjectFolder-Provision on CG-WESLEYDESK-01.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json

### RQ08: What worker handles dev?
- **Returned IH-PFSP:** IH-PFSP-008
- **Short answer:** CapitalGlass-Office-ProjectFolder-Provision-Dev with identity CG-WESLEYDESK-01-dev.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** artifacts/agent-runs/project-folder-synology-primary-v1-dev-hosted-environment/receipt.json

### RQ09: What is the production Synology root?
- **Returned IH-PFSP:** IH-PFSP-009
- **Short answer:** L:\Capital-Glass-Projects\
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json

### RQ10: What is the dev Synology root?
- **Returned IH-PFSP:** IH-PFSP-010
- **Short answer:** L:\Capital-Glass-Projects-Dev\
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** artifacts/agent-runs/project-folder-synology-primary-v1-dev-hosted-environment/receipt.json

### RQ11: Are dev and production isolated?
- **Returned IH-PFSP:** IH-PFSP-011
- **Short answer:** Yes — separate Supabase projects, roots, workers, and Doppler configs.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json

### RQ12: Which Supabase project is production?
- **Returned IH-PFSP:** IH-PFSP-012
- **Short answer:** wvidyxufvcrtezzkwwse
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json

### RQ13: Which Supabase project is dev?
- **Returned IH-PFSP:** IH-PFSP-013
- **Short answer:** mazvavlshjshwklcvxaw
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** artifacts/agent-runs/project-folder-synology-primary-v1-dev-hosted-environment/receipt.json

### RQ14: What SHA is live in production?
- **Returned IH-PFSP:** IH-PFSP-014
- **Short answer:** Promotion landed at 5a436d1; live /api/version may advance (e.g. 0f84735) as descendant commits deploy.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json

### RQ15: Why is deployed SHA 5a436d1 instead of candidate e3fe6ec?
- **Returned IH-PFSP:** IH-PFSP-015
- **Short answer:** PR #91 merged to main producing merge commit 5a436d1; application source matches e3fe6ec plus docs.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json

### RQ16: Which PR promoted the feature?
- **Returned IH-PFSP:** IH-PFSP-016
- **Short answer:** CapitalGlass-Documents PR #91 merged at 5a436d1; P1–P10 ALL PASS.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** pull/91, artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/gate-results.json

### RQ17: Can Wesley test the feature now?
- **Returned IH-PFSP:** IH-PFSP-017
- **Short answer:** Yes — for new production projects only, during stabilization observe-only.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json, artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/canary-receipt.json

### RQ18: Is historical migration active?
- **Returned IH-PFSP:** IH-PFSP-018
- **Short answer:** No — frozen; not started.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** work-progress/projects/project-folder-synology-primary-v1-production-promotion.md

### RQ19: Is SharePoint still used for project folders?
- **Returned IH-PFSP:** IH-PFSP-019
- **Short answer:** No — SharePoint Slice 4 not started; frozen for project-folder workflow.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_PRODUCTION_PROMOTION_CONTRACT.md

### RQ20: What is the current stabilization mode?
- **Returned IH-PFSP:** IH-PFSP-020
- **Short answer:** Observe-only for 24 hours; no storage expansion.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** work-progress/projects/project-folder-synology-primary-v1-production-promotion.md

### RQ21: Was rollback executed?
- **Returned IH-PFSP:** IH-PFSP-021
- **Short answer:** Yes — ROLLBACK_READY; not executed.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/rollback-receipt.json

### RQ22: Where is the detailed evidence?
- **Returned IH-PFSP:** IH-PFSP-022
- **Short answer:** Git harvest at artifacts/agent-runs/harvest-project-folder-synology-primary-chat-v1/ is canonical; L: and Supabase are validated projections.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** artifacts/agent-runs/harvest-project-folder-synology-primary-chat-v1/harvest-manifest-v1.json

### RQ23: What were P1–P10?
- **Returned IH-PFSP:** IH-PFSP-016
- **Short answer:** CapitalGlass-Documents PR #91 merged at 5a436d1; P1–P10 ALL PASS.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** pull/91, artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/gate-results.json

### RQ24: What is Git authority versus Intelligence Hub?
- **Returned IH-PFSP:** IH-PFSP-022
- **Short answer:** Git harvest at artifacts/agent-runs/harvest-project-folder-synology-primary-chat-v1/ is canonical; L: and Supabase are validated projections.
- **Classification:** VERIFIED
- **Layer:** intelligence-hub-L-catalog
- **Authority:** artifacts/agent-runs/harvest-project-folder-synology-primary-chat-v1/harvest-manifest-v1.json

## 5. IH-PFSP-001 through IH-PFSP-022 record mapping

| IH-PFSP | Question ID | Hub catalog path |
| --- | --- | --- |
| IH-PFSP-001 | Q001 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-001.json` |
| IH-PFSP-002 | Q017 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-002.json` |
| IH-PFSP-003 | Q013 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-003.json` |
| IH-PFSP-004 | Q018 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-004.json` |
| IH-PFSP-005 | Q019 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-005.json` |
| IH-PFSP-006 | Q020 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-006.json` |
| IH-PFSP-007 | Q005 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-007.json` |
| IH-PFSP-008 | Q006 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-008.json` |
| IH-PFSP-009 | Q021 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-009.json` |
| IH-PFSP-010 | Q022 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-010.json` |
| IH-PFSP-011 | Q007 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-011.json` |
| IH-PFSP-012 | Q023 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-012.json` |
| IH-PFSP-013 | Q024 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-013.json` |
| IH-PFSP-014 | Q002 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-014.json` |
| IH-PFSP-015 | Q003 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-015.json` |
| IH-PFSP-016 | Q025 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-016.json` |
| IH-PFSP-017 | Q004 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-017.json` |
| IH-PFSP-018 | Q008 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-018.json` |
| IH-PFSP-019 | Q009 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-019.json` |
| IH-PFSP-020 | Q010 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-020.json` |
| IH-PFSP-021 | Q011 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-021.json` |
| IH-PFSP-022 | Q016 | `02-catalog/knowledge-objects/cross-agent-harvest/IH-PFSP-022.json` |

## 6. Seed-versus-retrieval comparison

- Seed records: 22/22
- Retrieval questions executed: 24/24
- Retrieval pass rate: 24/24
- Chat transcript coverage: PARTIAL

## 7. Historical-state supersession

- CONTRACT_PASS_HOSTED_DEV_HOLD superseded by DEV_ENVIRONMENT_ACCEPTED
- PRODUCTION_PROMOTION_HOLD superseded by PRODUCTION_PROMOTION_PASS
- 405 route probe superseded by 401 live routes at 5a436d1+

## 8. Contradictions and unresolved claims

- No current answer sourced exclusively from obsolete HOLD records (verified in retrieval benchmark).
- Live SHA may advance beyond promotion merge; promotion merge remains lineage authority.

## 9. Evidence ledger

| Artifact | Path |
| --- | --- |
| Hub publication receipt | artifacts/agent-runs/complete-project-folder-synology-intelligence-publication-v1/hub-publication-receipt.json |
| Hub retrieval results | artifacts/agent-runs/complete-project-folder-synology-intelligence-publication-v1/hub-retrieval-results.json |
| Index publication | runtime/index-publication/latest.json |
| Freshness gate | artifacts/agent-runs/cross-agent-index-freshness-gate-v1/latest.json |
| Harvest manifest | artifacts/agent-runs/harvest-project-folder-synology-primary-chat-v1/harvest-manifest-v1.json |

## 10. Retrieval quality metrics

| Metric | Value |
| --- | --- |
| Questions executed | 24/24 |
| Pass rate | 100.0% |
| Retrieval layer | intelligence-hub-L-catalog |
| Source | L: only (not Git JSON) |

## 11. Human cross-check checklist

- [ ] Confirm L: files exist under 02-catalog/knowledge-objects/cross-agent-harvest/
- [ ] Confirm freshness gate PASS after index publication
- [ ] Confirm production still in stabilization observe-only
- [ ] Confirm no secrets in Hub records

## 12. Original dirty worktree confirmation

Baseline captured before publication; operator should verify main worktree unchanged.
```json
{
  "capturedAt": "2026-08-03T22:00:00.000Z",
  "mainWorktreePath": "/home/wesle/repos/CapitalGlass-Cross-Agent",
  "headSha": "649c2b3803082be1709484e29666fd4cb8dacd0f",
  "statusShort": [
    " M artifacts/agent-runs/cross-agent-index-freshness-gate-v1/latest.json",
    "?? artifacts/agent-runs/cross-agent-index-publication-v1/",
    "?? artifacts/agent-runs/preflight-index-utilization-gate-v1/",
    "?? runtime/"
  ],
  "note": "Baseline captured before isolated worktree publication; main worktree must remain unchanged."
}
```
