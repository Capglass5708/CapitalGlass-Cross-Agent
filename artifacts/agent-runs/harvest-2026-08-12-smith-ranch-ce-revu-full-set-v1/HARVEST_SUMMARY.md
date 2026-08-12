# Harvest summary — derived view

**Authority:** `harvest-manifest-v1.json` (`e19a2e565ef3…`)
**Work package:** `harvest-2026-08-12-smith-ranch-ce-revu-full-set-v1`
**Mission class:** `chat-thread-closeout-autopsy-harvest-v1`
**Verdict:** `HARVEST_VALIDATED`
**Retrieval:** `INDEX_HIT_AI_CACHE`

> This file is a generated view. Do not edit independently — update the manifest.

## Packets harvested

| Packet | State | Verdict | Owner |
| --- | --- | --- | --- |
| `smith-ranch-phase-a-profile-implemented-v1` | CODE_COMPLETE | PHASE_A_READY_FOR_REMOTE_DISPATCH | CG-AppBuilder-MCP |
| `smith-ranch-fixed-corpus-no-revu-v1` | COMPLETE | ENFORCED | CG-AppBuilder-MCP |
| `appbuilder-profile-merge-required-v1` | HOLD | BLOCKED | CG-AppBuilder-MCP |
| `revu-phase-b-policy-gate-v1` | HOLD | QUEUED_POLICY_GATE | CapitalGlassRevu |
| `operator-allowlist-wp-hardcode-v1` | RESOLVED | FIXED | CG-AppBuilder-MCP |
| `l-smb-readdirsync-hang-v1` | OPEN | MITIGATION_CANDIDATE | CG-AppBuilder-MCP |
| `find-manifest-l-smb-v1` | RECOMMENDED | ADVISORY | CG-AppBuilder-MCP |
| `cmd-test-smith-ranch-ce-batch-v1` | COMPLETE | PASS | CG-AppBuilder-MCP |
| `cmd-dispatch-phase-a-v1` | PENDING | NOT_RUN | CG-AppBuilder-MCP |
| `smith-ranch-235-manifest-digest-v1` | COMPLETE | ANCHORED | CG-AppBuilder-MCP |
| `smith-ranch-find-manifest-gate-v1` | CANDIDATE | POLICY_GATED | CG-AppBuilder-MCP |

## Global doNotAdvance

- PHASE_A_COMPLETE without phase-a-ce-batch-receipt.json and ce-revu-handoff.json from Ryzen
- PHASE_B_REVU without human gate and WINDOWS_INTERACTIVE proof
- Live GHA dispatch before AppBuilder profile on trusted main
- FULLY_SEEDED without index:freshness-gate receipt
- Run harvest:publish-hub-seed or index:publish from Cursor

## Projection sync

Status: `not-run` (hub: `not-run`)

