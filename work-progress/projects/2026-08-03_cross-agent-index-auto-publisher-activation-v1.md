# Project: cross-agent-index-auto-publisher-activation-v1

## Summary

Next mission after index freshness foundation — activate Cross-Agent index auto-publisher and prove post-commit publication to L:/Supabase.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `cross-agent-index-auto-publisher-activation-v1` |
| Owner repo | CapitalGlass-Cross-Agent |
| Status | **CODE_READY_FOR_RUNNER_BOOTSTRAP** — workflow + publisher staged; WESLEYDESK runner install pending |

## Current state

- Publisher workflow staged (`index-publication.yml`)
- WESLEYDESK runner bootstrap scripts + `runner-smoke.yml` added
- Post-commit publication **not** proven until runner online + smoke PASS
- `AUTO_PUBLISHER_V1_1_STAGED_NOT_ACTIVE` preserved until smoke + publication receipt

## Do not advance

- Mark active without publisher trigger enabled and post-commit proof
- Conflate dashboard drift (Platform Health / ASG observe lane) with publisher activation

## Prerequisite

`intelligence-hub-index-ai-cache-freshness-v1` foundation PASS (`67baa9d5`).

## Next action

1. On **CG-WESLEYDESK-01** WSL: `npm run runner:install` (see `docs/runbooks/wesleydesk-index-publication-runner.md`)
2. `gh workflow run runner-smoke.yml`
3. Re-dispatch `index-publication.yml` to clear queued run **30861642734**
