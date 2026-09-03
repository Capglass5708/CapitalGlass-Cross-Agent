#!/usr/bin/env python3
"""Fresh FileStation session proof for cg-context-ledger (no SID reuse).

Proves list shares → CheckPermission → meta-root upload → read/hash → vault-root upload.
Stops with diagnostics on first meta 407 without changing ACLs.
"""
from __future__ import annotations

import contextlib
import hashlib
import io
import json
import os
import secrets
import sys
from datetime import datetime, timezone
from pathlib import Path

from synology_api import filestation

HOST = os.environ.get("CG_SERVER_HOST", "100.112.81.50")
PORT = os.environ.get("CG_SERVER_PORT", "5001")
META_SHARE = "Capital-Glass-AI-Evidence-meta"
VAULT_SHARE = "Capital-Glass-AI-Evidence-Vault"
SERVICE_USER = "cg-context-ledger"
ARTIFACT_DIR = Path(__file__).resolve().parents[2] / "artifacts/agent-runs/immutable-context-ledger-v1"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def sha256_bytes(data: bytes) -> str:
    return f"sha256:{hashlib.sha256(data).digest().hex()}"


def fresh_filestation() -> filestation.FileStation:
    """Create a new login session (new SID). Never reuse a prior instance."""
    user = os.environ.get("SYNOLOGY_SERVICE_USERNAME", SERVICE_USER)
    passwd = os.environ["SYNOLOGY_SERVICE_PASSWORD"]
    with contextlib.redirect_stdout(io.StringIO()):
        return filestation.FileStation(
            HOST, PORT, user, passwd,
            secure=True, cert_verify=False, dsm_version=7, debug=False,
        )


def upload_root(fs: filestation.FileStation, share: str, local_path: Path, filename: str) -> dict:
    dest = f"/{share}"
    result = fs.upload_file(
        dest,
        str(local_path),
        create_parents=False,
        overwrite=False,
        progress_bar=False,
    )
    if isinstance(result, tuple):
        status_code, body = result
        return {
            "success": False,
            "httpStatus": status_code,
            "dsmResponse": body,
            "request": {
                "destPath": dest,
                "filename": filename,
                "create_parents": False,
                "overwrite": False,
            },
        }
    return {
        "success": bool(result.get("success")),
        "httpStatus": 200,
        "dsmResponse": result,
        "request": {
            "destPath": dest,
            "filename": filename,
            "create_parents": False,
            "overwrite": False,
        },
    }


def read_remote_bytes(fs: filestation.FileStation, remote_path: str) -> bytes:
    buf = fs.get_file(remote_path, "serve")
    data = buf.getvalue() if hasattr(buf, "getvalue") else buf
    if not data:
        raise RuntimeError(f"empty read for {remote_path}")
    return data


def prove_share_root(fs: filestation.FileStation, share: str, label: str) -> dict:
    token = secrets.token_hex(8)
    filename = f"cg-cl-fresh-{label}-{token}.bin"
    payload = secrets.token_bytes(256)
    local_path = Path("/tmp") / filename
    local_path.write_bytes(payload)
    local_hash = sha256_bytes(payload)

    upload = upload_root(fs, share, local_path, filename)
    proof = {
        "share": share,
        "filename": filename,
        "localPath": str(local_path),
        "localHash": local_hash,
        "upload": upload,
        "status": "FAIL",
    }

    if not upload.get("success"):
        local_path.unlink(missing_ok=True)
        return proof

    remote_path = f"/{share}/{filename}"
    listing = fs.get_file_list(f"/{share}")
    names = [f["name"] for f in listing.get("data", {}).get("files", [])]
    proof["listAfterUpload"] = {"path": f"/{share}", "containsFile": filename in names, "namesSample": names[:20]}

    remote_bytes = read_remote_bytes(fs, remote_path)
    remote_hash = sha256_bytes(remote_bytes)
    proof["readBack"] = {
        "remotePath": remote_path,
        "byteLength": len(remote_bytes),
        "remoteHash": remote_hash,
        "hashMatch": remote_hash == local_hash,
    }
    proof["status"] = "PASS" if proof["readBack"]["hashMatch"] and proof["listAfterUpload"]["containsFile"] else "FAIL"
    local_path.unlink(missing_ok=True)
    return proof


def main() -> int:
    if not os.environ.get("SYNOLOGY_SERVICE_PASSWORD"):
        print("SYNOLOGY_SERVICE_PASSWORD required", file=sys.stderr)
        return 2

    receipt = {
        "schemaVersion": "context-ledger-phase0-filestation-fresh-session-proof-v1@1.0.0",
        "recordedAt": now_iso(),
        "host": HOST,
        "freshSession": True,
        "serviceUser": SERVICE_USER,
        "metaShareCanonical": META_SHARE,
        "status": "IN_PROGRESS",
    }

    fs = fresh_filestation()
    receipt["session"] = {
        "authenticatedUsername": getattr(fs, "_username", None),
        "sidPrefix": (getattr(fs, "_sid", "") or "")[:8] + "…" if getattr(fs, "_sid", None) else None,
    }

    shares = fs.get_list_share(onlywritable=False)
    receipt["listShares"] = shares

    for share in (META_SHARE, VAULT_SHARE):
        fname = f"cg-cl-perm-probe-{secrets.token_hex(4)}.bin"
        try:
            perm = fs.check_permissions(f"/{share}", fname, overwrite=False, create_only=True)
        except Exception as exc:  # noqa: BLE001
            perm = {"error": str(exc)}
        receipt.setdefault("checkPermission", {})[share] = {
            "path": f"/{share}",
            "filename": fname,
            "overwrite": False,
            "create_only": True,
            "result": perm,
        }

    meta_proof = prove_share_root(fs, META_SHARE, "meta")
    receipt["metaRootUpload"] = meta_proof

    if meta_proof["status"] != "PASS":
        receipt["status"] = "CG_CONTEXT_LEDGER_FILESTATION_META_ROOT_BLOCKED"
        receipt["diagnosticsOn407"] = {
            "authenticatedUsername": receipt["session"]["authenticatedUsername"],
            "listShares": receipt["listShares"],
            "checkPermission": receipt["checkPermission"],
            "uploadRequest": meta_proof["upload"].get("request"),
            "dsmJsonResponse": meta_proof["upload"].get("dsmResponse"),
            "httpStatus": meta_proof["upload"].get("httpStatus"),
        }
        ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
        out = ARTIFACT_DIR / "phase0-filestation-fresh-session-proof-v1.json"
        out.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
        print(json.dumps({"status": receipt["status"], "artifact": str(out)}, indent=2))
        return 1

    vault_proof = prove_share_root(fs, VAULT_SHARE, "vault")
    receipt["vaultRootUpload"] = vault_proof
    receipt["status"] = (
        "CG_CONTEXT_LEDGER_FILESTATION_FRESH_SESSION_PROOF_PASS"
        if vault_proof["status"] == "PASS"
        else "CG_CONTEXT_LEDGER_FILESTATION_VAULT_ROOT_BLOCKED"
    )

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    out = ARTIFACT_DIR / "phase0-filestation-fresh-session-proof-v1.json"
    out.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "status": receipt["status"],
        "artifact": str(out),
        "meta": meta_proof["status"],
        "vault": vault_proof["status"],
    }, indent=2))
    return 0 if receipt["status"].endswith("_PASS") else 1


if __name__ == "__main__":
    raise SystemExit(main())
