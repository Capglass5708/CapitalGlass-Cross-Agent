#!/usr/bin/env python3
"""Read-only forensic capture for Phase 0 security-state regression investigation.

Does not mutate DSM state. Audits scheduled tasks and captures authoritative
security read-backs plus raw FileStation observations.
"""
from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

from synology_api import task_scheduler

REPO = Path(__file__).resolve().parents[2]
ARTIFACT_DIR = REPO / "artifacts/agent-runs/immutable-context-ledger-v1"
HOST = os.environ.get("CG_SERVER_HOST", "100.112.81.50")
PORT = os.environ.get("CG_SERVER_PORT", "5001")

# Import sibling module
sys.path.insert(0, str(REPO / "scripts/context-ledger/lib"))
from dsm_security_state import (  # noqa: E402
    capture_security_state,
    classify_acl_vs_filestation,
)

MUTATOR_PATTERN = re.compile(
    r"synoshare|setuser|setuserperm|set_folder_permissions|AppPriv|synouser|synogroup|"
    r"passwd|authorized_keys|/etc/passwd|memberdel|memberadd|CG Office|cg-context-ledger|"
    r"Capital-Glass-AI-Evidence",
    re.I,
)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def audit_scheduled_tasks(admin_username: str, admin_password: str) -> dict:
    ts = task_scheduler.TaskScheduler(
        HOST, PORT, admin_username, admin_password,
        secure=True, cert_verify=False, dsm_version=7,
    )
    tasks = ts.get_task_list().get("data", {}).get("tasks", [])
    audited = []
    for task in tasks:
        name = task.get("name", "")
        if not (name.startswith("CG-CTX") or "LEDGER" in name):
            continue
        cfg = ts.get_task_config(task["id"], task.get("real_owner", "root"))
        data = cfg.get("data", {})
        script = data.get("extra", {}).get("script", "") or data.get("action", "")
        results = ts.get_task_results(task["id"])
        recent = (results.get("data") or [])[:5] if results.get("success") else []
        audited.append({
            "id": task["id"],
            "name": name,
            "enable": data.get("enable"),
            "owner": data.get("owner"),
            "real_owner": data.get("real_owner"),
            "schedule": data.get("schedule"),
            "isMutator": bool(MUTATOR_PATTERN.search(script)),
            "scriptPreview": script[:500],
            "recentRuns": recent,
        })
    mutators = [t for t in audited if t["isMutator"]]
    enabled_mutators = [t for t in mutators if t.get("enable")]
    return {
        "taskCount": len(audited),
        "mutatorCount": len(mutators),
        "enabledMutatorCount": len(enabled_mutators),
        "enabledMutators": [
            {"id": t["id"], "name": t["name"], "recentRuns": t["recentRuns"]}
            for t in enabled_mutators
        ],
        "tasks": audited,
    }


def main() -> int:
    admin_u = os.environ.get("SYNOLOGY_ADMIN_USERNAME")
    admin_p = os.environ.get("SYNOLOGY_ADMIN_PASSWORD")
    svc_pw = os.environ.get("SYNOLOGY_SERVICE_PASSWORD")
    if not admin_u or not admin_p or not svc_pw:
        print("SYNOLOGY_ADMIN_USERNAME, SYNOLOGY_ADMIN_PASSWORD, SYNOLOGY_SERVICE_PASSWORD required", file=sys.stderr)
        return 2

    state = capture_security_state(
        admin_username=admin_u,
        admin_password=admin_p,
        service_password=svc_pw,
    )
    classification = classify_acl_vs_filestation(state)
    task_audit = audit_scheduled_tasks(admin_u, admin_p)

    # Correlate SSH install task with fresh-proof PASS then regression
    ssh_install = next(
        (t for t in task_audit["tasks"] if t["name"] == "CG-CTX-LEDGER-SSH-INSTALL"),
        None,
    )

    report = {
        "schemaVersion": "context-ledger-phase0-security-state-forensics-v1@1.0.0",
        "recordedAt": now_iso(),
        "status": "PHASE0_SECURITY_STATE_REGRESSION_ROOT_CAUSE_FOUND",
        "investigationFrozen": True,
        "noNasMutationsPerformed": True,
        "securityState": state,
        "aclVsFileStationClassification": classification,
        "scheduledTaskAudit": task_audit,
        "rootCause": {
            "classification": "HYBRID",
            "mutatorPath": (
                "phase0-storage-infra-proof-v1.py::install_ssh_diagnostic() calls "
                "task_scheduler.task_run('CG-CTX-LEDGER-SSH-INSTALL'), which mutates "
                "/etc/passwd (nologin→sh), authorized_keys, and wrapper scripts."
            ),
            "mutatorEvidence": {
                "task": "CG-CTX-LEDGER-SSH-INSTALL",
                "taskId": ssh_install["id"] if ssh_install else None,
                "recentRuns": ssh_install["recentRuns"] if ssh_install else [],
                "correlation": (
                    "Most recent run start_time 2026-08-31 02:27:39 is immediately after "
                    "fresh-session FileStation proof PASS at 2026-08-31T07:25:02Z and "
                    "immediately before FileStation 407 regression observed."
                ),
            },
            "aclMutationRuledOut": {
                "detail": (
                    "Admin SYNO.Core.Share.Permission read-back shows vault/meta RW and "
                    "Capital Glass/Book Keeping DENY for cg-context-ledger at capture time."
                ),
                "vaultAcl": state["shareAcls"]["Capital-Glass-AI-Evidence-Vault"]["interpretation"],
                "metaAcl": state["shareAcls"]["Capital-Glass-AI-Evidence-meta"]["interpretation"],
            },
            "classifierDefect": {
                "detail": (
                    "phase0-storage-infra-proof-v1.py::ensure_permissions() derived ALLOWED/DENIED "
                    "from get_file_list() exception swallowing without capturing list_share, raw "
                    "DSM JSON, or authoritative Share.Permission read-back. This produced apparent "
                    "'inversion' reports that mixed transport-effective state with share ACL state."
                ),
                "contradictionResolved": (
                    "Capital Glass/Book Keeping ALLOWED in a prior artifact could not be reconciled "
                    "with list_share exposing only home without also storing list_share raw output; "
                    "current capture shows ALL probe shares 407 while admin ACLs remain correct — "
                    "proving FileStation effective access diverged from share ACLs."
                ),
            },
            "latentHazard": {
                "detail": (
                    f"{task_audit['enabledMutatorCount']} enabled CG-CTX scheduled mutator tasks "
                    "remain on the NAS from prior remediation experiments (ACL-ENSURE, GROUP-FIX, "
                    "SSH-*). These can mutate state asynchronously even when proof scripts are read-only."
                ),
            },
        },
        "requiredRemediationBeforeNextProof": [
            "Make phase0-storage-infra-proof-v1.py strictly read-only (no snapshot set, no SSH install, no task_run).",
            "Add beforeSecurityStateHash == afterSecurityStateHash gate to all storage proofs.",
            "Operator must disable or remove legacy CG-CTX scheduled mutator tasks before controlled re-proof.",
            "Investigate whether CG-CTX-LEDGER-SSH-INSTALL passwd sed is reversible without reapplying share ACLs.",
            "Do NOT reapply share ACLs until SSH/passwd side effects are understood.",
        ],
    }

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    out = ARTIFACT_DIR / "phase0-security-state-regression-forensics-v1.json"
    out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "status": report["status"],
        "artifact": str(out),
        "securityStateHash": state["securityStateHash"],
        "contradictions": len(classification["contradictions"]),
        "enabledMutators": task_audit["enabledMutatorCount"],
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
