#!/usr/bin/env python3
"""Provision Context Ledger Phase 0 storage infrastructure on cg-server via DSM Web API.

Uses synology-api 0.9.2 (DSM 7.3.2 JSON webapi + X-SYNO-HASH). Never prints secrets.
"""
from __future__ import annotations

import json
import os
import secrets
import string
import sys
from datetime import datetime, timezone
from pathlib import Path

from synology_api import core_share, core_user, filestation

NAS_HOST = os.environ.get("CG_SERVER_HOST", "100.112.81.50")
NAS_PORT = os.environ.get("CG_SERVER_PORT", "5001")
VAULT_SHARE = "Capital-Glass-AI-Evidence-Vault"
META_SHARE = "Capital-Glass-AI-Evidence-meta"  # DSM 32-char share name limit; logical name Capital-Glass-AI-Evidence-Vault-meta
SERVICE_USER = "cg-context-ledger"
VOLUME = "/volume1"
ARTIFACT_DIR = Path(__file__).resolve().parents[2] / "artifacts/agent-runs/immutable-context-ledger-v1"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def gen_password(length: int = 32) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#%^*-_=+"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def connect():
    user = os.environ["SYNOLOGY_ADMIN_USERNAME"]
    passwd = os.environ["SYNOLOGY_ADMIN_PASSWORD"]
    return core_share.Share(
        NAS_HOST,
        NAS_PORT,
        user,
        passwd,
        secure=True,
        cert_verify=False,
        dsm_version=7,
        debug=False,
    )


def share_exists(share_api: core_share.Share, name: str) -> bool:
    try:
        share_api.get_folder(name)
        return True
    except Exception:
        return False


def connect_share():
    return connect()


def connect_permission():
    user = os.environ["SYNOLOGY_ADMIN_USERNAME"]
    passwd = os.environ["SYNOLOGY_ADMIN_PASSWORD"]
    return core_share.SharePermission(
        NAS_HOST,
        NAS_PORT,
        user,
        passwd,
        secure=True,
        cert_verify=False,
        dsm_version=7,
        debug=False,
    )


def worm_readback(share_api: core_share.Share, name: str) -> dict:
    info = share_api.get_folder(name, additional=["load_worm_attr", "include_worm_share"])
    data = info.get("data", {})
    return {
        "name": data.get("name"),
        "worm_subvol_mode": data.get("worm_subvol_mode"),
        "worm_def_lock_mode": data.get("worm_def_lock_mode"),
        "worm_def_lock_duration": data.get("worm_def_lock_duration"),
        "worm_lock_wait_time": data.get("worm_lock_wait_time"),
    }


def enterprise_worm_shareinfo(
    name: str,
    *,
    retention_seconds: int,
    lock_wait_seconds: int = 0,
    def_lock_mode: str = "immutable",
) -> dict:
    """Build shareinfo for DSM 7.3.2 Enterprise WriteOnce create (verified UI contract).

    WORM attrs live under shareinfo.worm (CreateWizard.getWormParam), not as top-level
    worm_* keys. Read-back uses worm_subvol_mode / worm_def_lock_mode / worm_def_lock_duration.
    """
    return {
        "name": name,
        "vol_path": VOLUME,
        "desc": "PROVING/PRE-PRODUCTION immutable Evidence Vault (Enterprise WriteOnce, 90-day retention)",
        "enable_share_cow": True,
        "enable_recycle_bin": False,
        "recycle_bin_admin_only": True,
        "hidden": False,
        "worm": {
            "subvol_mode": "enterprise",
            "def_lock_mode": def_lock_mode,
            "lock_wait_time": lock_wait_seconds,
            "def_lock_duration": retention_seconds,
        },
    }


def worm_enterprise_verified(worm: dict, expected_retention_seconds: int) -> bool:
    return (
        worm.get("worm_subvol_mode") == "enterprise"
        and worm.get("worm_def_lock_mode") == "immutable"
        and worm.get("worm_def_lock_duration") == expected_retention_seconds
        and worm.get("worm_lock_wait_time") == 0
    )


def create_worm_vault(share_api: core_share.Share, result: dict, retention_days: int = 90) -> None:
    """Create Enterprise WriteOnce vault via verified SYNO.Core.Share create + shareinfo.worm."""
    retention_seconds = retention_days * 86400
    if share_exists(share_api, VAULT_SHARE):
        result["vaultShare"]["state"] = "EXISTS"
        result["vaultShare"]["worm"] = worm_readback(share_api, VAULT_SHARE)
        result["vaultShare"]["wormEnterprise"] = worm_enterprise_verified(
            result["vaultShare"]["worm"], retention_seconds
        )
        return

    api_name = "SYNO.Core.Share"
    info = share_api.core_list[api_name]
    shareinfo = enterprise_worm_shareinfo(
        VAULT_SHARE,
        retention_seconds=retention_seconds,
        lock_wait_seconds=0,
        def_lock_mode="immutable",
    )
    req = {
        "method": "create",
        "version": info["maxVersion"],
        "name": VAULT_SHARE,
        "shareinfo": shareinfo,
    }
    resp = share_api.session.request_webapi_data(api_name, info["path"], req, method="post")
    result["vaultShare"]["createResponse"] = {"success": resp.get("success"), "error": resp.get("error")}
    result["vaultShare"]["worm"] = worm_readback(share_api, VAULT_SHARE)
    result["vaultShare"]["state"] = "CREATED" if resp.get("success") else "FAILED"
    result["vaultShare"]["wormEnterprise"] = worm_enterprise_verified(
        result["vaultShare"]["worm"], retention_seconds
    )


def create_meta_share(share_api: core_share.Share, result: dict) -> None:
    if share_exists(share_api, META_SHARE):
        result["metaShare"]["state"] = "EXISTS"
        return
    resp = share_api.create_folder(
        name=META_SHARE,
        vol_path=VOLUME,
        desc="Context Ledger mutable meta (logical: Evidence-Vault-meta)",
        enable_recycle_bin=False,
        enable_share_cow=True,
    )
    result["metaShare"]["createResponse"] = resp
    result["metaShare"]["state"] = "CREATED" if resp.get("success") else "FAILED"


def ensure_layout(share_api: core_share.Share, share_name: str, subdirs: list[str], result: dict) -> None:
    from synology_api import filestation

    fs = filestation.FileStation(
        NAS_HOST,
        NAS_PORT,
        os.environ["SYNOLOGY_ADMIN_USERNAME"],
        os.environ["SYNOLOGY_ADMIN_PASSWORD"],
        secure=True,
        cert_verify=False,
        dsm_version=7,
        debug=False,
    )
    base = f"/{share_name}"
    created = []
    for sub in subdirs:
        path = f"{base}/{sub}"
        try:
            fs.create_folder(path, force_parent=True)
            created.append(path)
        except Exception as exc:  # noqa: BLE001
            result.setdefault("layoutErrors", []).append({"path": path, "error": str(exc)})
    result.setdefault("layoutCreated", []).extend(created)


def provision_service_user(result: dict) -> None:
    users = core_user.User(
        NAS_HOST,
        NAS_PORT,
        os.environ["SYNOLOGY_ADMIN_USERNAME"],
        os.environ["SYNOLOGY_ADMIN_PASSWORD"],
        secure=True,
        cert_verify=False,
        dsm_version=7,
        debug=False,
    )
    listing = users.user_list(additional=["member_of", "groups"])
    names = [u["name"] for u in listing["data"]["users"]]
    if SERVICE_USER in names:
        result["serviceUser"]["state"] = "EXISTS"
        user = next(u for u in listing["data"]["users"] if u["name"] == SERVICE_USER)
        result["serviceUser"]["groups"] = user.get("groups", [])
        result["serviceUser"]["isAdmin"] = user.get("is_admin", False)
        return

    password = gen_password()
    resp = users.user_create(
        SERVICE_USER,
        password,
        description="Restricted Context Ledger replication service (non-admin)",
        passwd_never_expire=True,
        cannot_chg_passwd=True,
    )
    result["serviceUser"]["state"] = "CREATED" if resp.get("success") else "FAILED"
    result["serviceUser"]["createResponse"] = {"success": resp.get("success"), "error": resp.get("error")}
    result["serviceUser"]["passwordStored"] = "ephemeral-only-not-persisted"
    # password intentionally not written to artifact


def set_share_permissions(perm_api: core_share.SharePermission, share_name: str, result: dict) -> None:
    """Deprecated: use synoshare via scheduled task in phase0-storage-infra-proof-v1.py."""
    result.setdefault("permissions", {})[share_name] = {"skipped": "use synoshare ACL task"}


def configure_meta_snapshots(share_api: core_share.Share, result: dict) -> None:
    snap_api = "SYNO.Core.Share.Snapshot"
    snap_info = share_api.gen_list[snap_api]
    schedule = {
        "date": "2026/8/31",
        "date_type": 0,
        "hour": 2,
        "last_work_hour": 0,
        "min": 0,
        "monthly_week": [],
        "next_trigger_time": "",
        "repeat": 0,
        "repeat_hour": 0,
        "repeat_hour_store_config": None,
        "repeat_min": 0,
        "repeat_min_store_config": None,
        "week_name": "0,1,2,3,4,5,6",
    }
    try:
        sched = share_api.session.request_webapi_data(
            snap_api,
            snap_info["path"],
            {
                "method": "set_schedule",
                "version": 1,
                "name": META_SHARE,
                "enable_snapshot_schedule": True,
                "schedule": schedule,
                "task_id": -1,
            },
            method="post",
        )
        result["metaSnapshot"]["setSchedule"] = sched
    except Exception as exc:  # noqa: BLE001
        result["metaSnapshot"]["setScheduleError"] = str(exc)

    ret_api = "SYNO.DisasterRecovery.Retention"
    ret_info = share_api.gen_list[ret_api]
    try:
        current = share_api.session.request_webapi_data(
            ret_api,
            ret_info["path"],
            {"method": "get", "version": 1, "type": "Share", "name": META_SHARE},
            method="get",
        )
        tid = current.get("data", {}).get("tid", -1)
        retain = share_api.session.request_webapi_data(
            ret_api,
            ret_info["path"],
            {
                "method": "set",
                "version": 1,
                "type": "Share",
                "name": META_SHARE,
                "policyType": 20,
                "recently": 30,
                "tid": tid,
            },
            method="post",
        )
        result["metaSnapshot"]["setRetention"] = retain
        readback = share_api.session.request_webapi_data(
            ret_api,
            ret_info["path"],
            {"method": "get", "version": 1, "type": "Share", "name": META_SHARE},
            method="get",
        )
        result["metaSnapshot"]["retentionReadback"] = readback.get("data", {})
        sched_read = share_api.session.request_webapi_data(
            snap_api,
            snap_info["path"],
            {"method": "get_schedule", "version": 1, "name": META_SHARE},
            method="get",
        )
        result["metaSnapshot"]["scheduleReadback"] = sched_read.get("data", {})
    except Exception as exc:  # noqa: BLE001
        result["metaSnapshot"]["setRetentionError"] = str(exc)


def main() -> int:
    if not os.environ.get("SYNOLOGY_ADMIN_USERNAME") or not os.environ.get("SYNOLOGY_ADMIN_PASSWORD"):
        print("SYNOLOGY_ADMIN_USERNAME/PASSWORD required", file=sys.stderr)
        return 2

    result = {
        "schemaVersion": "context-ledger-phase0-provision-v1@1.0.0",
        "recordedAt": now_iso(),
        "nasHost": NAS_HOST,
        "vaultShare": {},
        "metaShare": {},
        "serviceUser": {},
        "metaSnapshot": {},
    }

    share_api = connect()
    perm_api = connect_permission()
    create_worm_vault(share_api, result, retention_days=90)
    create_meta_share(share_api, result)

    vault_dirs = [
        "objects/sha256",
        "immutable-metadata/manifests",
        "immutable-metadata/ledger-entries",
        "immutable-metadata/receipts",
    ]
    meta_dirs = [
        "current-head",
        "replication-state",
        "queues",
        "retry-state",
        "indexes",
        "operational-checkpoints",
    ]

    if result["vaultShare"].get("state") in ("CREATED", "EXISTS"):
        ensure_layout(share_api, VAULT_SHARE, vault_dirs, result)
    if result["metaShare"].get("state") in ("CREATED", "EXISTS"):
        ensure_layout(share_api, META_SHARE, meta_dirs, result)

    provision_service_user(result)

    if share_exists(share_api, META_SHARE):
        configure_meta_snapshots(share_api, result)

    if share_exists(share_api, VAULT_SHARE):
        result["vaultShare"]["wormReadback"] = worm_readback(share_api, VAULT_SHARE)
        result["vaultShare"]["wormVerified"] = worm_enterprise_verified(
            result["vaultShare"]["wormReadback"], 90 * 86400
        )

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    out = ARTIFACT_DIR / "phase0-provision-result-v1.json"
    out.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
