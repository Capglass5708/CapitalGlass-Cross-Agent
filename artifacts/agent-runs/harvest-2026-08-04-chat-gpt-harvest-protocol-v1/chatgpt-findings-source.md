# ChatGPT Harvest Branch Protocol — OBSERVED Findings

**Mission:** chat-thread-closeout-autopsy-harvest-chatgpt-v1
**Lane:** CHAT_CONTEXT_ONLY / OBSERVED
**Harvest ID:** harvest-2026-08-04-chat-gpt-harvest-protocol-v1
**Output verdict:** DRAFT_READY_FOR_CURSOR_VALIDATION
**Branch:** chat-gpt-harvest at 02882a05cf8cff0d92d7ae837ee2d6b934698ac2

## Executive summary

This harvest records the protocol development lane on chat-gpt-harvest so Pilot A (WESLEYDESK session-repair ADVANCEMENT) does not skew against mixed branch content. WESLEYDESK connectivity autopsy artifacts use different harvest ids — see BRANCH_LANE_MAP.md.

## Scope ledger

- primary mission: ChatGPT harvest protocols, Z operator paths, branch push workflow
- closed lanes: Phase 1 docs/schemas, autopsy evidence layer, operator quick-start, uppercase Z sync
- open lanes: Pilot A advancement harvest, Phase 2 ingest-chatgpt-advancement
- do-not-merge: WESLEYDESK connectivity harvests into Pilot A fixture

## Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: 02882a05cf8cff0d92d7ae837ee2d6b934698ac2
```

## Publication truth

| Layer | State |
| --- | --- |
| Git authority | not-run |
| L: Hub catalog | not-run |
| Z: AI cache | not-run |
| Supabase projection | not-run |
| Freshness gate | not-run |

```text
Publication: NOT_RUN_BY_CURSOR
projection.hubPublishStatus: not-run
```

## Cursor handoff

```text
npm run harvest:record -- harvest-2026-08-04-chat-gpt-harvest-protocol-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-04-chat-gpt-harvest-protocol-v1
```

Pilot A next: harvest-2026-08-04-wesleydesk-session-repair-v1 / system-advancement-findings-source.md
