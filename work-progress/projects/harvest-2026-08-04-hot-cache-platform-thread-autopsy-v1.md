# harvest-2026-08-04-hot-cache-platform-thread-autopsy-v1

ChatGPT **OBSERVED** lane T2 thread autopsy for the hot-cache platform evolution thread.

| Field | Value |
| --- | --- |
| **Source** | `chatgpt-findings-source.md` (ChatGPT `DRAFT_FILE`) |
| **ChatGPT commit** | `713bea841a25edfdffdc746cdb2898fe91486f78` |
| **Branch** | `chat-gpt-harvest` |
| **Cursor verdict** | `DRAFT_READY_FOR_CURSOR_VALIDATION` until `harvest:validate` PASS |

**Ingest**

```bash
npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-04-hot-cache-platform-thread-autopsy-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-04-hot-cache-platform-thread-autopsy-v1
node scripts/harvest/generate-hot-cache-platform-thread-autopsy-harvest.mjs
```

**Publish (operator, after validation)**

```bash
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-04-hot-cache-platform-thread-autopsy-v1
```
