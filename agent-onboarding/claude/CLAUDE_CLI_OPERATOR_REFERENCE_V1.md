# Claude — CLI Operator Reference v1

**Work package:** `claude-full-estate-platform-integration-v1`  
**Execution host:** WSL2 Ubuntu bash — `cd ~/repos/CG-AppBuilder-MCP` unless another owner repo is named  
**Machine index:** `claude-cli-command-index-v1.json`

---

## 1. Session open (every material turn)

```bash
cd ~/repos/CG-AppBuilder-MCP
export CG_AUTO_V32_WORK_PACKAGE='<work-package-id>'
export CG_AUTO_V32_MISSION_CLASS='investigate'   # fix | closeout | deploy | docs | ownership
# export CG_AUTO_V32_MATERIAL='true'               # material code/deploy/closeout
# export CG_AUTO_V32_REPO='/home/wesley/repos/<owner-repo>'

npm run agent:index:scout -- --json
npm run luna:retrieve -- --director --query="<mission summary>" --json

# Read (no npm):
# ~/repos/CapitalGlass-Cross-Agent/work-progress/ACTIVE_WORK.md
# ~/repos/CapitalGlass-Cross-Agent/handoffs/CURRENT_HANDOFF.md
```

---

## 2. Material preflight (code, deploy, closeout)

```bash
cd ~/repos/CG-AppBuilder-MCP
export CG_AUTO_V32_WORK_PACKAGE='<id>'
export CG_AUTO_V32_MISSION_CLASS='fix'
export CG_AUTO_V32_MATERIAL='true'

npm run agent:preflight:auto-v32 -- --run-compile --json
npm run agent:preflight:app-builder-mcp
npm run execution-context:resolve -- --work-package=<id> --json
npm run agent:context:compile -- --work-package=<id>   # when profile requires
```

**Session close:**

```bash
npm run auto:v3:session-closeout -- --work-package=<id> --payload=./closeout.json --json
```

Include `"clientSurface": "CLAUDE"` in closeout payload.

---

## 3. WaveRunner (multi-step autonomous waves)

```bash
cd ~/repos/CG-AppBuilder-MCP
npm run sdlc:waverunner:resolve -- --milestone=<id> --json
npm run sdlc:waverunner -- --milestone=<id> --json
```

One milestone lock at a time — coordinate with Cursor.

---

## 4. Intelligence Hub + ledger

```bash
cd ~/repos/CG-AppBuilder-MCP

# Export Cross-Agent ledger to Hub (after markdown edits, operator approval):
export INTELLIGENCE_HUB_ROOT=/mnt/l/Capital-Glass-Intelligence-Hub
npm run active-ledger:export -- --repo=/home/wesley/repos/CapitalGlass-Cross-Agent

# Ingest (requires explicit approval env + Doppler):
CROSS_AGENT_LEDGER_INGEST_APPROVED=1 doppler run --project cg-mcp --config dev -- \
  npm run cross-agent-ledger:ingest -- --apply --repo=/home/wesley/repos/CapitalGlass-Cross-Agent

npm run active-ledger:sync:check -- --repo=/home/wesley/repos/CapitalGlass-Cross-Agent
```

**Hub mount check:**

```bash
test -d /mnt/l/Capital-Glass-Intelligence-Hub/00-master-index && echo INDEX_OK
```

---

## 5. MCP health + repair

```bash
cd ~/repos/CG-AppBuilder-MCP

npm run mcp:doctor
npm run mcp:doctor:gate                    # strict gate
npm run wsl:mcp:verify -- --json
npm run wsl:mcp:repair -- --json           # fix ~/.cursor/mcp.json
npm run mcp:repair:cursor:json

# Integrations (often needs doppler):
doppler run --project cg-mcp --config dev -- npm run integrations:preflight
npm run mcp:railway-health:once:doctor
npm run mcp:cloudflare:check
npm run mcp:cloudflare:heal
```

**PM2 (Windows operator starts; WSL consumes API):**

```powershell
& "Z:\Capital-Glass-Dev\Cursor-MCP-Kit\Start-CgMcpForCursor.ps1"
```

```bash
cd ~/repos/CG-AppBuilder-MCP && npm run mcp:status
```

---

## 6. Git + GitHub (owner repo)

```bash
cd ~/repos/<owner-repo>
git status
git pull --ff-only
git checkout -b <branch>
# ... edits ...
git add -A && git commit -m "..."
gh pr create --title "..." --body "..."
gh pr checks
gh run list --limit 5
```

**Never** force-push `main`. Coordinate branch with Cursor (parallel guide).

---

## 7. App deploy gates (typical pattern)

In **owning app repo**:

```bash
cd ~/repos/<App-Repo>
npm run build                    # if applicable
npm test                         # if applicable
npm run deploy:gate              # name varies — use app MCP app.describe_gate_command
```

Cross-app wiring check:

```bash
cd ~/repos/CG-AppBuilder-MCP
# MCP: cg-suite-wiring resolve_wiring_path, describe_bridge
# CLI diagnostic:
npm run diag:smoke:integrations-health
```

---

## 8. Direct Connect (cross-desk WESLEY_WORK ↔ RYZEN9DESK)

```bash
cd ~/repos/CG-AppBuilder-MCP
npm run direct-connect:preflight -- --json
```

Handoff bus (read/write by operator policy):

`/mnt/z/Office/Wes/Direct Connect/handoffs`

**Not SSH-first** — see Office Admin MCP Direct Connect sequence.

---

## 9. Office Admin (CapitalGlass-Office-Admin)

**MCP preflight first** (read-only). Scripts run on **Windows PowerShell** when executing:

```powershell
# Example — endpoint gate (Windows, not WSL):
cd C:\Developer\repos\CapitalGlass-Office-Admin
.\scripts\devices\common\Test-OfficeDriveSidePanelGate.ps1 -EndpointId CG-WESLEYWORK-01
```

Network 3-way composer (material IT):

```bash
cd ~/repos/CapitalGlass-Office-Admin
npm run office-admin:controller -- --run-id=<id> --init --cursor-wiring
# ... builder → critic → verifier
```

---

## 10. Agent Loop + procedures

```bash
# MCP: user-agent-loop → glass_preflight, procedure_preflight, get_verification_playbook

cd ~/repos/capital-glass-agent-ops
# Read docs/PROCEDURE_LOOP_READINESS.md
```

Sync procedure sidecars (Windows):

```powershell
& "Z:\Capital-Glass-Dev\Cursor-MCP-Kit\Sync-ProcedureSidecars.ps1"
```

---

## 11. Failure Intelligence (before retrying)

Use MCP `user-failure-intelligence-mcp`:

- `failure.preflight`
- `failure.search_similar`
- `failure.get_repair_playbook`
- `failure.lookup_rejected_approaches`

---

## 12. Suite coherence + repository health

```bash
cd ~/repos/CG-AppBuilder-MCP
npm run suite-coherence:audit          # if available in package.json
npm run check:cross-index-parity
```

MCP: `user-cg-app-mcp` → `get_repository_health`, `intelligence.get_hub_status`

---

## 13. WSL estate maintenance

```bash
cd ~/repos/CG-AppBuilder-MCP
npm run wsl:verify-repo-library
npm run wsl:mount-authority-drives      # Z: / L: drvfs when needed
npm run wsl:ensure-z-drvfs-authority:json
```

---

## 14. Context budget (Tier 2/3 packages)

```bash
cd ~/repos/<owner-repo>   # or AppBuilder for cross-repo
npm run agent:context:validate-profile
npm run agent:context:compile -- --work-package=<id>
npm run agent:context:check -- --work-package=<id>
```

---

## 15. Quick task → command map

| Task | Command / MCP |
| --- | --- |
| What is active? | Read `ACTIVE_WORK.md`; `agent:index:scout` |
| Blockers / MCP catalog | Hub BY-KIND slices; scout JSON |
| Plan before code | `luna:retrieve --director` |
| Material fix | auto-v32 preflight → execution-context → owner repo |
| Cross-app wiring | Suite Wiring MCP; `resolve_wiring_path` |
| Deploy failure | App MCP + Diagnostic `preflight_plan` |
| Retry after fail | Failure Intelligence MCP first |
| Close session | `auto:v3:session-closeout` + clientSurface CLAUDE |
| Multi-step wave | `sdlc:waverunner` |
| Office/network | Office Admin MCP preflight → Windows scripts |
| MCP broken | `wsl:mcp:repair`, `mcp:doctor` |
| Secrets missing | `doppler secrets --only-names`; never ask for values in chat |

---

## 16. Control plane repo map (WSL paths)

| Repo | Path | Role |
| --- | --- | --- |
| CG-AppBuilder-MCP | `~/repos/CG-AppBuilder-MCP` | Execution, MCP, WaveRunner, Auto v3.2 |
| CapitalGlass-Cross-Agent | `~/repos/CapitalGlass-Cross-Agent` | Ledger, handoffs, onboarding |
| CG-Platform-Governance-MCP | `~/repos/CG-Platform-Governance-MCP` | Constitutional authority |
| CapitalGlass-Office-Admin | `~/repos/CapitalGlass-Office-Admin` | IT/endpoints/network |
| Cursor-MCP-Kit | `~/repos/Cursor-MCP-Kit` | Workstation MCP optimizer |
| capital-glass-agent-ops | `~/repos/capital-glass-agent-ops` | Agent Loop runtime |
| CG-Failure-Intelligence-MCP | `~/repos/CG-Failure-Intelligence-MCP` | Failure playbooks store |

Full registry: `machines-wsl-paths-v1.json` in this folder.

---

## 17. Auto Protocol v3 binding (suite missions)

```bash
cd ~/repos/CG-AppBuilder-MCP
npm run auto:v3:binding
npm run auto:v3:closeout -- --work-package=<id> --repo=/home/wesley/repos/<repo>
```

Canonical prose: `Z:\Capital-Glass-Dev\Chat GPT Instructions\Auto-Protocol\Auto v3.2\`
