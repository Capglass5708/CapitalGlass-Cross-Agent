# Repo Intelligence Compiler v1

Indexing as a build system, not a documentation workflow.

```text
SOURCE REPO
  -> authoritative ref resolution
  -> mechanical scan
  -> static analysis
  -> contract / governance analysis
  -> semantic claim extraction
  -> claim reconciliation (authority lattice)
  -> repo truth graph
  -> repo-index.v1.json | coverage.json | findings.json | receipt.json
  -> [federated compiler]        <- not yet implemented, see "Deferred"
```

## Run

```bash
npm run repo-index:compile                 # compile, write index/generated/
npm run repo-index:check                   # CI mode: non-zero exit on gate HOLD
npm run test:repo-intelligence-compiler    # 27 adversarial tests
node scripts/repo-intelligence/compile.mjs --repo-root <other-repo>
```

The compiler is repo-agnostic. `--repo-root` points it at any repo; the
behavior for that repo comes from `indexing-policy.v1.json`.

## Determinism

```text
repoIndexFingerprint = sha256(sourceTreeSha + compilerVersion
                              + schemaVersion + indexingPolicyHash)
```

Same tree + same policy + same compiler => byte-identical JSON. `generatedAt`
is written into the receipt but **excluded from the fingerprint**, so
reproducibility is a property of the source rather than of the clock.
Verified: two consecutive runs produce identical `repo-index.v1.json`,
`coverage.json` and `findings.json`.

## Passes

| Pass | Detects |
| --- | --- |
| `mechanical-inventory` | scale, dominant directories, stub directories, scan guidance |
| `script-reachability` | every executable classified by inbound edge; `ORPHANED_CANDIDATE` / `ORPHANED_TRANSITIVE` |
| `mutation-graph` | mutation primitives -> executable -> entry command -> admission gate -> receipt |
| `mirror-consistency` | `SOURCE_PROJECTION_DRIFT`, `PROJECTION_AHEAD_OF_SOURCE`, `SOURCE_MISSING` |
| `schema-runtime-consistency` | `CONTRACT_RUNTIME_CONTRADICTION` — schema permits what the validator rejects |
| `sentinel-analysis` | impossible timestamps, null/all-zero hashes, placeholder UUIDs, localhost, TODO in authority files |

### Execution context, not string matching

`execSync(\`git push origin main\`)` is a mutation. A packet title reading
`"verify git push parity"` is not. The mutation pass discriminates on
**execution context** — the primitive must be handed to an executor — and
records string-only occurrences separately as `mentionedNotExecuted`. A test
that commits into a throwaway fixture repo is recorded as
`TEST_SCOPED_MUTATION_ACKNOWLEDGED`, not as a governance contradiction.

## The authority lattice

Two orderings, deliberately kept separate (`lib/authority-lattice.mjs`):

- **NORMATIVE** — what *should* be true. `FROZEN_CONTRACT` > `ARCHITECTURE_LOCK` > ... > `README`.
- **OBSERVED** — what *is* true. `LIVE_CODE_BEHAVIOR` > `CI_ENFORCEMENT` > `TEST_ASSERTION` > ... > `README`.

Collapsing them into one ranking hides real drift. If the contract always
wins, nobody learns the code bypasses it; if the code always wins, the bypass
silently becomes the rule. When the two orderings disagree the compiler emits
`CONTRADICTION_NORMATIVE_VS_OBSERVED`, preserves **both** claims, and sets
`requiresHumanDisposition` rather than picking a winner.

## Claims are content-addressed

```json
{
  "claimId": "sha256:...",
  "subject": "CapitalGlass-Cross-Agent",
  "predicate": "owns",
  "object": "COMPOUNDING_INTELLIGENCE_PIPELINE",
  "authorityClass": "ARCHITECTURE_LOCK",
  "evidenceClass": "OBSERVED_SOURCE",
  "evidence": [{ "path": "contracts/intelligence/OWNERSHIP.md", "sourceSha": "sha256:...", "lineRange": [12, 18] }]
}
```

The id derives from the assertion **and** its evidence, so moving the source
changes the id. `diffClaims()` turns "the docs might be stale" into a
deterministic set: added / removed / changed. A claim with no evidence, or an
invalid `evidenceClass`, throws at construction — unevidenced claims are not
emittable.

`evidenceClass` is discrete on purpose: `OBSERVED_SOURCE`, `OBSERVED_RUNTIME`,
`DERIVED_STATIC`, `DERIVED_GRAPH`, `DECLARED_ONLY`, `INFERRED`, `UNPROVEN`.
There is no numeric confidence field — a fabricated `0.72` is itself an
unproven claim wearing the costume of a measurement.

## Proof ladder

A capability is not proven by its own documentation. Each rung is established
independently: `declared` / `implemented` / `tested` / `ciEnforced` /
`liveProven`. The M8 git-mutation gate currently compiles to
`declared: true, implemented: false, ciEnforced: false, bypassPathsPresent: 2`.

## Coverage

Semantic categories, not file percentage — "95% of files scanned" is
meaningless when two-thirds of the tree is generated evidence. Historical
artifacts are `DEFERRED_WITH_REASON` (scanned for sentinels, not semantically
classified) rather than silently counted or silently skipped.

## Gate

`REPO_INTELLIGENCE_V2_SOURCE_PASS` requires `authoritativeRefResolved`,
`semanticAuthorityReconciliation`, `indexSchemaValidation` and
`retrievalProof` to pass. Analysis passes report `FINDINGS` without blocking —
a repo with known, classified drift still compiles; a repo whose
contradictions are *unclassified* does not.

`runtimeBehaviorProven`, `crossMachineReproducibility` and
`federatedCompilation` are reported as separate dimensions and are **never**
upgraded by source inspection. An adversarial test asserts this.

## Deferred, and why

| Item | Status | Reason |
| --- | --- | --- |
| Incremental compilation | not built | Dependency fingerprints would be rewritten every time a pass is added. Worth building once the pass set stabilizes; a full run is currently ~2s. |
| Hermetic execution | not built | Needs a pinned image. The fingerprint already makes non-determinism *detectable*, which is the prerequisite. |
| Cross-machine reproducibility prover | not built | Requires a second host; the gate reports `NOT_ATTEMPTED_SINGLE_HOST` rather than claiming it. |
| Federated compilation | **blocked on an authority decision** | `index/cg-federated-repo-index.v1.json` is compiled by CG-AppBuilder-MCP. Making the federated index a projection of repo indexes changes who owns that file. Not a unilateral call. |
| Git history intelligence | not built | Needs "last authority-changing commit" heuristics per authority class. |
| Drift canaries | partially covered | Frozen expectations are implicit in the fingerprint; explicit per-fact canaries not yet emitted. |
