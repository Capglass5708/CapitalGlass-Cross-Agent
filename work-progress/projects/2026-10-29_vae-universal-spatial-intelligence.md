# Project: vae-universal-spatial-intelligence (VAE-USI-20261029)

## Summary

Implements the VAE Universal Spatial Intelligence master plan (`plans/2026-10-29_vae-universal-spatial-intelligence-master-plan.md`, branch `plan/vae-universal-spatial-intelligence-20261029` @ `12b68fe`) in the owning repo, `BlackBoxCompute/Visual-Asset-Engine`. Plan §10 steps 1–6 and the §5 `svg-render` prerequisite are implemented as seven stacked PRs (#27–#33). On 2026-10-29 all seven were **merged** (owner-granted DALs), **deployed** to the MCP host and **proven** by live tool calls, and `main`'s authoritative local-actions CI passed on the merge commit `0c3b1f9`.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | VAE-USI-20261029 |
| Work package | vae-universal-spatial-intelligence |
| Date opened | 2026-10-29 |
| Source | Wesley (owner direction), Claude Code (implementation), ChatGPT via bb-gpt relay (architectural review) |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | BlackBoxCompute/Visual-Asset-Engine |
| Execution repo | BlackBoxCompute/Visual-Asset-Engine (consumer fix: Capglass5708/CG-Website-) |
| Status | Active: slices 1–11 merged, deployed to the MCP host and green in `main`'s authoritative CI (main `d92fb35`, 2026-11-07); open: VAE #44, #40 |

## Repositories involved

| Repo | Role |
| --- | --- |
| BlackBoxCompute/Visual-Asset-Engine | Implementation, tests, mission receipt |
| Capglass5708/CG-Website- | Consumer page used as the benchmark reference; one asset fix PR |
| Capglass5708/CapitalGlass-Cross-Agent | Plan and this status record only |

## Authority / ownership rule

VAE owns capture, spatial scene, comparison, inspection and replacement planning, and never edits consumer source. CG-Website owns its page, its assets and its deployment. Merges and production deployment stay with the owners. The receipt in the owning repo is the evidence; this file points to it.

## Status by outcome (2026-10-29)

| Slice | PR | Implemented | GPT-reviewed | Lab-tested | Merged | Deployed (MCP host) | Independently verified |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 Lessons as tests; empty join fails closed | [#27](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/27) | yes | approved | yes | yes | yes | yes |
| 2 CDP element capture, VisualScene v2, storefront baseline | [#28](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/28) | yes | approved | yes | yes | yes | yes |
| 3 Element-level comparison across differing DOMs | [#29](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/29) | yes | approved | yes | yes | yes | yes |
| 4 Read-only Reference Inspector; full-page lazy loading | [#30](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/30) | yes | approved | yes | yes | yes | yes |
| 5 Focal-point responsive image replacement | [#31](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/31) | yes | approved | yes | yes | yes | yes |
| 6 Reuse on a second page; mission receipt | [#32](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/32) | evidence only | n/a | yes | yes | yes | yes |
| 7 `svg-render` capture adapter | [#33](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/33) | yes | approved | yes | yes | yes | yes |
| CI: USI suites in the authoritative CI | [#34](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/34) | yes | approved | yes | yes | yes | yes |
| 8 `pdf-render` capture adapter (pinned PDF.js) | [#35](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/35) | yes | approved | yes | yes | yes | yes |
| CI: workflow/CI drift guard; ROI-20 gates on main | [#36](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/36) | yes | approved | yes | yes | yes | yes |
| 9 PDF page elements, glyph-level visibility | [#37](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/37) | yes | approved | yes | yes | yes | yes |
| Fix: drift guard vs runner browser skip (main red after #37) | [#38](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/38) | yes | approved | yes | yes | yes | yes |
| 10 PDF colour, anchored links, multi-page documents | [#39](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/39) | yes | approved | yes | yes | yes | yes |
| 11 One browser launch per PDF document | [#42](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/42) | yes | approved | yes | yes | yes | yes |
| Fix: PDF session test browser path (main red after #42) | [#43](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/43) | yes | approved | yes | yes | yes | yes |

"Lab-tested" means the Omarchy host and the full `generation-core.yml` step list run locally, which is WORKFLOW_COMPLETE input, not RELEASE_PROVEN. "Independently verified" = `main`'s authoritative local-actions CI on `0c3b1f9` (test-and-gates and visual-graph-authority success, signed receipt, network none, read-only root) plus the live MCP probe. Since [VAE #34](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/34) (merged as `4a6662c`) that CI also runs both USI suites: 26/26 and 44/44, 0 skipped, signed receipt.

## Valuable decisions

| Date/time | Decision | Reason |
| --- | --- | --- |
| 2026-10-29 | Grow VisualScene into v2 (superset of v1); no second schema | Plan §4.2; v1 consumers keep working |
| 2026-10-29 | PDF rasteriser = pdfjs-dist 4.10.38 inside the pinned Playwright Chromium; reject poppler (unpinned), Chromium's viewer, MuPDF (AGPL) | GPT plan review approve gx-63a53a10-f89, after a spike |
| 2026-10-29 | Integration before the next development slice | Owner direction |

## Evidence / artifact paths

| Artifact | Path / link | Status |
| --- | --- | --- |
| Mission receipt | VAE `artifacts/agent-runs/VAE-USI-20261029/receipt.json` (in #32, corrected in #33) | branch only until merged |
| Storefront baseline | VAE `artifacts/runs/usi-baseline-storefront-b3d1aa97/baseline.json` | branch only |
| Second-page reuse | VAE `artifacts/runs/usi-baseline-curtain-wall-b3d1aa97/baseline.json` | branch only |

Baseline (CG-Website `b3d1aa97`, storefront page). Region loop against the inferred brief: 7 matched, 1 missing (`value-pillars`), 2 unexpected (`header`, `menu`), 14 structure deltas; reference authority INFERRED, outcome CORRECTION_REQUIRED. Elements: 427 nodes, 305 desktop and 292 phone inventoried. SSIM not applicable (no approved reference PNG); `pixelPerfectClaim` stays FORBIDDEN_UNTIL_MEASURED.

## Verification

| Command / check | Result | Notes |
| --- | --- | --- |
| `generation-core.yml` step list + `test:visual-reference-proof` + `test:reference-layout-intelligence` + toolbox gates, at `c6b7d77` (#33 head) | 22/22 pass | lab, Omarchy host, Chromium 155 |
| Stack integrity | linear: `84aec220` → 8f15f38 → 02b9851 → 0543382 → cc5759f → 11228a9 → 5f1c220 → c6b7d77 (29 commits) | remote heads match; `main` unchanged at `84aec220` |
| Live MCP probe, post-merge (host at `0c3b1f9`) | `NO_MATCHES` / `IDENTITY_MISMATCH` / `CALLER_ALIGN_REGION_IDENTITY`; contract 1.2.0 with `image.focal-fit` | deployed code proven |
| `main` CI on `0c3b1f9` (local-actions) | test-and-gates success, visual-graph-authority success; signed receipt, exit 0 | independent |
| Live MCP probe, pre-merge (host checkout `84aec220`) | zero-match join → `CORRECTION_REQUIRED` / `CALLER_FIX_THEN_RECAPTURE`; asset contract 1.1.0, no `image.focal-fit` | Plan §2.3 lesson 1's silent-zero bug is live |
| Same probe against the stack (`c6b7d77`) | `NO_MATCHES` / `IDENTITY_MISMATCH` / `CALLER_ALIGN_REGION_IDENTITY`; contract 1.2.0 with `image.focal-fit` | this is the post-merge deployment proof |

**Correction of an earlier report.** PRs #27–#32 attribute three `test:root` failures to the private `@capital-glass/vae-tokens` package. That was wrong. They came from `packages/vae-visual` (own lockfile) having no `node_modules`. With `npm ci` there, `test:root` passes in full (1 + 48). `generation-core.yml` never installed those dependencies; #33 adds the step and corrects the receipt.

## Blockers / warnings

| Blocker | Owner repo | Required action |
| --- | --- | --- |
| VAE #44 (toolbox admission of the reference-layout engines; GPT approve gx-1a5504b4-677) and #40 (clean install, MCP access, brand tokens; other author, unreviewed here) both open; they collide in three toolbox files, so the second to merge needs its index regenerated | Visual-Asset-Engine | Owner review and merge grants |
| MCP host at `410a3d5`: has all USI code, not #41 (L: drive retirement, outside this mission) | Visual-Asset-Engine | Routine host update |
| CG-Website anatomy illustration broken in production (0x14 byte) | CG-Website- | Review/merge [CG-Website PR #12](https://github.com/Capglass5708/CG-Website-/pull/12); deployment by that repo's owner |

## Commits / PRs

| Repo | Commit / PR | Status |
| --- | --- | --- |
| Visual-Asset-Engine | #27–#33 merged: 4ba23a2, 85a3d8f, fbf5ca6, ab16fba, 78aa378, 852677f, 0c3b1f9 (`main`) | merged, deployed, CI green |
| Visual-Asset-Engine | [#34](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/34): CI parity + operational acceptance receipt | merged `4a6662c` (main); CI green with both USI suites |
| Visual-Asset-Engine | #35 `8cd20cc`, #36 `a4fa84c`, #37 `2eec219`, #38 `debe62e`, #39 `6728c0f`, #42 `a8069ff`, #43 `410a3d5` | merged, deployed, CI green |
| Visual-Asset-Engine | [#44](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/44) toolbox admission · [#40](https://github.com/BlackBoxCompute/Visual-Asset-Engine/pull/40) brand tokens and setup | open |
| CG-Website- | [#12](https://github.com/Capglass5708/CG-Website-/pull/12) `0870c59`: one byte in `anatomy.svg` + XML parse check in `tests/storefront-systems-page-v1.py` | open; before/after evidence in the PR |

## Next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Owner decisions on VAE #44 and #40 | Visual-Asset-Engine | owner |
| 2 | PDF: page-reorder detection, link destinations to page numbers, colour for images and vector fills | Visual-Asset-Engine | not started |
| 3 | Keep failed-attempt CI evidence in the local-actions engine (a retry overwrote the first failure on `8cd20cc`) | BlackBoxServer | not started |
| 4 | Interaction/responsive state capture (menus, details); contextual matching for repeated cards | Visual-Asset-Engine | not started |
| 5 | Fusion / rebrand / functional reconstruction; §7 license inventory per candidate; learning-sink integration | Visual-Asset-Engine | not started |

## Reusable lessons

- Programmatic `scrollTo` does not trigger Chromium lazy loading; wheel input does. Readiness must not await lazy images outside the capture area: that alone made every capture of such a page wait out a 30 s timeout.
- Real Chromium DOMSnapshot output gives some nodes several layout objects; validating "one layout row per node" rejects real pages.
- The live MCP probe (NDJSON JSON-RPC to `mcp/run.mjs`) separates deployed from merged: run it before and after.
- `agent/*` branches get no authoritative CI before merge, so an environment assumption is first tested on `main`. Main went red twice (after #37: a runner-injected setting; after #42: a browser path that exists on the dev host, not in the image). Run browser-backed suites in the pinned image before opening the PR.

## Update log

### 2026-10-29 CT — Claude Code (owner-directed)

- Slices 1–7 published as VAE PRs #27–#33, each through the bb-gpt review loop to approval.
- Integration gate verified pre-merge: stack linear, heads match, CI step list green in the lab, MCP host and probe identified.
- CG-Website PR #12 opened (anatomy.svg). PDF adapter plan approved; implementation deferred until after integration.

### 2026-10-29 CT — Claude Code (integration)

- Owner granted merge DALs; #27–#33 merged in order with merge commits, `main` 84aec220 → 0c3b1f9; merged tree identical to the reviewed head.
- MCP host checkout moved to `0c3b1f9`; the live probe proves the merged implementation runs. `main` local-actions CI green.
- Found and fixed in PR #34: the authoritative CI parity script never ran the USI suites. Operational acceptance receipt: VAE `artifacts/agent-runs/VAE-USI-20261029/operational-acceptance.json` (on #34).

### 2026-10-29 CT — Claude Code (integration gate closed)

- VAE #34 merged (owner DAL) as `4a6662c`; MCP host moved to `4a6662c` (live probe unchanged: merged behaviour).
- `main`'s local-actions CI on `4a6662c`: test-and-gates and visual-graph-authority success; signed receipt; `test:visual-reference-proof` 26/26 and `test:reference-layout-intelligence` 44/44 ran, 0 skipped; 42 suite summaries, 0 failures.

### 2026-11-07 CT — Claude Code (status refresh)

- Slices 8–11 and CI fixes #34, #36, #38, #43 recorded: all merged, deployed to the MCP host, green in `main`'s authoritative CI (`d92fb35`: signed receipt, exit 0, 43 suites, 0 failures).
- Open: VAE #44 and #40 (owner), CG-Website #12 (that repo's owner), Intelligence #349. MCP host one merge behind (#41, outside this mission).
