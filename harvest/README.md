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
| `protocol/chat-thread-closeout-autopsy-harvest-chatgpt-v1.md` | ChatGPT OBSERVED autopsy lane (v2) |
| `protocol/CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md` | Shared Git gate + verdict contract |
| `protocol/CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md` | ChatGPT ADVANCEMENT synthesis (v2) |
| `protocol/CHATGPT-DRAFT-BATCH-ASSESSMENT-T2-V1.md` | T2 batch assessor for draft queue |
| `protocol/CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md` | Gated wave SDLC (canonical: Data-Extraction) |

## Publication modes

| Command | Z required | L required | Verdict on success | Exit |
| --- | --- | --- | --- | --- |
| `npm run harvest:sync-z-mirror` | yes (`/mnt/z` mount + protocol dir) | no (warnings only) | `Z_HARVEST_MIRROR_SYNC_PASS` | 0 |
| `npm run harvest:sync-z-mirror -- --repo-mirror-only` | no | no | `Z_HARVEST_REPO_MIRROR_PASS` | 0 |
| Z unavailable (default mode) | — | — | `Z_HARVEST_MIRROR_SYNC_BLOCKED` | 1 |

L: hub index findings are **warnings** for z-mirror; they do not block Z publication.
`harvest:sync-derived` uses repository-only mode (`requireZPublication: false`).

Receipt: `harvest/z-mirror-sync-receipt.json` — check `verdict`, `errors`, `warnings`, `mountAuthority`.

## Sync

From WSL (CapitalGlass-Cross-Agent):

```bash
npm run harvest:sync-z-mirror
```

Updates this tree and `Z:\\Capital-Glass-Dev\\Harvest` when the Z: drive is mounted.

**Do not hand-edit mirrored protocol files** — edit git sources under `docs/runbooks/`, `docs/harvest-z-mirror/`, or `Data-Extraction/docs/platform/` (wave SDLC), then re-sync.

Generated: 2026-08-12T17:28:36.839Z
Source commit: 0194365ab357ab935ab430734eecc8c7a5103cb9
