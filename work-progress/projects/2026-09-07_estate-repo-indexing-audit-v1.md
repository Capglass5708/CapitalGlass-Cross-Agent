# Project: estate-repo-indexing-audit-v1

## Summary

Full-estate audit of federated repo-index coverage across all 41 GitHub repositories in the
`Capglass5708` account, plus an execution-ready remediation runbook.

**Coverage against the root authority: 30 of 31 governed-active repos are indexed (96.8%).**
One governed gap (`CG-Web-Agent`), nine repos outside the manifest entirely, four drifted indexes,
and one high-severity structural defect: the derived registry layer no longer matches the manifest
it is derived from.

| Artifact | Path |
| --- | --- |
| Machine-readable audit | `registry/git-estate/repo-indexing-audit.v1.json` (schema v2.0.0, 41 records) |
| Remediation runbook | `runbooks/ESTATE_REPO_INDEXING_REMEDIATION_RUNBOOK.md` |

## Workspace

| Field | Value |
| --- | --- |
| Work package | `estate-repo-indexing-audit-v1` |
| Date opened | 2026-09-07 |
| Source | Wesley → Claude Code |
| Coordination repo | CapitalGlass-Cross-Agent (this record) |
| Compiler authority | CG-AppBuilder-MCP |
| Related programs | `cg-federated-repo-index-estate-100-v1`, `cg-federated-repo-index-v1` |

## Authority / ownership rule

This repo records the audit; it does not own the index. The root authority for what the estate *is*
is a single file:

```
CG-AppBuilder-MCP  scripts/wsl/wsl-repo-library-manifest.v1.json  →  repositories[]
```

Everything else — seed bank, estate routing, capability index, CI enforcement registry, every repo's
local index, and the slices published into this repo — is **derived** from it. Remediation is a
compiler run in the owning repo, never a hand edit.

## Correction — v1.0.0 of this audit was wrong in three places

The first pass classified coverage against `registry/federated-repo-index/ci-enforcement-registry.v1.json`.
That file is derived, and it is stale. Three findings do not survive contact with the root manifest:

| v1 finding | Actual state |
| --- | --- |
| `Computer Estimator` has no published index | Its manifest row was **deleted** on 2026-09-05 (`e5ce13fa`, "Admit the governed manifest before anything derives authority from it"). One estimator identity survives — `Computer-Estimator-glazing-spine` — and it **is** published, in GitHub repo `Computer-Estimator-`. Nothing is missing. |
| `Computer-Estimator-glazing-spine` hosting unresolved | It is the surviving identity and correctly owns `Computer-Estimator-`. Not a defect. |
| `capital-glass-developer-memory` should be retired from the target set | Already done in that same commit: `governanceStatus: excluded`, `exclusionReason: ARCHIVED_READ_ONLY`, with an `exclusionNote`. |

AppBuilder had already built the machinery for both cases —
`scripts/federated-repo-index/lib/governed-manifest-admission.mjs` names the duplicate-estimator row and
the archived developer-memory row in its own header as the two defects it exists to prevent.

The real defect those symptoms pointed at is recorded below as finding 1.

## Findings

### 1. The derived layer no longer matches the manifest (HIGH)

The manifest was corrected on 2026-09-05 and extended on 2026-09-07. No derived artifact has fully
caught up.

| Artifact | As-of | Wrong how |
| --- | --- | --- |
| `estate-routing.v1.json` | 2026-09-06T14:24Z | 31 routes, missing `CG-Web-Agent` |
| `ci-enforcement-registry.v1.json` | committed 2026-09-05T15:19Z | Enforces `Computer Estimator` (deleted identity) and `capital-glass-developer-memory` (declared excluded); omits `CG-Web-Agent` |
| `seed-bank/` | committed 2026-09-05T15:19Z | Stale `Computer Estimator.seed.v1.json`; no `CG-Web-Agent.seed.v1.json` |
| Cross-Agent published slice | 2026-09-03T23:41Z | Two generations behind — **and this is the copy other agents actually read** |

Two enforced rows can never be satisfied by anything, so a 100% estate proof against the current
registry is unreachable by construction. The published slice still advertises a `Computer Estimator`
route pointing at `/home/wesle/repos/Computer Estimator` — a machine path with no GitHub remote.

Runbook step 2.

### 2. `CG-Web-Agent` — the one governed coverage gap (HIGH)

Admitted to the manifest 2026-09-07T03:18Z (`5c698b33`). `GOVERNED_BUT_UNOBSERVED`: listed, active,
actively developed (pushed 2026-09-07), projection unreadable. No seed, no route, no index — its
`index/` directory holds an unrelated `index/latest` tree. Runbook steps 3–5.

### 3. Nine repos outside the manifest entirely (HIGH → LOW)

No manifest row, so the estate can neither see them nor report them missing. `ABSENCE IS NEVER
EXCLUSION` — leaving them out is not a decision.

`CG-MASTER-GRAPH` (HIGH, active, three unresolvable capabilities, hand-authored v1 index 9 commits
behind) · `Rewire` (MED) · `capital-glass-estimating-parser` (MED) · `capital-glass-idea-vault` ·
`capital-glass-research-intel` · `cursor-supabase-platform` · `capitalglass-contacts` · `WatchDog` ·
`capital-glass-marketing-ops` (all LOW)

Runbook step 7 — needs Wesley's adopt-or-retire decision.

### 4. Four drifted indexes, and the reason they drifted (LOW, but the cause is HIGH)

`CapitalGlass-Cross-Agent` (5 commits) · `capital-glass-project-dashboard` (2) · `CG-AppBuilder-MCP` (1)
· `Cursor-ProposalGenerator` (1).

Cause is structural: `perRepoNativeCi: AVAILABLE_NOT_ENFORCED`, `perRepoNativeCiCallers: []`. The
reusable workflow, the caller template and the propagation script all exist in CG-AppBuilder-MCP, but
no governed repo has the caller installed, so nothing re-indexes a repo when it changes. Regenerating
these four clears the symptom and buys nothing durable. Runbook step 6.

## Method

| Question | Source |
| --- | --- |
| What repos exist? | `list_repos` for the account — 41 repositories |
| What is governed? | `CG-AppBuilder-MCP@04f81628` `scripts/wsl/wsl-repo-library-manifest.v1.json` — 32 rows, 31 active + 1 excluded |
| Is an index published? | GitHub contents listing of `index/` per repo |
| Is it fresh? | Blobless partial clone per repo; `LAST_INDEXED_SHA` compared against origin HEAD **and** against the commit that last wrote the index file |

Drift is measured against the index-publication commit. `LAST_INDEXED_SHA` is
`OBSERVED_HEAD_AT_GENERATION`, so the publishing commit always lands after generation; measuring
naively reports all 30 indexed repos as stale when only 4 are.

## Verification

Read-only audit. No manifest, index, seed, routing file or enforcement registry was modified.

```bash
git clone --filter=blob:none --no-checkout --depth 60 https://github.com/Capglass5708/<repo> r
git -C r show HEAD:index/cg-federated-repo-index.v1.json      # read LAST_INDEXED_SHA
git -C r log -1 --format=%H -- index/cg-federated-repo-index.v1.json
git -C r rev-list --count <index-file-commit>..HEAD           # 0 = current
```

Every one of the 14 `npm run` commands cited in the runbook was cross-checked against the
`package.json` of the repo it runs in. `run-validate-governed-manifest-admission.mjs` has no npm
alias and is invoked directly — the runbook says so.

`node scripts/tests/run-cross-agent-architecture-matrix.test.mjs`: 8 of 16 lanes fail
(`HARVEST_CORE`, `PUBLICATION_HARDENING`, `LAYERED_VERDICT`, `CONTENT_FRESHNESS`,
`INTELLIGENCE_INGEST`, `INTELLIGENCE_FIRST_REAL_MISSION`, `INTELLIGENCE_VERIFICATION`, `PHASE_B`).
Verified identical on a clean baseline by stashing and re-running — pre-existing, unrelated.

## Next actions

Full detail, with commands and acceptance criteria, in
`runbooks/ESTATE_REPO_INDEXING_REMEDIATION_RUNBOOK.md`.

| # | Action | Owner repo | Blocked on | Status |
| --- | --- | --- | --- | --- |
| 1 | Preconditions: ext4 host, `CG_REPOS_ROOT`, `gh` auth, clean AppBuilder tree | — | WSL2 host access | OPEN |
| 2 | Reconcile the derived layer with the admitted manifest | CG-AppBuilder-MCP | 1 | OPEN |
| 3 | Seed `CG-Web-Agent` | CG-AppBuilder-MCP | 2 | OPEN |
| 4 | Generate + publish the `CG-Web-Agent` index | CG-Web-Agent | 3 | OPEN |
| 5 | Republish the estate slices into this repo | CG-AppBuilder-MCP → Cross-Agent | 4 | OPEN |
| 6 | Wire per-repo CI callers, then clear the 4 drifted indexes | CG-AppBuilder-MCP + ~30 repos | 5 | OPEN |
| 7 | Adopt-or-exclude the 9 ungoverned repos | Wesley decides; AppBuilder executes | Wesley | OPEN |

Steps 2–6 cannot be done from a cloud session — they need the local ext4 checkouts.

## Reusable lessons

- **Never classify estate coverage against a derived artifact.** The manifest is the authority; the
  enforcement registry, routing and seed bank are outputs. v1.0.0 of this audit read the output and
  reported three already-fixed defects as live.
- A routing entry is not an index. `localIndexPath` says where an index *would* live.
- `REPO_ID` inside a published index is the identity that matters, not the repo it sits in.
  `Computer-Estimator-` is indexed as `Computer-Estimator-glazing-spine`, and that is correct.
- `localRepoRoot` can name a working directory with no GitHub remote, so a route can look healthy on
  the compiler host and be unreachable from anywhere else. `repo-index:validate-no-machine-paths`
  exists for exactly this.
- Drift measured from `LAST_INDEXED_SHA` alone over-reports; measure from the commit that wrote the
  index file.
- When an estate looks broken in a way that seems obvious, check whether the owning repo already
  built the fix. Here it had — the admission module names both "defects" in its own header.
