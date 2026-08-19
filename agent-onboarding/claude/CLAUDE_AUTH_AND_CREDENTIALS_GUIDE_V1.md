# Claude — Auth and Credentials Guide v1

**Work package:** `claude-full-estate-platform-integration-v1`  
**Audience:** Wesley (operator setup) + Claude (knowing what auth exists — never values)  
**Rule:** **Doppler is canonical** for system/application secrets. **Never paste secret values** in chat, Git, Z:, or Claude Project uploads.

---

## 1. Auth model (what Claude operates with)

Claude acts on Wesley's behalf using the **same credentials Cursor uses** — not a separate Claude-only vault.

| Layer | Where auth lives | Claude access |
| --- | --- | --- |
| **Doppler** | Workplace + per-project configs | MCP `user-doppler` (names only) or `doppler run` in WSL |
| **WSL integrations** | `~/.cursor/integrations.config.json` + Doppler-injected env at MCP launch | Via wired MCP or CLI |
| **Windows integrations** | `%USERPROFILE%\.cursor\integrations.env` | Cursor only — **do not copy into WSL** |
| **OAuth (hosted MCP)** | Cursor/Claude browser session | Supabase MCP, Vercel plugin, some Cloudflare |
| **CLI sessions** | `gh auth`, `az login`, `railway login`, `doppler login` | Same user machine — Claude instructs or uses MCP |

**Three MCP authorities (never merge):** Office Admin MCP | Doppler MCP | SharePoint MCP

---

## 2. Doppler projects (names only)

| Doppler project | Used for |
| --- | --- |
| `cg-mcp` | MCP API (`MCP_API_URL`, `MCP_API_TOKEN`), App Builder backend |
| `cg-shared` | GitHub PAT, Railway, Vercel optional, suite-wide |
| `cg-documents` | SharePoint MCP, Azure Graph app (`AZURE_*`), Document Center |
| `capital-glass-agent-ops` | Agent Loop, procedures root |
| Per-app projects | App deploy secrets (discover via `app.get_env_contract_names`) |

**WSL Doppler CLI check:**

```bash
doppler me >/dev/null 2>&1 && echo DOPPLER_OK || doppler login
```

**Run any command with secrets (WSL):**

```bash
cd ~/repos/CG-AppBuilder-MCP
doppler run --project cg-mcp --config dev -- npm run mcp:doctor
```

**Sync Cursor integrations from Doppler (Windows operator — not WSL copy):**

```powershell
cd C:\Developer\repos\CG-AppBuilder-MCP
npm run integrations:sync-doppler
```

---

## 3. Required secret **names** by integration

From `Z:\Capital-Glass-Dev\Cursor-MCP-Kit\mcp-inventory.json` — values only in Doppler.

| Integration | Doppler project | Required names |
| --- | --- | --- |
| CG App Builder MCP | `cg-mcp` / dev | `MCP_API_URL`, `MCP_API_TOKEN` |
| GitHub MCP | `cg-shared` / dev | `GITHUB_PERSONAL_ACCESS_TOKEN` |
| Cloudflare MCP | (integrations) | `CLOUDFLARE_API_TOKEN` |
| Doppler MCP | (integrations) | `DOPPLER_TOKEN` |
| Railway MCP | `cg-shared` / dev | `RAILWAY_MCP_PO_SERVER_CWD` (+ session or `RAILWAY_API_TOKEN`) |
| SharePoint MCP | `cg-documents` / dev | `SHAREPOINT_MCP_URL`, `SHAREPOINT_MCP_BEARER_TOKEN` |
| Agent Loop MCP | `capital-glass-agent-ops` / dev | `PROCEDURES_REPO_ROOT`, Supabase keys via integrations |
| Azure Graph / plugin | `cg-documents` / dev | `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` |
| Vercel plugin | `cg-shared` / dev | `VERCEL_TOKEN` (optional) |

**List names without values:**

```bash
doppler secrets --project cg-mcp --config dev --only-names
```

Or MCP: `user-doppler` → `secrets_names`

---

## 4. CLI auth (operator one-time / refresh)

Run from **WSL bash** unless noted.

| Tool | Setup | Verify |
| --- | --- | --- |
| **Git** | SSH key or HTTPS + credential helper | `ssh -T git@github.com` or `gh auth status` |
| **GitHub CLI** | `gh auth login` | `gh auth status` |
| **Doppler CLI** | `doppler login` | `doppler me >/dev/null 2>&1 && echo OK` |
| **Azure CLI** | `az login` (Windows or WSL) | `az account show` |
| **Railway CLI** | `railway login` | `railway whoami` |
| **Vercel CLI** | `vercel login` or token in Doppler | `vercel whoami` |
| **Wrangler** | `wrangler login` (Cloudflare token provision) | `wrangler whoami` |
| **Supabase CLI** | OAuth or `SUPABASE_ACCESS_TOKEN` in integrations | `supabase projects list` |

**GitHub MCP and `gh` share the same PAT family** — store PAT in Doppler `cg-shared`, sync to integrations, never commit.

---

## 5. MCP API backend (required for App Builder MCP)

PM2 stack on operator machine (Windows starts stack; WSL agents consume `http://127.0.0.1:3001`):

```powershell
# Windows — daily start
& "Z:\Capital-Glass-Dev\Cursor-MCP-Kit\Start-CgMcpForCursor.ps1"
```

**WSL health check:**

```bash
curl -fsS --max-time 3 http://127.0.0.1:3001/health && echo MCP_API_OK
npm run wsl:mcp:verify -- --json   # from ~/repos/CG-AppBuilder-MCP
```

Port **must** be `3001` — matches Doppler `MCP_API_URL`.

**Repair WSL MCP wiring:**

```bash
cd ~/repos/CG-AppBuilder-MCP
npm run wsl:mcp:repair -- --json
```

Backups: `~/.cursor/backups/mcp.json.<timestamp>.bak`

---

## 6. Hosted OAuth MCPs (no Doppler token in file)

| MCP | Auth method |
| --- | --- |
| Supabase (app DB) | Cursor/Claude OAuth → project `wvidyxufvcrtezzkwwse` |
| Supabase MCP control | OAuth → project `xjivcwcyyimjujbchwdf` |
| Vercel plugin | Marketplace OAuth + optional `VERCEL_TOKEN` |
| Azure plugin | `az login` DefaultAzureCredential |

Enable in **Claude Code** or **Cursor → Settings → MCP** same as Cursor inventory.

---

## 7. Office / IT vault (separate from Doppler app secrets)

| Store | Purpose | Claude rule |
| --- | --- | --- |
| **D:\Capital-Glass-IT-Vault** | Endpoint/machine passwords | **Never read contents** — policy paths only via Office Admin MCP |
| **Doppler** | Integration/API secrets | Names via MCP; values via `doppler run` only |
| **SharePoint** | M365 operational data | SharePoint MCP when authorized |

Office Admin MCP is **read-only** — scripts run on Windows by operator or Cursor, not via MCP execution.

---

## 8. Claude Code — wire auth once

1. Install **Claude Code** on WESLEY_WORK / WESLEYDESK
2. Ensure WSL repos at `~/repos` and Doppler CLI logged in
3. Run MCP repair (section 5) — produces `~/.cursor/mcp.json` for WSL
4. Point Claude Code MCP config at same servers as `mcp-inventory.json`
5. Start PM2 / mcp-api before material MCP work
6. Run readiness:

```bash
cd ~/repos/CG-AppBuilder-MCP
npm run mcp:doctor
doppler run --project cg-mcp --config dev -- npm run integrations:preflight
```

See **`CLAUDE_CODE_MCP_WIRING_V1.md`** for step-by-step.

---

## 9. Forbidden (same as Cursor)

- Committing `.env`, `integrations.env`, vault exports, PATs, tokens
- Pasting secret values into Claude Project knowledge
- Copying Windows `integrations.env` into WSL
- Using `/mnt/c/Developer/repos` for agent Git work
- Storing passwords in chat logs or ledger markdown

---

## 10. Auth troubleshooting

| Symptom | Fix |
| --- | --- |
| MCP tools empty / fail | `npm run wsl:mcp:repair -- --json`; restart Claude Code |
| `MCP_API_URL` unreachable | Start PM2 on Windows; check port 3001 |
| Doppler errors in WSL | `doppler login` — do not copy Windows env file |
| GitHub 401 | Refresh PAT in Doppler → `integrations:sync-doppler` on Windows |
| Railway MCP auth fail | `npm run mcp:railway-health:once:doctor` |
| Cloudflare MCP OAuth lock | `npm run mcp:cloudflare:heal` |
| Azure Graph fail | `az login`; verify `cg-documents` secrets exist (names only) |

**Diagnostic MCP:** `user-cg-diagnostic` → `doppler_cli_check`, `preflight_plan`, `health_status`

---

## 11. Operator checklist — auth ready for Claude

| Check | Pass? |
| --- | --- |
| `doppler login` OK in WSL | ☐ |
| `gh auth status` OK | ☐ |
| `curl http://127.0.0.1:3001/health` OK | ☐ |
| `npm run wsl:mcp:verify -- --json` PASS | ☐ |
| Claude Code MCP servers match inventory | ☐ |
| PM2 stack started (Windows) | ☐ |
| No secrets in Claude Project uploads | ☐ |

When all pass, Claude may act with **full platform auth** via MCP + CLI on your behalf.
