# Agent Ledger Update Runbook

Use this whenever Wesley pastes Cursor or agent output that contains valuable build information.

## Steps

1. Identify the project/work package.
2. Extract only valuable information:
   - repo names
   - commits and push status
   - verification results
   - machine/host names
   - paths that future agents need
   - blockers and next actions
   - decisions and authority rules
3. Update `work-progress/ACTIVE_WORK.md`.
4. Update or create the relevant project file under `work-progress/projects/`.
5. Update `work-progress/projects/INDEX.md` if project status or next action changed.
6. If the information changes global lookup behavior, update `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md`.
7. Commit the documentation update.

## Do not capture

- secrets
- full source code
- copied Bibles
- database dumps
- long unneeded logs
- repeated chat filler
