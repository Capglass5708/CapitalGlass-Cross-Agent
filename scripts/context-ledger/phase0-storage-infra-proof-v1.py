#!/usr/bin/env python3
"""Prove Phase 0 storage infrastructure + both native transports (read-only).

Produces: artifacts/.../phase0-storage-infra-and-transport-ready-v1.json
Status: PHASE0_STORAGE_INFRASTRUCTURE_AND_TRANSPORT_READY_FOR_REAL_PROOF

This script MUST NOT mutate DSM security configuration. It only reads DSM state,
writes unique test objects to evidence shares, and verifies transport.

Requires beforeSecurityStateHash == afterSecurityStateHash (excluding test-object writes).
"""
from __future__ import annotations

import contextlib
import hashlib
import io
import json
import os
import secrets
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

from synology_api import core_share, filestation

REPO = Path(__file__).resolve().parents[2]
LIB_DIR = REPO / "scripts/context-ledger/lib"
sys.path.insert(0, str(LIB_DIR))

from dsm_security_state import (  # noqa: E402
    capture_security_state,
    classify_acl_vs_filestation,
    security_config_hash,
)

ARTIFACT_DIR = REPO / "artifacts/agent-runs/immutable-context-ledger-v1"
HOST = os.environ.get("CG_SERVER_HOST", "100.112.81.50")
PORT = os.environ.get("CG_SERVER_PORT", "5001")
VAULT_SHARE = "Capital-Glass-AI-Evidence-Vault"
META_SHARE = "Capital-Glass-AI-Evidence-meta"
SERVICE_USER = "cg-context-ledger"
RETENTION_SECONDS = 90 * 86400
TRANSPORT_PY = REPO / "scripts/context-ledger/lib/synology-transport.py"
PYTHON = os.environ.get("SYNOLOGY_PYTHON", "/tmp/dsm-client/.venv/bin/python3")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return f"sha256:{h.hexdigest()}"


def admin_share():
    u, p = os.environ["SYNOLOGY_ADMIN_USERNAME"], os.environ["SYNOLOGY_ADMIN_PASSWORD"]
    return core_share.Share(HOST, PORT, u, p, secure=True, cert_verify=False, dsm_version=7, debug=False)


def share_exists(share_api: core_share.Share, name: str) -> bool:
    try:
        share_api.get_folder(name)
        return True
    except Exception:
        return False


def worm_readback(share_api: core_share.Share, name: str) -> dict:
    info = share_api.get_folder(name, additional=["load_worm_attr", "include_worm_share"])
    data = info.get("data", {})
    return {
        "name": data.get("name"),
        "vol_path": data.get("vol_path"),
        "worm_subvol_mode": data.get("worm_subvol_mode"),
        "worm_def_lock_mode": data.get("worm_def_lock_mode"),
        "worm_def_lock_duration": data.get("worm_def_lock_duration"),
        "worm_lock_wait_time": data.get("worm_lock_wait_time"),
    }


def worm_verified(worm: dict) -> dict:
    checks = {
        "worm_subvol_mode_enterprise": worm.get("worm_subvol_mode") == "enterprise",
        "worm_def_lock_mode_immutable": worm.get("worm_def_lock_mode") == "immutable",
        "worm_def_lock_duration_90d": worm.get("worm_def_lock_duration") == RETENTION_SECONDS,
        "worm_lock_wait_time_zero": worm.get("worm_lock_wait_time") == 0,
    }
    return {"checks": checks, "pass": all(checks.values())}


def read_snapshot_policy(share_api: core_share.Share) -> dict:
    """Read-only snapshot schedule + retention — never calls set_* methods."""
    snap_api = "SYNO.Core.Share.Snapshot"
    snap_info = share_api.gen_list[snap_api]
    sched_read = share_api.session.request_webapi_data(
        snap_api,
        snap_info["path"],
        {"method": "get_schedule", "version": 1, "name": META_SHARE},
        method="get",
    )
    ret_api = "SYNO.DisasterRecovery.Retention"
    ret_info = share_api.gen_list[ret_api]
    retain_read = share_api.session.request_webapi_data(
        ret_api,
        ret_info["path"],
        {"method": "get", "version": 1, "type": "Share", "name": META_SHARE},
        method="get",
    )
    sched_data = sched_read.get("data", {})
    retain_data = retain_read.get("data", {})
    return {
        "scheduleReadback": sched_data,
        "retentionReadback": retain_data,
        "scheduleEnabled": bool(sched_data.get("enable_snapshot_schedule")),
        "retentionDays": retain_data.get("recently"),
        "pass": bool(sched_data.get("enable_snapshot_schedule")) and retain_data.get("recently") == 30,
    }


def evaluate_security_expectations(state: dict) -> dict:
    classification = classify_acl_vs_filestation(state)
    acls = state.get("shareAcls", {})
    vault_acl = acls.get(VAULT_SHARE, {}).get("interpretation", {}).get("effective")
    meta_acl = acls.get(META_SHARE, {}).get("interpretation", {}).get("effective")
    deny_glass = acls.get("Capital Glass", {}).get("interpretation", {}).get("effective") == "DENY"
    deny_bk = acls.get("Book Keeping", {}).get("interpretation", {}).get("effective") == "DENY"
    fs = state.get("fileStationObserved", {})
    vault_fs = fs.get("pathProbes", {}).get(VAULT_SHARE, {}).get("listSuccess")
    meta_fs = fs.get("pathProbes", {}).get(META_SHARE, {}).get("listSuccess")

    return {
        "authoritativeShareAcls": {
            VAULT_SHARE: vault_acl,
            META_SHARE: meta_acl,
            "Capital Glass": acls.get("Capital Glass", {}).get("interpretation", {}).get("effective"),
            "Book Keeping": acls.get("Book Keeping", {}).get("interpretation", {}).get("effective"),
        },
        "fileStationPathListSuccess": {
            VAULT_SHARE: vault_fs,
            META_SHARE: meta_fs,
        },
        "aclVsFileStation": classification,
        "note": (
            "Authoritative ACL posture is evaluated from SYNO.Core.Share.Permission read-back. "
            "FileStation path list probes are informational and may diverge without invalidating ACL config."
        ),
        "pass": (
            vault_acl == "RW"
            and meta_acl == "RW"
            and deny_glass
            and deny_bk
        ),
    }


def prove_synology_transport(result: dict) -> None:
    svc_user = os.environ.get("SYNOLOGY_SERVICE_USERNAME", SERVICE_USER)
    svc_pw = os.environ.get("SYNOLOGY_SERVICE_PASSWORD", "")
    if not svc_pw:
        result["primaryTransport"] = {"pass": False, "error": "SYNOLOGY_SERVICE_PASSWORD required"}
        return

    payload = secrets.token_bytes(4096)
    local = Path("/tmp") / f"cg-cl-infra-proof-{secrets.token_hex(8)}.bin"
    local.write_bytes(payload)
    local_hash = sha256_file(local)
    hex_name = local_hash.replace("sha256:", "")
    rel = f"objects/sha256/{hex_name[:2]}/{hex_name}"
    hash_named = Path("/tmp") / hex_name
    hash_named.write_bytes(payload)

    env = {**os.environ, "SYNOLOGY_SERVICE_USERNAME": svc_user, "SYNOLOGY_SERVICE_PASSWORD": svc_pw}
    upload_proc = subprocess.run(
        [PYTHON, str(TRANSPORT_PY), "upload", str(hash_named), rel],
        env=env, capture_output=True, text=True,
    )
    if upload_proc.returncode != 0:
        local.unlink(missing_ok=True)
        hash_named.unlink(missing_ok=True)
        result["primaryTransport"] = {
            "mechanism": "synology-https-filestation-over-tailscale",
            "serviceIdentity": svc_user,
            "remoteRel": rel,
            "localHash": local_hash,
            "pass": False,
            "uploadExitCode": upload_proc.returncode,
            "uploadStderr": (upload_proc.stderr or upload_proc.stdout)[-2000:],
        }
        return

    hash_proc = subprocess.run(
        [PYTHON, str(TRANSPORT_PY), "hash-remote", rel],
        env=env, capture_output=True, text=True,
    )
    local.unlink(missing_ok=True)
    hash_named.unlink(missing_ok=True)
    if hash_proc.returncode != 0:
        result["primaryTransport"] = {
            "mechanism": "synology-https-filestation-over-tailscale",
            "serviceIdentity": svc_user,
            "remoteRel": rel,
            "localHash": local_hash,
            "pass": False,
            "hashExitCode": hash_proc.returncode,
            "hashStderr": (hash_proc.stderr or hash_proc.stdout)[-2000:],
        }
        return

    remote_hash = hash_proc.stdout.strip()
    result["primaryTransport"] = {
        "mechanism": "synology-https-filestation-over-tailscale",
        "serviceIdentity": svc_user,
        "remoteRel": rel,
        "localHash": local_hash,
        "remoteHash": remote_hash,
        "byteEquality": local_hash == remote_hash,
        "usesDrvfs": False,
        "pass": local_hash == remote_hash,
    }


def prove_wesleydesk_transport(result: dict) -> None:
    node_script = REPO / "scripts/context-ledger/lib/wesleydesk-transport.mjs"
    ssh_key = os.environ.get("WESLEYDESK_SSH_KEY", "/tmp/wdesk-key")
    if not Path(ssh_key).exists():
        result["backupTransport"] = {"pass": False, "error": f"missing {ssh_key}"}
        return

    payload = secrets.token_bytes(4096)
    local = Path("/tmp") / f"cg-cl-wdesk-proof-{secrets.token_hex(8)}.bin"
    local.write_bytes(payload)
    local_hash = sha256_file(local)
    rel = f"control/infra-proof/{local.name}"

    probe = subprocess.run(
        ["node", "--input-type=module", "-e", f"""
import {{ createHash }} from 'node:crypto';
import {{ readFileSync }} from 'node:fs';
import {{ ensureBackupRoot, uploadBackup, hashRemoteBackup }} from '{node_script.as_posix()}';
ensureBackupRoot();
uploadBackup('{local}', '{rel}');
const h = hashRemoteBackup('{rel}');
const localH = 'sha256:' + createHash('sha256').update(readFileSync('{local}')).digest('hex');
console.log(JSON.stringify({{ localHash: localH, remoteHash: h, match: localH === h }}));
"""],
        capture_output=True, text=True, timeout=60,
        env={**os.environ, "WESLEYDESK_SSH_KEY": ssh_key},
    )
    local.unlink(missing_ok=True)
    if probe.returncode != 0:
        result["backupTransport"] = {"pass": False, "stderr": probe.stderr[-500:]}
        return
    data = json.loads(probe.stdout.strip().split("\n")[-1])
    result["backupTransport"] = {
        "mechanism": "wesleydesk-ssh-scp-to-L-share",
        "path": "L:/Capital-Glass-AI-Evidence-Vault-backup",
        "independentOfSynology": True,
        "remoteRel": rel,
        **data,
        "pass": bool(data.get("match")),
    }


def main() -> int:
    if not os.environ.get("SYNOLOGY_ADMIN_USERNAME") or not os.environ.get("SYNOLOGY_ADMIN_PASSWORD"):
        print("SYNOLOGY_ADMIN_USERNAME/PASSWORD required", file=sys.stderr)
        return 2
    if not os.environ.get("SYNOLOGY_SERVICE_PASSWORD"):
        print("SYNOLOGY_SERVICE_PASSWORD required (service account)", file=sys.stderr)
        return 2

    admin_u = os.environ["SYNOLOGY_ADMIN_USERNAME"]
    admin_p = os.environ["SYNOLOGY_ADMIN_PASSWORD"]
    svc_pw = os.environ["SYNOLOGY_SERVICE_PASSWORD"]

    proof: dict = {
        "schemaVersion": "context-ledger-phase0-storage-infra-and-transport-ready-v1@2.0.0",
        "recordedAt": now_iso(),
        "machineId": os.environ.get("CONTEXT_LEDGER_MACHINE_ID", "CG-NIMO-01"),
        "readOnlyProof": True,
        "status": "PHASE0_STORAGE_INFRASTRUCTURE_AND_TRANSPORT_READY_FOR_REAL_PROOF",
        "shares": {},
        "serviceIdentity": {},
        "securityStateProof": {},
        "transports": {},
        "gates": {},
    }

    before_state = capture_security_state(
        admin_username=admin_u, admin_password=admin_p, service_password=svc_pw,
    )
    proof["securityStateProof"]["before"] = before_state
    proof["securityStateProof"]["beforeConfigHash"] = before_state["securityConfigHash"]
    proof["securityStateProof"]["beforeHash"] = before_state["securityStateHash"]

    share_api = admin_share()

    vault_worm = worm_readback(share_api, VAULT_SHARE)
    vault_verify = worm_verified(vault_worm)
    proof["shares"]["vault"] = {
        "name": VAULT_SHARE,
        "exists": share_exists(share_api, VAULT_SHARE),
        "wormReadback": vault_worm,
        "wormVerification": vault_verify,
        "pass": vault_verify["pass"],
    }

    meta_worm = worm_readback(share_api, META_SHARE)
    snapshot = read_snapshot_policy(share_api)
    proof["shares"]["meta"] = {
        "name": META_SHARE,
        "exists": share_exists(share_api, META_SHARE),
        "wormReadback": meta_worm,
        "nonWorm": meta_worm.get("worm_subvol_mode") == "normal",
        "snapshot": snapshot,
        "pass": (
            share_exists(share_api, META_SHARE)
            and meta_worm.get("worm_subvol_mode") == "normal"
            and snapshot.get("pass", False)
        ),
    }

    security_eval = evaluate_security_expectations(before_state)
    proof["serviceIdentity"] = {
        "name": SERVICE_USER,
        "securityEvaluation": security_eval,
    }

    prove_synology_transport(proof)
    proof["transports"]["primary"] = proof.pop("primaryTransport", {})
    prove_wesleydesk_transport(proof)
    proof["transports"]["backup"] = proof.pop("backupTransport", {})

    after_state = capture_security_state(
        admin_username=admin_u, admin_password=admin_p, service_password=svc_pw,
    )
    proof["securityStateProof"]["after"] = after_state
    proof["securityStateProof"]["afterConfigHash"] = after_state["securityConfigHash"]
    proof["securityStateProof"]["afterHash"] = after_state["securityStateHash"]
    proof["securityStateProof"]["configUnchanged"] = (
        before_state["securityConfigHash"] == after_state["securityConfigHash"]
    )
    proof["securityStateProof"]["unchanged"] = (
        before_state["securityStateHash"] == after_state["securityStateHash"]
    )

    proof["gates"] = {
        "vaultWormVerified": proof["shares"]["vault"]["pass"],
        "metaShareNonWorm": proof["shares"]["meta"]["pass"],
        "metaSnapshotsConfigured": proof["shares"]["meta"]["snapshot"].get("pass", False),
        "securityStateUnchangedByProof": proof["securityStateProof"]["configUnchanged"],
        "serviceSecurityPosture": security_eval.get("pass", False),
        "primaryNativeTransport": proof["transports"]["primary"].get("pass", False),
        "backupNativeTransport": proof["transports"]["backup"].get("pass", False),
    }
    all_required = [
        proof["gates"]["vaultWormVerified"],
        proof["gates"]["metaShareNonWorm"],
        proof["gates"]["metaSnapshotsConfigured"],
        proof["gates"]["securityStateUnchangedByProof"],
        proof["gates"]["serviceSecurityPosture"],
        proof["gates"]["primaryNativeTransport"],
        proof["gates"]["backupNativeTransport"],
    ]
    proof["allRequiredGatesPass"] = all(all_required)

    if not proof["allRequiredGatesPass"]:
        proof["status"] = "PHASE0_STORAGE_INFRASTRUCTURE_AND_TRANSPORT_BLOCKED"
        failed = [k for k, v in proof["gates"].items() if not v]
        proof["failedGates"] = failed

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    out = ARTIFACT_DIR / "phase0-storage-infra-and-transport-ready-v1.json"
    out.write_text(json.dumps(proof, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "status": proof["status"],
        "artifact": str(out),
        "gates": proof["gates"],
        "beforeConfigHash": proof["securityStateProof"]["beforeConfigHash"],
        "afterConfigHash": proof["securityStateProof"]["afterConfigHash"],
        "beforeHash": proof["securityStateProof"]["beforeHash"],
        "afterHash": proof["securityStateProof"]["afterHash"],
    }, indent=2))
    return 0 if proof["allRequiredGatesPass"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
