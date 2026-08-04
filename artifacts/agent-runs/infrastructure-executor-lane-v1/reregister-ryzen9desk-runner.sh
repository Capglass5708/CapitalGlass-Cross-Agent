#!/usr/bin/env bash
set -euo pipefail
REG=$(gh api -X POST repos/Capglass5708/CG-AppBuilder-MCP/actions/runners/registration-token --jq .token)
REM=$(gh api -X POST repos/Capglass5708/CG-AppBuilder-MCP/actions/runners/remove-token --jq .token)
ssh -F /mnt/c/Users/wesle/.ssh/config -o BatchMode=yes cg-ryzen9desk-01 "wsl.exe -d Ubuntu-24.04 -u wesley bash -s" <<EOF
set -euo pipefail
cd ~/actions-runner
sudo ./svc.sh stop 2>/dev/null || true
sudo ./svc.sh uninstall 2>/dev/null || true
./config.sh remove --token "${REM}"
./config.sh --url https://github.com/Capglass5708/CG-AppBuilder-MCP --token "${REG}" --name ryzen9desk-wsl2-CG-RYZEN9DESK-01 --labels self-hosted,ryzen9desk,wsl2,gpu,computer-estimator --unattended
sudo ./svc.sh install wesley
sudo ./svc.sh start
sleep 5
sudo ./svc.sh status
journalctl -u actions.runner.Capglass5708-CG-AppBuilder-MCP.ryzen9desk-wsl2-CG-RYZEN9DESK-01.service -n 12 --no-pager
EOF
