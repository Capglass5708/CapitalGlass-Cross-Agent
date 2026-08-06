# Harvest summary — derived view

**Authority:** `harvest-manifest-v1.json` (`c50e396d760c…`)
**Work package:** `harvest-2026-08-06-office-admin-pr29-github-health-v1`
**Mission class:** `chat-thread-closeout-autopsy-harvest-v1`
**Verdict:** `HARVEST_COMPLETE`
**Retrieval:** `INDEX_HIT_AI_CACHE`

> This file is a generated view. Do not edit independently — update the manifest.

## Packets harvested

| Packet | State | Verdict | Owner |
| --- | --- | --- | --- |
| `office-admin-pr29-reconcile-verdict-v1` | PARTIAL | MERGEABLE_PR_CI_BLOCKED | CapitalGlass-Office-Admin |
| `office-admin-github-ci-auto-trigger-v1` | OPEN | UNPROVEN_AUTO_TRIGGER | CapitalGlass-Office-Admin |
| `office-admin-windows-runner-queue-v1` | OPEN | RUNNER_NOT_ACQUIRED | CapitalGlass-Office-Admin |
| `office-admin-workflow-push-without-scope-v1` | DOCUMENTED | WM-001 | CapitalGlass-Office-Admin |
| `office-admin-squash-without-merge-parent-v1` | DOCUMENTED | WM-002 | CapitalGlass-Office-Admin |
| `office-admin-merge-attempt-twice-v1` | DOCUMENTED | AVOIDABLE | CapitalGlass-Office-Admin |
| `office-admin-mcp-config-union-after-main-merge-v1` | PROVEN | OPTIMAL_PATH_USED | CapitalGlass-Office-Admin |
| `office-admin-deploy-gate-ci-smoke-v1` | RECORDED | PASS | CapitalGlass-Office-Admin |
| `office-admin-push-trigger-count-command-v1` | RECORDED | DIAGNOSTIC | CapitalGlass-Office-Admin |
| `office-admin-pr29-mergeable-evidence-v1` | FROZEN | AUTHORITATIVE | CapitalGlass-Office-Admin |
| `office-admin-github-health-closeout-guards-v1` | CANDIDATE | POLICY_GATED | CapitalGlass-Office-Admin |

## Global doNotAdvance

- Claim CAPITALGLASS-OFFICE-ADMIN GITHUB FULLY HEALTHY without validate-code and validate-docs PASS on final HEAD
- Claim automatic push/pull_request CI triggers proven when head_sha workflow run count is zero
- Merge PR #29 when mission requires it remain open
- Treat local deploy:gate PASS as substitute for GitHub validate-code PASS when GO criteria require both
- Run index:publish or harvest:publish-hub-seed from Cursor

## Projection sync

Status: `not-run` (hub: `not-run`)

