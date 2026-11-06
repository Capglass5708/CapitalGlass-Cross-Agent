# Pending Bible update — Visual Asset Engine

**Target repo:** `Capglass5708/Visual-Asset-Engine` (a repo this session is not authorised to push to)
**Target file:** `docs/application-bible/09-PROGRESSION-LOG.md`
**Status:** PREPARED, NOT APPLIED

The Application Bible is canonical in git inside VAE (`docs/application-bible/`), and is mirrored to
Z: downstream via `npm run sync:application-bible` from `CG-AppBuilder-MCP`. It has no dedicated
handoff document; `09-PROGRESSION-LOG.md` is its running record and the correct place for this entry.

Because the Bible lives in VAE, the entry below could not be committed from this session. Apply it
there, then run the Z: sync. The Cross-Agent side of the handoff **is** applied — see
`handoffs/2026-09-08_vae-index-and-tool-surface-handoff.md` and the updated `handoffs/CURRENT_HANDOFF.md`.

## How to apply

1. In `Visual-Asset-Engine`, insert the row from `progression-log-entry.md` into the table in
   `docs/application-bible/09-PROGRESSION-LOG.md`, keeping the existing `<!-- milestone:... -->`
   anchor convention.
2. Update that file's `**Last updated:**` line to `2026-09-08`.
3. From `CG-AppBuilder-MCP`: `npm run sync:application-bible` (then `check:application-bible-sync`).

Do not edit the Z: copy directly — it is downstream.
