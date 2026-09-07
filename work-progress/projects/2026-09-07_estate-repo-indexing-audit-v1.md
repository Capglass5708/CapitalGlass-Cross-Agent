# Project: estate-repo-indexing-audit-v1

## Summary

Full-estate audit of federated repo-index coverage across all 41 GitHub repositories in the
`Capglass5708` account, answering one question: **which repos need to be indexed?**

Result: **26 of 43 audited entries are current.** 17 need action — 2 governed identities have no
usable index, 1 governed entry should be retired rather than indexed, 10 repos sit entirely outside
the governed target set, and 4 conformant indexes have drifted behind their repo.

Machine-readable record: `registry/git-estate/repo-indexing-audit.v1.json`.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `estate-repo-indexing-audit-v1` |
| Date opened | 2026-09-07 |
| Source | Wesley → Claude Code |
| Coordination repo | CapitalGlass-Cross-Agent (this record) |
| Compiler authority | CG-AppBuilder-MCP |
| Related program | `cg-federated-repo-index-estate-100-v1`, `cg-federated-repo-index-v1` (Wave A) |

## Authority / ownership rule

This repo records the audit. It does **not** own the index. CG-AppBuilder-MCP owns estate routing,
the seed bank and the compiler; each owner repo owns its own local index. Nothing here should be
fixed by hand-editing an index file — every remediation below is a compiler run in the owning repo.

## Method

| Question | Source |
| --- | --- |
| What repos exist? | `list_repos` for the `Capglass5708` account — 41 repositories |
| What is governed? | `CG-AppBuilder-MCP@04f81628` `registry/federated-repo-index/ci-enforcement-registry.v1.json` → `enforcedRepos` (32) + `seed-bank/` (31 seeds) |
| What routes? | `work-progress/intelligence-hub-slices/federated-estate-routing.json` (32 routes, published 2026-09-03) |
| Is an index published? | GitHub contents listing of `index/` per repo |
| Is it fresh? | Blobless partial clone per repo; `LAST_INDEXED_SHA` compared against origin HEAD **and** against the commit that last wrote the index file |

Drift is measured as commits after the index-publication commit, so the structural one-commit
publication lag is excluded and `0` genuinely means current.

## Findings — repos that need indexing

### 1. `Computer Estimator` — INDEX_MISSING (HIGH)

The plan-vision identity is enforced, seeded (`seed-bank/Computer Estimator.seed.v1.json`) and routed
(`domain: plan-vision`, `localRepoRoot: /home/wesle/repos/Computer Estimator`) — but **no index for it
exists on GitHub**. The only estimator repository, `Computer-Estimator-`, carries an index whose
`REPO_ID` is `Computer-Estimator-glazing-spine`.

This is the highest-value gap in the estate. `Computer Estimator` owns `admission-router`,
`opening-detection` and `vision-plane`, plus the `rtx5080-plan-vision-intelligence-plane-v1` program.
It is also exactly what `cg-federated-repo-index-v1` Wave A close depends on: that gate requires
`ESTATE_ROUTE_HIT` + `LOCAL_INDEX_HIT` for both Vision Plane and `admit_structure`, and no published
index can satisfy it today.

### 2. `Computer-Estimator-glazing-spine` — IDENTITY_HOSTING_UNRESOLVED (HIGH)

Enforced, seeded and routed to `/home/wesle/repos/Computer-Estimator-glazing-spine`, but no such
GitHub repository exists and the git-estate manifest holds no record for it. Its index currently
occupies `Computer-Estimator-`. Decide whether glazing-spine is a distinct repo or a lane of
Computer Estimator, then re-home the index. Must be resolved together with finding 1 — the two
identities share one GitHub repo.

### 3. `CG-MASTER-GRAPH` — ADOPT_THEN_REINDEX (HIGH)

Actively developed (pushed 2026-09-06) and self-declares ownership of the `master-graph` and
`glazing-estimating-knowledge` domains with capabilities `graph-compile`, `glazing-knowledge-pack`
and `graph-intelligence-audit` — **none of which the estate router can resolve**, because the repo is
absent from `enforcedRepos`, from the seed bank and from estate routing.

Its index is hand-authored, not compiler-generated: schema v1 only, no `schemaVersion: v2`, no
`provenance` block, `INDEX_INPUT_DIGEST` holds a work-package id instead of a sha256, and there is no
`compounding-aliases.v1.json`. It is also 9 commits behind. Adopt it into the target set, then
regenerate.

### 4. Nine repos outside the governed set — TRIAGE_THEN_INDEX_OR_RETIRE

No `enforcedRepos` entry, no seed, no route, no index. Each needs an adopt-or-retire decision;
either way they must stop being invisible to the federated index.

| Repo | Last push | Severity | Note |
| --- | --- | --- | --- |
| `CG-Web-Agent` | 2026-09-07 | HIGH | Actively developed. Has an unrelated `index/latest` directory, no federated index |
| `Rewire` | 2026-09-02 | MEDIUM | Active |
| `capital-glass-estimating-parser` | 2026-08-12 | MEDIUM | Name overlaps the estimating spine — confirm it is not a superseded parser lane |
| `capital-glass-idea-vault` | 2026-08-14 | LOW | Low activity |
| `capital-glass-research-intel` | 2026-07-20 | LOW | Dormant |
| `cursor-supabase-platform` | 2026-07-20 | LOW | Dormant |
| `capitalglass-contacts` | 2026-07-15 | LOW | Name collides with governed `capital-glass-contacts`; likely superseded |
| `WatchDog` | 2026-06-25 | LOW | Dormant |
| `capital-glass-marketing-ops` | 2026-06-05 | LOW | Dormant |

### 5. `capital-glass-developer-memory` — REMOVE_FROM_TARGET_SET (MEDIUM)

The one governed entry that should **not** be indexed. It carries `DECOMMISSIONED.md` (2026-05-31,
superseded by `capital-glass-agent-ops`) and is archived on GitHub, yet it still holds an
`enforcedRepos` slot and a seed-bank seed. Retire both. While it stands, a clean 100% estate-index
proof is unreachable by construction.

### 6. Four indexes have drifted — REINDEX_RECOMMENDED

Conformant v2 indexes whose repo has moved past them:

| Repo | Commits ahead of index publication |
| --- | --- |
| `CapitalGlass-Cross-Agent` | 5 |
| `capital-glass-project-dashboard` | 2 |
| `CG-AppBuilder-MCP` | 1 |
| `Cursor-ProposalGenerator` | 1 |

## Root cause behind the drift

`ci-enforcement-registry.v1.json` reports `perRepoNativeCi: AVAILABLE_NOT_ENFORCED` with
`perRepoNativeCiCallers: []`. The workflow (`.github/workflows/federated-index-check.yml`) and a
caller template exist, but **no repo has wired the caller**. Enforcement is entirely central: the
AppBuilder prover checks the estate when someone runs it, and nothing re-indexes a repo when that
repo changes.

Every drift row above is a symptom of that, not a per-repo mistake. Re-running the compiler clears
today's drift and buys nothing durable; wiring the per-repo caller is what stops it recurring.

## Secondary observations

- The 2026-09-05 baseline sweep was generated on one host (`DESKTOP-DQ67FAC` / `cg_nimo_01`) between
  05:53 and 05:54 UTC and pushed ~14:37–14:39 UTC. Indexes therefore record pre-publication SHAs by
  design (`lastIndexedShaMeaning: OBSERVED_HEAD_AT_GENERATION`) — a one-commit lag is expected and is
  excluded from the drift counts above.
- `Cursor-ProposalGenerator` and `CG-MASTER-GRAPH` are the only indexed repos missing
  `index/compounding-aliases.v1.json`. Cursor-ProposalGenerator was indexed in a separate, earlier
  run (2026-09-05T02:05) rather than in the main sweep.
- `CG-AppBuilder-MCP` has no seed in its own seed-bank; its seed lives at
  `index/repo-index.seed.v1.json`. Expected for the compiler host — recorded so the 31-vs-32 seed
  count is not misread as a gap.

## Evidence / artifact paths

| Artifact | Path | Status |
| --- | --- | --- |
| Audit record (machine-readable) | `registry/git-estate/repo-indexing-audit.v1.json` | CURRENT |
| This project file | `work-progress/projects/2026-09-07_estate-repo-indexing-audit-v1.md` | CURRENT |
| Governed target set | `CG-AppBuilder-MCP` `registry/federated-repo-index/ci-enforcement-registry.v1.json` | READ @ `04f81628` |
| Seed bank | `CG-AppBuilder-MCP` `registry/federated-repo-index/seed-bank/` | READ @ `04f81628` |
| Estate routing | `work-progress/intelligence-hub-slices/federated-estate-routing.json` | READ |
| Estate manifest | `registry/git-estate/git-estate-manifest.v1.json` | READ (30 records) |

## Verification

Read-only audit. Every conclusion is reproducible from a live GitHub read:

```bash
# index presence
git ls-remote https://github.com/Capglass5708/<repo> HEAD

# index freshness, per repo
git clone --filter=blob:none --no-checkout --depth 60 https://github.com/Capglass5708/<repo> r
git -C r show HEAD:index/cg-federated-repo-index.v1.json   # read LAST_INDEXED_SHA
git -C r log -1 --format=%H -- index/cg-federated-repo-index.v1.json
git -C r rev-list --count <index-file-commit>..HEAD        # 0 = current
```

No index, seed, routing file or enforcement registry was modified by this audit.

## Next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Resolve the Computer Estimator / glazing-spine identity split and publish a real plan-vision index | CG-AppBuilder-MCP + Computer Estimator | OPEN |
| 2 | Wire `federated-index-check.yml` callers per repo so indexes refresh on change | CG-AppBuilder-MCP | OPEN |
| 3 | Adopt `CG-MASTER-GRAPH` into `enforcedRepos` + seed bank + routing, then regenerate | CG-AppBuilder-MCP | OPEN |
| 4 | Adopt-or-retire decision on the 9 ungoverned repos, starting with `CG-Web-Agent` | Wesley + CG-AppBuilder-MCP | OPEN |
| 5 | Retire `capital-glass-developer-memory` from `enforcedRepos` and the seed bank | CG-AppBuilder-MCP | OPEN |
| 6 | Regenerate the 4 drifted indexes (only after 2, so it does not recur) | owning repos | OPEN |

## Reusable lessons

- A routing entry is not an index. All 32 routes declare `localIndexPath`, which says where an index
  *would* live — not that one exists. Coverage has to be proven by reading the file in the owner repo.
- `REPO_ID` inside a published index is the identity that matters, not the repo it sits in.
  `Computer-Estimator-` looks indexed from the outside and is in fact indexed as a different repo.
- `localRepoRoot` in estate routing can name a working directory that has no GitHub remote at all, so
  a route can look healthy on the compiler host and be unreachable from anywhere else.
- Drift measured against `LAST_INDEXED_SHA` alone over-reports: the publication commit always lands
  after generation. Measure against the commit that wrote the index file.
