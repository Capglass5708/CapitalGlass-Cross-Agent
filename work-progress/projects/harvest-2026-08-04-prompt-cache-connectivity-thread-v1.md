# harvest-2026-08-04-prompt-cache-connectivity-thread-v1

ChatGPT **OBSERVED** lane T2 thread autopsy — prompt harvest lifecycle, cache hardening, and host connectivity.

| Field | Value |
| --- | --- |
| **Source** | `chatgpt-findings-source.md` (ChatGPT `DRAFT_FILE`) |
| **ChatGPT commit** | `39de20042ceb2b1bdb6961b02ca5c84b5c33f6c2` |
| **Branch** | `chat-gpt-harvest` |
| **Cursor verdict** | `DRAFT_READY_FOR_CURSOR_VALIDATION` until `harvest:validate` PASS |

**Ingest**

```bash
npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-04-prompt-cache-connectivity-thread-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-04-prompt-cache-connectivity-thread-v1
node scripts/harvest/generate-prompt-cache-connectivity-thread-harvest.mjs
```

**Publish (operator, after validation)**

```bash
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-04-prompt-cache-connectivity-thread-v1
```
