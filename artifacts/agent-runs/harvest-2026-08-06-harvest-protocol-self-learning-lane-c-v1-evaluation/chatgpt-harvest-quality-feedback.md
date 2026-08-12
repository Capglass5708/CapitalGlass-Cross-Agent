# ChatGPT Harvest Quality Feedback — Lane C Evaluation

## What ChatGPT did correctly

- Preserved protocol-only Lane C scope and explicit publication-not-run truth.
- Produced all required autopsy sections (packets, waste, ROI, guards, seeds).
- Correctly forbade HARVEST_COMPLETE / OPERATIONAL claims from ChatGPT lane.
- Command packets HP-009/HP-010 match shipped npm scripts on main.
- Separated z-mirror maintenance from Lane C operational closure.

## What Cursor repaired

- Descriptive evidenceRefs → EVT IDs, commit SHAs, file paths, receipt paths.
- Seed kind `protocol-upgrade` → `runbook` (schema compliance).
- ROI `seedAs` values → allowed enums (`rule`, `runbook`, `command`).
- Duplication DUP-001 resolved via registry + hub slice consultation.
- Added `protocolImprovementCandidates` with explicit `targetProtocolFiles` for export.

## Evidence references too vague

- "Operator scope correction", "Lane C protocol alignment", "Reported production packet exclusions"
- "All-spokes closeout", "Deferred harvest-z-mirror-source-repair-v1" without paths
- ChatGPT `sourceCommitSha: UNKNOWN` — actual `eba039d2f18e494d5564e0e2903295de1b8370c2` on `chat-gpt-harvest`

## Invalid or incomplete packets

- HP-003 strict classifier: valid lesson but **already implemented** — not a new protocol patch.
- HP-004 publication truth: **documented** in `harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md`.
- HP-005: valid but needed exact z-mirror receipt + runbook lag evidence.
- Seeds: `protocol-upgrade` kind invalid; spoke-matrix seed is generic harvest lesson.

## Duplicate or already implemented candidates

- Strict classifier → `classify-harvest-protocol-relevance.mjs` (PR #31).
- Publication truth chain → protocol doc + `protocolSelfLearning` manifest fields.
- Office-admin package already published `HPC-OA-PUBLICATION-TRUTH-001` (different fingerprint).

## Future ChatGPT harvests should

1. Attach `evidenceRefs` as paths, SHAs, or artifact IDs — never prose labels.
2. Include `targetProtocolFiles` / `targetValidators` on protocol_upgrade packets.
3. Run duplication registry lookup before marking NEEDS_REGISTRY_LOOKUP_FIRST.
4. Use seed `kind` enum from `harvest-seed-packet-v1.schema.json`.
5. Mark implementation-shipped items as ALREADY_IMPLEMENTED rather than protocol_upgrade candidates.

## ChatGPT protocol amendment?

**Yes — systematic:** Add a Cursor-validation checklist requiring exact evidenceRefs and schema field enums; add explicit "do not export already-shipped classifier behavior as new protocol_upgrade" guard in `chat-thread-closeout-autopsy-harvest-chatgpt-v1.md`.

## Evaluation verdict

`DRAFT_ACCEPTED_WITH_REPAIRS` — one genuinely new Lane C candidate (`HPC-Z-MIRROR-RUNBOOK-SYNC-001`) published; two redundant documentation candidates also in package (Governance should prioritize the z-mirror guard).
