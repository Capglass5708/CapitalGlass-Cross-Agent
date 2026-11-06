# Handoff — VAE index, Git-spine admission, and tool surface

**Work package:** `vae-repo-index-and-tool-surface-v1`
**Branch:** `claude/vae-repo-index-state-tga2aa` (Cross-Agent) · PR **#67** (draft)
**Date:** 2026-09-08
**Status:** INVESTIGATION COMPLETE — three decisions and two cross-repo pushes pending

Cross-Agent is the coordination ledger. Everything here is evidence and proposals; **nothing has
been applied to `Visual-Asset-Engine` or `CG-AppBuilder-MCP`.**

---

## The one thing to understand first

**There are two different "spines" and they are unrelated systems.** Conflating them wasted a
cycle in this session — do not repeat it.

| | Federated repo index | Git spine |
| --- | --- | --- |
| Artifact | `index/cg-federated-repo-index.v1.json` in each repo | Supabase `registry.*` + `codeintel.*` |
| Compiler / authority | `CG-AppBuilder-MCP/scripts/federated-repo-index/` | `scripts/platform-registry/` + `packages/derived-intel-core/` |
| Serves | Luna routing, capability resolution | `repository_index_status`, codeintel search |
| Runbook | — | `CG-AppBuilder-MCP/docs/platform-registry/CG-WEB-AGENT-GIT-SPINE-ADMISSION.md` |

That runbook states the rule explicitly: *"Local `index/latest/*` is repository-local and is **not**
Git-spine admission proof."* The same is true of the federated repo index. A repo can be perfect in
one and absent from the other.

---

## Three workstreams, three states

### 1. Federated repo index seed — PROPOSED, verified, awaiting review

VAE's compiled index is provenance-correct at `44e121c` but semantically empty: `repoClass: unknown`,
`authorities`/`capabilities`/`protocols`/`surfaces`/`dependencies` all `[]`, one code pointer. It
contributes **zero rows** to the estate capability index.

Packet: `artifacts/agent-runs/vae-repo-index-seed-population-v1/`

- `proposed-seed.v1.json` — drop-in for VAE `index/repo-index.seed.v1.json`
- `proposed-seed-bank-override.v1.json` — `RICH_OVERRIDES["Visual-Asset-Engine"]` for AppBuilder
- `validation-report.v1.json` — `COMPILE_PASS` through the real compiler, plus a 4-case negative control
- `compiled-index-preview.v1.json` — **not publishable** (`hostname: vm`)

**Two-part fix, and both halves are required.** `generate-seed-bank.mjs` has no `RICH_OVERRIDES`
entry for VAE, so it falls through to `baseSeed()` boilerplate. Fixing only the in-repo seed leaves
a trap: any future bank distribution overwrites VAE's routing content.

**Known undercount:** the seed proposes 5 capabilities. Workstream 3 found the real surface is 143.
Decide whether to widen the seed before applying it.

### 2. Git-spine admission — AUDITED, ungoverned and stale

Packet: `artifacts/agent-runs/vae-git-spine-admission-audit-v1/`

Verdict: **`ON_SPINE_BUT_UNGOVERNED_AND_STALE`**. VAE *is* registered and genuinely indexed —
6,230 files / 7,915 symbols, and one of only **2 of 27** repos with `index_status: indexed`. But:

- the governed seed (23 apps, regenerated 2026-09-07) has **zero** VAE mentions, so the live rows
  are outside governed authority and `import-seed-v1.mjs` would not maintain them;
- `verification_status: discovered` — the only such row in the table — with `phase1Pilot: true`;
- all four alias rows cite `authority_source: ephemeral-vae-vector-intake-smoke-v1`;
- classification disagrees three ways: `control_plane` (repositories) vs `development_local` (apps)
  vs `engines` (git-estate manifest);
- the structural index is **16 commits stale** (`33a791a8`, 2026-08-16 → `44e121c`, 2026-09-05).

### 3. Tool surface — INVENTORIED, 143 capabilities

Packet: `artifacts/agent-runs/vae-tool-surface-inventory-v1/`

**VAE has two MCP servers and the big one is orphaned:**

| Server | Wired to | Tools |
| --- | --- | --- |
| `mcp/run.mjs` | root `npm run mcp:start` — what the estate sees | **2** |
| `generation-core/packages/mcp-server/index.mjs` | only `generation-core/package.json` → `"mcp"` | **26** |

So **24 tools are already implemented and unreachable from the root server.** That is a wiring job,
not a build job — the highest-leverage item in this whole handoff.

Totals: **143 tool-qualifying capabilities** — 28 implemented, 78 function-shaped and ready to
register, 37 CLI-only lanes needing an entrypoint extracted first. All 78 tier-2 symbols were
re-verified as real named exports at their stated paths (0 unverified).

---

## Decisions needed before anyone proceeds

1. **Classification for the `CANONICAL_APPS` entry.** The enum has no `engines`. Recommend
   `mcp_package` (the package is `@capital-glass/visual-asset-engine-mcp` and it exposes MCP tools),
   matching `CG-Human-Estimator-MCP` and `CapitalGlass-Office-Admin`. Overrides both live values.
2. **Domain key.** `DOMAIN_OWNERSHIP` has no `visual-assets`. Map onto an existing domain, or add
   one — adding a domain is a larger governance change.
3. **Seed width.** Apply the 5-capability seed as-is, or widen it toward the 143-capability reality
   first.

---

## Next actions, in order

| # | Action | Repo | Blocked by |
| --- | --- | --- | --- |
| 1 | Wire the 26-tool `mcp-server` into the root MCP server (or merge the two surfaces) | Visual-Asset-Engine | nothing — highest leverage |
| 2 | Apply `proposed-seed.v1.json`, recompile index **on the governed host** | Visual-Asset-Engine | decision 3 |
| 3 | Add `RICH_OVERRIDES["Visual-Asset-Engine"]` to `generate-seed-bank.mjs` | CG-AppBuilder-MCP | — |
| 4 | Add VAE to `CANONICAL_APPS` + `REPO_ALIASES`; regenerate seed 23 → 24 | CG-AppBuilder-MCP | decisions 1, 2 |
| 5 | Supabase import so discovered/ephemeral rows become governed | governed host | 4 |
| 6 | `platform-intelligence:structural-cohort-refresh --repo=Visual-Asset-Engine --apply` | governed host | 5 |
| 7 | Re-run `run-harvest-capability-index` + `run-harvest-estate-routing` | CG-AppBuilder-MCP | 2, 3 |

Steps 2, 4, 5 and 6 need the WSL estate layout (sibling checkouts, Doppler/Supabase). They cannot
run from a cloud session — `generate-seed-v1.mjs` was confirmed to fail here on missing
`CapitalGlass-BidComposer/docs/platform-discovery/data`.

---

## Verification already done (do not redo)

- Federated seed compiled through the **real** compiler, fetched verbatim from
  `CG-AppBuilder-MCP@04f81628d`, against a full clone of VAE at `44e121c`: **`COMPILE_PASS`**,
  all 9 pointers `PUBLISHED`/`clean`.
- Negative control: 4 broken variants each rejected with the expected error — the validator is
  genuinely exercised, not passing vacuously.
- VAE's **current** index passes `run-repo-index-ci-check.mjs` with `requireStructured: true`;
  committed `contentSha256` reproduced exactly from a fresh compile off-host.
- Capability-id collision check: all 5 proposed ids are collision-free against the estate capability
  index — this matters because `harvestCapabilityIndex` **throws** on a duplicate ACTIVE id and
  would break the whole estate harvest.
- Git-spine state read by live read-only SQL against control plane `xjivcwcyyimjujbchwdf`.

## Caveats carried forward

- The capability-collision check used the estate capability index generated `2026-09-03`; a
  capability added elsewhere since then would not appear in it.
- `illustrator_trace_markup` / `vectorizeDocument` are workstation-local (WESLEYDESK, not CI) per
  `07-KNOWN-EXCEPTIONS.md` — they need routing metadata, not plain registration.
- `export_for_document` is declared `read-only` but accepts `forceGenerate`; its capability class
  needs review.
- The tier-2/tier-3 boundary in the inventory is a defensible judgment call, not a formal rule.
