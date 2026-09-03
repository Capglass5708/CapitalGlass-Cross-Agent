#!/usr/bin/env python3
"""Read-only DSM security state capture for cg-context-ledger.

Captures authoritative admin read-backs (user, groups, share ACLs) alongside
raw service-account FileStation observations. Never mutates NAS state.
"""
from __future__ import annotations

import contextlib
import hashlib
import io
import json
import os
from typing import Any

from synology_api import core_group, core_share, core_user, filestation
from synology_api.core_share import SharePermission

HOST = os.environ.get("CG_SERVER_HOST", "100.112.81.50")
PORT = os.environ.get("CG_SERVER_PORT", "5001")
SERVICE_USER = os.environ.get("SYNOLOGY_SERVICE_USERNAME", "cg-context-ledger")
VAULT_SHARE = "Capital-Glass-AI-Evidence-Vault"
META_SHARE = "Capital-Glass-AI-Evidence-meta"
PROBE_SHARES = [VAULT_SHARE, META_SHARE, "Capital Glass", "Book Keeping"]


def _canonical_json(payload: Any) -> str:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)


def security_state_hash(state: dict[str, Any]) -> str:
    return f"sha256:{hashlib.sha256(_canonical_json(state).encode()).hexdigest()}"


def security_config_hash(state: dict[str, Any]) -> str:
    """Hash stable DSM security configuration (ACLs, identity, app priv)."""
    prod = state.get("productionIdentity") or {}
    config_only = {
        "serviceUser": state.get("serviceUser"),
        "userUid": (state.get("userRecord") or {}).get("uid"),
        "shareAcls": {
            share: data.get("interpretation")
            for share, data in (state.get("shareAcls") or {}).items()
        },
        "fileStationAllowed": (prod.get("fileStationAppPrivilege") or {}).get("serviceUserAllowed"),
        "shellIntent": prod.get("shellIntent"),
    }
    return security_state_hash(config_only)


def _share_acl_items(perm_api: SharePermission, share_name: str) -> list[dict[str, Any]]:
    result = perm_api.get_folder_permission_by_name(
        share_name, SERVICE_USER, with_inherit=True, limit=20,
    )
    return result.get("data", {}).get("items", [])


def _interpret_acl(items: list[dict[str, Any]]) -> dict[str, Any]:
    if not items:
        return {"present": False, "effective": "ABSENT"}
    row = items[0]
    if row.get("is_deny"):
        return {"present": True, "effective": "DENY", "raw": row}
    if row.get("is_writable"):
        return {"present": True, "effective": "RW", "raw": row}
    if row.get("is_readonly"):
        return {"present": True, "effective": "RO", "raw": row}
    return {"present": True, "effective": "UNKNOWN", "raw": row}


def _service_filestation_observations(service_password: str) -> dict[str, Any]:
    with contextlib.redirect_stdout(io.StringIO()):
        fs = filestation.FileStation(
            HOST, PORT, SERVICE_USER, service_password,
            secure=True, cert_verify=False, dsm_version=7,
        )

    list_share_raw = fs.get_list_share(onlywritable=False)
    share_names = [s.get("name") for s in list_share_raw.get("data", {}).get("shares", [])]

    path_probes: dict[str, Any] = {}
    for share in PROBE_SHARES + ["home"]:
        path = f"/{share}"
        try:
            listing = fs.get_file_list(path)
            path_probes[share] = {
                "path": path,
                "exception": None,
                "listSuccess": bool(listing.get("success")),
                "entryCount": len(listing.get("data", {}).get("files", [])),
                "raw": listing,
            }
        except Exception as exc:  # noqa: BLE001
            path_probes[share] = {
                "path": path,
                "exception": f"{type(exc).__name__}: {exc}",
                "listSuccess": False,
                "entryCount": 0,
                "raw": None,
            }

    return {
        "listShareRaw": list_share_raw,
        "listShareNames": share_names,
        "pathProbes": path_probes,
    }


def capture_security_state(
    *,
    admin_username: str,
    admin_password: str,
    service_password: str,
) -> dict[str, Any]:
    users = core_user.User(
        HOST, PORT, admin_username, admin_password,
        secure=True, cert_verify=False, dsm_version=7,
    )
    groups = core_group.Group(
        HOST, PORT, admin_username, admin_password,
        secure=True, cert_verify=False, dsm_version=7,
    )
    share = core_share.Share(
        HOST, PORT, admin_username, admin_password,
        secure=True, cert_verify=False, dsm_version=7,
    )
    perm_api = SharePermission(share.session, share.core_list)

    user_get = users.user_get(SERVICE_USER, additional=["description", "expired"])
    user_row = (user_get.get("data", {}) or {}).get("users", [{}])[0]

    group_membership: dict[str, bool] = {}
    all_groups = groups.get_groups(name_only=True).get("data", {}).get("groups", [])
    for gname in all_groups:
        try:
            members = groups.get_users(gname, in_group=True)
            names = [u.get("name") for u in members.get("data", {}).get("users", [])]
            if SERVICE_USER in names:
                group_membership[gname] = True
        except Exception:  # noqa: BLE001
            continue

    share_acls: dict[str, Any] = {}
    for share_name in PROBE_SHARES:
        items = _share_acl_items(perm_api, share_name)
        share_acls[share_name] = {
            "synoshareListAclEquivalent": items,
            "interpretation": _interpret_acl(items),
        }

    filestation_obs = _service_filestation_observations(service_password)

    state = {
        "serviceUser": SERVICE_USER,
        "userRecord": user_row,
        "groupMembership": group_membership,
        "shareAcls": share_acls,
        "fileStationObserved": filestation_obs,
    }
    state["securityConfigHash"] = security_config_hash(state)
    state["securityStateHash"] = security_state_hash(
        {k: v for k, v in state.items() if k not in ("securityStateHash", "securityConfigHash")},
    )
    return state


def classify_acl_vs_filestation(state: dict[str, Any]) -> dict[str, Any]:
    """Surface contradictions between admin ACL read-back and FileStation probes."""
    contradictions: list[dict[str, Any]] = []
    fs = state.get("fileStationObserved", {})
    share_names = set(fs.get("listShareNames", []))
    for share_name in PROBE_SHARES:
        acl = state.get("shareAcls", {}).get(share_name, {}).get("interpretation", {})
        probe = fs.get("pathProbes", {}).get(share_name, {})
        acl_eff = acl.get("effective")
        fs_list_ok = bool(probe.get("listSuccess"))
        fs_visible = share_name in share_names
        expected_fs = acl_eff in ("RW", "RO")
        if expected_fs and not fs_list_ok:
            contradictions.append({
                "share": share_name,
                "kind": "ACL_ALLOWS_BUT_FILESTATION_LIST_FAILS",
                "aclEffective": acl_eff,
                "listShareVisible": fs_visible,
                "pathProbe": probe,
            })
        if acl_eff == "DENY" and fs_list_ok:
            contradictions.append({
                "share": share_name,
                "kind": "ACL_DENIES_BUT_FILESTATION_LIST_SUCCEEDS",
                "aclEffective": acl_eff,
                "listShareVisible": fs_visible,
                "pathProbe": probe,
            })
    return {"contradictions": contradictions, "hasContradictions": bool(contradictions)}
