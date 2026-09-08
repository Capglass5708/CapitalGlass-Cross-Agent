# VAE tool surface inventory (v1)

**Subject:** `Capglass5708/Visual-Asset-Engine` @ `44e121c`
**Data:** [`tool-surface-inventory.v1.json`](./tool-surface-inventory.v1.json)

Answers: *what functions in this repo would qualify as a tool?*

## Headline

VAE has **two MCP servers**, and the larger one is orphaned:

| Server | Wired to | Tools |
| --- | --- | --- |
| `mcp/run.mjs` | root `npm run mcp:start` — what the estate sees | 2 |
| `generation-core/packages/mcp-server/index.mjs` | only `generation-core/package.json` → `"mcp"` | 26 |

**24 tools are already implemented and unreachable from the root server.** Wiring, not building.

## Totals — 143 tool-qualifying capabilities

| Tier | Count | Meaning |
| --- | --- | --- |
| 1 — implemented | 28 | Already written as MCP tools (26 orphaned + 2 live) |
| 2 — ready, unregistered | 78 | Named exports, bounded inputs; registration is mechanical |
| 3 — CLI-only lanes | 37 | Tool-grade, but **no named export** — entrypoint must be extracted first |

Tier 2 spans graph/retrieval (10), generation and render (13), asset intake (14), document
validation (8), production gates (7), folder icons (6), vector/Illustrator (4), evaluators (4),
social creative (4), catalog/tokens/registry (8).

## Method

Static extraction from the working tree. **Every tier-2 symbol was re-verified** as an actual
`export function` at its stated path — 0 of 78 failed. Tier 1 tool names and their read-only/write
capability classes were parsed from the server sources, not transcribed.

## Caveats

- Pure helpers (`loadJson`, `getRepoRoot`, `hashContent`), type guards and test utilities were
  excluded by judgment. The tier-2/tier-3 boundary is a defensible call, not a formal rule.
- `illustrator_trace_markup` and `vectorizeDocument` are workstation-local (WESLEYDESK, not CI) per
  `docs/application-bible/07-KNOWN-EXCEPTIONS.md` — they need routing metadata, not plain registration.
- `export_for_document` is declared `read-only` but accepts `forceGenerate`; capability class needs review.

## Consequence for the federated index

`artifacts/agent-runs/vae-repo-index-seed-population-v1/proposed-seed.v1.json` declares 5
capabilities. The real surface is 143, with 28 already implemented — so that seed undercounts
substantially. Decide whether to widen it before applying.
