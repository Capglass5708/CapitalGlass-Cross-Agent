# Chat thread closeout autopsy harvest v1 — Git pointer

**Do not expand this file.** Full protocol: `L:/Capital-Glass-Intelligence-Hub/03-protocols/harvest/chat-thread-closeout-autopsy-harvest-v1.md`  
**Operator / ChatGPT:** `Z:/Capital-Glass-Dev/Harvest/protocol/chat-thread-closeout-autopsy-harvest-v1.md`  
**Storage policy:** `L:…/03-protocols/harvest/HARVEST-STORAGE-POLICY-v1.md`

**Work package:** `chat-thread-closeout-autopsy-harvest-v1` | **Authority (JSON/scripts):** CapitalGlass-Cross-Agent

## Git commands

```bash
npm run harvest:sync-derived -- <harvest-id>
npm run harvest:validate -- <harvest-id>
npm run harvest:validate-autopsy -- --harvest-id=<id>
npm run harvest:publish-intelligence-full -- --harvest-id=<id>   # seeds only — not protocol files
npm run harvest:ingest-chatgpt-findings -- --input=<findings.md> --harvest-id=<id>
```

**ChatGPT default:** `L:…/chat-improvement-extract-chatgpt-v1.md` (improvements + cross-check; not source of truth).

Related on L: `chat-thread-closeout-autopsy-harvest-chatgpt-v1.md`, `thread-autopsy-hub-accommodation-v1.md`, `harvest-record-validate-sync.md`.

**Supabase:** pointers only (`supabase-pointer-only-v1`) — see `L:…/HARVEST-STORAGE-POLICY-v1.md`. Full prose never in DB.
