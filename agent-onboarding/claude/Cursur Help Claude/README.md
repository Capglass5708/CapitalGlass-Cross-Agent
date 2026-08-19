# Cursor Help Claude — Wesley Work Handoff and Reconnect Guide

**Folder:** `Z:\Capital-Glass-Dev\Claude Start Package\Cursur Help Claude`  
**WSL path:** `/mnt/z/Capital-Glass-Dev/Claude Start Package/Cursur Help Claude`  
**Git source:** `CapitalGlass-Cross-Agent/agent-onboarding/claude/Cursur Help Claude/`

This folder is the durable handoff bus between Claude and Cursor. It is also
the reconnect point for Claude Code on another machine. GitHub is the source
of truth; Z: is the published operator mirror.

## What is complete

- Claude account connected to Cursor through the official Anthropic Claude Code
  extension.
- Claude Code local MCP configuration wired from the Cursor WSL definitions.
- 26 MCP definitions configured; 19 stdio servers completed live handshakes.
- Nine required read-only MCP probes returned live data:
  Office Admin, Doppler, CG App Builder, Diagnostic, Suite Wiring, Agent Loop,
  GitHub, SharePoint, and Failure Intelligence.
- Claude Code can use the same WSL2/ext4 platform lane as Cursor.
- `Cursur Help Claude/` was promoted into the Git source tree.
- Five unsafe Doppler token checks were replaced with identity-only checks:

```bash
doppler me >/dev/null 2>&1 && echo DOPPLER_OK || echo DOPPLER_LOGIN_REQUIRED
```

- Git source and Z: package passed recursive verification:
  `31 MATCH`, `CLEAN`, `MIRROR_IN_SYNC`.
- The integration matrix is intentionally:
  `30 DISCOVERED / 3 CONNECTED / 2 BLOCKED / 0 PROVEN`.

## What is not complete

- Formal `PROVEN` status is not claimed.
- The missing `clientSurface: "CLAUDE"` field in Auto v3.2 receipts remains
  the main proof gap.
- Six hosted OAuth services may still require interactive authorization:
  Cloudflare platform/bindings/builds/observability and Supabase services.
- WaveRunner 2.0 has not been executed by Claude; only the documented CLI and
  skill are available.
- Office Admin MCP is read-only. Endpoint scripts and IT Vault credentials
  remain operator-controlled.
- `CURRENT_HANDOFF.md` is separate stale-work remediation and is not part of
  this package change.

## Reconnect Claude on another machine

### 1. Use the correct host

Use WSL2 Ubuntu bash and the ext4 repository root:

```bash
test -d ~/repos && echo EXT4_OK
cd ~/repos
```

Do not use `C:\Developer\repos` or `/mnt/c/Developer/repos` for Git/npm work.
Those paths are `HOST_MODE_BLOCKED`.

### 2. Pull the Git source

On the other machine, clone or update the canonical repository:

```bash
cd ~/repos
git clone https://github.com/Capglass5708/CapitalGlass-Cross-Agent.git
cd CapitalGlass-Cross-Agent
git fetch origin
git checkout main
git pull --ff-only
```

If the Claude integration PR is not merged yet, use the published feature
branch only when Wesley explicitly directs it:

```bash
git fetch origin
git checkout feat/claude-code-mcp-wiring-v1
git pull --ff-only
```

### 3. Refresh the Wesley Work operator mirror

When Z: is mounted:

```bash
test -d "/mnt/z/Capital-Glass-Dev" && echo Z_OK
```

Read the latest handoff from:

```text
/mnt/z/Capital-Glass-Dev/Claude Start Package/Cursur Help Claude/README.md
```

The package does not self-update. A machine must pull Git source or receive a
new published Z: mirror. Do not edit the Z: copy as an independent source.

### 4. Connect Claude Code

1. Open Cursor in the WSL workspace.
2. Install or open **Claude Code for VS Code**, publisher **Anthropic**.
3. Choose **Claude.ai Subscription** and sign in with the Claude account.
4. Reload Cursor.
5. Open Claude Code and run `/mcp`.
6. Confirm the required servers are connected.

Claude Code settings are local to each machine. Do not copy
`~/.claude.json`, `~/.cursor/integrations.env`, `.env` files, tokens, or
passwords between machines.

### 5. Prepare local MCP runtime

From WSL on the machine being connected:

```bash
cd ~/repos/CG-AppBuilder-MCP
npm run wsl:mcp:repair -- --json
npm run wsl:mcp:verify -- --json
```

The MCP API must be healthy on port 3001. The Windows operator starts the
approved PM2 stack when required:

```powershell
& "Z:\Capital-Glass-Dev\Cursor-MCP-Kit\Start-CgMcpForCursor.ps1"
```

Authenticate locally without exposing values:

```bash
doppler login
gh auth login
doppler me >/dev/null 2>&1 && echo DOPPLER_OK
gh auth status
```

Doppler-backed launchers resolve credentials at runtime. Never paste secret
values into Claude, this handoff bus, Git, or Z:.

## How Claude requests Cursor work

1. Claude creates a numbered folder, for example:
   `03-read-only-preflight/`.
2. Claude writes `REQUEST.md` with scope, reason, exact safe checks, and
   expected output.
3. Cursor reads it, confirms the work package and write lane, and executes
   only the approved scope.
4. Cursor writes `RESPONSE.md` with status, exit codes, and concise evidence.
5. Claude reads the response and continues.

Allowed response tags:
`DONE` | `BLOCKED` | `NEEDS_WESLEY` | `PARTIAL`

This is coordination, not an automatic trigger. A watcher, Agent Loop mission,
or the operator must cause the next agent to read the new file.

## Parallel lane rules

- One active writer per repository branch.
- Cursor owns implementation, commits, and gates unless Wesley explicitly
  reassigns the write lane.
- Claude defaults to investigate, plan, review, and read-only MCP work.
- Never reset, clean, delete, or checkout over another agent's dirty work.
- Never run duplicate WaveRunner execution on the same milestone.
- Do not claim `PROVEN` without a Verifier-backed receipt.

## Security rules

Never write any of these into this folder:

- passwords or API keys
- PATs or OAuth tokens
- `.env` or `integrations.env` contents
- IT Vault contents
- saved browser credentials

Secret names and safe status values are permitted, for example
`DOPPLER_OK`, `MCP_API_OK`, or `SHAREPOINT_MCP_TOKEN_PRESENT`.

## Current handoff requests

- `01-environment-readiness-check/REQUEST.md` and `RESPONSE.md`
- `02-claude-code-mcp-wiring/REQUEST.md` and `RESPONSE.md`

Create the next numbered request only when a new handoff is needed.
