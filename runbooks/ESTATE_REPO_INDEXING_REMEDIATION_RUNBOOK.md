# Estate Repo-Indexing Remediation Runbook

**Work package:** `estate-repo-indexing-audit-v1`
**Audit record:** `registry/git-estate/repo-indexing-audit.v1.json` (schema v2.0.0)
**Owner of the fix:** `CG-AppBuilder-MCP` — it owns the manifest, the compiler, the seed bank and estate routing.
**Role of this repo:** coordination record only. Nothing here is executed. Do not "fix" an index by editing a file in this repo.

Written for an agent that will actually execute it. Every step states its precondition, the exact command, what proves it worked, and how to undo it.

---

## 0. Read this first — the authority model

This is the single most important thing in the document, because getting it wrong produces a confident, wrong audit.

```
ROOT AUTHORITY   CG-AppBuilder-MCP  scripts/wsl/wsl-repo-library-manifest.v1.json
                   │  repositories[] — folderName, githubRepoKey, tier, governanceStatus
                   │  repoId == folderName. This is the ONLY file that decides what the estate is.
                   ▼
DERIVED (generated, never hand-edited)
  ├─ registry/federated-repo-index/seed-bank/<REPO_ID>.seed.v1.json   ← repo-index:generate-seed-bank
  ├─ registry/federated-repo-index/estate-routing.v1.json             ← estate-index:harvest
  ├─ registry/federated-repo-index/capabilities.v1.json               ← estate-index:harvest-capabilities
  ├─ registry/federated-repo-index/ci-enforcement-registry.v1.json    ← estate-index:propagate-notify --update-ci-registry
  └─ <each governed repo>/index/cg-federated-repo-index.v1.json       ← repo-index:generate
                   ▼
PUBLISHED (what other agents actually read)
  CapitalGlass-Cross-Agent  work-progress/intelligence-hub-slices/federated-estate-routing.json
  CapitalGlass-Cross-Agent  work-progress/intelligence-hub-slices/federated-capabilities.v1.json
                                                                      ← estate-index:publish-cross-agent
```

**Rule: never classify coverage against a derived artifact.** The v1.0.0 audit did exactly that — it read `ci-enforcement-registry.v1.json` and reported three defects that had already been fixed in the manifest two days earlier. See `revisionNote` in the audit JSON.

### The three governance states, which must stay apart

From `scripts/federated-repo-index/lib/governed-manifest-admission.mjs`:

| State | Meaning |
| --- | --- |
| `NOT_GOVERNED` | Not in the manifest at all |
| `GOVERNED_BUT_UNOBSERVED` | Listed, active, projection could not be read — **an error** |
| `GOVERNED_EXCLUDED` | Listed, deliberately out of scope, with a machine-readable reason |

> **ABSENCE IS NEVER EXCLUSION.** Never retire a repo by deleting its row or by letting it fall off a list. Exclusion is declared: `governanceStatus: "excluded"` plus an `exclusionReason` from `EXCLUSION_REASON` (today the only accepted value is `ARCHIVED_READ_ONLY`) plus a human `exclusionNote`.

---

## 1. Preconditions — verify before touching anything

The compiler refuses to run outside a real Linux checkout. `isForbiddenNtfsCheckoutPath()` throws on any path starting `/mnt/c/`, any `X:/` drive letter, or any UNC `//` path.

```bash
# Must be a WSL2 / Linux ext4 host with the governed checkouts present.
echo "$CG_REPOS_ROOT"            # expected: /home/<user>/repos  (default /home/wesle/repos)
df -T "$CG_REPOS_ROOT" | tail -1 # expected fstype: ext4   — NOT drvfs, NOT 9p
node --version                   # expected: v22.x
gh auth status                   # needed: propagate-notify observes GitHub via gh
cd "$CG_REPOS_ROOT/CG-AppBuilder-MCP" && git fetch origin main && git status --short
```

| Precondition | Why it matters |
| --- | --- |
| ext4 checkout under `$CG_REPOS_ROOT` | `repo-index:generate` hard-fails on NTFS/DrvFS paths |
| Clean AppBuilder tree on current `main` | Derived registries are regenerated in place; a dirty tree makes the diff unreviewable |
| `gh` authenticated | `propagate-estate-index-notify.mjs` uses the contents API to observe each repo |
| Repo secret `CG_WORKSPACE_CHECKOUT_TOKEN` per governed repo | The reusable workflow needs read access to CG-AppBuilder-MCP; without it the caller fails on every governed repo |
| Governed checkouts present locally | The compiler reads working trees, not GitHub |

**If you are not on that host, stop.** Steps 2–6 cannot be done from a cloud session — they need the local checkouts. Record the blocker and hand off; do not improvise a GitHub-only substitute.

---

## 2. Reconcile the derived layer with the admitted manifest — **do this first**

**Why first:** every other step reads a derived artifact. Fixing indexes before fixing the registry means re-doing the work.

**Current wrongness (verified 2026-09-07):**

| Artifact | As-of | Wrong how |
| --- | --- | --- |
| `estate-routing.v1.json` | 2026-09-06T14:24Z | 31 routes, missing `CG-Web-Agent` |
| `ci-enforcement-registry.v1.json` | committed 2026-09-05T15:19Z | Enforces `Computer Estimator` — an identity **deleted** from the manifest on 2026-09-05 (`e5ce13fa`). Enforces `capital-glass-developer-memory`, which the manifest declares **excluded**. Omits `CG-Web-Agent`. |
| `seed-bank/` | committed 2026-09-05T15:19Z | Stale `Computer Estimator.seed.v1.json`; no `CG-Web-Agent.seed.v1.json` |
| Cross-Agent published slice | 2026-09-03T23:41Z | Two generations behind; still advertises a `Computer Estimator` route pointing at a machine path with no GitHub remote |

Two of those enforced rows can never be satisfied by anything, so **a 100% estate proof against the current registry is unreachable by construction.** That is the real defect the v1 audit's three false findings were pointing at.

```bash
cd "$CG_REPOS_ROOT/CG-AppBuilder-MCP"

# 2a. Confirm the manifest itself is admissible before deriving from it.
#     No npm alias exists for this one - invoke the script directly.
#     --probe=archived also checks GitHub archived state, which is what catches a row
#     that is active in the manifest but read-only on GitHub.
node scripts/federated-repo-index/run-validate-governed-manifest-admission.mjs --probe=archived --json
# Expect: GOVERNED_MANIFEST_ADMITTED. On GOVERNED_MANIFEST_REJECTED, fix the manifest and stop here -
# the findings name the offending rows (DUPLICATE_AUTHORITY_KEY, EXCLUDED_WITHOUT_REASON,
# ACTIVE_REPO_ARCHIVED, ACTIVE_REPO_UNREACHABLE, ...).

# 2b. Regenerate the seed bank from the manifest.
npm run repo-index:generate-seed-bank

# 2c. Re-harvest routing and capabilities.
npm run estate-index:harvest
npm run estate-index:harvest-capabilities:auto

# 2d. Rebuild the CI enforcement registry (also observes which repos have the caller installed).
node scripts/federated-repo-index/propagate-estate-index-notify.mjs --update-ci-registry --json
```

**Verify:**

```bash
python3 - <<'PY'
import json
m=json.load(open('scripts/wsl/wsl-repo-library-manifest.v1.json'))
active={r['folderName'] for r in m['repositories'] if r.get('governanceStatus','active')=='active'}
reg=set(json.load(open('registry/federated-repo-index/ci-enforcement-registry.v1.json'))['enforcedRepos'])
rt={r['ownerRepo'] for r in json.load(open('registry/federated-repo-index/estate-routing.v1.json'))['routes']}
print('active rows        :', len(active))
print('registry not active:', sorted(reg-active) or 'none')   # must be none
print('active not registry:', sorted(active-reg) or 'none')   # must be none
print('active not routed  :', sorted(active-rt)  or 'none')   # must be none
PY
ls registry/federated-repo-index/seed-bank/ | wc -l          # expect 30 (31 active minus AppBuilder's own)
ls "registry/federated-repo-index/seed-bank/Computer Estimator.seed.v1.json" 2>/dev/null && echo "STALE SEED STILL PRESENT"
```

Stale seeds are not removed by regeneration. Delete the orphan explicitly:

```bash
git rm "registry/federated-repo-index/seed-bank/Computer Estimator.seed.v1.json"
```

**Rollback:** `git checkout -- registry/federated-repo-index/` — all four artifacts are generated, so discarding is always safe.

---

## 3. Seed `CG-Web-Agent` — the one governed coverage gap

`CG-Web-Agent` was admitted to the manifest on 2026-09-07T03:18Z (`5c698b33`, "Admit CG-Web-Agent to estate Git spine registry"). It is `GOVERNED_BUT_UNOBSERVED`: listed, active, actively developed (pushed 2026-09-07), and its projection cannot be read. Its `index/` directory holds an unrelated `index/latest` tree — not a federated index.

Step 2b generates its seed automatically. The generated seed is a **baseline stub**: correct identity, empty capability/program surface. That is a legitimate starting state — do not invent capabilities to fill it.

```bash
cd "$CG_REPOS_ROOT/CG-AppBuilder-MCP"
cat registry/federated-repo-index/seed-bank/CG-Web-Agent.seed.v1.json
```

Check `REPO_ID` is `CG-Web-Agent`, `repoClass` is `engines` (its manifest tier), `status` is `ACTIVE`.

If the repo genuinely owns authorities or capabilities, declare them in the seed now rather than after publishing an empty index — the seed is the input, the index is the output. Use `CapitalGlass-Documents.seed.v1.json` as the shape reference for a repo with a real capability, and `Scraper.seed.v1.json` for a minimal one.

---

## 4. Generate the missing index and publish it

The seed lives in AppBuilder; the index must be written into and committed by the owning repo.

```bash
cd "$CG_REPOS_ROOT/CG-AppBuilder-MCP"
cp registry/federated-repo-index/seed-bank/CG-Web-Agent.seed.v1.json \
   "$CG_REPOS_ROOT/CG-Web-Agent/index/repo-index.seed.v1.json"

npm run repo-index:generate -- --repo="$CG_REPOS_ROOT/CG-Web-Agent" --json
npm run repo-index:validate -- --repo="$CG_REPOS_ROOT/CG-Web-Agent"
node scripts/federated-repo-index/run-repo-index-ci-check.mjs --repoRoot="$CG_REPOS_ROOT/CG-Web-Agent"
```

`repo-index:generate` writes `index/cg-federated-repo-index.v1.json` and stamps `LAST_INDEXED_SHA` with the head observed at generation.

**Verify before committing:**

```bash
python3 - <<'PY'
import json
d=json.load(open('/dev/stdin'))
assert d['REPO_ID']=='CG-Web-Agent', d['REPO_ID']
assert d.get('schemaVersion')=='cg-federated-repo-index-v2', d.get('schemaVersion')
assert d['INDEX_INPUT_DIGEST'].startswith('sha256:'), d['INDEX_INPUT_DIGEST']
assert 'provenance' in d and d['provenance'].get('contentSha256','').startswith('sha256:')
print('OK', d['REPO_ID'], d['LAST_INDEXED_SHA'])
PY
```
(pipe the generated file into that, or just read the four fields by eye)

Then commit **in `CG-Web-Agent`**, on a branch, and open a PR:

```bash
cd "$CG_REPOS_ROOT/CG-Web-Agent"
git checkout -b chore/federated-repo-index-baseline
git add index/repo-index.seed.v1.json index/cg-federated-repo-index.v1.json index/compounding-aliases.v1.json
git commit -m "chore(index): publish federated repo index baseline"
git push -u origin chore/federated-repo-index-baseline
```

Do not hand-write any of these three files.

---

## 5. Republish the estate slices so agents see the corrected estate

Until this runs, every agent routing through the Cross-Agent slice still reads the two-generations-stale estate.

```bash
cd "$CG_REPOS_ROOT/CG-AppBuilder-MCP"
npm run estate-index:harvest            # re-harvest now that CG-Web-Agent has an index
npm run estate-index:harvest-capabilities:auto
npm run estate-index:publish-cross-agent
```

That writes into the Cross-Agent checkout:
- `work-progress/intelligence-hub-slices/federated-estate-routing.json`
- `work-progress/intelligence-hub-slices/federated-capabilities.v1.json`
- a publication receipt under `work-progress/publications/cg-federated-repo-index-estate-100-v1/`

**Verify, then commit in `CapitalGlass-Cross-Agent`:**

```bash
cd "$CG_REPOS_ROOT/CapitalGlass-Cross-Agent"
python3 - <<'PY'
import json
d=json.load(open('work-progress/intelligence-hub-slices/federated-estate-routing.json'))
n={r['ownerRepo'] for r in d['routes']}
print('routes:', len(d['routes']))
print('has CG-Web-Agent   :', 'CG-Web-Agent' in n)              # must be True
print('has Computer Estimator:', 'Computer Estimator' in n)      # must be False
PY
npm run index:verify-publication-sha
```

Machine paths must not leak into a published slice — the old `Computer Estimator` route carried `localRepoRoot: /home/wesle/repos/Computer Estimator`, a path with no GitHub remote:

```bash
cd "$CG_REPOS_ROOT/CG-AppBuilder-MCP" && npm run repo-index:validate-no-machine-paths
```

---

## 6. Wire per-repo CI — the durable fix

**This is the step that stops the problem recurring.** Everything above is a one-time catch-up; without this, drift returns on the next push to any governed repo.

`ci-enforcement-registry.v1.json` reports `perRepoNativeCi: AVAILABLE_NOT_ENFORCED` with `perRepoNativeCiCallers: []`. Enforcement today is entirely central: the AppBuilder prover checks the estate when a human runs it, and **nothing re-indexes a repo when that repo changes.** All four `REINDEX_RECOMMENDED` rows are symptoms of this, not per-repo mistakes.

The pieces already exist in CG-AppBuilder-MCP:
- reusable workflow `.github/workflows/federated-index-check.yml`
- caller template `.github/workflows/federated-index-check-caller.yml.template`
- distributor `scripts/federated-repo-index/propagate-estate-index-notify.mjs`

```bash
cd "$CG_REPOS_ROOT/CG-AppBuilder-MCP"

# 6a. Dry run first — writes a packet, changes nothing.
node scripts/federated-repo-index/propagate-estate-index-notify.mjs --dry-run --json
cat artifacts/agent-runs/estate-index-refresh/propagation-packet-v1.json
```

Read the packet before applying. Per governed repo it reports: target workflow path, whether the caller is `PRESENT` / `ABSENT` / `UNOBSERVED` on the default branch, the template content hash, whether `CG_WORKSPACE_CHECKOUT_TOKEN` is present (by name only — the script never prints secret values), and the SHA the reusable-workflow call would be pinned to.

Act on the packet's own warnings: `repositoryNotFound` and `defaultBranchNotMain` rows will not work as-is.

```bash
# 6b. Apply — writes the caller into each LOCAL checkout. Never pushes, never runs git.
node scripts/federated-repo-index/propagate-estate-index-notify.mjs --apply --json
```

`--apply` only writes files into checkouts under `$CG_REPOS_ROOT`. Committing and pushing is yours, per repo:

```bash
for r in $(python3 -c "
import json
m=json.load(open('$CG_REPOS_ROOT/CG-AppBuilder-MCP/scripts/wsl/wsl-repo-library-manifest.v1.json'))
print('\n'.join(x['folderName'] for x in m['repositories']
                if x.get('governanceStatus','active')=='active' and x['folderName']!='CG-AppBuilder-MCP'))
"); do
  d="$CG_REPOS_ROOT/$r"
  [ -d "$d/.git" ] || { echo "SKIP (no checkout): $r"; continue; }
  git -C "$d" status --porcelain .github/workflows/federated-index-check-caller.yml | grep -q . || continue
  git -C "$d" checkout -b chore/federated-index-check-caller 2>/dev/null || git -C "$d" checkout chore/federated-index-check-caller
  git -C "$d" add .github/workflows/federated-index-check-caller.yml
  git -C "$d" commit -m "ci: install federated index check caller"
  git -C "$d" push -u origin chore/federated-index-check-caller
done
```

**Before this lands, set the secret on every governed repo** — the caller fails without it:

```bash
gh secret set CG_WORKSPACE_CHECKOUT_TOKEN --repo Capglass5708/<repo>   # read access to CG-AppBuilder-MCP
```

**Verify:** re-run `--update-ci-registry` and confirm `perRepoNativeCiCallers` is no longer empty and `perRepoNativeCi` is no longer `AVAILABLE_NOT_ENFORCED`.

**Only after this is live**, clear the four drifted indexes — otherwise you are clearing a symptom that will come straight back:

| Repo | Commits ahead of its index publication |
| --- | --- |
| `CapitalGlass-Cross-Agent` | 5 |
| `capital-glass-project-dashboard` | 2 |
| `CG-AppBuilder-MCP` | 1 |
| `Cursor-ProposalGenerator` | 1 |

```bash
npm run repo-index:generate -- --repo="$CG_REPOS_ROOT/<repo>"   # then commit in that repo
```

`Cursor-ProposalGenerator` is also the only governed repo missing `index/compounding-aliases.v1.json` — it was indexed in a separate earlier run (2026-09-05T02:05) rather than the main sweep. Regeneration should produce it; confirm it does.

---

## 7. Adopt-or-exclude the nine repos outside the manifest

Nine GitHub repos have no manifest row, so the estate can neither see them nor report them missing. Each needs a decision recorded in the manifest — **`ABSENCE IS NEVER EXCLUSION`, so leaving them out is not a decision.**

| Repo | Last push | Severity | Note |
| --- | --- | --- | --- |
| `CG-MASTER-GRAPH` | 2026-09-06 | HIGH | Active. Self-declares `master-graph` + `glazing-estimating-knowledge` domains and capabilities `graph-compile`, `glazing-knowledge-pack`, `graph-intelligence-audit` — none resolvable by the router. Carries a **hand-authored** index: schema v1 only, no `provenance`, `INDEX_INPUT_DIGEST` holds a work-package id instead of a sha256, no `compounding-aliases.v1.json`. 9 commits behind. |
| `Rewire` | 2026-09-02 | MEDIUM | Active |
| `capital-glass-estimating-parser` | 2026-08-12 | MEDIUM | Name overlaps the estimating spine — confirm it is not a superseded parser lane before adopting |
| `capital-glass-idea-vault` | 2026-08-14 | LOW | |
| `capital-glass-research-intel` | 2026-07-20 | LOW | Dormant |
| `cursor-supabase-platform` | 2026-07-20 | LOW | Dormant |
| `capitalglass-contacts` | 2026-07-15 | LOW | Name collides with governed `capital-glass-contacts`; likely superseded |
| `WatchDog` | 2026-06-25 | LOW | Dormant |
| `capital-glass-marketing-ops` | 2026-06-05 | LOW | Dormant |

**To adopt** — add a manifest row, then re-run steps 2, 4 and 5 for it:

```json
{ "folderName": "CG-MASTER-GRAPH", "githubRepoKey": "CG-MASTER-GRAPH",
  "tier": "engines", "workspaceName": "Master Graph" }
```

`CG-MASTER-GRAPH` needs one extra thing: its existing index is hand-authored and must be **replaced** by a compiled one, not merged with. Delete it, seed it, regenerate:

```bash
rm "$CG_REPOS_ROOT/CG-MASTER-GRAPH/index/cg-federated-repo-index.v1.json"
cp "$CG_REPOS_ROOT/CG-AppBuilder-MCP/registry/federated-repo-index/seed-bank/CG-MASTER-GRAPH.seed.v1.json" \
   "$CG_REPOS_ROOT/CG-MASTER-GRAPH/index/repo-index.seed.v1.json"
# carry its real declared domains/capabilities into the SEED before generating
npm run repo-index:generate -- --repo="$CG_REPOS_ROOT/CG-MASTER-GRAPH"
```

Then confirm nothing else in the estate is hand-authored:

```bash
cd "$CG_REPOS_ROOT/CG-AppBuilder-MCP" && npm run repo-index:implausible-provenance-scan
```

**To retire** — add a row with a declared reason. Only `ARCHIVED_READ_ONLY` is currently accepted by `EXCLUSION_REASON`; if a repo is dead for a different reason, extend that enum in `governed-manifest-admission.mjs` and add a test, rather than reusing the wrong reason or omitting the row:

```json
{ "folderName": "WatchDog", "githubRepoKey": "WatchDog", "tier": "support",
  "workspaceName": "WatchDog",
  "governanceStatus": "excluded",
  "exclusionReason": "ARCHIVED_READ_ONLY",
  "exclusionNote": "<why, in a sentence a human will read in six months>" }
```

**Ask Wesley before adopting or retiring anything in this table.** Steps 2–6 are mechanical corrections to declared intent; step 7 *is* the intent, and it is not yours to decide.

---

## 8. Acceptance — the estate is fixed when all of these hold

```bash
cd "$CG_REPOS_ROOT/CG-AppBuilder-MCP"
node scripts/federated-repo-index/run-validate-governed-manifest-admission.mjs --probe=archived  # GOVERNED_MANIFEST_ADMITTED
npm run repo-index:estate-proof                                                 # every active row observed
npm run repo-index:validate-no-machine-paths                                    # no machine paths published
npm run repo-index:implausible-provenance-scan                                  # no hand-authored indexes
npm run test:federated-repo-index
npm run test:federated-repo-index-estate-100
npm run test:federated-index-truth
npm run test:estate-index-refresh
```

| Criterion | Proof |
| --- | --- |
| Manifest admissible | `GOVERNED_MANIFEST_ADMITTED` |
| Derived layer matches the manifest | The step-2 set-difference check prints `none` three times |
| No unreachable enforced rows | `Computer Estimator` and `capital-glass-developer-memory` absent from `enforcedRepos` |
| Every active row observed | `repo-index:estate-proof` passes with zero `GOVERNED_BUT_UNOBSERVED` |
| `CG-Web-Agent` indexed | Its `index/cg-federated-repo-index.v1.json` exists with `REPO_ID: CG-Web-Agent` and a `provenance` block |
| Published slice current | Cross-Agent routing contains `CG-Web-Agent`, not `Computer Estimator` |
| CI actually enforced | `perRepoNativeCiCallers` non-empty; `perRepoNativeCi` no longer `AVAILABLE_NOT_ENFORCED` |
| No drift | Every governed repo: `git rev-list --count <index-file-commit>..HEAD` == 0 |
| Nothing ungoverned | Every one of the 41 account repos is either an active manifest row or an excluded row with a declared reason |

Re-run the independent read to confirm from outside the compiler's own view:

```bash
git clone --filter=blob:none --no-checkout --depth 60 https://github.com/Capglass5708/<repo> r
git -C r show HEAD:index/cg-federated-repo-index.v1.json
git -C r log -1 --format=%H -- index/cg-federated-repo-index.v1.json
git -C r rev-list --count <that-commit>..HEAD          # 0 = current
```

---

## 9. Traps

- **Do not audit against `ci-enforcement-registry.v1.json`.** It is derived and currently stale. The manifest is the authority. This is the mistake v1.0.0 of the audit made.
- **Do not hand-edit any index, seed, routing file or registry.** All are generated. A hand-authored index is detectable (`repo-index:implausible-provenance-scan`) and `CG-MASTER-GRAPH` is the standing example of what one looks like.
- **Do not delete a manifest row to retire a repo.** Declare exclusion. A deleted row is indistinguishable from a repo that was never governed.
- **A one-commit lag is not drift.** `LAST_INDEXED_SHA` is `OBSERVED_HEAD_AT_GENERATION`; the commit that publishes the index necessarily lands after generation. Measure drift from the commit that *wrote* the index file. Measuring from `LAST_INDEXED_SHA` alone reports all 30 indexed repos as stale when only 4 are.
- **`propagate-estate-index-notify.mjs --apply` never pushes.** It writes into local checkouts only. If you skip the commit/push loop, nothing changes on GitHub and the registry will still report zero callers.
- **The caller workflow needs `CG_WORKSPACE_CHECKOUT_TOKEN` on every governed repo.** Landing callers without the secret turns 30 green repos red.
- **Do not run the compiler on `/mnt/c/...`.** It throws `Forbidden NTFS/DrvFS checkout`. Use `$CG_REPOS_ROOT` on ext4.
- **Do not widen a repo's PR.** Index publication is `index/` only.

---

## 10. Ordering

```
1 preconditions
2 reconcile derived layer  ─────────────► blocks everything downstream
3 seed CG-Web-Agent
4 generate + publish its index
5 republish estate slices  ─────────────► agents now read the true estate
6 wire per-repo CI ───► then clear the 4 drifted indexes
7 adopt-or-exclude the 9 ungoverned repos  (needs Wesley's decision; independent of 2-6)
8 acceptance
```

Steps 2 → 5 are one sitting and can land as a single AppBuilder PR plus one PR in `CG-Web-Agent` and one in `CapitalGlass-Cross-Agent`. Step 6 is a separate change touching ~30 repos and should not be mixed into it. Step 7 is blocked on a human decision and should not hold up 2–6.
