# Claude WSL Execution Policy

**Work package:** `claude-estate-awareness-v1`  
**Status:** REQUIRED — upload with the main estate pack  
**Applies to:** All Capital Glass development, Git, npm, CI, and agent coordination advice

---

## Core rule

> **Capital Glass operates in WSL2 — not in a Windows shell.**

Claude must treat **WSL Ubuntu bash on ext4** as the default execution environment for all repo, build, test, Git, npm, and cross-repo agent work.

Claude must **not** default to:

- Windows PowerShell
- Windows CMD
- Git Bash rooted in `C:\Developer\repos`
- Paths under `/mnt/c/Developer/repos`

---

## Canonical environment

| Item | Value |
| --- | --- |
| Host | WSL2 — Ubuntu 24.04 |
| Shell | **bash** (integrated terminal and agent host) |
| User home repos | `/home/wesley/repos` |
| Workspace | `/home/wesley/Capital-Glass-Suite.WSL.code-workspace` (or repo under `~/repos`) |
| Env authority | `~/.config/capital-glass/cursor-wsl.env` |
| Intelligence Hub (L:) | `/mnt/l/Capital-Glass-Intelligence-Hub/00-master-index` |
| Published dev (Z:) | `/mnt/z/Capital-Glass-Dev/...` |

### Verification command (WSL bash)

```bash
test -d /home/wesley/repos/CG-AppBuilder-MCP && echo EXT4_OK || echo HOST_MODE_BLOCKED
```

From AppBuilder when diagnosing Cursor host:

```bash
cd ~/repos/CG-AppBuilder-MCP && npm run cursor:wsl-default:verify
```

---

## Forbidden paths for repo / agent work

| Path | Verdict |
| --- | --- |
| `C:\Developer\repos\...` | **HOST_MODE_BLOCKED** |
| `/mnt/c/Developer/repos/...` | **HOST_MODE_BLOCKED** |
| `\\wsl$\...` as workspace root for development | **Avoid** — use Remote-WSL workspace instead |

If Wesley is on a blocked path, Claude stops implementation advice and tells him to reconnect via **Capital Glass Cursor (WSL Suite)** shortcut — not a Windows-hosted repo window.

---

## When Windows is allowed (exceptions only)

Windows **PowerShell on CG-WESLEYWORK-01 / CG-WESLEYDESK-01** is valid **only** for Office Admin operations explicitly documented as Windows-only:

| Class | Examples |
| --- | --- |
| Storage / drives | Storage Keeper, SMB remap probes, drive mount gates |
| Endpoint admin | `scripts/devices/*`, scheduled tasks, registry |
| Vault USB | `scripts/vault/*` with IT Vault drive inserted |
| Explorer / session | Employee-session-dependent validation |

Even then: **Git publication and suite app commits** still originate from WSL ext4 — not from Windows checkout paths.

Label any Windows command block clearly: `WINDOWS_ADMIN_POWERSHELL — not for repo Git/npm`.

---

## How Claude should write commands

### Default (correct)

```bash
cd ~/repos/CG-AppBuilder-MCP
npm run agent:preflight:auto-v32 -- --json
```

```bash
export INTELLIGENCE_HUB_ROOT=/mnt/l/Capital-Glass-Intelligence-Hub
npm run active-ledger:export -- --repo=/home/wesley/repos/CapitalGlass-Cross-Agent
```

### Wrong (do not suggest unless Windows Admin exception)

```powershell
cd C:\Developer\repos\CG-AppBuilder-MCP
npm run agent:preflight:auto-v32
```

---

## Cross-desk and remote work

- WESLEY_WORK ↔ RYZEN9DESK coordination uses **Direct Connect** first — not SSH/Tailscale as default transport.
- RYZEN9DESK runner/bootstrap executes in **RYZEN9DESK WSL** ext4 `$HOME/repos`, not `/mnt/c`.

---

## Claude product note

Claude (web Project or desktop chat) does not run inside WSL itself. This policy means:

1. **All commands and paths Claude recommends** must assume Wesley executes them in **WSL bash** unless a Windows Admin exception applies.
2. Claude must **not** conflate "shell" with PowerShell for Capital Glass dev work.
3. When Wesley pastes terminal output, Claude should ask whether the prompt was WSL (`wesley@...`) or Windows (`PS C:\...`) before trusting path-dependent conclusions.

---

## Agent Fast Path

- WSL bash + `/home/wesley/repos` = default
- PowerShell/CMD = Office Admin exceptions only
- `/mnt/c/Developer/repos` = HOST_MODE_BLOCKED
- Prescribe bash; label Windows blocks explicitly
