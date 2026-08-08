# Wesleydesk plan-processing worker deploy closeout

**Work package:** `wesleydesk-plan-processing-worker-deploy-closeout-v1`  
**Owner repo:** CapitalGlass-Documents  
**Status:** `BLOCKED_WESLEYDESK_WORKER_DEPLOY` (host gate — desk-local proof required)

## Blocker

Remote verification from CG-RYZEN9DESK-01 failed:

- SSH → Permission denied
- `Invoke-Command` → Access denied
- `https://office-worker.capitalglasstxapps.com/healthz` → HTTP 502

This is **not** a processing architecture defect. Beacon and Rosewood are `PLAN_INTELLIGENCE_READY` on the data plane.

## Operator sequence (CG-WESLEYDESK-01)

```powershell
cd C:\Developer\repos\CapitalGlass-Documents
git fetch origin && git checkout main && git pull
git rev-parse HEAD   # target: origin/main (29be72cd+)
.\scripts\proof\wesleydesk-plan-processing-worker-deploy-closeout.ps1
```

## Four proofs required

1. `CapitalGlass-Office-Document-Worker` healthy at current build
2. Intelligence sidecar on port **8791**
3. Bounded Synology-primary job succeeds without SharePoint-authority error
4. Single canonical worker (no stale racer)

## Drift check after deploy

```powershell
doppler run -p cg-documents -c prd -- npx tsx scripts/proof/aggregate-plan-intelligence.ts ce0db433-2214-45b8-bf43-00077f179bf4
doppler run -p cg-documents -c prd -- npx tsx scripts/proof/aggregate-plan-intelligence.ts 748545a7-5114-47dd-a979-3d72a0b3b8eb
```

## Evidence

- `CapitalGlass-Documents/artifacts/agent-runs/wesleydesk-plan-processing-worker-deploy-closeout-v1/closeout-receipt.json`
- `CapitalGlass-Documents/scripts/proof/wesleydesk-plan-processing-worker-deploy-closeout.ps1`

## Harvest packet

`wesleydesk-worker-deploy-blocked-v1` in `harvest-2026-08-07-m4pds-plan-processing-engine-closeout-v1`
