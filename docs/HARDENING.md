# CapitalGlass-Cross-Agent — Hardening

> Machine-readable companion: [`docs/hardening-status.json`](./hardening-status.json).

**Status: UNKNOWN — `NOT_YET_VERIFIED`.**

This is an honest baseline, not a health report. It exists so the estate
hardening index has complete coverage of the control-plane repositories without
pretending this one has been checked. **No gate in this repository has been run
by the hardening system.** The zeros in `findings` mean *unmeasured*, not clean.

## System role

control-plane: Platform Intelligence, cross-repository intelligence, compounding intelligence, registry/index consumption

## Authority sources

- Platform Intelligence is READ-ONLY with respect to git authority
- GitHub main is the code authority; cached index data never overrides newer git state

## Key invariants

1. Platform Intelligence never overwrites newer Git state with cached index data.
2. If the index is behind GitHub it is STALE, and must be classified as such.
3. Consumes the deterministic registry; does not produce machine authority.

## Security boundaries

- Read-only with respect to git authority
- Never returns secret values from indexed content

## Data-loss risks

- A stale index presented as current causes agents to act on code that has moved

## Required verification

The overnight hardening wave must run these and replace this baseline with real
evidence bound to the commit it tested:

- `npm test`
- `npm run typecheck`
- confirm index freshness against GitHub HEAD for indexed repositories

## Known defects

None recorded — because none have been looked for. This is not a claim that
there are none.

## Deferred hardening work

- Run the required verification and replace this baseline with measured evidence.

## Recovery procedure

Not yet documented. To be written during the first verification wave, once the
repository's actual failure modes have been observed rather than guessed.

## Verification

Baseline recorded at `0261f45cf7f5` on 2026-08-25T00:20:00Z. A hardening claim is bound to the
commit it was verified at — once HEAD moves past this commit, the estate index
reports this document as `STALE`.
