# Handoff — Estate Repo-Indexing Remediation

**Work package:** `estate-repo-indexing-audit-v1`
**Prepared:** 2026-09-07 · **Prepared by:** Claude Code (audit session, read-only)
**For:** the agent that will execute the fix
**Status:** audit COMPLETE, remediation NOT STARTED

This is the scope outline. Command-level detail lives in
`runbooks/ESTATE_REPO_INDEXING_REMEDIATION_RUNBOOK.md` — read this first, that second.

---

## 1. Mission

Capital Glass runs a federated repo index: every governed repository publishes
`index/cg-federated-repo-index.v1.json`, and a compiler in `CG-AppBuilder-MCP` harvests those into
estate routing that agents use to find who owns what. The estate is **96.8% covered** — 30 of 31
governed-active repos are indexed and current.

The remaining work is four things: the generated registries have fallen behind the manifest they are
generated from, one governed repo was never indexed, nine repositories are invisible to the system
entirely, and nothing re-indexes a repo when it changes.

**Definition of done:** every repository in the `Capglass5708` account is either an active manifest
row with a current published index, or an excluded row with a declared reason — and per-repo CI keeps
it that way without anyone running a command.

---

## 2. Where things stand — verified 2026-09-07

Read at `CG-AppBuilder-MCP@04f81628db7cf0f67fd6a5a312835cda28a01f3b`.

| Fact | Value |
| --- | --- |
| Repositories in the account | 41 |
| Manifest rows | 32 (31 active + 1 excluded) |
| Governed-active repos with a current index | 30 |
| Governed-active repos with **no** index | 1 (`CG-Web-Agent`) |
| Repos with **no manifest row at all** | 9 |
| Indexed repos that have drifted | 4 |
| Per-repo CI enforcing any of this | **0 repos** |

Full per-repo detail: `registry/git-estate/repo-indexing-audit.v1.json` (41 records, one per repo).

---

## 3. The authority model — read before forming any opinion

```
ROOT AUTHORITY
  CG-AppBuilder-MCP  scripts/wsl/wsl-repo-library-manifest.v1.json  →  repositories[]
  repoId == folderName. This file alone decides what the estate is.
        │
        ▼  generated, never hand-edited
DERIVED
  registry/federated-repo-index/seed-bank/<REPO_ID>.seed.v1.json
  registry/federated-repo-index/estate-routing.v1.json
  registry/federated-repo-index/capabilities.v1.json
  registry/federated-repo-index/ci-enforcement-registry.v1.json
  <each governed repo>/index/cg-federated-repo-index.v1.json
        │
        ▼  published
CapitalGlass-Cross-Agent  work-progress/intelligence-hub-slices/federated-estate-routing.json
                          work-progress/intelligence-hub-slices/federated-capabilities.v1.json
```

**Never assess coverage against a derived artifact.** The first pass of this audit did exactly that,
read the stale `ci-enforcement-registry.v1.json`, and reported three defects that had already been
fixed in the manifest two days earlier. Those findings are withdrawn and documented in the audit
JSON's `revisionNote`. Do not resurrect them:

- `Computer Estimator` is **not** a missing index. Its row was deleted 2026-09-05 (`e5ce13fa`). One
  estimator identity survives — `Computer-Estimator-glazing-spine` — and it is published, in GitHub
  repo `Computer-Estimator-`. That mapping is correct.
- `capital-glass-developer-memory` is **not** an un-indexed gap. It is declared
  `governanceStatus: excluded`, `exclusionReason: ARCHIVED_READ_ONLY`.

### The three governance states

| State | Meaning | Action |
| --- | --- | --- |
| `NOT_GOVERNED` | No manifest row | Adopt or declare excluded |
| `GOVERNED_BUT_UNOBSERVED` | Listed active, projection unreadable | **An error** — fix it |
| `GOVERNED_EXCLUDED` | Listed, out of scope, with a declared reason | Nothing |

**ABSENCE IS NEVER EXCLUSION.** Never retire a repo by deleting its row or letting it fall off a
list — a deleted row is indistinguishable from a repo that was never governed.

---

## 4. Work packages

### WP1 — Reconcile the derived layer with the manifest · **HIGH** · do first

Everything downstream reads a derived artifact, so fixing indexes before this means redoing them.

**Problem.** The manifest was corrected 2026-09-05 (`e5ce13fa`) and extended 2026-09-07 (`5c698b33`).
Nothing derived has fully caught up:

| Artifact | As-of | Wrong how |
| --- | --- | --- |
| `estate-routing.v1.json` | 2026-09-06T14:24Z | 31 routes, missing `CG-Web-Agent` |
| `ci-enforcement-registry.v1.json` | 2026-09-05T15:19Z | Enforces `Computer Estimator` (deleted) and `capital-glass-developer-memory` (excluded); omits `CG-Web-Agent` |
| `seed-bank/` | 2026-09-05T15:19Z | Stale `Computer Estimator.seed.v1.json`; no `CG-Web-Agent.seed.v1.json` |
| Cross-Agent published slice | 2026-09-03T23:41Z | Two generations behind — **this is what agents read** |

Two enforced rows can never be satisfied by anything, so a 100% estate proof against the current
registry is unreachable by construction. The published slice still advertises a machine path
(`/home/wesle/repos/Computer Estimator`) with no GitHub remote.

**Tasks**
1. Admit the manifest before deriving from it (`--probe=archived`).
2. Regenerate the seed bank.
3. Re-harvest estate routing and capabilities.
4. Rebuild the CI enforcement registry.
5. Delete the orphaned `Computer Estimator` seed — regeneration does not remove stale files.

**Acceptance.** Set-difference between manifest-active and each derived artifact is empty in both
directions. `Computer Estimator` and `capital-glass-developer-memory` absent from `enforcedRepos`.
No machine paths in any published artifact.

**Blast radius.** One PR in `CG-AppBuilder-MCP`. All four artifacts are generated, so
`git checkout -- registry/federated-repo-index/` is a complete rollback.

---

### WP2 — Index `CG-Web-Agent` · **HIGH** · depends on WP1

The only governed-active repo with no index. Admitted to the manifest 2026-09-07T03:18Z, actively
developed (pushed 2026-09-07), currently `GOVERNED_BUT_UNOBSERVED`. Its `index/` directory holds an
unrelated `index/latest` tree, not a federated index.

**Tasks**
1. Take the seed WP1 generated; confirm identity fields (`REPO_ID: CG-Web-Agent`, `repoClass: engines`).
2. Decide whether it owns real authorities/capabilities. If yes, declare them **in the seed** before
   generating — the seed is the input, the index is the output. If no, an empty capability surface is
   a legitimate baseline; do not invent capabilities to fill it.
3. Copy the seed into the repo, generate, validate, run the CI check.
4. Commit `index/` only, on a branch, PR it.

**Acceptance.** `index/cg-federated-repo-index.v1.json` exists with `REPO_ID: CG-Web-Agent`,
`schemaVersion: cg-federated-repo-index-v2`, a `sha256:` `INDEX_INPUT_DIGEST`, and a `provenance`
block. `repo-index:estate-proof` reports zero `GOVERNED_BUT_UNOBSERVED`.

**Judgement call for the executing agent:** task 2. Everything else here is mechanical.

---

### WP3 — Republish the estate slices · **HIGH** · depends on WP2

Until this runs, every agent routing through the Cross-Agent slice reads a two-generations-stale
estate — including a route to a path that does not exist on any machine but one.

**Tasks**
1. Re-harvest routing and capabilities now that `CG-Web-Agent` has an index.
2. Publish into the Cross-Agent checkout.
3. Verify the slice, verify publication SHA alignment, verify no machine paths.
4. Commit in `CapitalGlass-Cross-Agent`.

**Acceptance.** Published routing contains `CG-Web-Agent` and does not contain `Computer Estimator`.

---

### WP4 — Wire per-repo CI · **HIGH** · depends on WP3 · **the durable fix**

WP1–WP3 are one-time catch-up. Without this, drift returns on the next push to any governed repo.

**Problem.** `perRepoNativeCi: AVAILABLE_NOT_ENFORCED`, `perRepoNativeCiCallers: []`. Enforcement is
entirely central — the AppBuilder prover checks the estate when a human runs it, and nothing
re-indexes a repo when that repo changes. All four drifted indexes are symptoms of this, not
per-repo mistakes.

Every piece already exists in `CG-AppBuilder-MCP`: the reusable workflow
(`.github/workflows/federated-index-check.yml`), the caller template, and a distributor
(`scripts/federated-repo-index/propagate-estate-index-notify.mjs`). Nobody has installed the caller.

**Tasks**
1. Set repo secret `CG_WORKSPACE_CHECKOUT_TOKEN` on every governed repo **before** landing callers —
   the caller fails without it. Landing callers first turns 30 green repos red.
2. Dry-run the propagator; read the packet. Act on its `repositoryNotFound` and
   `defaultBranchNotMain` warnings — those repos will not work as-is.
3. Apply. **Note:** `--apply` writes into local checkouts only. It never pushes and never runs git.
   Committing and pushing across ~30 repos is a separate loop and is yours.
4. Re-run with `--update-ci-registry` and confirm `perRepoNativeCiCallers` is non-empty.
5. **Only then** regenerate the four drifted indexes:
   `CapitalGlass-Cross-Agent` (5 commits) · `capital-glass-project-dashboard` (2) ·
   `CG-AppBuilder-MCP` (1) · `Cursor-ProposalGenerator` (1).
   `Cursor-ProposalGenerator` is also missing `index/compounding-aliases.v1.json` — confirm
   regeneration produces it.

**Acceptance.** `perRepoNativeCi` no longer `AVAILABLE_NOT_ENFORCED`; callers non-empty; every
governed repo shows `git rev-list --count <index-file-commit>..HEAD` == 0.

**Blast radius.** ~30 repositories. Do **not** mix this into the WP1–WP3 PR. Sequence the secret
before the workflow.

---

### WP5 — Adopt or exclude the nine ungoverned repos · **BLOCKED ON WESLEY**

No manifest row, so the estate can neither see them nor report them missing.

| Repo | Last push | Sev | Note |
| --- | --- | --- | --- |
| `CG-MASTER-GRAPH` | 2026-09-06 | HIGH | Active. Declares `master-graph` + `glazing-estimating-knowledge` domains and capabilities `graph-compile`, `glazing-knowledge-pack`, `graph-intelligence-audit` — none resolvable by the router. **Hand-authored index**: v1 schema, no `provenance`, `INDEX_INPUT_DIGEST` holds a work-package id instead of a sha256, no aliases file. 9 commits behind. |
| `Rewire` | 2026-09-02 | MED | Active |
| `capital-glass-estimating-parser` | 2026-08-12 | MED | Name overlaps the estimating spine — confirm not a superseded lane |
| `capital-glass-idea-vault` | 2026-08-14 | LOW | |
| `capital-glass-research-intel` | 2026-07-20 | LOW | Dormant |
| `cursor-supabase-platform` | 2026-07-20 | LOW | Dormant |
| `capitalglass-contacts` | 2026-07-15 | LOW | Collides with governed `capital-glass-contacts`; likely superseded |
| `WatchDog` | 2026-06-25 | LOW | Dormant |
| `capital-glass-marketing-ops` | 2026-06-05 | LOW | Dormant |

**Adopt** = add a manifest row, then run WP1/WP2/WP3 for it.
**Retire** = add a row with `governanceStatus: excluded` and a declared reason. Only
`ARCHIVED_READ_ONLY` is currently accepted; if a repo is dead for a different reason, extend
`EXCLUSION_REASON` in `governed-manifest-admission.mjs` and add a test rather than reusing the wrong
reason or omitting the row.

`CG-MASTER-GRAPH` needs one extra step: its hand-authored index must be **deleted and recompiled**,
not merged with. Carry its real declared domains and capabilities into the *seed* first, or they are
lost. Then run `repo-index:implausible-provenance-scan` to confirm nothing else in the estate is
hand-authored.

**This work package is not mechanical.** WP1–WP4 correct the estate to match declared intent; WP5
*is* the intent. Do not adopt or retire anything here without Wesley's decision.

---

## 5. Decisions needed from Wesley

| # | Decision | Blocks |
| --- | --- | --- |
| 1 | Adopt or retire each of the nine ungoverned repos (table above) | WP5 |
| 2 | Does `CG-Web-Agent` own declarable authorities/capabilities, or is an empty baseline correct? | WP2 task 2 — proceed with empty baseline if no answer |
| 3 | Is `capitalglass-contacts` superseded by `capital-glass-contacts`? | WP5 |
| 4 | Is `capital-glass-estimating-parser` a live lane or superseded by the estimating spine? | WP5 |

Nothing in WP1–WP4 needs a decision. Start there.

---

## 6. Environment and access

| Requirement | Why |
| --- | --- |
| WSL2 / Linux host with the governed checkouts on **ext4** under `$CG_REPOS_ROOT` (default `/home/wesle/repos`) | `repo-index:generate` throws `Forbidden NTFS/DrvFS checkout` on `/mnt/c/...`, any drive letter, or UNC paths |
| Node 22 | Compiler requirement |
| `gh` authenticated | The propagator observes each repo's default branch via the contents API |
| Clean `CG-AppBuilder-MCP` tree on current `main` | Registries regenerate in place; a dirty tree makes the diff unreviewable |
| Push access to ~32 repos | WP4 |
| Ability to set repo secrets | WP4 task 1 |

**WP1–WP4 cannot be executed from a cloud session** — they read local working trees, not GitHub. An
agent without the host should verify the audit and stop, not improvise a GitHub-only substitute.

---

## 7. Do not

- Do not assess coverage against `ci-enforcement-registry.v1.json`, `estate-routing.v1.json`, or the
  published slice. The manifest is the authority.
- Do not hand-edit any index, seed, routing file or registry. All are generated, and a hand-authored
  index is detectable — `CG-MASTER-GRAPH` is the standing example of what one looks like.
- Do not delete a manifest row to retire a repo. Declare exclusion.
- Do not treat a one-commit lag as drift. `LAST_INDEXED_SHA` is `OBSERVED_HEAD_AT_GENERATION`, so the
  publishing commit always lands after generation. Measure from the commit that *wrote* the index
  file. Measuring naively reports all 30 indexed repos as stale when only 4 are.
- Do not land WP4 callers before the `CG_WORKSPACE_CHECKOUT_TOKEN` secret exists on each repo.
- Do not implement anything in `CapitalGlass-Cross-Agent`. It is the coordination repo — ledger,
  decisions, runbooks, published slices. Implementation belongs in the owning repo.
- Do not widen any repo's PR. Index publication touches `index/` only.

---

## 8. Sequencing

```
WP1 reconcile derived layer ──► WP2 index CG-Web-Agent ──► WP3 republish slices
                                                              │
                                                              ▼
                                                     WP4 wire per-repo CI
                                                     then clear 4 drifted indexes

WP5 adopt-or-exclude 9 repos ── independent of WP1-WP4, blocked on Wesley
```

WP1→WP3 is one sitting: one PR in `CG-AppBuilder-MCP`, one in `CG-Web-Agent`, one in
`CapitalGlass-Cross-Agent`. WP4 is a separate change across ~30 repos. WP5 should not hold up
anything else.

---

## 9. Reference

| Item | Path |
| --- | --- |
| Execution runbook (commands, verification, rollback) | `runbooks/ESTATE_REPO_INDEXING_REMEDIATION_RUNBOOK.md` |
| Per-repo audit record, 41 rows | `registry/git-estate/repo-indexing-audit.v1.json` |
| Project file | `work-progress/projects/2026-09-07_estate-repo-indexing-audit-v1.md` |
| Ledger entry | `work-progress/ACTIVE_WORK.md` (2026-09-07) |
| Root manifest | `CG-AppBuilder-MCP` `scripts/wsl/wsl-repo-library-manifest.v1.json` |
| Governance state machine | `CG-AppBuilder-MCP` `scripts/federated-repo-index/lib/governed-manifest-admission.mjs` |
| Audit PR | `Capglass5708/CapitalGlass-Cross-Agent#68` |

**How to re-verify any coverage claim in this handoff, independently of the compiler:**

```bash
git clone --filter=blob:none --no-checkout --depth 60 https://github.com/Capglass5708/<repo> r
git -C r show HEAD:index/cg-federated-repo-index.v1.json
git -C r log -1 --format=%H -- index/cg-federated-repo-index.v1.json
git -C r rev-list --count <that-commit>..HEAD          # 0 = current
```
