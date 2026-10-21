# VAE Git-spine admission audit (v1)

**Subject:** `Capglass5708/Visual-Asset-Engine` @ `44e121c`
**Data:** [`git-spine-admission-audit.v1.json`](./git-spine-admission-audit.v1.json)
**Verdict:** `ON_SPINE_BUT_UNGOVERNED_AND_STALE`

## The Git spine is not the federated repo index

The Git spine is the **platform registry + derived-intel structural index in Supabase**
(control plane `xjivcwcyyimjujbchwdf`). Its runbook —
`CG-AppBuilder-MCP/docs/platform-registry/CG-WEB-AGENT-GIT-SPINE-ADMISSION.md` — states:

> `repository_index_status` resolves only against **Supabase registry** after import. Local
> `CG-Web-Agent/index/latest/*` is **repository-local** and is not Git-spine admission proof.

The same applies to `index/cg-federated-repo-index.v1.json`. These are unrelated systems.

## VAE is on the spine, and genuinely indexed

`registry.repositories` present · `registry.apps` present · 4 verified active aliases ·
latest published `codeintel` run `524ffaf1`, profile `structural-v1a`, **6,230 files / 7,915
symbols**, published 2026-08-16.

Only **2 of 27** registered repos have `index_status: indexed` — VAE and CapitalGlass-Documents.
VAE is ahead of the estate, not behind it.

## But the admission is ungoverned

| Defect | Severity |
| --- | --- |
| Governed seed (23 apps, regenerated 2026-09-07) has **zero** VAE mentions — live rows sit outside governed authority | high |
| `verification_status: discovered` (only such row); aliases cite `authority_source: ephemeral-vae-vector-intake-smoke-v1` | high |
| Classification disagrees three ways: `control_plane` / `development_local` / `engines` | medium |
| Structural index **16 commits stale** (`33a791a8` → `44e121c`) | medium |
| No `visual-assets` key in `DOMAIN_OWNERSHIP` | medium |

Contrast `CG-Web-Agent`, which *is* in the governed seed because it is being properly admitted.

## Remediation

See `remediation` in the JSON. Steps 2 and 4–6 require the WSL estate layout (sibling checkouts,
Doppler/Supabase) and cannot run from a cloud session — `generate-seed-v1.mjs` was confirmed to
fail here on missing `CapitalGlass-BidComposer/docs/platform-discovery/data`.

Two decisions block step 1: **classification** (recommend `mcp_package`) and **domain key**.

## Evidence

Live read-only SQL against `xjivcwcyyimjujbchwdf`, plus static reads of
`CG-AppBuilder-MCP@04f81628d` and a full clone of VAE at `44e121c`.
