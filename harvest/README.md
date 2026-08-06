# Capital Glass Harvest — Z: mirror authority

Git authority: `CapitalGlass-Cross-Agent/harvest/`  
Windows operator path: `Z:\\Capital-Glass-Dev\\Harvest`

## Cursor end-of-chat

At thread close, @ **one** protocol file (not the whole folder):

```
Z:\\Capital-Glass-Dev\\Harvest\\protocol\\CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md
```

## Protocol index

| File | Purpose |
| --- | --- |
| `protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md` | Thread closeout autopsy (Cursor) |
| `protocol/HARVEST-INGESTION-RUNBOOK-v1.md` | Record → validate → sync → publication |
| `protocol/PROMPT-EXTRACTION-AND-PROMOTION-v1.md` | Prompt candidate extraction + Supabase seed |
| `protocol/chat-thread-closeout-autopsy-harvest-chatgpt-v1.md` | ChatGPT draft lane |
| `protocol/CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md` | Gated wave SDLC (canonical: Data-Extraction) |

## Sync

From WSL (CapitalGlass-Cross-Agent):

```bash
npm run harvest:sync-z-mirror
```

Updates this tree and `Z:\\Capital-Glass-Dev\\Harvest` when the Z: drive is mounted.

**Do not hand-edit mirrored protocol files** — edit git sources under `docs/runbooks/`, `docs/harvest-z-mirror/`, or `Data-Extraction/docs/platform/` (wave SDLC), then re-sync.

Generated: 2026-08-06T16:06:58.067Z
Source commit: 02e7afc76b79933301dbf40eefe4d0034bc7c0db
