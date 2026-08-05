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
| `protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md` | ChatGPT OBSERVED autopsy |
| `protocol/CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md` | ChatGPT ADVANCEMENT synthesis |
| `protocol/CHATGPT-DRAFT-BATCH-ASSESSMENT-T2-V1.md` | T2 batch assessor (draft queue → validated harvest) |
| `protocol/chatgpt-system-advancement-findings-template.md` | Advancement findings template |

## Sync

From WSL (CapitalGlass-Cross-Agent):

```bash
npm run harvest:sync-z-mirror
```

Updates this tree and `Z:\\Capital-Glass-Dev\\Harvest` when the Z: drive is mounted.

**Do not hand-edit mirrored protocol files** — edit git sources under `docs/runbooks/` or `docs/harvest-z-mirror/`, then re-sync.

Generated: 2026-08-05T04:07:44.348Z
Source commit: c7ef3556b7b4d30fd7f03e99ed77c73e659088fe
