# Work package: harvest-knowledge-quality-gate-v1 (Wave 4B)

**Branch:** `feat/harvest-publication-authority-v1`  
**Depends on:** Wave 4A `SUPABASE_SHARED_DEV_PROJECTION_PASS`  
**Target verdict:** `KNOWLEDGE_QUALITY_PASS`

## Governing rule

A structurally valid harvest is not automatically good knowledge.
A successfully published harvest is not automatically true or complete.

```
HARVEST_STRUCTURAL_PASS + KNOWLEDGE_QUALITY_PASS = DURABLE_PUBLICATION_READY
```

Without both, Phase A (`stageLDurableBundle`) stops with `BLOCKED_KNOWLEDGE_QUALITY`.

## Commands

```bash
npm run harvest:validate-knowledge-quality -- --run-dir=<path> --json
npm run test:harvest:knowledge-quality
```

## Inputs

- `knowledge-quality-evidence-v1.json` — structured gate evidence
- `harvest-manifest-v1.json`, `thread-event-inventory.json`, `thread-autopsy-bundle.json`, `seed-packets/`

## Outputs

- `harvest-knowledge-quality-receipt-v1.json` — included in durable payload inventory / payloadHash

## Test-only bypass

Only when manifest declares:

```json
"publicationPolicy": {
  "syntheticFixture": true,
  "publicationEligibility": "TEST_ONLY"
}
```

No `--skip-quality` for real harvests.

## Wave 4B gates

| Gate | Proof |
|------|-------|
| KNOWLEDGE_QUALITY_SCHEMA_PASS | evidence + receipt schema |
| THREAD_COVERAGE_GATE_PASS | 100% inventory event coverage |
| DECISION_INTEGRITY_GATE_PASS | required decision fields |
| USER_CORRECTION_GATE_PASS | correction completeness |
| EVIDENCE_COVERAGE_GATE_PASS | confidence labeling |
| CONTRADICTION_GATE_PASS | reconciliation required |
| SEED_QUALITY_GATE_PASS | seed packet + instructions |
| BLIND_RETRIEVAL_GATE_PASS | thread-specific retrieval |
| HUMAN_REVIEW_GATE_PASS | authority/security triggers |
| PHASE_A_QUALITY_ENFORCEMENT_PASS | `stageLDurableBundle` integration |
| QUALITY_RECEIPT_IN_PAYLOAD_HASH_PASS | payloadHash changes with receipt |

## Next wave

Wave 5 — Phase C pointer (`harvest-phase-c-pointer-v1`) blocked until `KNOWLEDGE_QUALITY_PASS` on synthetic full lifecycle.
