# ChatGPT draft batch assessment (T2)

**Work package:** `chatgpt-draft-batch-assessment-t2-v1`  
**Protocol:** `docs/protocols/chatgpt-draft-batch-assessment-t2-v1.md`  
**Branch:** `chat-gpt-harvest` (draft queue) → batch output harvest id on same branch until operator merge policy  
**Tier:** T2

## Model

1. ChatGPT pushes draft markdown per thread (`DRAFT_READY_FOR_CURSOR_VALIDATION`) — **no per-run hub publish**.
2. Operator or Cursor runs `npm run harvest:collect-chatgpt-drafts` to refresh the queue.
3. Batch assessor reads many drafts, cross-checks repos/index, dedupes, writes **one validated harvest**.
4. `harvest:validate` + `harvest:validate-autopsy` **once** on batch output.
5. Operator runs `harvest:publish-intelligence-full` **once** on batch harvest id.

## Draft queue index

Machine inventory: `work-progress/chatgpt-draft-index.json`  
Refresh: `npm run harvest:collect-chatgpt-drafts -- --refresh-index`

## Lane map

Do not merge OBSERVED autopsy drafts with ADVANCEMENT synthesis without explicit operator approval. See `artifacts/agent-runs/harvest-2026-08-04-chat-gpt-harvest-protocol-v1/BRANCH_LANE_MAP.md`.

## Status

| Item | State |
| --- | --- |
| Protocol + collect script | Shipped on `chat-gpt-harvest` |
| First batch consolidation harvest | Pending operator / assessor run |
| Hub publication | Not run — drafts are not authority |

## Next action

Run batch assessor opener from protocol § Cursor opener against current `chatgpt-draft-index.json` queue.
