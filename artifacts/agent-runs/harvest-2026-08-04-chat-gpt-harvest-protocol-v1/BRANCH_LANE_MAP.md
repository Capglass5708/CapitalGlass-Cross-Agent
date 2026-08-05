# chat-gpt-harvest branch lane map

**Branch:** chat-gpt-harvest
**Protocol harvest (this run):** harvest-2026-08-04-chat-gpt-harvest-protocol-v1
**Purpose:** Record protocol lane and prevent Pilot A skew.

## Protocol lane (CLOSED in this harvest)

| Commit | Summary |
| --- | --- |
| ef0b8eb | ChatGPT push instructions on branch |
| 5ce2079 | Phase 1 system advancement protocol + autopsy hardening |
| e5e108e | Z mirror sync receipt |
| 02882a0 | Operator quick-start + uppercase Z sync |

## Separate harvests on same branch (do NOT merge into Pilot A)

| Harvest ID | Lane | Output |
| --- | --- | --- |
| harvest-2026-08-04-wesleydesk-connectivity-session-boundary-v1 | OBSERVED ChatGPT | chatgpt-findings-source.md |
| harvest-2026-08-04-prompt-cache-connectivity-thread-v1 | OBSERVED ChatGPT | chatgpt-findings-source.md |
| harvest-2026-08-05-wesleydesk-connectivity-repair-v1 | OBSERVED Cursor T2 | published seeds |

## Pilot A (next — not this harvest)

| Harvest ID | Lane | Output |
| --- | --- | --- |
| harvest-2026-08-04-wesleydesk-session-repair-v1 | ADVANCEMENT synthesis | system-advancement-findings-source.md |

Pilot A must use CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md on Z, not the autopsy protocol file.
