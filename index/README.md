# Federated repo index (Cross-Agent local)

Two files, two different owners. Getting this backwards breaks provenance.

| File | Authored by | Editable here |
| --- | --- | --- |
| `repo-index.seed.v1.json` | **Hand-authored in this repo** — the authority | **Yes** |
| `cg-federated-repo-index.v1.json` | **Generated** by the CG-AppBuilder-MCP federated-repo-index compiler | **No** |
| `compounding-aliases.v1.json` | Alias overlay | Yes |

## Do not hand-edit the generated index

`cg-federated-repo-index.v1.json` carries `LAST_INDEXED_SHA`, `INDEX_INPUT_DIGEST`,
`contentSha256`, `routingSummary` and `provenance`. Those are compiler-owned. Writing them
by hand produces an index that claims a provenance it does not have, which is worse than a
stale one — the estate cannot tell the difference.

Change the seed, then regenerate from CG-AppBuilder-MCP, which owns the compiler:

```text
capability   federated_repo_index_compile_v1
entrypoint   compileLocalIndex
path         scripts/federated-repo-index/lib/compile-local-index.mjs
```

(Recorded in `work-progress/intelligence-hub-slices/federated-capabilities.v1.json`. Take the
exact CLI invocation from AppBuilder — it is not published here.)

Until that runs, the generated file legitimately lags the seed. That drift is expected and
is the compiler's signal to re-run — it is not something to patch by hand.

## Validate the seed

```bash
npm run index:validate-seed
```

Fails closed when a `CODE_POINTERS` path no longer exists, a structured capability names an
entrypoint that is not a function in the file it cites, a program reference does not resolve
to a declared work package, or `requireStructured` is set while the structured arrays are
empty. Runs on every push and pull request via `.github/workflows/repo-index-seed-gate.yml`.

A pointer that has rotted routes an agent to nothing, so this is a gate, not a lint.

## Structured arrays

This repo sets `requireStructured: true`, so `authorities[]` and `capabilities[]` carry real
records. `capabilities[]` is what the compiler harvests into the estate-wide
`federated-capabilities.v1.json` slice — a repo that leaves it empty contributes nothing to
estate capability routing, however many flat `CAPABILITIES` labels it declares.

`protocols[]`, `surfaces[]` and `dependencies[]` are deliberately still empty: no element
contract for them has been published by CG-AppBuilder-MCP, and a guessed shape would land in
the compiler's `invalid[]` bucket. Populate them once that contract exists.
