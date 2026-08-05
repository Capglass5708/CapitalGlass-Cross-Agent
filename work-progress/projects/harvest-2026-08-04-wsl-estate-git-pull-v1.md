# harvest-2026-08-04-wsl-estate-git-pull-v1

**Status:** HARVEST_COMPLETE (Phase A)  
**Subject:** WSL estate git pull — 31 OK, 2 FAIL, 22 dirty  
**Tier:** T2

## Summary

Operator requested estate-wide `git pull --ff-only` on WESLEY_WORK WSL (`/home/wesley/repos`). Two repos blocked: CapitalGlass-Documents (no upstream), Visual-Asset-Engine (diverged main).

## Next action

Operator: `npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-04-wsl-estate-git-pull-v1`

## Open repo fixes

- **CapitalGlass-Documents:** set upstream or `git pull origin work/document-center-adaptive-details-panel-v1-clean`
- **Visual-Asset-Engine:** merge or rebase `origin/main`
