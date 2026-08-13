# Project Index

Master index of all project files in `work-progress/projects/`.

**Last updated:** 2026-08-12 (`cg-federated-repo-index-v1` Wave A ledger: IMPLEMENTED_PUSHED / LIVE_RYZEN9_PROOF_PENDING)

Read `AGENT_START_HERE.md` and `work-progress/ACTIVE_WORK.md` before working on any project listed here.

---

## How to use this index

| Column | Meaning |
| --- | --- |
| Project ID | Canonical work-package or Cursor project identifier |
| File | Durable project file in this folder |
| Status | Current state from ledger and project file |
| Owner repo | Primary repo where implementation happens |
| Last commit | Most recent known commit (if any) |
| Next action | Highest-priority next step |

When you create or materially update a project file:

1. Update the project file.
2. Update this index row.
3. Add a timestamped entry to `work-progress/ACTIVE_WORK.md`.

Filename pattern: `YYYY-MM-DD_<project-id>.md` — see `work-progress/projects/README.md`.

---


## Harvest packet index (manifest-derived)

<!-- HARVEST-PACKET-INDEX:START -->

_**DERIVED HUMAN VIEW — NOT MACHINE AUTHORITY.**_
_Source: `work-progress/harvest-intelligence-index.json` + `harvest-packet-registry.json`. Do not edit manually — run `npm run harvest:render-index`._

| Packet ID | Entity | State | Verdict | Owner repo | Latest harvest | Next action |
| --- | --- | --- | --- | --- | --- | --- |
| `2026-08-04-chatgpt-full-autopsy-v1` | — | VALIDATION_PENDING | HOLD | CapitalGlass-Cross-Agent | `harvest-2026-08-04-chatgpt-full-autopsy-v1` | see chat-thread-closeout-autopsy-harvest-chatgpt-v1.md |
| `active-ledger-ci-path-and-hash-stability-v1` | `intel:2ac17d9049ee49…` | COMPLETE | PASS | CG-AppBuilder-MCP | `harvest-2026-08-03-cross-thread-platform-state-v1` | see 2026-08-03_active-ledger-ci-path-and-hash-stability-v1.md |
| `adjacent-repo-local-drift-v1` | — | LOCAL_ONLY | PASS | Cursor-ProposalGenerator | `harvest-2026-08-04-ultimate-sdlc-runner-dark-package-v1` | see adjacent-repo-local-drift-v1.md |
| `ai-cache-milestone-blocked-pending-estate-proof-v1` | — | ACTIVE | BLOCKED | CG-AppBuilder-MCP | `harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1` | see harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1.md |
| `ai-cached-sdlc-cursor-integration-go-v1` | — | WARN | PASS | CG-AppBuilder-MCP | `harvest-ai-cached-sdlc-protocol-cursor-integration-v1` | see ai-cached-sdlc-cursor-integration-go-v1.md |
| `app-builder-preflight-downstream-blockers-v1` | — | ACTIVE | BLOCKED | CG-AppBuilder-MCP | `harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1` | see harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1.md |
| `appbuilder-pr284-ci-merge-gate-v1` | — | HARVEST_COMPLETE | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-hot-cache-wave-a-estate-ship-v1` | see thread-event-inventory.json |
| `appbuilder-pr290-merge-evidence-v1` | — | COMPLETE | VERIFIED | CG-AppBuilder-MCP | `harvest-2026-08-07-direct-connect-three-controller-closeout-v1` | see harvest-2026-08-07-direct-connect-three-controller-closeout-v1.md |
| `appbuilder-profile-merge-required-v1` | — | HOLD | BLOCKED | CG-AppBuilder-MCP | `harvest-2026-08-12-smith-ranch-ce-revu-full-set-v1` | see 2026-08-12_smith-ranch-ce-revu-full-set-v1.md |
| `asg-closed-immutable-v1` | `intel:3f11a4feab66cc…` | CLOSED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-three-lane-suite-closeout-v1` | see ultimate-sdlc-runner-hardening-and-ai-cache-v1.md |
| `asg-converge-all-blocked-v1` | — | ACTIVE | EXPECTED_BLOCK | CG-AppBuilder-MCP | `harvest-2026-08-07-asg-ge-wave-closeout-v1` | see harvest-2026-08-07-asg-ge-wave-closeout-v1.md |
| `asg-ge-acceptance-commands-v1` | — | COMPLETE | PASS | CG-AppBuilder-MCP | `harvest-2026-08-07-asg-ge-wave-closeout-v1` | see harvest-2026-08-07-asg-ge-wave-closeout-v1.md |
| `asg-ge-formal-proof-outcome-v1` | — | COMPLETE | PROVEN_EFFECTIVE | CG-AppBuilder-MCP | `harvest-2026-08-07-asg-ge-wave-closeout-v1` | see harvest-2026-08-07-asg-ge-wave-closeout-v1.md |
| `asg-go-command-v1` | — | PROVEN | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-asg-go-shared-db-closeout-v1` | see asg-go-command-v1.md |
| `asg-go-recovery-commands-v1` | — | COMPLETE | DOCUMENTED | CG-AppBuilder-MCP | `harvest-2026-08-08-asg-thread-continuation-v1` | see harvest-2026-08-08-asg-thread-continuation-v1.md |
| `asg-hardening-authority-v1` | — | GO | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-asg-hardening-authority-v1` | see asg-hardening-authority-v1.md |
| `asg-operator-git-preflight-v1` | — | COMPLETE | DOCUMENTED | CG-AppBuilder-MCP | `harvest-2026-08-08-asg-thread-continuation-v1` | see harvest-2026-08-08-asg-thread-continuation-v1.md |
| `asg-receipt-377e6da2-v1` | — | COMPLETE | VERIFIED | CG-AppBuilder-MCP | `harvest-2026-08-08-asg-thread-continuation-v1` | see harvest-2026-08-08-asg-thread-continuation-v1.md |
| `asg-routine-run-outcome-v1` | — | COMPLETE | PROVEN_EFFECTIVE | CG-AppBuilder-MCP | `harvest-2026-08-08-asg-thread-continuation-v1` | see harvest-2026-08-08-asg-thread-continuation-v1.md |
| `asg-shared-db-gate-alignment-v1` | — | SHIPPED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-asg-go-shared-db-closeout-v1` | see asg-shared-db-gate-alignment-v1.md |
| `asg-warn-correct-for-dirty-tree-v1` | — | COMPLETE | EXPECTED_WARN | CG-AppBuilder-MCP | `harvest-2026-08-08-asg-thread-continuation-v1` | see harvest-2026-08-08-asg-thread-continuation-v1.md |
| `asg-wave-ge-closed-parent-open-v1` | — | COMPLETE | WAVE_CLOSED | CG-AppBuilder-MCP | `harvest-2026-08-07-asg-ge-wave-closeout-v1` | see harvest-2026-08-07-asg-ge-wave-closeout-v1.md |
| `asg-wave-scoped-closeout-v1` | — | COMPLETE | DOCUMENTED | CG-AppBuilder-MCP | `harvest-2026-08-07-asg-ge-wave-closeout-v1` | see harvest-2026-08-07-asg-ge-wave-closeout-v1.md |
| `auto-v32-env-decontamination-v1` | — | VERIFIED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-platform-ops-pg-staging-auto-v32-v1` | see CURRENT_HANDOFF.md |
| `beacon-hill-plan-intelligence-ready-v1` | — | COMPLETE | PLAN_INTELLIGENCE_READY | CapitalGlass-Documents | `harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1` | see harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1.md |
| `bible-evidence-identity-revalidation-v1` | — | COMPLETE | BY_DESIGN | CG-AppBuilder-MCP | `harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1` | see harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1.md |
| `blocker-z-mirror-wave-sdlc-source-v1` | — | OPEN | DEFERRED | Data-Extraction | `harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1` | see harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1.md |
| `bounded-command-closeout-v1` | — | RECORDED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-ultimate-sdlc-runner-dark-package-v1` | see bounded-command-closeout-v1.md |
| `bulk-hub-provenance-chain-pass-v1` | — | COMPLETE | VERIFIED | Data-Extraction | `harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1` | see harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1.md |
| `ce-issued-proposal-corpus-foundation-v1` | `intel:21902621d8b25d…` | FOUNDATION_COMPLETE | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-12-issued-proposal-corpus-chat-v1` | see 2026-08-11_ce-issued-proposal-corpus-v1.md |
| `chat-improvement-extract-chatgpt-v1` | — | ACTIVE | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-04-harvest-storage-chatgpt-lane-v1` | see 2026-08-04_chat-improvement-extract-chatgpt-v1.md |
| `chatgpt-harvest-git-gate-v2-v1` | — | COMPLETE | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-07-chatgpt-git-publication-restoration-v1` | see CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md |
| `chatgpt-harvest-protocol-promotion-drift-v1` | — | RESOLVED | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-07-chatgpt-git-publication-restoration-v1` | see CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md |
| `chatgpt-restoration-milestone-hold-v1` | — | OPEN | HOLD | CapitalGlass-Cross-Agent | `harvest-2026-08-07-chatgpt-git-publication-restoration-v1` | see harvest-2026-08-07-chatgpt-git-publication-restoration-v1.md |
| `chatgpt-ultimate-sdlc-thread-v1` | — | HARVEST_COMPLETE | HARVEST_COMPLETE | CapitalGlass-Cross-Agent | `harvest-2026-08-04-ultimate-sdlc-runner-dark-package-v1` | see harvest-2026-08-04-ultimate-sdlc-runner-dark-package-v1.md |
| `check-git-before-asg-v1` | — | COMPLETE | CLASSIFIED | CG-AppBuilder-MCP | `harvest-2026-08-08-asg-thread-continuation-v1` | see harvest-2026-08-08-asg-thread-continuation-v1.md |
| `cloudflare-mcp-health-layer-v1` | `intel:b0e08e02b32c8a…` | RESOLVED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-11-cloudflare-mcp-repair-v1` | see HARVEST_SUMMARY.md |
| `cloudflare-mcp-oauth-lock-v1` | `intel:c39b6c6f3d0635…` | RESOLVED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-11-cloudflare-mcp-repair-v1` | see HARVEST_SUMMARY.md |
| `cloudflare-mcp-operator-sequence-v1` | `intel:3d3fff2802d891…` | RESOLVED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-11-cloudflare-mcp-repair-v1` | see HARVEST_SUMMARY.md |
| `cloudflare-mcp-wrangler-auth-v1` | `intel:2417ae03ad729c…` | OPEN_OPERATOR | HOLD | CG-AppBuilder-MCP | `harvest-2026-08-11-cloudflare-mcp-repair-v1` | see HARVEST_SUMMARY.md |
| `cmd-dispatch-phase-a-v1` | — | PENDING | NOT_RUN | CG-AppBuilder-MCP | `harvest-2026-08-12-smith-ranch-ce-revu-full-set-v1` | see 2026-08-12_smith-ranch-ce-revu-full-set-v1.md |
| `cmd-test-smith-ranch-ce-batch-v1` | — | COMPLETE | PASS | CG-AppBuilder-MCP | `harvest-2026-08-12-smith-ranch-ce-revu-full-set-v1` | see 2026-08-12_smith-ranch-ce-revu-full-set-v1.md |
| `cmd-w17-capture` | — | PENDING | HOLD | CapitalGlass-Documents | `harvest-2026-08-04-document-center-adaptive-details-w17-v1` | see harvest-2026-08-04-document-center-adaptive-details-w17-v1.md |
| `command-estate-pull-loop` | — | EXECUTED | PASS | CapitalGlass-Office-Admin | `harvest-2026-08-04-wsl-estate-git-pull-v1` | see harvest-2026-08-04-wsl-estate-git-pull-v1.md |
| `complete-project-folder-synology-intelligence-publication-v1` | — | PUBLICATION_COMPLETE | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-04-three-way-improvement-slice6-thread-v1` | see 2026-08-03_complete-project-folder-synology-intelligence-publication-v1.md |
| `computer-estimator-estate-probe-failures-v1` | — | OPEN | FAIL | Computer Estimator | `harvest-2026-08-07-product-estate-operational-proof-v1` | see INDEX.md |
| `corpus-shift-product-heavy-v1` | — | RECORDED | OBSERVED | Data-Extraction | `harvest-2026-08-07-product-estate-operational-proof-v1` | see INDEX.md |
| `cross-agent-harvest-owner-boundary-v1` | — | MERGED_COMPLETE | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-04-three-way-improvement-slice6-thread-v1` | see 2026-08-03_cross-agent-harvest-owner-boundary-v1.md |
| `cross-agent-hub-publish-pass-v1` | — | COMPLETE | VERIFIED | CapitalGlass-Cross-Agent | `harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1` | see harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1.md |
| `cross-agent-index-auto-publisher-activation-v1` | — | RUNNER_OFFLINE_HOLD | HOLD | CapitalGlass-Cross-Agent | `harvest-2026-08-04-three-way-improvement-slice6-thread-v1` | see 2026-08-03_cross-agent-index-auto-publisher-activation-v1.md |
| `cross-agent-ledger-only-pi-model-v1` | — | COMPLETE | CLASSIFIED | CapitalGlass-Cross-Agent | `harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1` | see harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1.md |
| `cross-agent-pi-refresh-milestone-closed-v1` | — | COMPLETE | MILESTONE_CLOSED | Data-Extraction | `harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1` | see harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1.md |
| `cross-agent-pr10-conflict-resolution-v1` | — | DOCUMENTED | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-04-hot-cache-wave-a-estate-ship-v1` | see thread-event-inventory.json |
| `cross-agent-pr29-conflict-v1` | — | RESOLVED | CORRECTED | CapitalGlass-Cross-Agent | `harvest-2026-08-10-experience-rosewood-bid-composer-closeout-v1` | see experience-estimator-bid-composer-loop-v1.md |
| `cross-agent-retrieval-failover-v1.1` | `intel:f36536f188a854…` | ADOPTED | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-03-cross-thread-platform-state-v1` | see CURRENT_HANDOFF.md |
| `cursor-harvest-protocol-session-v1` | — | COMPLETE | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-04-cursor-harvest-protocol-session-v1` | see chat-thread-closeout-autopsy-harvest-v1.md |
| `cursor-healthkeeper-dedupe-milestone-closed-v1` | — | COMPLETE | MILESTONE_CLOSED | CG-AppBuilder-MCP | `harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1` | see harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1.md |
| `cursor-healthkeeper-dedupe-tests-v1` | — | COMPLETE | PASS | CG-AppBuilder-MCP | `harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1` | see harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1.md |
| `cursor-wsl-health-preflight-gate-v1` | — | COMPLETE | PASS | CG-AppBuilder-MCP | `harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1` | see harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1.md |
| `data-extraction-v1e-pi-current-v1` | — | COMPLETE | VERIFIED | Data-Extraction | `harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1` | see harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1.md |
| `de-handoff-degraded-wsl-l-unmounted-v1` | — | RESOLVED | BOOTSTRAP_SHIPPED | CG-AppBuilder-MCP | `harvest-2026-08-06-wesley-work-l-research-bootstrap-closeout-v1` | see 2026-08-02_z-drive-disconnect-recurrence-v1.md |
| `de-handoff-pipe-exit-code-trap-v1` | — | RECORDED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-06-wesley-work-l-research-bootstrap-closeout-v1` | see 2026-08-02_z-drive-disconnect-recurrence-v1.md |
| `de-main-lags-feature-pi-v1` | — | ACTIVE | EXPECTED_HOUSEKEEPING | Data-Extraction | `harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1` | see harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1.md |
| `de-v1e-live-publication-command-v1` | — | COMPLETE | PASS | CG-AppBuilder-MCP | `harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1` | see harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1.md |
| `decision-ff-only-estate-pull` | — | DECIDED | PASS | CapitalGlass-Office-Admin | `harvest-2026-08-04-wsl-estate-git-pull-v1` | see harvest-2026-08-04-wsl-estate-git-pull-v1.md |
| `detached-worktree-dirty-main-v1` | — | COMPLETE | DOCUMENTED | CG-AppBuilder-MCP | `harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1` | see harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1.md |
| `direct-connect-mesh-live-closeout-v1` | — | COMPLETE | PASS | CapitalGlass-Office-Admin | `harvest-2026-08-07-direct-connect-three-controller-closeout-v1` | see harvest-2026-08-07-direct-connect-three-controller-closeout-v1.md |
| `direct-connect-persistent-controller-v1` | — | INSTALLED_PERSISTENCE_UNPROVEN | HOLD | CapitalGlass-Office-Admin | `harvest-2026-08-04-three-way-improvement-slice6-thread-v1` | see 2026-08-03_direct-connect-persistent-controller-v1.md |
| `direct-connect-three-controller-milestone-operational-v1` | — | COMPLETE | OPERATIONAL_CLOSED | CapitalGlass-Office-Admin | `harvest-2026-08-07-direct-connect-three-controller-closeout-v1` | see harvest-2026-08-07-direct-connect-three-controller-closeout-v1.md |
| `document-hub-handoff-probe-failures-v1` | — | OPEN | FAIL | CapitalGlass-Documents | `harvest-2026-08-07-product-estate-operational-proof-v1` | see INDEX.md |
| `document-intake-z-drive-layout` | — | DOCUMENTED | PASS | CapitalGlass-Office-Admin | `harvest-2026-08-04-m2-plans-intake-closeout-v1` | see document-intake-z-drive-layout.md |
| `document-layer-synology-register-false-positive-v1` | — | FIXED | PASS | CapitalGlass-Documents | `harvest-2026-08-06-wesley-work-l-research-bootstrap-closeout-v1` | see 2026-08-02_z-drive-disconnect-recurrence-v1.md |
| `documents-ocr-contract-drift-v1` | — | RESOLVED_OBSERVED | PATCHED_LOCALLY | CapitalGlass-Documents | `harvest-2026-08-07-asg-ge-wave-closeout-v1` | see harvest-2026-08-07-asg-ge-wave-closeout-v1.md |
| `estate-bulk-pull-without-hook-reconcile-v1` | — | COMPLETE | PARTIAL_FAILURE | CapitalGlass-Cross-Agent | `harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1` | see harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1.md |
| `estate-consumer-proof-host-access-v1` | — | ACTIVE | OPERATOR_REQUIRED | CG-AppBuilder-MCP | `harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1` | see harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1.md |
| `evidence-pull-summary` | — | CAPTURED | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-04-wsl-estate-git-pull-v1` | see harvest-2026-08-04-wsl-estate-git-pull-v1.md |
| `find-manifest-l-smb-v1` | — | RECOMMENDED | ADVISORY | CG-AppBuilder-MCP | `harvest-2026-08-12-smith-ranch-ce-revu-full-set-v1` | see 2026-08-12_smith-ranch-ce-revu-full-set-v1.md |
| `frozen-upstream-milestone-closeout-v1` | — | COMPLETE | DOCUMENTED | CapitalGlass-Cross-Agent | `harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1` | see harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1.md |
| `gh-workflow-scope-push-block-v1` | — | RESOLVED | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-07-chatgpt-git-publication-restoration-v1` | see CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md |
| `git-bundle-ci-parity-v1` | — | COMPLETE | CLASSIFIED | CapitalGlass-Office-Admin | `harvest-2026-08-07-direct-connect-three-controller-closeout-v1` | see harvest-2026-08-07-direct-connect-three-controller-closeout-v1.md |
| `git-clean-before-formal-asg-v1` | — | COMPLETE | CLASSIFIED | CG-AppBuilder-MCP | `harvest-2026-08-07-asg-ge-wave-closeout-v1` | see harvest-2026-08-07-asg-ge-wave-closeout-v1.md |
| `gitleaks-mcp-tool-slug-allowlist-v1` | — | COMPLETE | SHIPPED | CapitalGlass-Office-Admin | `harvest-2026-08-07-direct-connect-three-controller-closeout-v1` | see harvest-2026-08-07-direct-connect-three-controller-closeout-v1.md |
| `gold-mine-corpus-sdlc-bias-v1` | — | RECORDED | OBSERVED | Data-Extraction | `harvest-2026-08-07-gold-mine-compounding-reference-v1` | see INDEX.md |
| `gold-mine-full-open-population-complete-v1` | — | COMPLETE | PASS | Data-Extraction | `harvest-2026-08-07-gold-mine-compounding-reference-v1` | see INDEX.md |
| `gold-mine-product-estate-proof-launched-v1` | — | IN_PROGRESS | PASS_WITH_WARN | Data-Extraction | `harvest-2026-08-07-gold-mine-compounding-reference-v1` | see INDEX.md |
| `gold-mine-receipt-field-authority-v1` | — | COMPLETE | SHIPPED | Data-Extraction | `harvest-2026-08-07-gold-mine-compounding-reference-v1` | see INDEX.md |
| `governance-preflight-linkage-v1` | `intel:c744444136849e…` | CLOSED | PASS | CG-Platform-Governance-MCP | `harvest-2026-08-04-three-lane-suite-closeout-v1` | see governance-material-preflight-linkage-v1.md |
| `governance-wsl-path-normalization-v1` | — | MERGED_COMPLETE | PASS | CG-Platform-Governance-MCP | `harvest-2026-08-04-three-way-improvement-slice6-thread-v1` | see 2026-08-03_governance-wsl-path-normalization-v1.md |
| `guided-scope-review-closeout-runbook-v1` | — | COMPLETE | DOCUMENTED | CapitalGlass-Cross-Agent | `harvest-2026-08-07-guided-scope-review-milestone-closeout-v1` | see CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md |
| `guided-scope-review-milestone-closed-v1` | — | COMPLETE | MILESTONE_CLOSED | CapitalGlass-BidComposer | `harvest-2026-08-07-guided-scope-review-milestone-closeout-v1` | see harvest-2026-08-07-guided-scope-review-milestone-closeout-v1.md |
| `harvest-2026-08-03-pg-estimator-trust-closure-v1` | — | HARVEST_COMPLETE | HARVEST_COMPLETE | CapitalGlass-Cross-Agent | `harvest-2026-08-03-pg-estimator-trust-closure-v1` | see 2026-08-03_harvest-pg-estimator-trust-closure-v1.md |
| `harvest-2026-08-04-asg-go-shared-db-closeout-v1` | — | HARVEST_COMPLETE | HARVEST_COMPLETE | CapitalGlass-Cross-Agent | `harvest-2026-08-04-asg-go-shared-db-closeout-v1` | see harvest-2026-08-04-asg-go-shared-db-closeout-v1.md |
| `harvest-2026-08-04-asg-hardening-authority-v1` | — | HARVEST_COMPLETE | HARVEST_COMPLETE | CapitalGlass-Cross-Agent | `harvest-2026-08-04-asg-hardening-authority-v1` | see asg-hardening-authority-v1.md |
| `harvest-2026-08-04-harvest-storage-chatgpt-lane-v1` | — | HARVEST_COMPLETE | HARVEST_COMPLETE | CapitalGlass-Cross-Agent | `harvest-2026-08-04-harvest-storage-chatgpt-lane-v1` | see 2026-08-04_harvest-storage-chatgpt-lane-v1.md |
| `harvest-2026-08-04-m2-plans-intake-closeout-v1` | — | HARVEST_COMPLETE | HARVEST_COMPLETE | CapitalGlass-Cross-Agent | `harvest-2026-08-04-m2-plans-intake-closeout-v1` | see harvest-2026-08-04-m2-plans-intake-closeout-v1.md |
| `harvest-2026-08-04-platform-ops-pg-staging-auto-v32-v1` | — | HARVEST_COMPLETE | HARVEST_COMPLETE | CapitalGlass-Cross-Agent | `harvest-2026-08-04-platform-ops-pg-staging-auto-v32-v1` | see harvest-manifest-v1.json |
| `harvest-2026-08-04-three-lane-suite-closeout-v1` | — | HARVEST_COMPLETE | HARVEST_COMPLETE | CapitalGlass-Cross-Agent | `harvest-2026-08-04-three-lane-suite-closeout-v1` | see harvest-2026-08-04-three-lane-suite-closeout-v1.md |
| `harvest-project-folder-synology-primary-chat-v1` | — | HARVEST_COMPLETE | HARVEST_COMPLETE | CapitalGlass-Cross-Agent | `harvest-project-folder-synology-primary-chat-v1` | see harvest-project-folder-synology-primary-chat-v1.md |
| `harvest-protocol-second-pass-v1` | — | COMPLETE | DUPLICATE_AVOIDED | CapitalGlass-Cross-Agent | `harvest-2026-08-08-asg-thread-continuation-v1` | see harvest-2026-08-08-asg-thread-continuation-v1.md |
| `harvest-protocol-v1-1-gold-mine-compounding-v1` | — | COMPLETE | DOCUMENTED | CapitalGlass-Cross-Agent | `harvest-2026-08-07-gold-mine-compounding-reference-v1` | see INDEX.md |
| `harvest-render-index-operational-gate-v1` | — | FIXED | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-04-operational-publish-friction-v1` | see publish-intelligence-full-lib.mjs |
| `harvest-storage-pointer-authority-v1` | — | POLICY_ACTIVE | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-04-harvest-storage-chatgpt-lane-v1` | see 2026-08-04_harvest-storage-pointer-authority-v1.md |
| `healthkeeper-dedupe-sha-d18bb643-v1` | — | COMPLETE | VERIFIED | CG-AppBuilder-MCP | `harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1` | see harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1.md |
| `healthkeeper-duplicated-preflight-checks-v1` | — | COMPLETE | REMEDIATED | CG-AppBuilder-MCP | `harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1` | see harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1.md |
| `healthkeeper-integration-sha-bf6c38c-v1` | — | COMPLETE | VERIFIED | CG-AppBuilder-MCP | `harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1` | see harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1.md |
| `healthkeeper-ownership-matrix-first-v1` | — | COMPLETE | DOCUMENTED | CG-AppBuilder-MCP | `harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1` | see harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1.md |
| `healthkeeper-substrate-only-ownership-v12-v1` | — | COMPLETE | DOCUMENTED | CG-AppBuilder-MCP | `harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1` | see harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1.md |
| `healthkeeper-v11-owned-downstream-checks-v1` | — | RESOLVED | CORRECTED | CG-AppBuilder-MCP | `harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1` | see harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1.md |
| `healthkeeper-v12-dedupe-outcome-v1` | — | COMPLETE | PROVEN_EFFECTIVE | CG-AppBuilder-MCP | `harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1` | see harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1.md |
| `hot-cache-content-hash-host-serialization-v1` | — | DOCUMENTED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-hot-cache-wave-a-estate-ship-v1` | see IH-HOT-CACHE-CONTENT-HASH-HOST-001.json |
| `hot-cache-deferred-wave-cd-v1` | — | DOCUMENTED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-hot-cache-wave-a-estate-ship-v1` | see thread-event-inventory.json |
| `hot-cache-evidence-chain-v1` | — | HARVEST_COMPLETE | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-hot-cache-wave-a-estate-ship-v1` | see code-touch-summary.json |
| `hot-cache-protocol-upgrade-v1` | — | HARVEST_COMPLETE | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-04-hot-cache-wave-a-estate-ship-v1` | see chat-thread-closeout-autopsy-harvest-v1.md |
| `hot-cache-wave-a-estate-shipped-v1` | — | HARVEST_COMPLETE | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-hot-cache-wave-a-estate-ship-v1` | see thread-event-inventory.json |
| `hub-document-center-staged-intake-auth-v1` | — | CLOSED | PASS | cg-apps-hub | `harvest-2026-08-04-platform-ops-pg-staging-auto-v32-v1` | see CURRENT_HANDOFF.md |
| `hub-publication-not-run-v1` | — | ACTIVE | EXPECTED_HOLD | CapitalGlass-Cross-Agent | `harvest-2026-08-07-direct-connect-three-controller-closeout-v1` | see harvest-2026-08-07-direct-connect-three-controller-closeout-v1.md |
| `index-freshness-receipt-treadmill-v1` | — | DOCUMENTED | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-04-operational-publish-friction-v1` | see freshness-gate.mjs |
| `ingest-git-mutation-operational-v1` | — | DOCUMENTED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-operational-publish-friction-v1` | see thread-event-inventory.json |
| `init-temp-git-fixture-live-fast-gate-v1` | — | COMPLETE | SHIPPED | CG-AppBuilder-MCP | `harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1` | see harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1.md |
| `intelligence-hub-capability-expansion-v1` | — | WAVE1_SHIPPED | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-04-three-way-improvement-slice6-thread-v1` | see 2026-08-03_intelligence-hub-capability-expansion-v1.md |
| `intelligence-hub-hot-cache-scout-v1` | — | SHIPPED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-platform-ops-pg-staging-auto-v32-v1` | see CURRENT_HANDOFF.md |
| `intelligence-hub-index-ai-cache-freshness-v1` | — | FOUNDATION_PASS | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-three-way-improvement-slice6-thread-v1` | see 2026-08-03_intelligence-hub-index-ai-cache-freshness-v1.md |
| `intelligence-hub-thread-autopsy-publication-v1` | — | PUBLICATION_COMPLETE | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-04-three-way-improvement-slice6-thread-v1` | see 2026-08-04_intelligence-hub-thread-autopsy-publication-v1.md |
| `invalid-wesleydesk-proof-on-wesleywork-v1` | — | RESOLVED | INVALIDATED | CG-AppBuilder-MCP | `harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1` | see harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1.md |
| `issued-proposal-corpus-evidence-v1` | `intel:9fd18a6629f909…` | RECORDED | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-12-issued-proposal-corpus-chat-v1` | see 2026-08-11_ce-issued-proposal-corpus-v1.md |
| `issued-proposal-corpus-harvest-commands-v1` | `intel:44e2fe5c06a24c…` | DOCUMENTED | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-12-issued-proposal-corpus-chat-v1` | see 2026-08-11_ce-issued-proposal-corpus-v1.md |
| `issued-proposal-corpus-rediscovery-v1` | `intel:992a89809e6b4f…` | MITIGATED | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-12-issued-proposal-corpus-chat-v1` | see 2026-08-11_ce-issued-proposal-corpus-v1.md |
| `issued-proposal-harvest-not-learning-v1` | `intel:bfe64452c11102…` | ACTIVE | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-12-issued-proposal-corpus-chat-v1` | see 2026-08-12_issued-proposal-structured-estimator-learning-v1.md |
| `issued-proposal-l-hub-publication-hold-v1` | `intel:a206e7d46d7cf2…` | HOLD | HOLD | CapitalGlass-Cross-Agent | `harvest-2026-08-12-issued-proposal-corpus-chat-v1` | see capital-glass-proposal-learning-compounding-spine-v1.md |
| `issued-proposal-poppler-scout-path-v1` | `intel:8314bd9325ef66…` | INSTALLED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-12-issued-proposal-corpus-chat-v1` | see 2026-08-12_issued-proposal-structured-estimator-learning-v1.md |
| `issued-proposal-strings-pdf-mistake-v1` | `intel:f4ff1e05969079…` | RESOLVED | PASS | capital-glass-estimating-parser | `harvest-2026-08-12-issued-proposal-corpus-chat-v1` | see 2026-08-11_ce-issued-proposal-corpus-v1.md |
| `issued-proposal-structured-learning-active-v1` | `intel:7d398ceeda1e36…` | IN_PROGRESS | HOLD | capital-glass-estimating-parser | `harvest-2026-08-12-issued-proposal-corpus-chat-v1` | see 2026-08-12_issued-proposal-structured-estimator-learning-v1.md |
| `issued-proposal-z-boundary-protocol-v1` | `intel:6d6e370eacdab4…` | DOCUMENTED | PASS | Computer Estimator | `harvest-2026-08-12-issued-proposal-corpus-chat-v1` | see capital-glass-proposal-learning-compounding-spine-v1.md |
| `l-drop-to-review-queue-proof-v1` | — | MILESTONE_PASS | PASS | CapitalGlass-Documents | `harvest-2026-08-04-m2-plans-intake-closeout-v1` | see l-drop-to-review-queue-proof-v1.md |
| `l-smb-readdirsync-hang-v1` | — | OPEN | MITIGATION_CANDIDATE | CG-AppBuilder-MCP | `harvest-2026-08-12-smith-ranch-ce-revu-full-set-v1` | see 2026-08-12_smith-ranch-ce-revu-full-set-v1.md |
| `lane-c-export-command-v1` | — | COMPLETE | SHIPPED | CapitalGlass-Cross-Agent | `harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1` | see harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1.md |
| `lane-c-ownership-routing-v1` | — | RECORDED | OWNERSHIP_RECORDED | CapitalGlass-Cross-Agent | `harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1` | see harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1.md |
| `lane-c-protocol-only-scope-v1` | — | RECORDED | POLICY_RECORDED | CapitalGlass-Cross-Agent | `harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1` | see harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1.md |
| `lane-c-publication-truth-chain-v1` | — | COMPLETE | DOCUMENTED | CapitalGlass-Cross-Agent | `harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1` | see harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1.md |
| `lane-c-repeated-ownership-friction-v1` | — | DOCUMENTED | DUPLICATE_AWARE | CapitalGlass-Cross-Agent | `harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1` | see harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1.md |
| `lane-c-spoke-matrix-lesson-v1` | — | RECORDED | LESSON_RECORDED | CapitalGlass-Cross-Agent | `harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1` | see harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1.md |
| `lane-c-strict-classifier-shipped-v1` | — | COMPLETE | ALREADY_IMPLEMENTED | Data-Extraction | `harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1` | see harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1.md |
| `lane-c-verify-command-v1` | — | COMPLETE | SHIPPED | Data-Extraction | `harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1` | see harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1.md |
| `lane-c-z-mirror-authority-drift-v1` | — | OPEN | WARN | CapitalGlass-Cross-Agent | `harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1` | see harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1.md |
| `m2-closeout-receipt-governance-reconciliation` | — | RECONCILED | PASS | CapitalGlass-Documents | `harvest-2026-08-04-m2-plans-intake-closeout-v1` | see m2-closeout-receipt-governance-reconciliation.md |
| `m2-nas-register-received-at-fix` | — | MERGED_PRODUCTION | PASS | CapitalGlass-Documents | `harvest-2026-08-04-m2-plans-intake-closeout-v1` | see m2-nas-register-received-at-fix.md |
| `m4pds-closeout-receipt-chain-v1` | — | RECORDED | EVIDENCE_BOUND | CapitalGlass-Documents | `harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1` | see harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1.md |
| `m4pds-data-plane-complete-wesleydesk-gate-v1` | — | COMPLETE | BLOCKED_WESLEYDESK_WORKER_DEPLOY | CapitalGlass-Documents | `harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1` | see harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1.md |
| `mcp-build-stamp-windows-pm2-topology-v1` | — | DOCUMENTED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-06-wesley-work-l-research-bootstrap-closeout-v1` | see 2026-08-02_z-drive-disconnect-recurrence-v1.md |
| `mcp-doctor-gate-blocked-v1` | — | OPEN | BLOCKED | CG-AppBuilder-MCP | `harvest-2026-08-07-product-estate-operational-proof-v1` | see INDEX.md |
| `milestone-lock-reconfirmation-v1` | — | COMPLETE | DUPLICATE_COORDINATION | CapitalGlass-Cross-Agent | `harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1` | see harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1.md |
| `mistake-none-ad-hoc-loop-acceptable` | — | RECORDED | PASS | CapitalGlass-Office-Admin | `harvest-2026-08-04-wsl-estate-git-pull-v1` | see harvest-2026-08-04-wsl-estate-git-pull-v1.md |
| `mistake-premature-pass-git-durability-v1` | — | FIXED | PASS | Data-Extraction | `harvest-2026-08-07-gold-mine-compounding-reference-v1` | see INDEX.md |
| `mount-authority-ext4-repos-root-v1` | — | FIXED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-wesleywork-l-windows-closeout-v1` | see 2026-08-02_z-drive-disconnect-recurrence-v1.md |
| `no-fabricated-visual-pass-guard-v1` | — | COMPLETE | DOCUMENTED | CapitalGlass-BidComposer | `harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1` | see harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1.md |
| `north-star-observe-cli-repair-v1` | `intel:ca5bd45039204d…` | CLOSED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-three-lane-suite-closeout-v1` | see north-star-observe-cli-repair-v1.md |
| `office-admin-ci-manifest-drift-v1` | — | RESOLVED | CORRECTED | CapitalGlass-Office-Admin | `harvest-2026-08-07-direct-connect-three-controller-closeout-v1` | see harvest-2026-08-07-direct-connect-three-controller-closeout-v1.md |
| `office-admin-deploy-gate-windows-v1` | — | COMPLETE | PASS | CapitalGlass-Office-Admin | `harvest-2026-08-07-direct-connect-three-controller-closeout-v1` | see harvest-2026-08-07-direct-connect-three-controller-closeout-v1.md |
| `office-admin-pr57-merge-evidence-v1` | — | COMPLETE | VERIFIED | CapitalGlass-Office-Admin | `harvest-2026-08-07-direct-connect-three-controller-closeout-v1` | see harvest-2026-08-07-direct-connect-three-controller-closeout-v1.md |
| `office-admin-ryzen9desk-managed-executor-bootstrap-v1` | `intel:b493da1e581484…` | INDEXED | CODE_READY_FOR_RUNNER_BOOTSTRAP | CapitalGlass-Office-Admin | `harvest-2026-08-03-cross-thread-platform-state-v1` | see 2026-08-03_office-admin-ryzen9desk-managed-executor-bootstrap-v1.md |
| `operational-publish-friction-v1` | — | HARVEST_COMPLETE | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-04-operational-publish-friction-v1` | see HARVEST_SUMMARY.md |
| `operator-allowlist-wp-hardcode-v1` | — | RESOLVED | FIXED | CG-AppBuilder-MCP | `harvest-2026-08-12-smith-ranch-ce-revu-full-set-v1` | see 2026-08-12_smith-ranch-ce-revu-full-set-v1.md |
| `operator-pilot-human-validation-milestone-v1` | — | COMPLETE | LOCKED | CapitalGlass-BidComposer | `harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1` | see harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1.md |
| `operator-signoff-receipt-scaffold-v1` | — | COMPLETE | SCAFFOLD_READY | CapitalGlass-BidComposer | `harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1` | see harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1.md |
| `operator-signoff-validate-command-v1` | — | COMPLETE | PASS | CapitalGlass-BidComposer | `harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1` | see harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1.md |
| `operator-visual-evidence-blocked-v1` | — | ACTIVE | BLOCK_OPERATOR_AUTHENTICATION | CapitalGlass-BidComposer | `harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1` | see harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1.md |
| `parser-from-ocr-default-v1` | — | ADOPTED | PROVEN_SHORTCUT | CapitalGlass-Documents | `harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1` | see harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1.md |
| `pg-estimator-trust-closure-v1` | — | ESTIMATOR_TRUST_BLOCKED | FAIL | Cursor-ProposalGenerator-1 | `harvest-2026-08-03-pg-estimator-trust-closure-v1` | see 2026-08-03_pg-estimator-trust-closure-v1.md |
| `pg-pricing-editable-workspace-persist-v1` | — | PRODUCT_FIX_REQUIRED | BLOCKED | Cursor-ProposalGenerator-1 | `harvest-2026-08-03-pg-estimator-trust-closure-v1` | see 2026-08-03_pg-pricing-editable-workspace-persist-v1.md |
| `pkt-blocker-001` | — | BLOCKED | BLOCKED | CapitalGlass-Documents | `harvest-2026-08-04-document-center-adaptive-details-w17-v1` | see harvest-2026-08-04-document-center-adaptive-details-w17-v1.md |
| `pkt-decision-001` | — | COMPLETE | PASS | CapitalGlass-Documents | `harvest-2026-08-04-document-center-adaptive-details-w17-v1` | see harvest-2026-08-04-document-center-adaptive-details-w17-v1.md |
| `pkt-evidence-001` | — | COMPLETE | PASS | CapitalGlass-Documents | `harvest-2026-08-04-document-center-adaptive-details-w17-v1` | see harvest-2026-08-04-document-center-adaptive-details-w17-v1.md |
| `pkt-faster-001` | — | COMPLETE | PASS | CapitalGlass-Documents | `harvest-2026-08-04-document-center-adaptive-details-w17-v1` | see harvest-2026-08-04-document-center-adaptive-details-w17-v1.md |
| `pkt-mistake-001` | — | COMPLETE | PASS | CapitalGlass-Documents | `harvest-2026-08-04-document-center-adaptive-details-w17-v1` | see harvest-2026-08-04-document-center-adaptive-details-w17-v1.md |
| `pkt-proto-001` | — | COMPLETE | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-04-document-center-adaptive-details-w17-v1` | see harvest-2026-08-04-document-center-adaptive-details-w17-v1.md |
| `pkt-repeated-001` | — | COMPLETE | PASS | CapitalGlass-Documents | `harvest-2026-08-04-document-center-adaptive-details-w17-v1` | see harvest-2026-08-04-document-center-adaptive-details-w17-v1.md |
| `plan-processing-proof-commands-v1` | — | RECORDED | COMMAND_INDEXED | CapitalGlass-Documents | `harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1` | see harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1.md |
| `platform-health-read-model-slice-7-v1` | — | DEFERRED | HOLD | CapitalGlass-Cross-Agent | `harvest-2026-08-04-three-way-improvement-slice6-thread-v1` | see 2026-08-03_platform-health-read-model-slice-7-v1.md |
| `po-receipt-ledger-api-smoke-v1` | — | PASS | PASS | capital-glass-po-app | `harvest-2026-08-12-po-wave2-receipt-ledger-wp21-v1` | see po-wave2-receipt-ledger-v1.md |
| `po-wave2-receipt-ledger-impl-v1` | — | CODE_COMPLETE | PASS | capital-glass-po-app | `harvest-2026-08-12-po-wave2-receipt-ledger-wp21-v1` | see po-wave2-receipt-ledger-v1.md |
| `po-wave2-ryzen-git-handoff-v1` | — | PASS | PASS | CG-AppBuilder-MCP | `harvest-2026-08-12-po-wave2-receipt-ledger-wp21-v1` | see po-wave2-receipt-ledger-v1.md |
| `po-wave2-wp21-browser-gate-v1` | — | OPEN | HOLD | capital-glass-po-app | `harvest-2026-08-12-po-wave2-receipt-ledger-wp21-v1` | see po-wave2-receipt-ledger-v1.md |
| `post-merge-live-reproof-v1` | — | COMPLETE | REQUIRED_NOT_DUPLICATE | CapitalGlass-Office-Admin | `harvest-2026-08-07-direct-connect-three-controller-closeout-v1` | see harvest-2026-08-07-direct-connect-three-controller-closeout-v1.md |
| `preflight-duplicate-de-handoff-step-v1` | — | FIXED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-06-wesley-work-l-research-bootstrap-closeout-v1` | see 2026-08-02_z-drive-disconnect-recurrence-v1.md |
| `preflight-stale-cross-agent-sha-v1` | — | RESOLVED | CORRECTED | CapitalGlass-Cross-Agent | `harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1` | see harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1.md |
| `premature-parent-go-claim-v1` | — | RESOLVED | CORRECTED | CG-AppBuilder-MCP | `harvest-2026-08-07-asg-ge-wave-closeout-v1` | see harvest-2026-08-07-asg-ge-wave-closeout-v1.md |
| `processing-architecture-freeze-v1` | — | ACTIVE | SCOPE_FROZEN | CapitalGlass-Documents | `harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1` | see harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1.md |
| `product-estate-operational-proof-measurement-v1` | — | COMPLETE | PASS_WITH_WARN | Data-Extraction | `harvest-2026-08-07-product-estate-operational-proof-v1` | see INDEX.md |
| `product-estate-v11-evidence-native-v1` | — | COMPLETE | SHIPPED | Data-Extraction | `harvest-2026-08-07-product-estate-operational-proof-v1` | see INDEX.md |
| `product-routing-locks-v1` | — | COMPLETE | VERIFIED | Data-Extraction | `harvest-2026-08-10-experience-rosewood-bid-composer-closeout-v1` | see experience-estimator-bid-composer-loop-v1.md |
| `project-folder-synology-primary-v1` | — | SUPERSEDED_BY_PRODUCTION_PASS | PROGRAM_FOUNDATION_COMPLETE | CapitalGlass-Documents | `harvest-project-folder-synology-primary-chat-v1` | see project-folder-synology-primary-v1.md |
| `project-folder-synology-primary-v1-dev-environment` | `intel:adb7eaf3351967…` | HOLD | CONTRACT_PASS_HOSTED_DEV_HOLD | CapitalGlass-Documents | `harvest-2026-08-03-cross-thread-platform-state-v1` | see project-folder-synology-primary-v1-dev-hosted-environment.md |
| `project-folder-synology-primary-v1-dev-hosted-environment` | — | DEV_ENVIRONMENT_ACCEPTED | PASS | CapitalGlass-Documents | `harvest-project-folder-synology-primary-chat-v1` | see project-folder-synology-primary-v1-dev-hosted-environment.md |
| `project-folder-synology-primary-v1-dev-reproducibility-hardening` | — | PROMOTION_CANDIDATE_READY | PASS | CapitalGlass-Documents | `harvest-project-folder-synology-primary-chat-v1` | see project-folder-synology-primary-v1-dev-reproducibility-hardening.md |
| `project-folder-synology-primary-v1-production-promotion` | — | STABILIZATION_OBSERVE_ONLY | PRODUCTION_PROMOTION_PASS | CapitalGlass-Documents | `harvest-project-folder-synology-primary-chat-v1` | see project-folder-synology-primary-v1-production-promotion.md |
| `promptops-index-ci-churn-v1` | — | ACTIVE | DUPLICATE_RISK | CG-AppBuilder-MCP | `harvest-2026-08-07-asg-ge-wave-closeout-v1` | see harvest-2026-08-07-asg-ge-wave-closeout-v1.md |
| `proposal-generator-staging-e2e-closure-v1` | — | STAGING_E2E_CLOSED | PASS | Cursor-ProposalGenerator-1 | `harvest-2026-08-04-platform-ops-pg-staging-auto-v32-v1` | see thread-event-inventory.json |
| `proposal-learning-corpus-extract-v1` | — | COMPLETE | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-12-proposal-learning-corpus-extract-v1` | see capital-glass-proposal-learning-compounding-spine-v1.md |
| `protocol-upgrade-estate-pull-seed` | — | CANDIDATE | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-04-wsl-estate-git-pull-v1` | see harvest-2026-08-04-wsl-estate-git-pull-v1.md |
| `real-human-disposition-ops-gate-v1` | — | ACTIVE | EXPECTED_BLOCK | CapitalGlass-BidComposer | `harvest-2026-08-10-experience-rosewood-bid-composer-closeout-v1` | see experience-estimator-bid-composer-loop-v1.md |
| `receipt-lineage-warn-to-go-v1` | — | RECORDED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-ultimate-sdlc-runner-dark-package-v1` | see receipt-lineage-warn-to-go-v1.md |
| `remote-wesleydesk-worker-proof-v1` | — | RESOLVED | RECORDED_WRONG_MOVE | CapitalGlass-Documents | `harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1` | see harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1.md |
| `revu-phase-b-policy-gate-v1` | — | HOLD | QUEUED_POLICY_GATE | CapitalGlassRevu | `harvest-2026-08-12-smith-ranch-ce-revu-full-set-v1` | see 2026-08-12_smith-ranch-ce-revu-full-set-v1.md |
| `roi-convergence-baseline-verified-v1` | — | COMPLETE | VERIFIED | CapitalGlass-BidComposer | `harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1` | see harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1.md |
| `rosewood-bid-composer-loop-durable-complete-v1` | — | COMPLETE | DURABLE_COMPLETE | CapitalGlass-BidComposer | `harvest-2026-08-10-experience-rosewood-bid-composer-closeout-v1` | see experience-estimator-bid-composer-loop-v1.md |
| `rosewood-freeze-beacon-hill-next-v1` | — | COMPLETE | PASS | CapitalGlass-Cross-Agent | `harvest-2026-08-10-experience-rosewood-bid-composer-closeout-v1` | see experience-beacon-hill-proposal-generator-loop-v1.md |
| `rosewood-loop-proof-commands-v1` | — | COMPLETE | PASS | CapitalGlass-BidComposer | `harvest-2026-08-10-experience-rosewood-bid-composer-closeout-v1` | see experience-estimator-bid-composer-loop-v1.md |
| `rosewood-plan-intelligence-ready-v1` | — | COMPLETE | PLAN_INTELLIGENCE_READY | CapitalGlass-Documents | `harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1` | see harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1.md |
| `rosewood-scope-seed-idempotency-v1` | — | COMPLETE | PASS | CapitalGlass-BidComposer | `harvest-2026-08-07-guided-scope-review-milestone-closeout-v1` | see harvest-2026-08-07-guided-scope-review-milestone-closeout-v1.md |
| `rosewood-smoke-bid-duplicate-v1` | — | COMPLETE | DUPLICATE_AVOIDED | CapitalGlass-BidComposer | `harvest-2026-08-07-guided-scope-review-milestone-closeout-v1` | see harvest-2026-08-07-guided-scope-review-milestone-closeout-v1.md |
| `run-estate-consumer-proof-v3-v1` | — | COMPLETE | READY | CG-AppBuilder-MCP | `harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1` | see harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1.md |
| `ryzen9desk-managed-executor-v1` | `intel:4a8c45cc3e5eaa…` | RUNNER_BOOTSTRAP_CHECKPOINT_STARTED | CODE_READY_FOR_RUNNER_BOOTSTRAP | CG-AppBuilder-MCP | `harvest-2026-08-03-cross-thread-platform-state-v1` | see 2026-08-03_ryzen9desk-managed-executor-v1.md |
| `scope-review-issue-gate-active-v1` | — | ACTIVE | EXPECTED_BLOCK | CapitalGlass-BidComposer | `harvest-2026-08-07-guided-scope-review-milestone-closeout-v1` | see harvest-2026-08-07-guided-scope-review-milestone-closeout-v1.md |
| `scope-review-production-deploy-evidence-v1` | — | COMPLETE | VERIFIED | CapitalGlass-BidComposer | `harvest-2026-08-07-guided-scope-review-milestone-closeout-v1` | see harvest-2026-08-07-guided-scope-review-milestone-closeout-v1.md |
| `scout-spine-import-gap-v1` | — | COMPLETE | DOCUMENTED | CapitalGlass-BidComposer | `harvest-2026-08-10-experience-rosewood-bid-composer-closeout-v1` | see experience-estimator-bid-composer-loop-v1.md |
| `scraper-data-extraction-improvements-v1` | — | PARTIAL | POINTER_ONLY | CapitalGlass-Cross-Agent | `harvest-2026-08-04-scraper-data-extraction-improvements-v1` | see 2026-08-05_scraper-data-extraction-improvements-v1.md |
| `sdlc-dirty-tree-closeout-v1` | — | RESOLVED | CORRECTED | CapitalGlass-BidComposer | `harvest-2026-08-07-guided-scope-review-milestone-closeout-v1` | see harvest-2026-08-07-guided-scope-review-milestone-closeout-v1.md |
| `second-host-ssh-wesleydesk-gate-v1` | — | HARVEST_COMPLETE | PASS | CapitalGlass-Office-Admin | `harvest-2026-08-04-hot-cache-wave-a-estate-ship-v1` | see IH-HOT-CACHE-SECOND-HOST-SSH-001.json |
| `separate-human-validation-milestone-v1` | — | COMPLETE | CLASSIFIED | CapitalGlass-BidComposer | `harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1` | see harvest-2026-08-07-estimating-spine-operator-pilot-signoff-v1.md |
| `shared-db-investigate-first-v1` | — | RECONCILIATION_COMPLETE | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-ultimate-sdlc-runner-dark-package-v1` | see shared-db-investigate-first-v1.md |
| `shared-db-reconciliation-v1` | — | RECONCILIATION_COMPLETE | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-asg-go-shared-db-closeout-v1` | see shared-db-reconciliation-v1.md |
| `simulated-vs-real-human-disposition-v1` | — | COMPLETE | DOCUMENTED | CapitalGlass-Cross-Agent | `harvest-2026-08-10-experience-rosewood-bid-composer-closeout-v1` | see experience-estimator-bid-composer-loop-v1.md |
| `smith-ranch-235-manifest-digest-v1` | — | COMPLETE | ANCHORED | CG-AppBuilder-MCP | `harvest-2026-08-12-smith-ranch-ce-revu-full-set-v1` | see 2026-08-12_smith-ranch-ce-revu-full-set-v1.md |
| `smith-ranch-find-manifest-gate-v1` | — | CANDIDATE | POLICY_GATED | CG-AppBuilder-MCP | `harvest-2026-08-12-smith-ranch-ce-revu-full-set-v1` | see 2026-08-12_smith-ranch-ce-revu-full-set-v1.md |
| `smith-ranch-fixed-corpus-no-revu-v1` | — | COMPLETE | ENFORCED | CG-AppBuilder-MCP | `harvest-2026-08-12-smith-ranch-ce-revu-full-set-v1` | see 2026-08-12_smith-ranch-ce-revu-full-set-v1.md |
| `smith-ranch-phase-a-profile-implemented-v1` | — | CODE_COMPLETE | PHASE_A_READY_FOR_REMOTE_DISPATCH | CG-AppBuilder-MCP | `harvest-2026-08-12-smith-ranch-ce-revu-full-set-v1` | see 2026-08-12_smith-ranch-ce-revu-full-set-v1.md |
| `sso-ui-proof-admin-lane-v1` | — | COMPLETE | CLASSIFIED | CapitalGlass-BidComposer | `harvest-2026-08-07-guided-scope-review-milestone-closeout-v1` | see harvest-2026-08-07-guided-scope-review-milestone-closeout-v1.md |
| `synology-primary-foundation-prior-harvest-v1` | — | INDEXED_NOT_DUPLICATE | BOUNDARY_RECORDED | CapitalGlass-Cross-Agent | `harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1` | see harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1.md |
| `three-way-agent-improvement-intelligence-v1` | — | OPERATIONAL_CLOSEOUT_COMPLETE | THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL | CG-AppBuilder-MCP | `harvest-2026-08-04-three-way-improvement-slice6-thread-v1` | see 2026-08-03_three-way-agent-improvement-intelligence-v1.md |
| `uh-async-test-miss-v1` | — | RESOLVED | FIXED | CG-AppBuilder-MCP | `harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1` | see harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1.md |
| `uh-clean-tree-before-execute-v1` | — | COMPLETE | DOCUMENTED | CG-AppBuilder-MCP | `harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1` | see harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1.md |
| `uh-durability-receipt-v1` | — | COMPLETE | VERIFIED | CG-AppBuilder-MCP | `harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1` | see harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1.md |
| `uh-extend-sdlc-stack-not-parallel-hub-v1` | — | COMPLETE | ADOPTED | CG-AppBuilder-MCP | `harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1` | see harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1.md |
| `uh-milestone-outcome-v1` | — | COMPLETE | PROVEN_EFFECTIVE | CG-AppBuilder-MCP | `harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1` | see harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1.md |
| `uh-proof-wave-retry-dirty-tree-v1` | — | COMPLETE | DOCUMENTED | CG-AppBuilder-MCP | `harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1` | see harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1.md |
| `uh-ready-not-terminal-v1` | — | COMPLETE | SHIPPED | CG-AppBuilder-MCP | `harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1` | see harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1.md |
| `uh-sdlc-cursor-execute-v1` | — | COMPLETE | PROVEN | CG-AppBuilder-MCP | `harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1` | see harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1.md |
| `uh-z-drvfs-publish-eperm-v1` | — | ACTIVE | WORKAROUND_DOCUMENTED | CG-AppBuilder-MCP | `harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1` | see harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1.md |
| `ultimate-sdlc-dark-package-go-v1` | — | GO | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-ultimate-sdlc-runner-dark-package-v1` | see ultimate-sdlc-dark-package-go-v1.md |
| `ultimate-sdlc-runner-go-v1` | — | GO | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-asg-go-shared-db-closeout-v1` | see ultimate-sdlc-runner-go-v1.md |
| `wave-d-gates-before-publication-v1` | — | COMPLETE | ENFORCED | CapitalGlass-Office-Admin | `harvest-2026-08-07-direct-connect-three-controller-closeout-v1` | see harvest-2026-08-07-direct-connect-three-controller-closeout-v1.md |
| `wave-d-implementation-outcome-v1` | — | PARTIAL | IMPLEMENTATION_COMPLETE_PROOF_PARTIAL | CG-AppBuilder-MCP | `harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1` | see harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1.md |
| `wave-ge-closeout-receipt-v1` | — | COMPLETE | VERIFIED | CG-AppBuilder-MCP | `harvest-2026-08-07-asg-ge-wave-closeout-v1` | see harvest-2026-08-07-asg-ge-wave-closeout-v1.md |
| `wesley-work-bootstrap-commands-v1` | — | RECORDED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-06-wesley-work-l-research-bootstrap-closeout-v1` | see 2026-08-02_z-drive-disconnect-recurrence-v1.md |
| `wesley-work-bootstrap-evidence-v1` | — | RECORDED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-06-wesley-work-l-research-bootstrap-closeout-v1` | see 2026-08-02_z-drive-disconnect-recurrence-v1.md |
| `wesley-work-l-research-bootstrap-protocol-v1` | — | SHIPPED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-06-wesley-work-l-research-bootstrap-closeout-v1` | see 2026-08-02_z-drive-disconnect-recurrence-v1.md |
| `wesley-work-z-hydration-proof-v1` | — | COMPLETE | VERIFIED | CG-AppBuilder-MCP | `harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1` | see harvest-2026-08-07-ai-cache-preflight-evidence-reuse-closeout-v1.md |
| `wesleydesk-worker-deploy-blocked-v1` | — | ACTIVE | BLOCKED_WESLEYDESK_WORKER_DEPLOY | CapitalGlass-Documents | `harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1` | see wesleydesk-plan-processing-worker-deploy-closeout-v1.md |
| `wesleywork-dirty-worktree-v1` | — | ACTIVE | EXPECTED_BLOCK | CG-AppBuilder-MCP | `harvest-2026-08-08-asg-thread-continuation-v1` | see harvest-2026-08-08-asg-thread-continuation-v1.md |
| `wesleywork-flash-attribution-machine-poll-v1` | — | PROVEN | OPTIMAL_PATH_USED_PHASE2 | CapitalGlass-Office-Admin | `harvest-2026-08-06-wesleywork-terminal-flash-closeout-v1` | see 2026-08-06_wesleywork-terminal-flash-closeout-v1.md |
| `wesleywork-l-tailscale-remap-command-v1` | — | RECORDED | PASS | CapitalGlass-Office-Admin | `harvest-2026-08-04-wesleywork-l-windows-closeout-v1` | see 2026-08-02_z-drive-disconnect-recurrence-v1.md |
| `wesleywork-launcher-audit-without-functional-proof-v1` | — | DOCUMENTED | WM-001 | CapitalGlass-Office-Admin | `harvest-2026-08-06-wesleywork-terminal-flash-closeout-v1` | see 2026-08-06_wesleywork-terminal-flash-closeout-v1.md |
| `wesleywork-phase3-after-closeout-v1` | — | DOCUMENTED | AVOIDABLE | CapitalGlass-Cross-Agent | `harvest-2026-08-06-wesleywork-terminal-flash-closeout-v1` | see 2026-08-06_wesleywork-terminal-flash-closeout-v1.md |
| `wesleywork-terminal-flash-advisory-tasks-v1` | — | ADVISORY | NON_BLOCKING_AT_CLOSEOUT | CapitalGlass-Office-Admin | `harvest-2026-08-06-wesleywork-terminal-flash-closeout-v1` | see 2026-08-06_wesleywork-terminal-flash-closeout-v1.md |
| `wesleywork-terminal-flash-audit-command-v1` | — | RECORDED | PASS | CapitalGlass-Office-Admin | `harvest-2026-08-06-wesleywork-terminal-flash-closeout-v1` | see 2026-08-06_wesleywork-terminal-flash-closeout-v1.md |
| `wesleywork-terminal-flash-closeout-verdict-v1` | — | CLOSED | WESLEY_WORK_TERMINAL_FLASH_CLOSEOUT_VERIFIED_WITH_ADVISORIES | CapitalGlass-Office-Admin | `harvest-2026-08-06-wesleywork-terminal-flash-closeout-v1` | see 2026-08-06_wesleywork-terminal-flash-closeout-v1.md |
| `wesleywork-terminal-flash-frozen-receipts-v1` | — | FROZEN | AUTHORITATIVE | CapitalGlass-Office-Admin | `harvest-2026-08-06-wesleywork-terminal-flash-closeout-v1` | see 2026-08-06_wesleywork-terminal-flash-closeout-v1.md |
| `wesleywork-terminal-flash-poll-command-v1` | — | RECORDED | PASS | CapitalGlass-Office-Admin | `harvest-2026-08-06-wesleywork-terminal-flash-closeout-v1` | see 2026-08-06_wesleywork-terminal-flash-closeout-v1.md |
| `wesleywork-terminal-flash-recurring-v1` | — | RESOLVED | CONVERTED_AND_VERIFIED | CapitalGlass-Office-Admin | `harvest-2026-08-06-wesleywork-terminal-flash-closeout-v1` | see 2026-08-06_wesleywork-terminal-flash-closeout-v1.md |
| `wesleywork-wscript-hidden-task-registrar-v1` | — | ACTIVE | PASS | CapitalGlass-Office-Admin | `harvest-2026-08-06-wesleywork-terminal-flash-closeout-v1` | see 2026-08-06_wesleywork-terminal-flash-closeout-v1.md |
| `windows-l-unmapped-explorer-v1` | — | RESOLVED_SESSION | L_REMAPPED_VIA_TAILSCALE_HOSTNAME | CapitalGlass-Office-Admin | `harvest-2026-08-04-wesleywork-l-windows-closeout-v1` | see 2026-08-02_z-drive-disconnect-recurrence-v1.md |
| `wsl-drvfs-ghost-mount-v1` | — | DOCUMENTED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-z-l-drive-offlan-session-v1` | see 2026-08-02_z-drive-disconnect-recurrence-v1.md |
| `wsl-estate-git-pull-run` | — | PARTIAL_PASS | PASS_WITH_GAPS | CapitalGlass-Office-Admin | `harvest-2026-08-04-wsl-estate-git-pull-v1` | see harvest-2026-08-04-wsl-estate-git-pull-v1.md |
| `wsl-supabase-cli-spawn-v1` | — | SHIPPED | PASS | CG-AppBuilder-MCP | `harvest-2026-08-04-asg-go-shared-db-closeout-v1` | see wsl-supabase-cli-spawn-v1.md |
| `wsl2-native-repo-library-migration-v1` | `intel:94c4601cef99ef…` | PARTIAL | FILESYSTEM_PASS_OPERATIONAL_CLEANUP_RECORDED | CG-AppBuilder-MCP | `harvest-2026-08-03-cross-thread-platform-state-v1` | see 2026-08-03_wsl2-native-repo-library-migration-v1.md |
| `z-drive-force-remap-wsl-cwd-v1` | — | RECORDED | PASS | CapitalGlass-Office-Admin | `harvest-2026-08-04-z-l-drive-offlan-session-v1` | see 2026-08-02_z-drive-disconnect-recurrence-v1.md |
| `z-l-drive-offlan-partial-availability-v1` | — | PARTIAL_DRIVE_AVAILABILITY | Z_OK_L_BLOCKED_OFF_LAN | CapitalGlass-Office-Admin | `harvest-2026-08-04-z-l-drive-offlan-session-v1` | see 2026-08-02_z-drive-disconnect-recurrence-v1.md |

_267 registry packets · 122 intelligence entities_

<!-- HARVEST-PACKET-INDEX:END -->

## Active projects

| Project ID | File | Status | Owner repo(s) | Last commit | Next action |
| --- | --- | --- | --- | --- | --- |
| `cg-federated-repo-index-v1` | [2026-08-12_cg-federated-repo-index-v1.md](./2026-08-12_cg-federated-repo-index-v1.md) | **CG_FEDERATED_REPO_INDEX_WAVE_A_IMPLEMENTED_PUSHED / LIVE_RYZEN9_PROOF_PENDING** — blocker `BLOCKED_GHA_WP_NOT_ALLOWLISTED`; failover `DIRECT_CONNECT_FAILOVER_LOCAL` | `CG-AppBuilder-MCP`, `Computer Estimator` | AppBuilder `94c2caae0abe064bfe561ef9ca7e7a79a7ba3d3f`; CE `acc4e2b6` | RYZEN9DESK ext4: `npm run repo-index:ryzen9desk-wave-a-generate`; commit only generate receipt. Do not close Wave A / enter Wave B / publish Hub / repair GHA-SSH in this WP |
| `harvest-2026-08-03-cross-thread-platform-state-v1` | [2026-08-03_harvest-2026-08-03-cross-thread-platform-state-v1.md](./2026-08-03_harvest-2026-08-03-cross-thread-platform-state-v1.md) | **COMPLETE** — `HARVEST_COMPLETE` | CapitalGlass-Cross-Agent | Harvest commit pending | Recurring ingest + L: publish when operator approves |
| `estimating-spine-ryzen9-activation-v1` | [2026-08-12_estimating-spine-ryzen9-activation-v1.md](./2026-08-12_estimating-spine-ryzen9-activation-v1.md) | **WSL_EXECUTOR_READY_ESTIMATING_PARTIAL** | `CG-AppBuilder-MCP` | GHA proofs `31560060271`–`31560208328` | RYZEN9 desk: CE opening stack + Revu Windows handoff |
| `smith-ranch-ce-revu-full-set-v1` | [2026-08-12_smith-ranch-ce-revu-full-set-v1.md](./2026-08-12_smith-ranch-ce-revu-full-set-v1.md) | **PHASE_A_READY_FOR_REMOTE_DISPATCH** | `CG-AppBuilder-MCP` | commit `cd807ac8f` (local) | Merge main → dispatch `smith-ranch-ce-batch`; Phase B Revu queued |
| `ryzen9desk-managed-executor-v1` | [2026-08-03_ryzen9desk-managed-executor-v1.md](./2026-08-03_ryzen9desk-managed-executor-v1.md) | **MANAGED_EXECUTOR_ONLINE** — PARTIAL_REMOTE_PASS | `CG-AppBuilder-MCP` | `51946c4b` AppBuilder at harvest | Maintain runner; CE opening stack + Revu Windows interactive |
| `active-ledger-ci-path-and-hash-stability-v1` | [2026-08-03_active-ledger-ci-path-and-hash-stability-v1.md](./2026-08-03_active-ledger-ci-path-and-hash-stability-v1.md) | **PASS** | `CG-AppBuilder-MCP` | `2cd8eba9`, `3fb8c9bb` | None — close unless CI regresses |
| `office-admin-ryzen9desk-managed-executor-bootstrap-v1` | [2026-08-03_office-admin-ryzen9desk-managed-executor-bootstrap-v1.md](./2026-08-03_office-admin-ryzen9desk-managed-executor-bootstrap-v1.md) | **NEEDS_OFFICE_ADMIN_INDEXING** | CapitalGlass-Office-Admin | — | Index runbook in Office Admin when ready |
| `wsl2-native-repo-library-migration-v1` | [2026-08-03_wsl2-native-repo-library-migration-v1.md](./2026-08-03_wsl2-native-repo-library-migration-v1.md) | **PARTIAL** — filesystem PASS | `CG-AppBuilder-MCP` | — | Per-repo ext4 verification; RYZEN9DESK alignment separate |
| `ryzen9desk-wsl2-canonical-workspace-v1` | [2026-08-03_ryzen9desk-wsl2-canonical-workspace-v1.md](./2026-08-03_ryzen9desk-wsl2-canonical-workspace-v1.md) | **BLOCKED — use managed executor** | `CG-AppBuilder-MCP`, RYZEN9DESK operator | Tooling prepared on WESLEY_WORK | Dispatch via `ryzen9desk-managed-executor-v1` (`job_profile: wsl2-canonical-setup`) |
| `wesleywork-drive-mount-task-dedupe-v1` | [2026-08-03_wesleywork-drive-mount-task-dedupe-v1.md](./2026-08-03_wesleywork-drive-mount-task-dedupe-v1.md) | **IMPLEMENTED — ready for live deploy** | CapitalGlass-Office-Admin | Code in owner repo | Elevated deploy on WESLEY_WORK: `Install-CgWesleyWorkDriveMountPersistence.ps1` + verifier; live probe pending |
| `project-folder-synology-primary-v1-dev-hosted-environment` | [project-folder-synology-primary-v1-dev-hosted-environment.md](./project-folder-synology-primary-v1-dev-hosted-environment.md) | **HOLD** — step #3 hosted dev | CapitalGlass-Documents, WESLEYDESK | Contract `d8826e8`; partial Doppler dev | Fix Vercel BLOCKED deploy; separate Supabase dev; alias `documents-dev`; gates G1–G10 |
| `project-folder-synology-primary-v1-dev-environment` | [project-folder-synology-primary-v1-dev-environment.md](./project-folder-synology-primary-v1-dev-environment.md) | **ACTIVE** — dev lane before production | CapitalGlass-Documents, Dashboard, Office Admin | Slice 0–3 on `main`; prod flag **off** | Child WP step #3; then Dashboard dev + worker |
| `project-folder-synology-primary-v1` | [project-folder-synology-primary-v1.md](./project-folder-synology-primary-v1.md) | **HALTED** — integration PASS; productionization halted | CapitalGlass-Documents | `440ce33` | No production work until dev-environment gates pass |
| `suite-ci-healing-v1` | [2026-08-03_suite-ci-healing-v1.md](./2026-08-03_suite-ci-healing-v1.md) | **PASS pending smoke rerun** — Doppler SHA aligned `f16b4ff` | Product Catalog, Proposal Generator, Office Admin, Document Center | Office Admin PR #51 merged; Doppler `cg-documents/prd` updated 2026-08-04 | Rerun Document Center production smokes; sync GitHub secret if apply script not run |
| `cross-agent-registry-onboard-v1` | [2026-08-02_cross-agent-registry-onboard-v1.md](./2026-08-02_cross-agent-registry-onboard-v1.md) | Complete — closeout PASS | `CG-AppBuilder-MCP` | `38a162da` / `48a1bff1` | Recurring registry maintenance only |
| `cross-agent-structured-ledger-projection-v1` | [2026-08-02_cross-agent-structured-ledger-projection-v1.md](./2026-08-02_cross-agent-structured-ledger-projection-v1.md) | **MILESTONE PASS** — Phases 0–3 operational | `CG-Platform-Governance-MCP`, `CG-AppBuilder-MCP` | AppBuilder `63dbeb8c`; Governance `a5ce4c3` | Recurring ingest + drift probe after ledger updates |
| `wsl-mcp-cursor-doppler-promptops-hardening-v1` | [2026-08-02_wsl-mcp-cursor-doppler-promptops-hardening-v1.md](./2026-08-02_wsl-mcp-cursor-doppler-promptops-hardening-v1.md) | **PASS — Cursor WSL default active; `mcp:repair:cursor` PASS** | `CG-AppBuilder-MCP`, `Cursor-MCP-Kit`, Cursor MCP, Doppler | WSL default verify PASS; `mcp:repair:cursor` PASS | Use WSL Suite shortcut; optionally commit/push ext4 changes; handle Vercel / Cloudflare / `mcp:attest` separately |
| `z-ai-cache-single-canonical-authority-v1` | [2026-08-02_z-ai-cache-single-canonical-authority-v1.md](./2026-08-02_z-ai-cache-single-canonical-authority-v1.md) | **Complete — three-host aligned** | `CG-AppBuilder-MCP` | `b3ae65d2` | Recurring `ai-cache-z-master:three-host-status` probe only |
| `z-drive-disconnect-recurrence-v1` | [2026-08-02_z-drive-disconnect-recurrence-v1.md](./2026-08-02_z-drive-disconnect-recurrence-v1.md) | **Active — pre-session gate** | CapitalGlass-Office-Admin | FI + Office Admin script | ForceRemap Z: before material sessions on WESLEY_WORK |
| `active-ledger-drain-and-intelligence-hub-sync-v1` | [2026-08-02_active-ledger-drain-and-intelligence-hub-sync-v1.md](./2026-08-02_active-ledger-drain-and-intelligence-hub-sync-v1.md) | **Complete — closeout PASS** | Multi-repo | AppBuilder `cd4a9005` | Recurring L: publish only |
| `north-star-compounding-proof-v1` | [2026-08-01_north-star-compounding-proof-v1.md](./2026-08-01_north-star-compounding-proof-v1.md) | Pushed — evidence receipts on `origin/main` | `CG-Platform-Governance-MCP` (authority), `CG-AppBuilder-MCP` (execution) | Governance `8ebcdf4`; AppBuilder `3772d491` | Restart MCP; clear Auto v3.2 env vars and rerun `closeout:gate`; begin `north-star-compounding-vertical-pilot-v1` |
| `agent-research-library-layout-v1` | [2026-08-01_agent-research-library-layout-v1.md](./2026-08-01_agent-research-library-layout-v1.md) | Pilot 9/10 operational | `Data-Extraction`, `Scraper` | `Data-Extraction 2190944`; `Scraper 0111837`; layout `b1d2e42`, `3e09e4c` | Optional bounded n8n capture; agent review before any `10-approved-for-use/` promotion |
| `docling-github-ingest-v1` | [2026-08-01_docling-github-ingest-v1.md](./2026-08-01_docling-github-ingest-v1.md) | Publish optimized — `manifest-only-fast` default | `Scraper`, `Data-Extraction` | Cross-Agent `2ecb2f5` | Use L: compact / manifest entry points; full publish only when all 1,076 pages must be mirrored |
| `ephemeral-unstructured-github-scrape-v1` | [2026-08-01_ephemeral-unstructured-github-scrape-v1.md](./2026-08-01_ephemeral-unstructured-github-scrape-v1.md) | Scrape complete — corpus publish pending | `Scraper` (capture), `Data-Extraction` (publish) | Cross-Agent `1ff3908`, `5abae0f`, `78bbdde` | Implement shared `build-github-markdown-articles.mjs`; publish Unstructured corpus; run `knowledge:build` |
| `bid-composer-upgrade-roadmap-v1` | [2026-08-01_bid-composer-upgrade-roadmap-v1.md](./2026-08-01_bid-composer-upgrade-roadmap-v1.md) | Phase 1 implemented; shared-dev migration pending | `CapitalGlass-BidComposer` | Cross-Agent `ed1fbea`; migration `20260801120000_bid_revision_control_and_pipeline.sql` | Apply shared DB migration or start `bid-composer-phase2-document-authority-v1` |
| `revu-opening-detection-top10-v1` | [2026-08-01_revu-opening-detection-top10-v1.md](./2026-08-01_revu-opening-detection-top10-v1.md) | Pilot 8/10 operational; Rosewood lane status corrected | `Computer Estimator` (detection), `CapitalGlassRevu` (markup), `Data-Extraction`, `Scraper`, `Bid Composer` | `Data-Extraction 38e5c58`; `Scraper 36cd354`; Cross-Agent `ad12b11`, `531fd9b` | Do not treat Rosewood as proposal-ready; Revu markup controlled, CE parse stalled, real BC bid not started |
| `ce-issued-proposal-corpus-v1` | [2026-08-11_ce-issued-proposal-corpus-v1.md](./2026-08-11_ce-issued-proposal-corpus-v1.md) | **FOUNDATION_COMPLETE** | `CapitalGlass-Cross-Agent`, `CapitalGlass-BidComposer`, `capital-glass-estimating-parser` | Harvest 2026-08-12 | Successor: `issued-proposal-structured-estimator-learning-v1`; L: publish operator |
| `issued-proposal-structured-estimator-learning-v1` | [2026-08-12_issued-proposal-structured-estimator-learning-v1.md](./2026-08-12_issued-proposal-structured-estimator-learning-v1.md) | **ACTIVE** | parser, Cross-Agent, Bid Composer, Data-Extraction, CG-MASTER-GRAPH | Opens on foundation commit | Frame/glass extract + parity + PLR + decision events; blocks premature program closeout |

---

## Status legend

| Status | Meaning |
| --- | --- |
| Planned | Scoped but not started |
| Active | In progress |
| Blocked | Waiting on dependency or operator action |
| Complete | Delivered locally; may still need commit/push |
| Pushed | Committed and pushed to remote |
| Pilot operational | Partial rollout verified; optional follow-ups remain |

---

## Projects by owner repo

Use this when you need to find all work touching a specific repo.

### CG-Platform-Governance-MCP

| Project ID | Status | Next action |
| --- | --- | --- |
| `north-star-compounding-proof-v1` | Pushed | Begin `north-star-compounding-vertical-pilot-v1` |
| `active-ledger-drain-and-intelligence-hub-sync-v1` | Complete — closeout PASS | Recurring L: publish after ledger edits |

Recommended follow-on work packages (not yet project files):

- `north-star-compounding-vertical-pilot-v1` — harvest → Z: → next-mission retrieval
- `platform-governance-phase4-registries-v1` — program/mission/exception registries

### CapitalGlass-Office-Admin

| Project ID | Status | Next action |
| --- | --- | --- |
| `wesleywork-drive-mount-task-dedupe-v1` | IMPLEMENTED — live deploy pending | Elevated deploy + verifier on WESLEY_WORK |
| `z-drive-disconnect-recurrence-v1` | Active — pre-session gate | ForceRemap Z: before material sessions |

### CG-AppBuilder-MCP

| Project ID | Status | Next action |
| --- | --- | --- |
| `cg-federated-repo-index-v1` | **IMPLEMENTED_PUSHED / LIVE_RYZEN9_PROOF_PENDING** | RYZEN9DESK generate receipt; defer GHA/SSH to `ryzen9desk-executor-transport-repair-v1` |
| `suite-ci-healing-v1` | Partial PASS | After Document Center SHA alignment, inspect stale AppBuilder PRs #254, #252, #228, #227, #216 |
| `north-star-compounding-proof-v1` | Pushed | Restart MCP; clear Auto v3.2 env vars; rerun `closeout:gate` |
| `cross-agent-registry-onboard-v1` | Complete — pushed | Recurring maintenance |
| `cross-agent-structured-ledger-projection-v1` | **MILESTONE PASS** | Recurring ingest + drift probe |
| `wsl-mcp-cursor-doppler-promptops-hardening-v1` | PASS — Cursor WSL default active; `mcp:repair:cursor` PASS | Use WSL Suite shortcut; optionally commit/push ext4 changes; investigate Vercel auth / Cloudflare / `mcp:attest` separately |
| `z-ai-cache-single-canonical-authority-v1` | Complete — three-host aligned | Recurring `ai-cache-z-master:three-host-status` probe only |
| `active-ledger-drain-and-intelligence-hub-sync-v1` | Complete — closeout PASS | Recurring L: publish after ledger edits |

### Data-Extraction

| Project ID | Status | Next action |
| --- | --- | --- |
| `active-ledger-drain-and-intelligence-hub-sync-v1` | Phases 0–3 complete | Recurring `publish-active-work-ledger` after ledger updates |
| `agent-research-library-layout-v1` | Pilot 9/10 operational | Agent review before `10-approved-for-use/` promotion |
| `docling-github-ingest-v1` | Publish optimized | Add Docling vendor interpreter; warm retrieval ladder |
| `ephemeral-unstructured-github-scrape-v1` | Scrape complete | Corpus publish after shared articles builder exists |

### Scraper

| Project ID | Status | Next action |
| --- | --- | --- |
| `agent-research-library-layout-v1` | Pilot 9/10 operational | Optional bounded n8n capture |
| `docling-github-ingest-v1` | Publish optimized | GitHub bulk capture + articles builder if not done |
| `ephemeral-unstructured-github-scrape-v1` | Scrape complete | Shared `build-github-markdown-articles.mjs` |
| `revu-opening-detection-top10-v1` | Pilot 8/10 operational | Deepen vendor KB for pymkup, PyMuPDF, PaddleDetection; keep proposal-stack out of CE parser scope |

### Bid Composer

| Project ID | Status | Next action |
| --- | --- | --- |
| `ce-issued-proposal-corpus-v1` | FOUNDATION_COMPLETE | Successor WP owns learning extract |
| `issued-proposal-structured-estimator-learning-v1` | ACTIVE | Frame/glass extract + `test:issued-proposal-corpus-parity` + PLR/decision events |
| `bid-composer-upgrade-roadmap-v1` | Phase 1 implemented | Apply shared DB migration; choose Phase 2 document authority or Phase 3 parser normalization |

### Computer Estimator / CapitalGlassRevu

| Project ID | Status | Next action |
| --- | --- | --- |
| `cg-federated-repo-index-v1` | **LIVE_RYZEN9_PROOF_PENDING** | Generate local index on RYZEN9DESK Vision Plane bytes; do not compound fake paths on WesleyWork |
| `revu-production-plan-markup-readiness-v1` | ACTIVE — operator-led | Phase 0–1 on WESLEYDESK: Max seat + Gate 1 controlled fixture; see `2026-08-11_revu-production-plan-markup-readiness-v1.md` |
| `ce-issued-proposal-corpus-v1` | INDEXED — git authority | Regenerate via `npm run harvest:issued-proposal-corpus`; L: publish merges `agent-build-catalog-patch-v1.json` |
| `revu-opening-detection-top10-v1` | Rosewood lane status corrected | Build `cg-opening-locator-v1`; if marking Rosewood in Revu, start with controlled sheet choice and do not assume CE parse or BC bid exists |

---

## Cross-cutting blockers

Indexed for agent preflight (`active-work-blockers.json`). Domain blockers are gated under owner work packages; operator items are not indexed here.

| Blocker | Affects | Owner | Required action |
| --- | --- | --- | --- |
| Missing shared GitHub → articles builder | `docling-github-ingest-v1`, `ephemeral-unstructured-github-scrape-v1` | `Scraper` | Implement `build-github-markdown-articles.mjs` — gated under owner WPs |
| Rank-9 Arch FP YOLO benchmark repo URL unknown | `revu-opening-detection-top10-v1` | Research | Pin URL before capture — gated under `revu-opening-detection-top10-v1` |
| DE opening-detection KB is shallow | `revu-opening-detection-top10-v1`, `cg-opening-locator-v1` | `Data-Extraction` | Finish vendor interpretation; fix `unsupported_vendor` — gated under opening-detection WPs |
| Bid Composer weak on `window_schedule_row` | CE parser ROI / Bid Composer review lane | `Bid Composer` | Partial relief: `ce-issued-proposal-corpus-v1` frame/glass schema + 23 examples; full import lane still gated under Bid Composer roadmap |
| Revu MCP production workflow locked | `revu-production-takeoff-pilot-v1` | `CapitalGlassRevu`, `Bid Composer` | Policy lock until plan → approval → export → BC review pilot passes |

---

## Cleared blockers (2026-08-04 — `active-ledger-blocker-gate-sweep-v1`)

| Blocker | Gate / evidence | Status |
| --- | --- | --- |
| Auto v3.2 env var contamination | `npm run check:auto-v32-session-env-policy` PASS; shell + Doppler clean | **CLEARED** |
| Document Center deployed SHA secret mismatch | Doppler `cg-documents/prd` `EXPECTED_DOCUMENT_CENTER_GIT_SHA` → `f16b4ff…` | **CLEARED** — rerun production smokes |
| Cursor opened from `/mnt/c` instead of ext4 WSL root | `npm run cursor:wsl-default:verify` PASS; operating rule only | **CLEARED** (regression watch) |

Receipt: `artifacts/agent-runs/active-ledger-blocker-gate-sweep-v1/blocker-gate-receipt.json`

---

## Operator checklist (not indexed as blockers)

| Item | When | Owner |
| --- | --- | --- |
| Restart MCP after Governance tool updates | Before `north-star-compounding-proof-v1` compounding tools | Cursor / operator |
| Vercel MCP auth | Only when Vercel connector needed | Cursor / Vercel — `mcp_auth` |
| Cloudflare stdio OAuth loopback | Only when Cloudflare MCP needed | Keep stdio disabled or clear `127.0.0.1:15170` |

---

## Open next actions (workspace-wide)

Priority order from `work-progress/ACTIVE_WORK.md`:

| Priority | Action | Owner repo |
| --- | --- | --- |
| 1 | Rerun Document Center production smokes after SHA pin | `CapitalGlass-Documents` |
| 2 | Restart MCP so Governance compounding tools load (operator checklist) | Cursor / local MCP |
| 3 | Run `north-star-compounding-vertical-pilot-v1` | Governance + AppBuilder |
| 4 | Run `platform-governance-phase4-registries-v1` | `CG-Platform-Governance-MCP` |
| 5 | Scope `cg-opening-locator-v1` parser package from Revu/Docling evidence | `Computer Estimator`, `Data-Extraction` |
| 6 | Scope `revu-production-takeoff-pilot-v1` after fixture gates | `CapitalGlassRevu`, `Bid Composer` |
| 7 | Keep ledger updated as work proceeds | `CapitalGlass-Cross-Agent` |

---

## Index maintenance rule

When adding a project:

```text
1. Create  work-progress/projects/YYYY-MM-DD_<project-id>.md
2. Add row to this INDEX.md (Active projects + By owner repo)
3. Add entry to work-progress/ACTIVE_WORK.md
4. Commit with: docs: add <project-id> project file
```

When closing a project:

1. Set status to Complete or Pushed in project file and this index.
2. Move detailed history to project file update log; keep ledger entry in `ACTIVE_WORK.md`.
3. Optionally archive superseded notes to `archive/YYYY-MM/` when that folder is in use.
