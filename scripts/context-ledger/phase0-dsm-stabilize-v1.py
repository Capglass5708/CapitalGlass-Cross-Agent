#!/usr/bin/env python3
"""Stabilize DSM security state for Phase 0 transport proof.

Steps:
  1. Export immutable snapshot of all CG-CTX-* scheduled tasks
  2. Disable every CG-CTX-* task (no deletes)
  3. Verify/restore production identity (nologin shell; no SSH repair)
  4. Capture baselineSecurityStateHash
  5. Fresh FileStation vault/meta transport proof
  6. Stability wait + delayed recapture
  7. Run read-only infra proof when gates pass

Does not reapply share ACLs when authoritative read-back is already correct.
"""
from __future__ import annotations

import contextlib
import io
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from synology_api import core_user, task_scheduler

REPO = Path(__file__).resolve().parents[2]
LIB_DIR = REPO / "scripts/context-ledger/lib"
sys.path.insert(0, str(LIB_DIR))

from dsm_security_state import (  # noqa: E402
    capture_security_state,
    classify_acl_vs_filestation,
    security_config_hash,
    security_state_hash,
)

ARTIFACT_DIR = REPO / "artifacts/agent-runs/immutable-context-ledger-v1"
HOST = os.environ.get("CG_SERVER_HOST", "100.112.81.50")
PORT = os.environ.get("CG_SERVER_PORT", "5001")
SERVICE_USER = "cg-context-ledger"
FILE_STATION_APP_ID = "SYNO.SDS.App.FileStation3.Instance"
STABILITY_WAIT_SECONDS = int(os.environ.get("CONTEXT_LEDGER_STABILITY_WAIT_SECONDS", "180"))
MUTATOR_PREFIX = "CG-CTX"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def list_all_cg_ctx_tasks(ts: task_scheduler.TaskScheduler) -> list[dict]:
    tasks: list[dict] = []
    offset = 0
    while True:
        page = ts.get_task_list(offset=offset, limit=50)
        batch = page.get("data", {}).get("tasks", [])
        if not batch:
            break
        tasks.extend(t for t in batch if t.get("name", "").startswith(MUTATOR_PREFIX))
        offset += len(batch)
        if len(batch) < 50:
            break
    return tasks


def export_task_definitions(ts: task_scheduler.TaskScheduler, tasks: list[dict]) -> list[dict]:
    exported: list[dict] = []
    for task in tasks:
        cfg = ts.get_task_config(task["id"], task.get("real_owner", "root"))
        data = cfg.get("data", {})
        script = data.get("extra", {}).get("script", "") or data.get("action", "")
        exported.append({
            "id": task.get("id"),
            "name": task.get("name"),
            "type": task.get("type"),
            "owner": task.get("owner"),
            "real_owner": task.get("real_owner"),
            "next_trigger_time": task.get("next_trigger_time"),
            "enable": data.get("enable"),
            "schedule": data.get("schedule"),
            "can_edit_name": data.get("can_edit_name"),
            "can_edit_owner": data.get("can_edit_owner"),
            "scriptFull": script,
            "configRaw": data,
        })
    return exported


def disable_all_cg_ctx_tasks(ts: task_scheduler.TaskScheduler, tasks: list[dict]) -> list[dict]:
    results = []
    for task in tasks:
        cfg = ts.get_task_config(task["id"], task.get("real_owner", "root"))
        enabled = bool(cfg.get("data", {}).get("enable"))
        if not enabled:
            results.append({"id": task["id"], "name": task["name"], "wasEnabled": False, "disabled": False})
            continue
        resp = ts.task_set_enable(task["id"], task.get("real_owner", "root"), False)
        results.append({
            "id": task["id"],
            "name": task["name"],
            "wasEnabled": True,
            "disabled": bool(resp.get("success")),
            "response": resp,
        })
    return results


def capture_app_priv_filestation(admin_username: str, admin_password: str) -> dict:
    from synology_api import core_service_apps

    apps = core_service_apps.CoreServiceApps(
        HOST, PORT, admin_username, admin_password,
        secure=True, cert_verify=False, dsm_version=7,
    )
    info = apps.gen_list["SYNO.Core.AppPriv.Rule"]
    rules = apps.request_data(
        "SYNO.Core.AppPriv.Rule",
        info["path"],
        {"version": 1, "method": "list", "app_id": FILE_STATION_APP_ID},
        method="get",
    )
    filestation_rules = rules.get("data", {}).get("rules", [])
    svc_rules = [r for r in filestation_rules if r.get("entity_name") == SERVICE_USER]
    return {
        "appId": FILE_STATION_APP_ID,
        "allRules": filestation_rules,
        "serviceUserRules": svc_rules,
        "serviceUserAllowed": len(svc_rules) > 0,
    }


def restore_production_shell(admin_username: str, admin_password: str) -> dict:
    users = core_user.User(
        HOST, PORT, admin_username, admin_password,
        secure=True, cert_verify=False, dsm_version=7,
    )
    api = "SYNO.Core.User"
    info = users.core_list[api]
    result = users.request_data(
        api,
        info["path"],
        {
            "method": "set",
            "version": info["minVersion"],
            "name": SERVICE_USER,
            "new_name": SERVICE_USER,
            "shell": "/sbin/nologin",
        },
        method="post",
    )
    return {
        "action": "SYNO.Core.User.set shell=/sbin/nologin",
        "sshRepairPerformed": False,
        "idempotent": True,
        "success": bool(result.get("success")),
    }


def extended_baseline(admin_u: str, admin_p: str, svc_pw: str) -> dict:
    shell_restore = restore_production_shell(admin_u, admin_p)
    app_priv = capture_app_priv_filestation(admin_u, admin_p)
    state = capture_security_state(
        admin_username=admin_u, admin_password=admin_p, service_password=svc_pw,
    )
    state["productionIdentity"] = {
        "nonAdmin": True,
        "shellIntent": "/sbin/nologin",
        "shellRestore": shell_restore,
        "fileStationAppPrivilege": app_priv,
        "sshClassification": "DIAGNOSTIC_ONLY_DISABLED_FOR_PHASE0_PRODUCTION",
    }
    state["securityConfigHash"] = security_config_hash(state)
    state["securityStateHash"] = security_state_hash(
        {k: v for k, v in state.items() if k not in ("securityStateHash", "securityConfigHash")},
    )
    return state


def run_fresh_filestation_proof() -> dict:
    proof_py = REPO / "scripts/context-ledger/phase0-filestation-fresh-session-proof-v1.py"
    python = os.environ.get("SYNOLOGY_PYTHON", "/tmp/dsm-client/.venv/bin/python3")
    proc = subprocess.run(
        [python, str(proof_py)],
        env={**os.environ},
        capture_output=True,
        text=True,
    )
    artifact = ARTIFACT_DIR / "phase0-filestation-fresh-session-proof-v1.json"
    payload = json.loads(artifact.read_text(encoding="utf-8")) if artifact.exists() else {}
    return {
        "exitCode": proc.returncode,
        "stdout": proc.stdout[-2000:],
        "stderr": proc.stderr[-2000:],
        "artifactStatus": payload.get("status"),
        "pass": payload.get("status") == "CG_CONTEXT_LEDGER_FILESTATION_FRESH_SESSION_PROOF_PASS",
    }


def run_readonly_infra_proof() -> dict:
    proof_py = REPO / "scripts/context-ledger/phase0-storage-infra-proof-v1.py"
    python = os.environ.get("SYNOLOGY_PYTHON", "/tmp/dsm-client/.venv/bin/python3")
    proc = subprocess.run(
        [python, str(proof_py)],
        env={**os.environ},
        capture_output=True,
        text=True,
    )
    try:
        summary = json.loads(proc.stdout.strip().split("\n")[-1])
    except Exception:
        summary = {"parseError": proc.stdout[-1000:]}
    return {
        "exitCode": proc.returncode,
        "summary": summary,
        "stderr": proc.stderr[-2000:],
        "pass": summary.get("status") == "PHASE0_STORAGE_INFRASTRUCTURE_AND_TRANSPORT_READY_FOR_REAL_PROOF",
    }


def run_synthetic_proof() -> dict:
    proc = subprocess.run(
        ["doppler", "run", "--project", "cg-shared", "--config", "dev", "--",
         "node", str(REPO / "scripts/context-ledger/phase0-synthetic-proof-v1.mjs")],
        env={**os.environ},
        capture_output=True,
        text=True,
        cwd=str(REPO),
    )
    artifact = ARTIFACT_DIR / "phase0-synthetic-proof-v1.json"
    payload = json.loads(artifact.read_text(encoding="utf-8")) if artifact.exists() else {}
    return {
        "exitCode": proc.returncode,
        "stdout": proc.stdout[-2000:],
        "stderr": proc.stderr[-2000:],
        "durabilityState": payload.get("durabilityState"),
        "status": payload.get("status"),
        "pass": payload.get("durabilityState") == "FULLY_PROTECTED"
            and payload.get("status") == "CG_CONTEXT_LEDGER_PHASE_0_SYNTHETIC_PROOF_PASS",
    }


def main() -> int:
    admin_u = os.environ.get("SYNOLOGY_ADMIN_USERNAME")
    admin_p = os.environ.get("SYNOLOGY_ADMIN_PASSWORD")
    svc_pw = os.environ.get("SYNOLOGY_SERVICE_PASSWORD")
    if not admin_u or not admin_p or not svc_pw:
        print("SYNOLOGY_ADMIN_USERNAME, SYNOLOGY_ADMIN_PASSWORD, SYNOLOGY_SERVICE_PASSWORD required", file=sys.stderr)
        return 2

    report: dict = {
        "schemaVersion": "context-ledger-phase0-dsm-stabilize-v1@1.0.0",
        "recordedAt": now_iso(),
        "status": "IN_PROGRESS",
        "causalPrecision": {
            "classifierDefect": "CONFIRMED",
            "unsafeScheduledMutatorEnvironment": "CONFIRMED",
            "sshInstallToFileStation407": "CORRELATED_NOT_PROVEN",
        },
    }

    ts = task_scheduler.TaskScheduler(
        HOST, PORT, admin_u, admin_p, secure=True, cert_verify=False, dsm_version=7,
    )
    tasks = list_all_cg_ctx_tasks(ts)
    exported = export_task_definitions(ts, tasks)
    disable_results = disable_all_cg_ctx_tasks(ts, tasks)

    enabled_remaining = []
    for task in tasks:
        cfg = ts.get_task_config(task["id"], task.get("real_owner", "root"))
        if cfg.get("data", {}).get("enable"):
            enabled_remaining.append(task["name"])

    export_artifact = ARTIFACT_DIR / "phase0-dsm-scheduled-mutators-export-v1.json"
    export_payload = {
        "schemaVersion": "context-ledger-phase0-dsm-scheduled-mutators-export-v1@1.0.0",
        "recordedAt": now_iso(),
        "immutableForensicExport": True,
        "taskCount": len(exported),
        "tasks": exported,
    }
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    export_artifact.write_text(json.dumps(export_payload, indent=2) + "\n", encoding="utf-8")

    report["mutatorFreeze"] = {
        "exportArtifact": str(export_artifact),
        "taskCount": len(exported),
        "disableResults": disable_results,
        "enabledContextLedgerMutatorTasks": len(enabled_remaining),
        "enabledRemainingNames": enabled_remaining,
        "pass": len(enabled_remaining) == 0,
    }

    if not report["mutatorFreeze"]["pass"]:
        report["status"] = "PHASE0_DSM_STABILIZE_BLOCKED_MUTATORS_STILL_ENABLED"
        _write_report(report)
        return 1

    baseline = extended_baseline(admin_u, admin_p, svc_pw)
    report["baseline"] = {
        "baselineSecurityConfigHash": baseline["securityConfigHash"],
        "baselineSecurityStateHash": baseline["securityStateHash"],
        "classification": classify_acl_vs_filestation(baseline),
        "state": baseline,
    }

    filestation_proof = run_fresh_filestation_proof()
    report["fileStationRestore"] = filestation_proof

    if not filestation_proof["pass"]:
        report["status"] = "PHASE0_DSM_STABILIZE_BLOCKED_FILESTATION_NOT_RESTORED"
        _write_report(report)
        return 1

    report["stabilityWait"] = {"seconds": STABILITY_WAIT_SECONDS, "startedAt": now_iso()}
    time.sleep(STABILITY_WAIT_SECONDS)
    report["stabilityWait"]["completedAt"] = now_iso()

    delayed = capture_security_state(
        admin_username=admin_u, admin_password=admin_p, service_password=svc_pw,
    )
    delayed_hash = delayed["securityConfigHash"]
    report["stability"] = {
        "baselineSecurityConfigHash": baseline["securityConfigHash"],
        "delayedSecurityConfigHash": delayed_hash,
        "configUnchanged": baseline["securityConfigHash"] == delayed_hash,
        "baselineSecurityStateHash": baseline["securityStateHash"],
        "delayedSecurityStateHash": delayed["securityStateHash"],
        "fullStateUnchanged": baseline["securityStateHash"] == delayed["securityStateHash"],
        "delayedClassification": classify_acl_vs_filestation(delayed),
        "fileStationStillPassing": run_fresh_filestation_proof(),
    }

    if not report["stability"]["configUnchanged"] or not report["stability"]["fileStationStillPassing"]["pass"]:
        report["status"] = "PHASE0_DSM_STABILIZE_BLOCKED_UNSTABLE_AFTER_WAIT"
        _write_report(report)
        return 1

    infra = run_readonly_infra_proof()
    report["infraProof"] = infra
    if not infra["pass"]:
        report["status"] = "PHASE0_DSM_STABILIZE_BLOCKED_INFRA_PROOF"
        _write_report(report)
        return 1

    synthetic = run_synthetic_proof()
    report["syntheticProof"] = synthetic
    if not synthetic["pass"]:
        report["status"] = "PHASE0_DSM_STABILIZE_BLOCKED_SYNTHETIC_PROOF"
        _write_report(report)
        return 1

    report["status"] = "PHASE0_DSM_STABILIZE_AND_PROOFS_COMPLETE"
    _write_report(report)
    print(json.dumps({
        "status": report["status"],
        "artifact": str(ARTIFACT_DIR / "phase0-dsm-stabilize-v1.json"),
        "enabledMutators": report["mutatorFreeze"]["enabledContextLedgerMutatorTasks"],
        "baselineHash": baseline["securityStateHash"],
        "infra": infra["summary"].get("status"),
        "synthetic": synthetic.get("status"),
    }, indent=2))
    return 0


def _write_report(report: dict) -> None:
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    out = ARTIFACT_DIR / "phase0-dsm-stabilize-v1.json"
    out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": report["status"], "artifact": str(out)}, indent=2))


if __name__ == "__main__":
    raise SystemExit(main())
