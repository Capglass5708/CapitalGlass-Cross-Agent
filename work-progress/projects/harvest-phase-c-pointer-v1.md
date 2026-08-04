# harvest-phase-c-pointer-v1

**Status:** Wave 5 — Phase C pointer materialization  
**Branch:** `feat/harvest-publication-authority-v1`  
**Owner repo:** CapitalGlass-Cross-Agent

## Objective

Materialize exactly one Git coordination pointer (`harvest-publication-pointer-v1.json`) after L durable publication, Z cache alignment, Supabase projection alignment, and knowledge quality gate pass. Record the Git commit SHA on L: in `phase-c-receipt.json` without self-referencing the pointer file.

## Hard gates (pre-Phase C)

- `KNOWLEDGE_QUALITY_PASS`
- `DURABLE_PUBLICATION_READY`
- L durable bundle `CURRENT`
- Z and Supabase `sourcePayloadHash` aligned to `payloadHash`
- `PHASE_B_COMPLETE` or `NOOP_CURRENT`
- Valid L: pointer candidate with `receiptCommit: null`

## Phase C behavior

1. Validate candidate, phase-b receipt, and knowledge-quality receipt on L:
2. Build compact Git pointer (no payload bodies)
3. Commit pointer once when `PHASE_C_POINTER_APPROVED=1`
4. Write L: `phase-c-receipt.json` with `gitPointerCommit`
5. Post-commit Phase B rerun must be all `NOOP_CURRENT` with no new Git commit

## Commands

```bash
npm run test:harvest:phase-c
npm run harvest:materialize-pointer -- --harvest-id=<id> --payload-hash=<sha256:...> --json
PHASE_C_POINTER_APPROVED=1 npm run harvest:materialize-pointer -- --harvest-id=<id> --payload-hash=<sha256:...> --apply --json
```

## Synthetic fixture

`scripts/tests/fixtures/harvest-knowledge-quality-pass-v1` — full lifecycle only; not Slice 6 or business harvests.

## Target verdict

`PHASE_C_POINTER_PASS` — stop with `PHASE_C_HOLD` on any misalignment.
