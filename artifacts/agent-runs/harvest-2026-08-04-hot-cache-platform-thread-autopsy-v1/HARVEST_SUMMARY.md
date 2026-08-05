# Harvest summary — derived view

**Authority:** `harvest-manifest-v1.json` (`a7f66f122ee3…`)
**Work package:** `harvest-2026-08-04-hot-cache-platform-thread-autopsy-v1`
**Mission class:** `chat-thread-closeout-autopsy-harvest-chatgpt-v1`
**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`
**Retrieval:** `INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT`

> This file is a generated view. Do not edit independently — update the manifest.

## Packets harvested

| Packet | State | Verdict | Owner |
| --- | --- | --- | --- |
| `hot-cache-federated-datasets-v1` | RECORDED | CROSS_CHECK_REQUIRED | CG-AppBuilder-MCP |
| `hot-cache-derivative-only-v1` | RECORDED | CROSS_CHECK_REQUIRED | CG-AppBuilder-MCP |
| `hot-cache-immutable-generation-v1` | USER_REPORTED | CROSS_CHECK_REQUIRED | CG-AppBuilder-MCP |
| `hot-cache-routed-compact-retrieval-v1` | USER_REPORTED | CROSS_CHECK_REQUIRED | CG-AppBuilder-MCP |
| `hot-cache-safety-refusal-success-v1` | RECORDED | PASS | CG-AppBuilder-MCP |
| `chatgpt-draft-branch-lane-v1` | RECORDED | PASS | CapitalGlass-Cross-Agent |

## Global doNotAdvance

- Claim INDEX_HIT or live hub codes from ChatGPT draft
- Claim HARVEST_COMPLETE or OPERATIONAL before harvest:validate PASS
- Treat USER_REPORTED_OPERATIONAL milestones as verified without Cursor cross-check
- Merge chat-gpt-harvest to main without operator review
- Enable estate-wide bulk pull while material dirty trees remain
- Auto-promote prompt candidates

## Projection sync

Status: `not-run` (hub: `not-run`)

