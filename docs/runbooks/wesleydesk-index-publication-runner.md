# WESLEYDESK index publication runner

**Work package:** `cross-agent-index-auto-publisher-activation-v1`  
**Owner repo:** CapitalGlass-Cross-Agent  
**Workflow:** `.github/workflows/index-publication.yml`  
**Runner labels:** `self-hosted`, `wesleydesk`, `wsl2`

Cross-Agent index publication to L:/Supabase **must** execute on **CG-WESLEYDESK-01** WSL2 because that host owns the canonical L: Intelligence Hub mount. WESLEY_WORK is a control host only.

**Triggers:** `workflow_dispatch` (manual) and **push to `main`** when `work-progress/**`, `handoffs/**`, or `registry/**` change.

## Symptom

`index-publication.yml` jobs stay **queued** with zero repo runners online:

```bash
gh api repos/Capglass5708/CapitalGlass-Cross-Agent/actions/runners
# total_count: 0
```

## Prerequisites (WESLEYDESK WSL)

| Check | Command |
| --- | --- |
| Host identity | `npm run runner:preflight` |
| L: mounted | `test -d /mnt/l/Capital-Glass-Intelligence-Hub/00-master-index/BY-KIND` |
| Sibling repos | `CG-AppBuilder-MCP`, `Data-Extraction` under `~/repos` |
| Doppler | `doppler --version` (publication uses `doppler run`) |
| GitHub CLI | `gh auth status` |

## Install (one-time on WESLEYDESK)

```bash
cd ~/repos/CapitalGlass-Cross-Agent
git pull origin main
npm run runner:install:dry-run
export REGISTRATION_TOKEN="$(gh api -X POST repos/Capglass5708/CapitalGlass-Cross-Agent/actions/runners/registration-token -q .token)"
npm run runner:install
```

The install script registers a **repo-scoped** runner (personal account — no org runner group).

Default install path: `~/actions-runner-cross-agent` (systemd service).

## Hardening (post-install)

### Persistent WSL DNS

WSL may assign a broken resolver (`172.x.x.1`). Persist LAN DNS on WESLEYDESK:

```bash
# as root (passwordless via wsl.exe -u root from Windows admin session)
wsl.exe -d Ubuntu-24.04 -u root bash ~/repos/CapitalGlass-Cross-Agent/scripts/runner/configure-wesleydesk-wsl-network.sh
# or: npm run runner:configure-wsl-network  # requires sudo on WSL
```

Sets `/etc/wsl.conf` → `generateResolvConf = false` and `nameserver 192.168.1.254` in `/etc/resolv.conf`. Reboot WSL once to confirm persistence: `wsl.exe --shutdown` then reopen Ubuntu.

### Systemd service (survives reboot)

If `npm run runner:install` cannot `sudo` without a password, install the service as root:

```bash
wsl.exe -d Ubuntu-24.04 -u root bash -lc 'cd /home/wesley/actions-runner-cross-agent && ./svc.sh install wesley && ./svc.sh start && ./svc.sh status'
```

Verify: `systemctl is-enabled actions.runner.Capglass5708-CapitalGlass-Cross-Agent.wesleydesk-wsl2-cross-agent.service`

### Post-Windows-reboot recovery

WSL stops on Windows reboot until something starts it. **Permanent fix:** install the logon scheduled task once on WESLEYDESK (elevated PowerShell):

```powershell
cd ~\repos\CapitalGlass-Cross-Agent   # or WSL path after git pull
powershell -ExecutionPolicy Bypass -File scripts/runner/install-wesleydesk-runner-autostart.ps1
```

### Pro-level WSL persistence (publication lane)

Root cause of publication failures: **Ubuntu-24.04 stops** when no Windows-side `wsl.exe` client remains connected. Short ping tasks are not enough.

**One-time install (elevated PowerShell on WESLEYDESK):**

```powershell
cd ~\repos\CapitalGlass-Cross-Agent
powershell -ExecutionPolicy Bypass -File scripts\runner\install-wesleydesk-wsl-persistence.ps1
```

This installs:

| Task | Purpose |
| --- | --- |
| `CapitalGlass-WESLEYDESK-WSL-Runner-Anchor-Process` | SYSTEM, unlimited: `wsl.exe … sleep infinity` (keeps distro **Running**) |
| `CapitalGlass-WESLEYDESK-WSL-Runner-Anchor-Watchdog` | Every 1m: restart anchor if WSL stopped |
| `CapitalGlass-WESLEYDESK-WSL-Runner-Watchdog` | Every 1m: `ensure-wesleydesk-runner-wsl.sh` (DNS + Runner.Listener) |
| `CapitalGlass-WESLEYDESK-WSL-Runner-Keepalive` | Every 1m: lightweight WSL ping |
| `.wslconfig` | `vmIdleTimeout=-1` (user + SYSTEM profiles) |

Receipt: `runtime/runner/wesleydesk-wsl-persistence-receipt.json`  
Ensure receipt: `/var/log/cg-wesleydesk-runner/latest-ensure.json`

**Lane verify (read-only):**

```powershell
powershell -ExecutionPolicy Bypass -File scripts\runner\verify-wesleydesk-publication-lane.ps1
```

**Recovery order (do not spam workflow_dispatch):**

1. Cancel stuck `index-publication` run if `in_progress` >10m with WSL **Stopped**
2. Run persistence installer (or ensure script only if tasks already installed)
3. Confirm `wsl.exe -l -v` shows **Running** for **≥3 minutes unattended**
4. Confirm runner **online** and **busy=false**
5. **One** `workflow_dispatch` for `index-publication.yml`

Only set `CG_WSL_CONFIG_REFRESH=true` when changing `.wslconfig` (triggers one `wsl --shutdown`).

**Manual recovery** (any time runner shows offline):

```bash
wsl.exe -d Ubuntu-24.04 -u root bash /home/wesley/repos/CapitalGlass-Cross-Agent/scripts/runner/ensure-wesleydesk-runner-wsl.sh
```

The ensure script writes `wsl.conf` (`systemd=true`), enables `cg-wesleydesk-resolv.service`, and starts the GitHub Actions runner unit.

### Runner version

Default tarball version is **2.336.0** (required for `actions/checkout` node24 runtime). Override with `RUNNER_VERSION` only when upgrading deliberately.

## Verify runner online

```bash
gh api repos/Capglass5708/CapitalGlass-Cross-Agent/actions/runners
gh workflow run runner-smoke.yml --repo Capglass5708/CapitalGlass-Cross-Agent
gh run list --repo Capglass5708/CapitalGlass-Cross-Agent --workflow runner-smoke.yml --limit 3
```

Smoke receipt: `artifacts/agent-runs/cross-agent-index-auto-publisher-activation-v1/wesleydesk-runner-preflight.json`

## Clear queued publication

After the runner is **online**, re-dispatch or wait for the queued job to start:

```bash
gh workflow run index-publication.yml --repo Capglass5708/CapitalGlass-Cross-Agent -f reason="runner-online-retry"
# or watch an existing queued run:
gh run watch 30861642734 --repo Capglass5708/CapitalGlass-Cross-Agent
```

## Uninstall

```bash
cd ~/actions-runner-cross-agent
sudo ./svc.sh stop
sudo ./svc.sh uninstall
./config.sh remove --token "$(gh api -X POST repos/Capglass5708/CapitalGlass-Cross-Agent/actions/runners/remove-token -q .token)"
```

## Related

- Harvest runbook: `docs/runbooks/harvest-record-validate-sync.md`
- Publisher implementation: `scripts/index/run-index-publisher.mjs`
- RYZEN9DESK managed executor (separate): `CG-AppBuilder-MCP/scripts/executor/install-github-runner-wsl-service.sh`
