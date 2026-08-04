# Project: cross-agent-index-auto-publisher-activation-v1

## Summary

Next mission after index freshness foundation — activate Cross-Agent index auto-publisher and prove post-commit publication to L:/Supabase.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `cross-agent-index-auto-publisher-activation-v1` |
| Owner repo | CapitalGlass-Cross-Agent |
| Status | **RUNNER_ONLINE_PUBLICATION_PROVEN** — WESLEYDESK runner + manual publisher PASS @ `acd94ba` |

## Current state

- WESLEYDESK self-hosted runner installed (systemd + `wsl.conf` `[boot] systemd=true`)
- `index-publication.yml` workflow_dispatch proven (prior runs) + local publisher on desk
- Post-commit scheduled auto-publisher **not** active (`AUTO_PUBLISHER_V1_1_STAGED_NOT_ACTIVE`)
- Slice 6 publication gates closed — see `three-way-agent-improvement-intelligence-v1` closeout

## Do not advance

- `AUTO_PUBLISHER_V1_1_ACTIVE` until scheduled/cron trigger proven
- Conflate dashboard drift with publisher activation

## Prerequisite

`intelligence-hub-index-ai-cache-freshness-v1` foundation PASS (`67baa9d5`).

## Next action

1. Enable push-triggered `index-publication.yml` v1.1 on WESLEYDESK
2. Prove `NOOP_CURRENT` via workflow (not only local publisher)
3. Keep runner online after Windows reboot (`wsl.exe -d Ubuntu-24.04` or systemd service)
