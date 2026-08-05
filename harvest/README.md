# Capital Glass Harvest — Z: mirror authority

Git authority: `CapitalGlass-Cross-Agent/harvest/`  
Windows operator path: `Z:\\Capital-Glass-Dev\\Harvest`

## Cursor end-of-chat

At thread close, @ **one** protocol file (not the whole folder):

| Lane | Protocol |
| --- | --- |
| OBSERVED (what happened) | `protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md` or ChatGPT autopsy lane |
| ADVANCEMENT (what should exist next) | `protocol/chat-thread-system-advancement-harvest-chatgpt-v1.md` |

## Protocol index

| File | Purpose |
| --- | --- |
| `protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md` | Thread closeout autopsy (Cursor) |
| `protocol/chat-thread-closeout-autopsy-harvest-chatgpt-v1.md` | ChatGPT OBSERVED autopsy draft |
| `protocol/chat-thread-system-advancement-harvest-chatgpt-v1.md` | ChatGPT ADVANCEMENT synthesis |
| `protocol/gated-wave-lifecycle-v1.md` | Concept-to-completion waves 0–13 |
| `protocol/system-advancement-quality-gate.md` | Novelty gate (synthesis-not-replay) |
| `protocol/advancement-cycle-taxonomy-v1.md` | NEW_SYNTHESIS vs DUPLICATE vs NO_NEW_ADVANCEMENT |
| `protocol/chatgpt-system-advancement-findings-template.md` | Advancement findings template |
| `protocol/HARVEST-INGESTION-RUNBOOK-v1.md` | Record → validate → sync → publication |
| `protocol/PROMPT-EXTRACTION-AND-PROMOTION-v1.md` | Prompt candidate extraction + Supabase seed |

## ChatGPT branch

Findings push to `chat-gpt-harvest` on `Capglass5708/CapitalGlass-Cross-Agent` (not `main`).

| Artifact | Path |
| --- | --- |
| Autopsy (OBSERVED) | `artifacts/agent-runs/<id>/chatgpt-findings-source.md` |
| Advancement (SYNTHESIS) | `artifacts/agent-runs/<id>/system-advancement-findings-source.md` |

## Sync

From WSL (CapitalGlass-Cross-Agent):

```bash
npm run harvest:sync-z-mirror
```

Updates this tree and `Z:\\Capital-Glass-Dev\\Harvest` when the Z: drive is mounted.

**Do not hand-edit mirrored protocol files** — edit git sources under `harvest/protocol/`, then re-sync.
