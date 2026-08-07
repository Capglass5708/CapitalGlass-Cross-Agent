# System Advancement Harvest — Quality Gate v1

**Applies to:** ChatGPT draft findings before push to `chat-gpt-harvest`  
**Enforced by:** ChatGPT self-check (pre-push); Cursor ingest validation (Phase 2)  
**Git publication gate:** [CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md](./CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md) — `CHATGPT_HARVEST_GIT_GATE` must PASS before `CHATGPT_SOURCE_PUBLISHED`; `BLOCKED_GIT_PUBLICATION` on failure. Repo: `Capglass5708/CapitalGlass-Cross-Agent`, branch: `chat-gpt-harvest`.

## Intelligence kind

| Kind | Protocol | Hub records |
| --- | --- | --- |
| **OBSERVED** | [CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md](./CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md) | What happened, failed, passed, learned |
| **ADVANCEMENT** | [CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md](./CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md) | Synthesized/invented designs and capabilities |

Advancement records must use `intelligenceKind: advancement` and `ADV-###` provenance. Never treat advancement as observed fact or implemented feature.

## Novelty gate — FAIL

**FAIL** the advancement harvest draft if:

- Output only summarizes, reorganizes, or restates prior thread material
- Output only lists prior commands, status tables, existing architecture, or historical summaries
- No `SYNTHESIZED` concept that was **not explicitly stated** in the thread
- No `INVENTED` concept linked to evidence
- Forbidden verdict appears (`HARVEST_COMPLETE`, `OPERATIONAL`, `FULLY_SEEDED`, `IMPLEMENTED`, `DEPLOYED`, `VALIDATED`, live `INDEX_HIT*`)
- Publication table has any layer not `not-run`
- Top-3 concepts lack measurable `acceptanceProof`

## Novelty gate — PASS

**PASS** requires:

- ≥1 `SYNTHESIZED` concept not explicit in thread
- ≥1 `INVENTED` concept (evidence-linked problem)
- ≥1 concept that removes an entire failure class
- ≥1 concept that reduces token or context cost
- ≥1 concept that improves concept-to-completion gated-wave execution
- Measurable proof criteria for each top-3 `IMP-###` / `ADV-###`
- Advancement cycle assessment ([advancement-cycle-taxonomy-v1.md](./advancement-cycle-taxonomy-v1.md))
- Scope ledger separates closed/open/blocked/deferred lanes
- Correction ledger (`COR-###`) overrides earlier assumptions where applicable

## Gated-wave harvest (when SDLC substantial)

Additional minimum `IMP-###` counts per [chat-thread-system-advancement-harvest-chatgpt-v1.md](./chat-thread-system-advancement-harvest-chatgpt-v1.md) — each tags `wavePhaseImproved`.

## Synthesis-not-replay principle

```text
History supplies constraints.
ChatGPT supplies synthesis.
Cursor supplies verification.
The Intelligence Hub supplies durable reuse.
New work supplies the next generation of evidence.
```

ChatGPT does **not** deterministically replay prior thread data as the advancement output.
