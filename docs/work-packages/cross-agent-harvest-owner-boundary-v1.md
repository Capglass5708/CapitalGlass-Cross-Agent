# Work package: cross-agent-harvest-owner-boundary-v1

**Type:** Prerequisite gate repair (blocks improvement-intelligence program PRs)  
**Scope:** Harvest authority test alignment — no publisher behavior change, no knowledge deletion.

## Problem

`npm run test:harvest` asserted `owner-repo-boundary-index.json` had exactly **6** packets (matching one harvest manifest), but the boundary index is **cumulative** across all registered harvest packets. Registry authority had **11** legitimate entries (project-folder program expansion + coordination packets).

## Root cause

Stale hardcoded count in `run-harvest-authority-system.test.mjs` — not duplicate owners or unrelated packet pollution. All 11 boundary entries align 1:1 with `harvest-packet-registry.json`.

## Solution

- Test now derives expected boundary IDs from `harvest-packet-registry.json` authority
- Asserts every manifest packet has matching boundary entry with same `ownerRepo`
- `validate-harvest.mjs` enforces registry ↔ boundary parity and manifest packet coverage

## Verification

```bash
cd CapitalGlass-Cross-Agent
npm run test:harvest
npm run harvest:validate
```

**Result:** `test:harvest` 11/11 PASS, `harvest:validate` PASS.

## Forbidden in this PR

- Changing `run-index-publisher.mjs` publication behavior
- Deleting or renumbering knowledge records
- Bumping boundary count without registry authority
