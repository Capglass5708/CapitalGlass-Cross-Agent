# active-ledger-drain-and-intelligence-hub-sync-v1

**Status:** Phase 0 PASS — Governance contract READY FOR APPROVAL (blocks Phase 1)  
**Mission class:** `fix`  
**Primary repo:** CG-AppBuilder-MCP (execution)  
**Constitutional owner:** CG-Platform-Governance-MCP  
**Coordination repo:** CapitalGlass-Cross-Agent  
**L: publication owner:** Data-Extraction  
**Mutation repos:** CG-AppBuilder-MCP, Data-Extraction  
**Acceptance probe:** `active-ledger-drain-and-intelligence-hub-sync-v1`

**Six phases, numbered 0–5** (not five).

| Phase | Scope | Result |
| --- | --- | --- |
| 0 | Classify, snapshot, reconcile project files, ROI report | **PASS** |
| 1 | Export/lint (AppBuilder) — **blocked on Governance approval** | Pending |
| 2 | Governance constitutional capture + compounding proof linkage | Pending |
| 3 | Activate trimmed ledger (after export verification) | Pending |
| 4 | Recurring sync, lint, closeout write-back | Pending |
| 5 | Material closeout + observer verification | Pending |

**Baseline (operator-recorded):** 419 lines · 2,480 words · ~5,968 tokens · 16 historical live entries · 3 pending project updates

**Governance contract:** `CG-Platform-Governance-MCP/docs/platform/ACTIVE_LEDGER_RELEASE_AUTHORITY_CONTRACT.md` — **READY FOR APPROVAL**

**Phase 0 evidence:** `archive/2026-08/ledger-snapshots/phase-0-pre-drain/`

**Operating contract:** [TWO_MCP_OPERATING_CONTRACT.md](https://github.com/Capglass5708/CG-Platform-Governance-MCP/blob/main/docs/platform/TWO_MCP_OPERATING_CONTRACT.md)

---

## 1. Problem statement

`CapitalGlass-Cross-Agent/work-progress/ACTIVE_WORK.md` has accumulated high-value operational intelligence:

- Authority rules (Governance vs AppBuilder, GPU host split, Bible gate)
- Commits, verification, and push status across 6+ repos
- Cross-cutting blockers and prioritized next actions
- Architecture decisions (Revu MCP boundary, parser lanes, 5080 tiering)
- Run evidence (Rosewood parser, pilot handoffs, master index sync)

Today this knowledge is:

1. **Human-only** — no MCP tool or CI reads the live ledger
2. **Duplicated** — mirrored imperfectly in `projects/INDEX.md` and project files
3. **Not on L:** — only daily master-work digests sync; live ledger stays git-only
4. **Not in Governance** — constitutional rules are recorded in Markdown but not validated as compounding capture
5. **Growing unbounded** — progress log will keep expanding without archival drain

Agents re-discover the same context every session. Execution receipts in AppBuilder do not flow back. The Intelligence Hub cannot answer "what is active right now?" from machine-readable data.

---

## 2. Authority model

| Layer | Role | Authoritative for |
| --- | --- | --- |
| **CG-Platform-Governance-MCP** | Constitutional capture | Whether drained knowledge counts, compounding proof validation, authority-rule registry |
| **CG-AppBuilder-MCP** | Execution control plane | Export script, ledger lint, lifecycle locator, closeout→ledger draft, MCP read tool |
| **Data-Extraction** | L: publish delegate | `sync-master-index` extension, `BY-KIND/active-work-ledger.json`, operational mirror |
| **CapitalGlass-Cross-Agent** | Human coordination | Live ledger (minimal after drain), project files, archive snapshots |
| **L: Intelligence Hub** | Machine-readable projection | Published slices — never constitutional authority |

**Rule:** Cross-Agent remains the meeting repo. Drain moves **durable knowledge** to owners; it does not move implementation. **Export/lint scripts belong in AppBuilder; L: publication ownership remains with Data-Extraction.**

### Mandatory JSON slice envelope

Every published JSON slice must include: `schemaVersion`, `sourceRepository`, `sourcePath`, `sourceCommitSha`, `generatedAt`, `contentHash`.

### Default preflight policy

`active-work-ledger.json` must **not** be injected into every agent prompt. Default preflight uses **only** compact `active-work-open-actions.json` and `active-work-blockers.json` slices.

### Execution order (mandatory)

```
Phase 0 classification
  → Governance authority document
  → Governance approval
  → Phase 1 export/lint (AppBuilder worktree)
  → Verify L: slices reproduce all data without loss
  → Archive snapshot (immutable — done in Phase 0)
  → Activate trimmed ledger (human commit only)
  → Recurring synchronization
  → Auto v3.2 closeout
```

Do **not** activate trimmed ledger because classification succeeds alone.

### Bounded release-enablement scaffolding

This work package authorizes minimal, owner-aligned scaffolding to export, publish, index, and retrieve ledger data. See Governance contract §5–§6 for permitted additions and prohibitions. No new repos, no implementation code in Cross-Agent, no automated `ACTIVE_WORK.md` rewrite, no full-ledger default prompt injection.

---

## 3. Drain routing matrix

Every ledger entry class routes to exactly one primary owner plus optional projections.

| Ledger content class | Primary owner | Destination path / artifact | Projection |
| --- | --- | --- | --- |
| Authority rules (Governance > AppBuilder) | Governance | `CG-Platform-Governance-MCP/docs/platform/ACTIVE_LEDGER_RELEASE_AUTHORITY_CONTRACT.md` | `BY-KIND/governance-authority-rules.json` on L: |
| Operating rules (Bible gate, meeting capture) | AppBuilder | `CG-AppBuilder-MCP/docs/platform/ACTIVE_LEDGER_OPERATING_RULES.md` (pointer) | Gate fixtures if testable |
| GPU / host authority | Cross-Agent canonical map | `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md` § GPU Host Authority | `BY-KIND/host-authority.json` on L: |
| Work package status + commits | Project files | `work-progress/projects/YYYY-MM-DD_<id>.md` | Lifecycle index in AppBuilder |
| Open next actions | Intelligence Hub | `BY-KIND/active-work-open-actions.json` on L: | Agent Loop mission queue (optional) |
| Cross-cutting blockers | Intelligence Hub + project INDEX | `BY-KIND/active-work-blockers.json` on L: | Failure Intelligence routing (optional) |
| Progress log (historical) | Cross-Agent archive | `archive/2026-08/ledger-snapshots/ACTIVE_WORK-2026-08-02-pre-drain.md` | `cross-agent-master-work/` digest only |
| Decisions (architectural) | Cross-Agent decisions | `decisions/DECISION_LOG.md` | Governance compounding proof envelope |
| Verification evidence | Owning repo artifacts | `artifacts/agent-runs/<wp>/` in mutation repo | AppBuilder lifecycle locator |
| Reusable lessons | Project files + DE operational KB | Project file `## Reusable lessons` | L: `02-capability-library/` when promoted |
| Research pointers | Already canonical | `CANONICAL_KNOWLEDGE_LOCATIONS.md` | No duplicate — verify pointers only |

---

## 4. Target artifacts

### 4.1 Machine-readable export schema (`active-work-ledger-v1`)

```json
{
  "schemaVersion": "1.0.0",
  "sourceRepository": "CapitalGlass-Cross-Agent",
  "sourcePath": "work-progress/ACTIVE_WORK.md",
  "sourceCommitSha": "<sha>",
  "generatedAt": "2026-08-03T03:30:00Z",
  "contentHash": "<sha256>",
  "exportedAt": "2026-08-03T03:30:00Z",
  "currentStatus": {
    "lastUpdated": "2026-08-02",
    "currentFocus": "...",
    "primaryAuthorityRepo": "CG-Platform-Governance-MCP",
    "executionRepo": "CG-AppBuilder-MCP"
  },
  "savedWork": [
    {
      "repo": "CG-Platform-Governance-MCP",
      "commit": "8ebcdf4",
      "status": "Pushed",
      "workPackageId": "north-star-compounding-proof-v1"
    }
  ],
  "openActions": [
    {
      "priority": 1,
      "action": "Restart MCP for Governance tools",
      "ownerRepo": "Cursor / local MCP runtime",
      "status": "Pending",
      "workPackageId": null
    }
  ],
  "blockers": [
    {
      "id": "mcp-restart-governance-tools",
      "affects": ["north-star-compounding-proof-v1"],
      "owner": "Cursor / operator",
      "requiredAction": "Restart MCP in Cursor"
    }
  ],
  "authorityRules": [
    {
      "id": "governance-counts-work",
      "rule": "Governance decides what must be captured and whether completed work counts",
      "source": "ACTIVE_WORK.md § North Star / Governance work"
    }
  ],
  "projectPointers": [
    {
      "workPackageId": "north-star-compounding-proof-v1",
      "projectFile": "work-progress/projects/2026-08-01_north-star-compounding-proof-v1.md",
      "status": "Pushed"
    }
  ],
  "drainReceipt": {
    "drainedAt": null,
    "archivePath": null,
    "governanceProofId": null,
    "hubPublishPath": null
  }
}
```

### 4.2 L: Intelligence Hub publish targets

| L: path | Purpose |
| --- | --- |
| `00-master-index/BY-KIND/active-work-ledger.json` | Live machine-readable ledger slice |
| `00-master-index/BY-KIND/active-work-open-actions.json` | Prioritized action queue |
| `00-master-index/BY-KIND/active-work-blockers.json` | Cross-cutting blockers |
| `00-master-index/BY-KIND/host-authority.json` | GPU/host role assignments |
| `00-master-index/cross-agent-master-work/LATEST.md` | Human digest (existing) |
| `00-master-index/INDEX.json` | Add `activeWorkLedger` pointer + counts |

### 4.3 Governance artifacts

| Artifact | Location |
| --- | --- |
| Work package authority doc | `CG-Platform-Governance-MCP/docs/work-packages/active-ledger-drain-and-intelligence-hub-sync-v1.md` |
| Drained authority rules registry | `CG-Platform-Governance-MCP/docs/platform/ACTIVE_LEDGER_AUTHORITY_RULES.md` |
| Compounding proof envelope | `artifacts/agent-runs/active-ledger-drain-and-intelligence-hub-sync-v1/` |
| Material preflight receipt | `governance-material-preflight-v1.json` |

### 4.4 AppBuilder execution artifacts

| Artifact | Location |
| --- | --- |
| Export script | `CG-AppBuilder-MCP/scripts/active-ledger/export-active-work-ledger.mjs` |
| Lint script | `CG-AppBuilder-MCP/scripts/active-ledger/lint-active-work-ledger.mjs` |
| Closeout draft generator | `CG-AppBuilder-MCP/scripts/active-ledger/draft-ledger-entry-from-closeout.mjs` |
| MCP read tool (optional) | `cross_agent_get_active_work` in Agent Loop or AppBuilder MCP |
| Lifecycle locator | `runtime/work-package-lifecycle-index/active-ledger-drain-and-intelligence-hub-sync-v1.json` |
| Non-authoritative pointer | `CG-AppBuilder-MCP/docs/work-packages/active-ledger-drain-and-intelligence-hub-sync-v1.md` |

### 4.5 Cross-Agent post-drain state

After Phase 3, `ACTIVE_WORK.md` retains only:

- Rules (unchanged)
- Required entry format (unchanged)
- **Current active status** (refreshed)
- **Current saved work** (only unpushed or active repos)
- **Open next actions** (refreshed from hub export, not duplicated history)
- **Progress log** — last 3 entries max; older entries in archive

Archive:

```text
archive/2026-08/ledger-snapshots/
  ACTIVE_WORK-2026-08-02-pre-drain.md
  active-work-ledger-v1-2026-08-02.json
  DRAIN_RECEIPT.md
```

---

## 5. Phase plan

### Phase 0 — Classify and reconcile (Cross-Agent + operator)

**Goal:** Every ledger entry has a drain destination; no orphan knowledge.

| Step | Action | Owner |
| --- | --- | --- |
| 0.1 | Inventory all progress log entries in `ACTIVE_WORK.md` | Cross-Agent |
| 0.2 | Map each entry to drain routing matrix (§3) | Cross-Agent |
| 0.3 | Resolve pending project file updates (`docling`, `unstructured`, `revu-opening`) | Cross-Agent |
| 0.4 | Reconcile `projects/INDEX.md` blockers with ledger open actions | Cross-Agent |
| 0.5 | Confirm GPU host authority already in `CANONICAL_KNOWLEDGE_LOCATIONS.md` | Cross-Agent |

**Exit criteria:** Classification spreadsheet or `DRAIN_CLASSIFICATION.md` in plan folder; zero "ledger update pending" in project files.

---

### Phase 1 — Export and Intelligence Hub publish (AppBuilder + Data-Extraction)

**Goal:** Machine-readable ledger on L:; agents can query active work without parsing Markdown.

| Step | Action | Owner |
| --- | --- | --- |
| 1.1 | Implement `export-active-work-ledger.mjs` — parse ACTIVE_WORK.md → `active-work-ledger-v1.json` | AppBuilder |
| 1.2 | Add npm script: `npm run active-ledger:export -- --repo=<cross-agent-path> --json` | AppBuilder |
| 1.3 | Extend `agent-research-library:sync-master-index` to ingest export JSON | Data-Extraction |
| 1.4 | Publish `BY-KIND/active-work-ledger.json` + open-actions + blockers slices to L: | Data-Extraction |
| 1.5 | Update `INDEX.json` counts and `AGENT_BUILD_CATALOG.json` pointer | Data-Extraction |
| 1.6 | Verify L: paths match `CANONICAL_KNOWLEDGE_LOCATIONS.md` | Operator |

**Exit criteria:**

```powershell
# Export succeeds
cd C:\Developer\repos\CG-AppBuilder-MCP
npm run active-ledger:export -- --repo=C:\Developer\repos\CapitalGlass-Cross-Agent --json

# Hub sync succeeds
cd C:\Developer\repos\Data-Extraction
npm run agent-research-library:sync-master-index

# L: file exists
Test-Path "L:\Capital-Glass-Intelligence-Hub\00-master-index\BY-KIND\active-work-ledger.json"
```

---

### Phase 2 — Governance constitutional capture (Governance)

**Goal:** Authority rules and drain operation validated as compounding capture.

| Step | Action | Owner |
| --- | --- | --- |
| 2.1 | Create authority doc in Governance (copy from this plan §2–§3) | Governance |
| 2.2 | Extract authority rules from ledger → `ACTIVE_LEDGER_AUTHORITY_RULES.md` | Governance |
| 2.3 | Run `governance_run_material_preflight` for this work package | AppBuilder delegate |
| 2.4 | Attach drain receipt to compounding proof envelope | Governance |
| 2.5 | Validate with `governance_validate_compounding_proof` | Governance MCP |

**Exit criteria:** Material preflight PASS; compounding proof AUTHORIZED for drain operation.

---

### Phase 3 — Archive and clear live ledger (Cross-Agent)

**Goal:** ACTIVE_WORK.md is scannable; history is archived, not lost.

| Step | Action | Owner |
| --- | --- | --- |
| 3.1 | Snapshot full `ACTIVE_WORK.md` to `archive/2026-08/ledger-snapshots/` | Cross-Agent |
| 3.2 | Snapshot export JSON alongside archive | Cross-Agent |
| 3.3 | Write `DRAIN_RECEIPT.md` listing what went where | Cross-Agent |
| 3.4 | Trim progress log to last 3 entries; move detail to project files | Cross-Agent |
| 3.5 | Reset open next actions to current-only (remove completed) | Cross-Agent |
| 3.6 | Update `ACTIVE_WORK.md` current status with drain completion entry | Cross-Agent |
| 3.7 | Commit: `docs: drain active ledger to intelligence hub (active-ledger-drain-and-intelligence-hub-sync-v1)` | Cross-Agent |

**Exit criteria:** Archive exists; live ledger < 150 lines; all historical entries reachable via archive + project files + L: JSON.

---

### Phase 4 — Recurring sync and automation (AppBuilder)

**Goal:** Ledger does not re-accumulate without draining.

| Step | Action | Owner |
| --- | --- | --- |
| 4.1 | Implement `lint-active-work-ledger.mjs` — required fields, project file parity, no secrets | AppBuilder |
| 4.2 | Add `npm run active-ledger:lint` to closeout gate advisory checks | AppBuilder |
| 4.3 | Implement `draft-ledger-entry-from-closeout.mjs` — session closeout → ledger entry draft | AppBuilder |
| 4.4 | Document weekly drain cadence in `runbooks/AGENT_LEDGER_UPDATE_RUNBOOK.md` | Cross-Agent |
| 4.5 | Optional: `cross_agent_get_active_work` MCP tool reading L: JSON | Agent Loop / AppBuilder |

**Recurring cadence:**

| Trigger | Action |
| --- | --- |
| After material closeout | Generate ledger entry draft; operator reviews and commits |
| Weekly (or >10 progress log entries) | Run export → hub sync → archive trim |
| On `closeout:gate` advisory | Lint ledger parity if `CG_ACTIVE_LEDGER_LINT=true` |

---

### Phase 5 — Material closeout (Governance + AppBuilder)

**Goal:** Work package counts under Governance compounding proof.

```powershell
$env:CG_AUTO_V32_WORK_PACKAGE='active-ledger-drain-and-intelligence-hub-sync-v1'
$env:CG_AUTO_V32_MISSION_CLASS='fix'
$env:CG_AUTO_V32_MATERIAL='true'
cd C:\Developer\repos\CG-AppBuilder-MCP
npm run agent:preflight:auto-v32 -- --run-compile --json
npm run agent:preflight:app-builder-mcp
```

Closeout payload must include:

- Export script path + sample JSON hash
- L: publish verification (paths only, no secrets)
- Archive path in Cross-Agent
- Governance compounding proof receipt ID
- `enhancementRecommendations[]` per North Star closeout

```powershell
npm run auto:v3:session-closeout -- --work-package=active-ledger-drain-and-intelligence-hub-sync-v1 --payload=./closeout.json --json
npm run closeout:gate
```

**Exit criteria:** `governance_run_closeout_validation` AUTHORIZED; lifecycle locator current; observer PASS.

---

## 6. Initial drain inventory (2026-08-02 baseline)

Content currently in `ACTIVE_WORK.md` that must drain:

| Entry / section | Drain target | Status |
| --- | --- | --- |
| Governance > AppBuilder authority rule | Governance `ACTIVE_LEDGER_AUTHORITY_RULES.md` | Pending |
| Bible gate rule | AppBuilder gate docs (already exists; verify pointer) | Pending |
| GPU host authority (WESLEYDESK vs RYZEN9DESK) | `CANONICAL_KNOWLEDGE_LOCATIONS.md` + L: `host-authority.json` | Partially done |
| 6-repo saved work table | L: `active-work-ledger.json` + lifecycle index | Pending |
| 5 open next actions | L: `active-work-open-actions.json` | Pending |
| 6 cross-cutting blockers (INDEX.md) | L: `active-work-blockers.json` | Pending |
| north-star-compounding-proof-v1 log | Project file (exists) + Governance artifacts | Done |
| cross-agent master work L: ingest | L: `cross-agent-master-work/` (exists) | Done |
| Rosewood parser run evidence | Project file `revu-opening-detection-top10-v1` | Partially done |
| Revu MCP boundary decision | Project file + `decisions/DECISION_LOG.md` | Pending |
| L: master index canonical front door | `CANONICAL_KNOWLEDGE_LOCATIONS.md` (exists) | Done |
| Proposal stack 9/10 pilot | Project file `agent-research-library-layout-v1` | Done |
| Revu opening 8/10 pilot | Project file `revu-opening-detection-top10-v1` | Done |

---

## 7. Verification checklist

| Check | Command / path | Expected |
| --- | --- | --- |
| Export produces valid JSON | `npm run active-ledger:export -- --json` | `schemaVersion: 1.0.0` |
| Lint passes | `npm run active-ledger:lint` | PASS |
| L: slice exists | `BY-KIND/active-work-ledger.json` | Readable, counts match |
| Archive snapshot exists | `archive/2026-08/ledger-snapshots/` | Pre-drain MD + JSON |
| Live ledger trimmed | `ACTIVE_WORK.md` line count | < 150 lines |
| Project files current | `projects/INDEX.md` | No "ledger update pending" |
| Governance preflight | `governance_run_material_preflight` | PASS |
| Compounding proof | `governance_validate_compounding_proof` | AUTHORIZED |
| Closeout gate | `npm run closeout:gate` | PASS |
| Parity | Export `sourceCommitSha` vs git HEAD | Match |

---

## 8. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Knowledge lost during drain | Archive snapshot before any trim; git history preserved |
| L: out of sync with git | Export includes `sourceCommitSha`; lint checks drift |
| Triplicate status returns | Single canonical open-actions in L: JSON; INDEX references hub |
| Secrets in export | Lint blocks patterns; export script redacts |
| Cross-Agent becomes implementation repo | All scripts live in AppBuilder; Cross-Agent docs only |
| Governance not consulted | Phase 2 material preflight before archive trim |

---

## 9. Enhancement recommendations (for closeout)

| ID | Classification | Recommendation |
| --- | --- | --- |
| ER-1 | `immediate-fix` | Resolve 3 pending project file ledger updates before Phase 3 |
| ER-2 | `next-work-package` | `cross-agent-get-active-work-mcp-v1` — MCP read tool on L: JSON |
| ER-3 | `next-work-package` | Failure Intelligence routing from `active-work-blockers.json` |
| ER-4 | `architecture-candidate` | Bi-directional closeout ↔ ledger sync with operator approval gate |
| ER-5 | `reject` | Auto-trim ledger without archive — too risky |

---

## 10. Dependencies

| Dependency | Blocks | Resolution |
| --- | --- | --- |
| MCP restart for Governance tools | Phase 2 preflight | Operator restarts Cursor MCP |
| Auto v3.2 env contamination | Phase 5 closeout | Clear `CG_AUTO_V32_*` vars |
| `sync-master-index` extension | Phase 1 L: publish | Data-Extraction mutation |
| Canonical AppBuilder worktree | Phase 1 scripts | Use `C:\Developer\worktrees\CG-AppBuilder-MCP\active-ledger-drain-v1` |

---

## 11. Success definition

When this work package is complete:

1. **ACTIVE_WORK.md** is a thin live surface — current status, open actions, last 3 log entries.
2. **L: Intelligence Hub** answers "what is active now?" via `BY-KIND/active-work-ledger.json`.
3. **Governance** owns drained authority rules and validates the drain as compounding capture.
4. **Archive** preserves full pre-drain ledger with receipt.
5. **Recurring cadence** prevents unbounded re-accumulation.
6. **No knowledge lost** — every drained item has a durable owner path.

---

## 12. Related work packages

| Work package | Relationship |
| --- | --- |
| `north-star-compounding-proof-v1` | Governance authority model this drain follows |
| `north-star-compounding-vertical-pilot-v1` | Next recommended WP after operator blockers cleared |
| `cross-agent-master-work-ingest-v1` | Prior L: publish pattern for master work docs |
| `agent-research-library-layout-v1` | Master index sync infrastructure to extend |
