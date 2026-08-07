# ChatGPT Harvest Git Publication Contract v1

**Authority:** `CapitalGlass-Cross-Agent` `main` → `harvest/protocol/` (mirrored to Z and L)  
**Applies to:** all ChatGPT harvest lanes that produce draft markdown on `chat-gpt-harvest`

**Consumers:**

- [CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md](./CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md) (OBSERVED autopsy — v2)
- [CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md](./CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md) (ADVANCEMENT synthesis)
- [system-advancement-quality-gate.md](./system-advancement-quality-gate.md)
- [CHATGPT-DRAFT-BATCH-ASSESSMENT-T2-V1.md](./CHATGPT-DRAFT-BATCH-ASSESSMENT-T2-V1.md)

---

## Operational authority invariant

No protocol is operational because it exists on `chat-gpt-harvest`.

Only **`main`** and published **Z / L mirrors** define ChatGPT harvest behavior.

---

## Git staging constants

| Field | Value |
| --- | --- |
| **Repo** | `Capglass5708/CapitalGlass-Cross-Agent` |
| **Branch** | `chat-gpt-harvest` (never `main`) |
| **OBSERVED artifact** | `artifacts/agent-runs/<harvest-id>/chatgpt-findings-source.md` |
| **ADVANCEMENT artifact** | `artifacts/agent-runs/<harvest-id>/system-advancement-findings-source.md` |
| **Push** | `git push origin chat-gpt-harvest` |

---

## Verdict truth (do not mix stages)

| Stage | ChatGPT may claim | Lane-specific draft alias |
| --- | --- | --- |
| Draft in chat / file only | `DRAFT_READY` | `SYSTEM_ADVANCEMENT_DRAFT_READY` (ADVANCEMENT) |
| Download-ready without Git access | `DRAFT_READY_DOWNLOAD` | Normal ChatGPT terminal success — Cursor bridge owns Git |
| Git gate PASS + remote SHA verified | `CHATGPT_SOURCE_PUBLISHED` | same |
| Cursor validate / hub publish complete | `HARVEST_COMPLETE` | **Forbidden in ChatGPT** |

| Failure | Meaning |
| --- | --- |
| `BLOCKED_GIT_PUBLICATION` | `CHATGPT_HARVEST_GIT_GATE` FAIL — do not hand off as published evidence |

---

## CHATGPT_HARVEST_GIT_GATE (hard closeout gate)

Mandatory for `DRAFT_FILE` closeout unless `REVIEW_ONLY`, `CONCEPT_ONLY_NO_WRITE`, `STOP_NOW`, or GitHub unavailable (operator manual push).

### Required

| Check | Requirement |
| --- | --- |
| Artifact exists | Designated draft file present |
| Path matches harvest-id | Under `artifacts/agent-runs/<harvest-id>/` |
| Repo | `Capglass5708/CapitalGlass-Cross-Agent` |
| Branch | `chat-gpt-harvest` |
| Commit | Local commit contains artifact |
| Push | `git push origin chat-gpt-harvest` succeeded |
| Remote verification | Remote HEAD SHA == local commit SHA |

### Failure

```text
verdict: BLOCKED_GIT_PUBLICATION
```

Do not claim `CHATGPT_SOURCE_PUBLISHED` or `HARVEST_COMPLETE`.

### SHA receipt (mandatory after PASS)

```json
{
  "gitPublicationReceipt": {
    "gate": "CHATGPT_HARVEST_GIT_GATE",
    "verdict": "PASS",
    "repo": "Capglass5708/CapitalGlass-Cross-Agent",
    "branch": "chat-gpt-harvest",
    "harvestId": "harvest-YYYY-MM-DD-<slug>-v1",
    "artifactPath": "artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/<draft-file>.md",
    "localCommitSha": "<40-char>",
    "remoteCommitSha": "<40-char>",
    "remoteVerified": true
  }
}
```

---

## DRAFT_FILE write boundary

`DRAFT_FILE` authorizes **only** the designated draft artifact on `chat-gpt-harvest`.

Forbidden: edits to canonical `main` material (schemas, validators, scripts, hub indexes, merges to `main`).

---

## Authority split

| Owner | Scope |
| --- | --- |
| **ChatGPT** | Compression → designated artifact → Git staging + gate receipt |
| **Cursor** | Ingest → validate → canonical JSON → `main` |
| **Operator / estate** | `harvest:publish-intelligence-full`, Z/L, index, cache |

---

## Estate automation (ChatGPT must not claim)

```text
push chat-gpt-harvest
  → (when on main) .github/workflows/chatgpt-harvest-move-to-l.yml
  → L:\02-catalog\chatgpt-draft-staging\chat-gpt-harvest\<harvest-id>\
  → Cursor pull + ingest + validate
```

Workflow: `chatgpt-harvest-move-to-l`  
Move command: `npm run harvest:move-chatgpt-harvest-to-l`
