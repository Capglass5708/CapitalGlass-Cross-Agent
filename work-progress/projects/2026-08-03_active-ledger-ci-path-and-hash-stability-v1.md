# Active ledger CI path and hash stability

**Work package:** `active-ledger-ci-path-and-hash-stability-v1`  
**Status:** `COMPLETE`  
**Verdict:** `PASS`  
**Owner repo:** CG-AppBuilder-MCP  
**Harvested:** 2026-08-03 (`harvest-2026-08-03-cross-thread-platform-state-v1`)

---

## Summary

Closeout support for PR #268 (`ryzen9desk-managed-executor-v1`). Fixed CI failures on `test:active-ledger-sync` and unstable `contentHash` generation.

---

## Root cause

1. **Primary:** `test:active-ledger-sync` required mounted L: Intelligence Hub on `ubuntu-latest` — not available in GitHub Actions.
2. **Secondary:** `contentHash` instability from `undefined` keys in `scripts/intelligence-hub/lib/canonical-json.mjs`.

---

## Fix commits (CG-AppBuilder-MCP `main`)

| SHA | Change |
| --- | --- |
| `2cd8eba9` | Canonical JSON omits undefined keys; WSL publish path fixes |
| `3fb8c9bb` | Removed L: mount requirement from CI sync test; path checks moved to `scripts/tests/run-active-ledger-paths.test.mjs` |

---

## Canonical commands

```bash
npm run active-ledger:sync -- --json
npm run active-ledger:sync -- --publish   # operator only when L: mounted
npm run active-ledger:sync:check
```

---

## Separate concern (not CI blocker)

L: operational drift may exist locally. Address via operator publish when approved — not part of this packet's PASS verdict.

---

## Do not advance

- Treating L: drift as blocking merged PR #268 closeout
- Re-opening this packet unless CI regresses on `test:active-ledger-sync`
