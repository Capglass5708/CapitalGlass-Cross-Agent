# Cursor Help Claude — Handoff Protocol

**Purpose:** Claude (running in a cloud/Cowork session, no live shell into this
machine) drops requests here for the local Cursor agent — which *does* have a
real WSL2 terminal, Doppler/gh sessions, and network access — to execute.

## How it works

1. Claude creates a numbered, titled subfolder per request: `NN-short-title/`
2. Each request folder contains `REQUEST.md` — what's needed, why, and the
   exact commands/checks to run.
3. **Cursor agent:** read `REQUEST.md`, do the work, then write your results
   into a new `RESPONSE.md` in the same folder. Include exit codes, pass/fail
   status, and relevant output — not full logs unless asked.
4. Claude will periodically read this folder (via the desktop device bridge)
   to pick up `RESPONSE.md` files and continue from there.

## Hard rule — same as the rest of this estate

**Never write actual secret values into any file in this folder.**
No tokens, passwords, `.env` contents, or vault contents — status/pass-fail
and secret *names* only (e.g. "DOPPLER_OK", "cloudflare-mcp token present in
cg-mcp/dev"), exactly like `CLAUDE_CODE_MCP_WIRING_V1.md` section 6 and
`D:\Admin Keys\README.txt` already require. These files round-trip through a
cloud chat session — treat them with the same caution as pasting into any
chat window.

## Status tags

Use these at the top of `RESPONSE.md` so Claude can parse state at a glance:
`DONE` | `BLOCKED` | `NEEDS_WESLEY` | `PARTIAL`

---
Requests below, oldest first.
