# ChatGPT Thread Autopsy Findings — AI Cache Preflight Evidence Reuse

Mission: `chat-thread-closeout-autopsy-harvest-chatgpt-v1`
Lane: `CHAT_CONTEXT_ONLY`
Protocol: `v2`
Harvest ID: `harvest-2026-08-07-ai-cache-preflight-evidence-thread-v1`
Target tier: `T2`
Pre-Git verdict: `DRAFT_READY`

> Draft source material only. Cursor must verify repository, runtime, gate, and index claims before canonical publication.

## 1. Final summary

The thread refined “cache the entire preflight” into a safe deterministic evidence engine governed by: **cache the proof, never the decision**.

Durable outcomes from the visible conversation:

- per-kind evidence keys rather than a global composite key;
- reusable evidence payloads but fresh session/gate receipts;
- live-fast-gate before seed/cache work;
- D host-local writable hot store, governed Z promotion, L retrieval-only;
- content-addressed evidence objects and key pointers;
- stampede leases;
- cache miss/invalidation/live failure telemetry kept separate;
- cache optimization may degrade/fail open to regeneration while authority/live truth stays fail-closed;
- master preflight cache-eligible steps separated from always-live runtime probes;
- cold-host governed Z hydration before regeneration;
- cross-host proof requires runtime host identity plus exact key/object identity;
- cold canonical-reuse KPI is distinct from hot aggregate hit-rate KPI.

The thread also exposed process improvements: realistic Git fixtures for live-state gates, preflight of remote-host execution capability before a multi-host wave, and a `BLOCKED_OPERATOR_EVIDENCE_ONLY` stop state to prevent repeated no-op waiting turns.

## 2. Harvest tier rationale

`T2`: corrections, architecture evolution, multi-component execution, operator friction, repeated closeout debate, and durable protocol-learning candidates.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

Pasted `INDEX_HIT_AI_CACHE`, Git SHA, gate, Scout, and host reports are cross-check candidates only in this lane.

## 4. Thread event inventory

- `EVT-001` User asks whether to AI-cache entire preflight.
- `EVT-002` Rule established: cache evidence, never final verdict.
- `EVT-003` Initial evidence-cache plan introduced kinds, keys, telemetry, tests, waves.
- `EVT-004` Architecture improved with per-kind keys, payload/receipt separation, live-fast-gate-first, content addressing, leases, storage authority, fail-open cache semantics.
- `EVT-005` Wave A evidence engine reported implemented and tests green.
- `EVT-006` Completion wave expanded to master preflight evidence reuse, TTL/promotion, and formal proof.
- `EVT-007` Auto-v32 temp fixtures fail `LIVE_NOT_GIT_REPO`; treated as milestone compatibility rather than weakening production gate.
- `EVT-008` Real temporary Git fixtures restore 15/15 while negative live-gate test preserves fail-closed behavior.
- `EVT-009` Cold cross-machine proof reveals missing governed Z hydration path.
- `EVT-010` Z hydration path and promotion key pointers reported added.
- `EVT-011` WESLEY_WORK cold governed-Z reuse + hot local D reuse reported.
- `EVT-012` Cold acceptance corrected: selected promoted object must reuse without regeneration; aggregate >=60%/>=70% belongs on hot second pass.
- `EVT-013` Prior “WESLEYDESK” artifact rejected because runtime host was WESLEY_WORK.
- `EVT-014` SSH to WESLEYDESK/RYZEN9DESK unavailable; final child closeout becomes operator-host proof only.
- `EVT-015` Several repeated locked/waiting turns add no new evidence.

## 5. Harvest packets

- `HP-001 lesson`: cache deterministic proof, not decision.
- `HP-002 architecture`: per-kind minimal evidence keys maximize reuse and limit invalidation blast radius.
- `HP-003 architecture`: D writable hot store; Z governed canonical promotion/reuse; L retrieval-only.
- `HP-004 failure-pattern`: repair unrealistic test fixtures, not production live-state safety gates.
- `HP-005 failure-pattern`: work-package host name is not host attestation.
- `HP-006 lesson`: distinguish cold canonical hydration KPI from hot aggregate reuse KPI.
- `HP-007 operator-friction`: multi-host proof blocked by missing remote execution/auth channel.
- `HP-008 protocol-upgrade`: add `BLOCKED_OPERATOR_EVIDENCE_ONLY` stop state. `NEEDS_REGISTRY_LOOKUP_FIRST`.

## 6. Execution deltas

- `ED-001` preflight blob → evidence graph + fresh verdict.
- `ED-002` global composite key → per-kind minimal material key.
- `ED-003` cached receipt ambiguity → cached payload + fresh receipt.
- `ED-004` seed/cache work before live blocker → live-fast-gate first.
- `ED-005` test isolation explanation → milestone-owned fixture compatibility until repaired/proven.
- `ED-006` promotion-only architecture → governed cold-host hydration before regeneration.
- `ED-007` artifact host label → runtime hostname/Git/authority/cache-root attestation.
- `ED-008` multi-host proof without access preflight → estate execution-capability preflight first.

## 7. Waste ledger

- `TW-001` repeated “locked/waiting for four proof lines” turns; replace with one durable stop-state receipt.
- `TW-002` repeated full closure criteria; reference canonical closeout receipt instead.
- `TW-003` repeated host commands; canonical operator script should be created earlier.
- `TW-004` cold pass initially risked being judged by warm aggregate KPI.

## 8. Duplication detector

- `DUP-001` blocked/waiting state repeated.
- `DUP-002` closure contract repeated.
- `DUP-003` host-proof instructions repeated.
- `DUP-004` likely overlap with existing cache-authority/cross-host/live-gate intelligence: `NEEDS_REGISTRY_LOOKUP_FIRST`.

## 9. Operator friction

- `OF-001` SSH authentication unavailable from WESLEY_WORK to target hosts.
- `OF-002` formal proof needs clean worktree; use clean proof/detached worktree rather than `--allow-dirty`.
- `OF-003` distributed host evidence should collapse to one machine-readable proof receipt plus PASS line per host.
- `OF-004` manual host switching delays otherwise-complete milestone closure.

## 10. ROI backlog

1. Finish WESLEYDESK + RYZEN9DESK cold/hot operator proof and close the child milestone.
2. Resume parent telemetry completeness and deterministic hit/miss classification.
3. Run representative two-pass cohort and prove sustained >=60% hit rate over an explicit denominator.
4. Provider token pairing; do not equate engineering-context reduction with billed-dollar ROI.
5. Add host-attested cross-machine proof schema.
6. Add estate execution-capability preflight.
7. Add `BLOCKED_OPERATOR_EVIDENCE_ONLY` conversation/SDLC stop state.

## 11. Do-not-advance guards

- No child CLOSED without target-host proof.
- No host proof inferred from work-package name.
- No `--allow-dirty` for formal host proof.
- No manual evidence copying between hosts.
- No warm D reuse counted as cross-machine proof.
- No weakening `LIVE_NOT_GIT_REPO` for tests.
- No casual canonical Z writes.
- No cached final verdicts or runtime probes.
- No provider-dollar ROI claim from context reduction alone.
- No ChatGPT claims of `INDEX_HIT`, `HARVEST_COMPLETE`, `OPERATIONAL`, or `FULLY_SEEDED`.
- No new implementation while only operator host evidence remains.

## 12. Seed packet candidates

```json
{"seedId":"IH-THREAD-PREFLIGHT-PROOF-NOT-DECISION-001","kind":"lesson","status":"CANDIDATE","retrievalQuestions":["Which preflight surfaces may be reused safely?","Why must final verdicts remain fresh on cache hit?"],"evidenceRefs":["EVT-001","EVT-002","HP-001"],"futureAgentInstructions":{"whenThisAppears":"A gate/PASS result is proposed for caching.","startAt":"Separate stable proof from live truth.","runPreflight":"Inventory evidence inputs and live-only checks.","doNot":["Cache final PASS/FAIL","Cache runtime health"],"proveBeforeClaiming":["Fresh live checks","Fresh receipt","Fresh verdict"]}}
```

```json
{"seedId":"IH-THREAD-PER-KIND-EVIDENCE-KEYS-001","kind":"architecture","status":"CANDIDATE","retrievalQuestions":["Why does a global cache key over-invalidate?","Which fields belong in each evidence kind key?"],"evidenceRefs":["EVT-003","EVT-004","HP-002"],"futureAgentInstructions":{"whenThisAppears":"Every evidence kind uses the same broad key.","startAt":"List material inputs per producer.","runPreflight":"Verify source hashes and generator versions.","doNot":["Put workPackageId in global reusable evidence","Invalidate unrelated evidence on repo SHA alone"],"proveBeforeClaiming":["Unrelated changes preserve hits","Relevant changes invalidate dependent kinds only"]}}
```

```json
{"seedId":"IH-THREAD-CROSS-HOST-EVIDENCE-IDENTITY-001","kind":"failure-pattern","status":"CANDIDATE","retrievalQuestions":["What proves a hit occurred on the intended host?","How is the exact promoted object proven across machines?"],"evidenceRefs":["EVT-009","EVT-011","EVT-013"],"futureAgentInstructions":{"whenThisAppears":"Artifact naming implies host identity.","startAt":"Read runtime hostname, Git SHA/parity, Z release, cache root, keyHash, objectHash.","runPreflight":"Use empty isolated local cache and require governed hydration before regeneration.","doNot":["Infer host from name","Count warm local reuse as cross-machine proof","Manually copy evidence"],"proveBeforeClaiming":["Runtime host matches","Exact key/object matches","Governed source","regenerated=false"]}}
```

```json
{"seedId":"IH-THREAD-COLD-VS-HOT-CACHE-KPI-001","kind":"lesson","status":"CANDIDATE","retrievalQuestions":["Why can a valid cold consumer have low aggregate hit rate?","Which KPIs apply to cold vs hot passes?"],"evidenceRefs":["EVT-011","EVT-012","TW-004"],"futureAgentInstructions":{"whenThisAppears":"An empty consumer cache is judged by warm aggregate targets.","startAt":"Validate selected promoted evidence identity first.","runPreflight":"Capture cold canonical hydration and unchanged hot rerun.","doNot":["Require all kinds to hit cold","Lower hot targets"],"proveBeforeClaiming":["Cold selected object reused without regeneration","Hot aggregate targets pass"]}}
```

```json
{"seedId":"IH-THREAD-OPERATOR-EVIDENCE-BLOCK-STATE-001","kind":"protocol-upgrade","status":"CANDIDATE","retrievalQuestions":["When should implementation freeze for operator evidence only?","How can repeated locked/waiting turns be avoided?"],"evidenceRefs":["EVT-014","EVT-015","TW-001"],"futureAgentInstructions":{"whenThisAppears":"Implementation and owned gates are complete; only named external proof remains.","startAt":"Emit one durable stop state with exact resume evidence.","runPreflight":"Validate only returned operator evidence.","doNot":["Create another implementation wave","Repeat full status with no new evidence"],"proveBeforeClaiming":["Named evidence arrived","Locked closure contract satisfied"]}}
```

Lane C candidate remains draft-only; Cursor must do registry/duplication lookup before export.

## 13. Future-agent instructions

If host proof is missing, start from `BLOCKED_OPERATOR_EVIDENCE_ONLY` and require only the named WESLEYDESK/RYZEN9DESK receipts. If the child closes, return directly to `ai-cache-deterministic-hit-rate-and-verified-roi-v1` for telemetry completeness, representative sustained hit-rate proof, provider pairing, verified ROI, and parent closeout. If a host proof fails, classify `HOST_BASELINE`, `Z_AUTHORITY_BINDING`, `CANONICAL_HYDRATION`, `EVIDENCE_IDENTITY_MISMATCH`, `GENERATOR_VERSION_MISMATCH`, `SOURCE_HASH_MISMATCH`, `LOCAL_CACHE_CONTAMINATION`, or `LIVE_GATE_FAILURE` before changing code.

## 14. Publication truth table

| Layer | State |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | `PENDING_GIT_GATE` |
| `CHATGPT_HARVEST_GIT_GATE` | `PENDING` |
| L: draft staging | `not-run` |
| Cursor ingest | `not-run` |
| `harvest:validate` | `not-run` |
| L: Hub catalog | `not-run` |
| Z: AI cache | `not-run` |
| Supabase projection | `not-run` |
| Lane C export / Data-Extraction | `not-run` |
| Freshness gate | `not-run` |
| Automatic protocol mutation | `false` |

```text
Publication: NOT_RUN_BY_CURSOR
projection.hubPublishStatus: not-run
```

## 15. gitPublicationReceipt

The final SHA receipt is emitted in ChatGPT after remote verification. It is not self-embedded with its own final commit SHA because modifying this file to add that SHA would create a different commit.

## 16. Cursor handoff command

Use only after ChatGPT reports `CHATGPT_SOURCE_PUBLISHED`:

```bash
git fetch origin chat-gpt-harvest && git checkout chat-gpt-harvest && git pull --ff-only origin chat-gpt-harvest
npm run harvest:ingest-chatgpt-findings -- --input=artifacts/agent-runs/harvest-2026-08-07-ai-cache-preflight-evidence-thread-v1/chatgpt-findings-source.md --harvest-id=harvest-2026-08-07-ai-cache-preflight-evidence-thread-v1
npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-07-ai-cache-preflight-evidence-thread-v1
npm run harvest:sync-derived -- harvest-2026-08-07-ai-cache-preflight-evidence-thread-v1
npm run harvest:validate -- harvest-2026-08-07-ai-cache-preflight-evidence-thread-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-07-ai-cache-preflight-evidence-thread-v1
npm run test:harvest
# operator after validation only: harvest:publish-intelligence-full
```

Final draft state before Git gate: `DRAFT_READY`.
