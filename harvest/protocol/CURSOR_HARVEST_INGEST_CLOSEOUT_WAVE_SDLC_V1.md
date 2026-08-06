# Cursor Harvest Ingest Closeout — Gated Wave SDLC v1

**Work package:** `cursor-cross-agent-harvest-ingest-closeout-wave-v1`  
**Status:** CURRENT  
**Owner repo:** Data-Extraction (canonical authority for ingest, staging, inspection)

## Authority split

| Role | Path |
| --- | --- |
| **Canonical source (edit here)** | `Data-Extraction/docs/platform/CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md` |
| **Published operational mirror** | `Z:\Capital-Glass-Dev\Harvest\protocol\CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md` |
| **Sync command** | `npm run harvest:sync-z-mirror` (from CapitalGlass-Cross-Agent) |

Do **not** hand-edit the Z: mirror. Commit changes in Data-Extraction, then run `harvest:sync-z-mirror` and verify the mirror receipt.

## Milestone target

**`END_TO_END_HARVEST_INGEST_PROVEN`**

| Layer | Proven when |
| --- | --- |
| Cross-Agent harvest | `harvest:validate` PASS + `validation-result.json` |
| Data-Extraction classification | `cursor-cross-agent-harvest-v1` → `READY_FOR_INGEST` |
| L: direct staging | Atomic delivery to `incoming/<harvest-id>/` |
| Extraction | Two-pass inspect: PASS → `SKIPPED_IDEMPOTENTLY` + receipt on L: |
| Publication | Operator checklist emitted; **not** claimed by Cursor |

## Protocol anchors

| Topic | Authority |
| --- | --- |
| Thread autopsy + Cursor opener | `Z:\Capital-Glass-Dev\Harvest\protocol\CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md` |
| Record → validate → publication | `Z:\Capital-Glass-Dev\Harvest\protocol\HARVEST-INGESTION-RUNBOOK-v1.md` |
| L: staging boundary | `docs/platform/CURSOR_DIRECT_STAGING_V1.md` (when present) / `config/cursor-direct-staging-v1.json` |
| Scope identity | `docs/platform/HARVEST_SCOPE_IDENTITY.md` |
| Branch investigation | `docs/platform/HARVEST_BRANCH_INVESTIGATION.md` |
| L: 21-package smoke | `docs/platform/CURSOR_DIRECT_STAGING_L21_SMOKE_CHECKLIST.md` |

---

## Non-negotiable boundaries

### Cursor may

- Record harvest artifacts in CapitalGlass-Cross-Agent
- Run `harvest:sync-derived`, `harvest:validate`, `test:harvest`
- Build `cursor-staging-manifest-v1.json` + package hashes
- Write to `L:\02-catalog\cursor-direct-staging-v1\incoming\.partial\<harvest-id>\`
- Atomically rename to `incoming\<harvest-id>\`
- Run Data-Extraction read-only or production inspect (receipts owned by DE)
- Run `harvest:investigate-branch`, `harvest:validate-staging-manifest`
- Prepare AI-cache / Supabase projection **files** (not publish)
- Emit graph contribution envelopes + MG `--dry-run`
- Record Auto v3.2 `session-closeout-v3.2.json`

### Cursor must not

- Claim `HARVEST_COMPLETE` without `harvest:validate` PASS
- Invent `sourceRepo`, `sourceBranch`, `sourceCommitSha`, `packetId`, or finding values
- Claim `READY_FOR_INGEST` without Data-Extraction protocol adapter PASS
- Claim `index:publish`, `harvest:publish-hub-seed`, `FULLY_SEEDED`, or hub freshness without operator receipt
- Overwrite completed L: packages or mutate extraction receipts
- Run `cross-agent-ledger:ingest -- --apply` without operator approval
- Use `--scan-all` on L: SMB as unattended production default

**Fail closed:** If repo/branch/commit/packet identity cannot be proven → `HARVEST_PARTIAL` or `HARVEST_BLOCKED`, never a falsely complete manifest.

---

## Wave model

Execution order: **W0 → WA → WB → WC → WD → WE → WF → WG → WH → WI → WJ → WK**

Stop at first FAIL in WC, WD, WE, or WG unless explicitly downgrading verdict. WF may `BLOCK` on L: mount — complete WC–WE in Git; defer WF–WG to operator.

---

### W0 — Scout preflight and mission lock

**Owner:** CG-AppBuilder-MCP / Cross-Agent index  
**Gate:** `W0_PASS` required before repo grep or implementation

```bash
npm run agent:index:scout -- --json
# fallback (Cross-Agent):
npm run agent:index:preflight -- --query="cursor harvest ingest closeout wave" --json
```

**Pass criteria:**

- [ ] Retrieval code logged (`INDEX_HIT_AI_CACHE` | `INDEX_HIT` | `INDEX_MISS` | `FAILOVER_*`)
- [ ] `harvest-id` assigned and frozen: `harvest-YYYY-MM-DD-<slug>-v1`
- [ ] L: status recorded: `test -d /mnt/l/02-catalog/cursor-direct-staging-v1/incoming`

**Evidence:** Chat retrieval block; `thread-event-inventory.json` stub OK

---

### WA — Protocol and ingest contract hardening

**Owner:** CapitalGlass-Cross-Agent  
**Depends:** W0_PASS

Confirm Cursor opener includes **DATA-EXTRACTION INGEST CONTRACT** in `CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md`.

**Required `harvest-manifest-v1.json` fields:**

- `schemaVersion`: `cross-agent-harvest-manifest-v1@1.0.0`
- `harvestId`, `sourceRepo`, `sourceBranch`
- `sourceCommitSha`: exact 40-character Git SHA (`git rev-parse HEAD`)
- `packets[]` with deterministic `packetId` on every entry

Registry: `Data-Extraction/config/harvest-protocols.v1.json` → `cursor-cross-agent-harvest-v1`

**Pass criteria:**

- [ ] Ingest contract present in opener
- [ ] No invented repo/branch/commit in draft manifest

---

### WB — Thread autopsy and harvest packets

**Owner:** CapitalGlass-Cross-Agent  
**Depends:** W0_PASS, WA_PASS  
**Tier:** T2 if multi-repo, frustration, or >40 turns; else T1

Use full Cursor opener from `CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md`.

**Produce under `artifacts/agent-runs/<harvest-id>/`:**

| Artifact | Role |
| --- | --- |
| `harvest-manifest-v1.json` | Machine authority |
| `thread-autopsy-bundle.json` | Waste, deltas, ROI, friction |
| `thread-event-inventory.json` | Event timeline |
| `code-touch-summary.json` | SHAs from actual git |
| `compact-records/<packet-id>.json` | Per-packet records |
| `seed-packets/` | T2+ atomic seeds |
| `validation-result.json` | After WC |

**Pass criteria:**

- [ ] Applicable packet kinds (8) covered or N/A with reason
- [ ] Waste ledger or `NONE_FOUND` + proof
- [ ] ROI backlog ranked (≥1)
- [ ] No secrets in JSON

---

### WC — Cross-Agent validation chain

**Owner:** CapitalGlass-Cross-Agent  
**Depends:** WB_PASS

```bash
cd ~/repos/CapitalGlass-Cross-Agent
npm run harvest:sync-derived -- <harvest-id>
npm run harvest:render-index
npm run harvest:validate -- <harvest-id>
npm run test:harvest
```

T2+ optional: `harvest:compile-seed-packets`, `harvest:blind-retrieval`

**Pass criteria:**

- [ ] `validation-result.json` verdict PASS
- [ ] `test:harvest` exit 0

---

### WD — Data-Extraction classification

**Owner:** Data-Extraction  
**Depends:** WC_PASS

```bash
cd ~/repos/Data-Extraction
npm run harvest:investigate-branch -- \
  --repo=~/repos/CapitalGlass-Cross-Agent \
  --branch=<current-branch> \
  --base=main \
  --out=artifacts/harvest-investigations/INV-<date>-wave-v1 \
  --json
```

**Pass criteria:**

- [ ] `primarySource.protocolId` = `cursor-cross-agent-harvest-v1`
- [ ] Inventory `state` = `READY_FOR_INGEST` for `<harvest-id>`
- [ ] Not `NO_PRIMARY_SOURCE`

---

### WE — Staging manifest and package hash

**Owner:** Cursor producer (DE schema authority)  
**Depends:** WC_PASS, WD_PASS

Build `cursor-staging-manifest-v1.json` per:

- `schemas/harvest-investigation/cursor-staging-manifest-v1.schema.json`
- `docs/platform/HARVEST_SCOPE_IDENTITY.md`

```bash
npm run harvest:validate-staging-manifest -- \
  --harvest-dir=<package-path> --json
```

**Minimum package files:**

- `cursor-staging-manifest-v1.json`
- `harvest-manifest-v1.json`
- `thread-autopsy-bundle.json`
- `thread-event-inventory.json`
- `code-touch-summary.json`
- `validation-result.json`
- `HARVEST_SUMMARY.md`

**Pass criteria:**

- [ ] Staging manifest validates (`ROUTABLE` or equivalent PASS)
- [ ] `packageHash` stable across two builds with same `frozen-at`
- [ ] `scope` block DECLARED (not inferred-only)

---

### WF — L: atomic staging delivery

**Owner:** Cursor producer  
**Depends:** WE_PASS; L: mounted  
**Catalog:** `L:\02-catalog\cursor-direct-staging-v1`

**Atomic delivery order:**

1. Write all files to `incoming/.partial/<harvest-id>/`
2. Write per-file sha256 inventory
3. Write `cursor-staging-manifest-v1.json` (final `packageHash`)
4. Rename `.partial/<harvest-id>` → `<harvest-id>`

**Collision rules:**

- Existing dir + different hash → `HARVEST_ID_CONTENT_CONFLICT` — STOP
- Same hash → `SKIPPED_IDEMPOTENTLY` — document, do not overwrite

**Pass criteria:**

- [ ] `incoming/<harvest-id>/` exists (not `.partial`)
- [ ] All minimum files present
- [ ] Cursor did not write extraction receipts

---

### WG — Inspect and two-pass determinism

**Owner:** Data-Extraction  
**Depends:** WF_PASS (or `WF_BLOCKED` documented)  
**Mode:** Selected harvest (`--harvest-id`) — not default `--scan-all` on L: SMB

```bash
export FROZEN_AT=2026-08-06T12:00:00.000Z  # freeze for both passes

npm run extract:inspect-cursor-staging -- --json \
  --staging-root=/mnt/l/02-catalog/cursor-direct-staging-v1 \
  --harvest-id=<harvest-id> \
  --frozen-at="$FROZEN_AT"
# repeat pass 2 — expect SKIPPED_IDEMPOTENTLY
```

**Pass criteria:**

- [ ] Pass 1: `PASS`, `scopeDisposition` = `READY_FOR_INGEST`
- [ ] Pass 2: `SKIPPED_IDEMPOTENTLY`
- [ ] Receipt at `receipts/<harvest-id>/<package-hash>/extraction-receipt-v1.json`
- [ ] `hubPublication: false`

---

### WH — Projection prep (operator publishes)

**Owner:** CG-AppBuilder-MCP prep | Operator publish  
**Depends:** WG_PASS  
**Status:** `PREPARE_ONLY` — `NOT_PUBLISHED_BY_CURSOR`

**Operator only (label `NOT_RUN_BY_CURSOR`):**

- `cross-agent-ledger:ingest -- --apply`
- `promptops:project-harvest-prompts`
- `agent-research-library:publish-active-work-ledger`
- `index:freshness-gate`
- `harvest:publish-hub-seed`

---

### WI — Graph contribution (MG dry-run)

**Owner:** Data-Extraction → CG-MASTER-GRAPH  
**Depends:** WD_PASS

```bash
npm run harvest:ingest-pending -- --investigation=artifacts/harvest-investigations/INV-<id> --json
npm run harvest:emit-graph-contributions -- \
  --investigation=artifacts/harvest-investigations/INV-<id> \
  --master-graph-root=~/repos/CG-MASTER-GRAPH \
  --expected-validator-sha=<mg-short-sha> \
  --frozen-at="$FROZEN_AT" \
  --json
```

**Staleness guard:** `branchHeadSha` mismatch → `STALE_BRANCH_INVESTIGATION` — STOP

---

### WJ — Git ship and operator publication checklist

**Owner:** Cross-Agent (git) | Operator (publication)  
**Depends:** WC_PASS minimum

Commit harvest artifacts after WC_PASS. Record pushed SHA; must match manifest `sourceCommitSha` or re-sync manifest.

Emit operator publication checklist (HARVEST-INGESTION-RUNBOOK steps 7–9) — do not claim complete from Cursor.

---

### WK — Wave closeout

**Owner:** All repos (receipts)

```bash
export CG_AUTO_V32_WORK_PACKAGE=cursor-cross-agent-harvest-ingest-closeout-wave-v1
export CG_AUTO_V32_MISSION_CLASS=closeout
export CG_AUTO_V32_MATERIAL=true
npm run agent:preflight:auto-v32 -- --run-compile --json   # CG-AppBuilder-MCP
npm run auto:v3:session-closeout -- \
  --work-package=cursor-cross-agent-harvest-ingest-closeout-wave-v1 \
  --payload=./closeout.json --json
```

**Final summary template:**

```text
VERDICT: <WAVE_CLOSEOUT_COMPLETE | WAVE_PARTIAL | WAVE_BLOCKED>
Milestone: END_TO_END_HARVEST_INGEST_PROVEN <YES|NO|PARTIAL>

Wave gates: W0..WK each PASS|FAIL|SKIP|BLOCKED + evidence path
Retrieval: <code> | harvest-id: <id> | sourceCommitSha: <40-char>
packageHash: <hex> | receiptCoreHash: <hex|NOT_RUN>
Publication: NOT_RUN_BY_CURSOR | Next operator action: <one sentence>
```

---

## Milestone acceptance (all required for `END_TO_END_HARVEST_INGEST_PROVEN`)

1. `harvest-manifest-v1.json` validates as `cross-agent-harvest-manifest-v1`
2. `harvest:validate` PASS + `test:harvest` PASS
3. Data-Extraction investigate → `READY_FOR_INGEST` for `cursor-cross-agent-harvest-v1`
4. `cursor-staging-manifest-v1.json` ROUTABLE with DECLARED scope
5. L: `incoming/<harvest-id>/` atomically delivered
6. Inspect pass1 PASS + pass2 `SKIPPED_IDEMPOTENTLY`
7. `extraction-receipt-v1.json` on L: with `hubPublication: false`
8. No false publication / cache / Supabase / freshness claims
9. Operator publication checklist emitted
10. Auto v3.2 session-closeout recorded

**Partial milestones (honest):**

| Waves complete | Label |
| --- | --- |
| A–D | `CROSS_AGENT_HARVEST_READY` |
| A–F | `STAGING_DELIVERED` |
| G fail | `INSPECT_BLOCKED` |

---

## Cursor mission prompt (copy-paste)

Paste at thread close after `@` the autopsy protocol file.

```text
Run cursor-cross-agent-harvest-ingest-closeout-wave-v1 (gated SDLC).

Authority: Data-Extraction/docs/platform/CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md
Also @ Z:\Capital-Glass-Dev\Harvest\protocol\CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md

Mission class: closeout | Tier: T2 if multi-repo or rework else T1
Freeze harvest-id: harvest-YYYY-MM-DD-<slug>-v1

Execute waves W0 through WK in order. Report PASS|FAIL|BLOCKED after each wave.
Do not skip gates. Do not claim publication, hub seed, Supabase seeded, or freshness PASS from Cursor.

DATA-EXTRACTION INGEST CONTRACT (harvest-manifest-v1.json):
- schemaVersion cross-agent-harvest-manifest-v1@1.0.0
- harvestId, sourceRepo, sourceBranch, sourceCommitSha (40 hex), packets[], deterministic packetId each
- Do not invent missing values → HARVEST_PARTIAL or HARVEST_BLOCKED

After WC: harvest:validate PASS required before WF/WG.
After WC: confirm Data-Extraction READY_FOR_INGEST under cursor-cross-agent-harvest-v1.
After WE: atomic L: delivery to incoming/.partial then rename.
After WG: two-pass extract:inspect with frozen-at; receipt on L: hubPublication false.

Final: wave gate table, milestone verdict, ROI top-3, do-not-advance, next operator action.
```

---

## Related

- `docs/platform/HARVEST_SCOPE_IDENTITY.md`
- `docs/platform/HARVEST_BRANCH_INVESTIGATION.md`
- `docs/platform/CURSOR_DIRECT_STAGING_L21_SMOKE_CHECKLIST.md`
- CapitalGlass-Cross-Agent `harvest/protocol/HARVEST-INGESTION-RUNBOOK-v1.md` (mirrored to Z:)
