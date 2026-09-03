#!/usr/bin/env python3
"""Native Synology transport for cg-context-ledger — HTTPS FileStation over Tailscale.

Uses the service account and SMB share permissions without SSH shell or drvfs.
"""
from __future__ import annotations

import argparse
import contextlib
import hashlib
import io
import json
import os
import sys
from pathlib import Path

from synology_api import filestation

HOST = os.environ.get("CG_SERVER_HOST", "100.112.81.50")
PORT = os.environ.get("CG_SERVER_PORT", "5001")
VAULT_SHARE = "Capital-Glass-AI-Evidence-Vault"
META_SHARE = "Capital-Glass-AI-Evidence-meta"


def connect() -> filestation.FileStation:
    user = os.environ["SYNOLOGY_SERVICE_USERNAME"]
    passwd = os.environ["SYNOLOGY_SERVICE_PASSWORD"]
    with contextlib.redirect_stdout(io.StringIO()):
        return filestation.FileStation(
            HOST, PORT, user, passwd, secure=True, cert_verify=False, dsm_version=7
        )


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return f"sha256:{h.hexdigest()}"


def upload(local_path: Path, remote_rel: str) -> None:
    fs = connect()
    remote_rel = remote_rel.replace("\\", "/")
    dest_dir = f"/{VAULT_SHARE}/{'/'.join(remote_rel.split('/')[:-1])}"
    result = fs.upload_file(
        dest_dir, str(local_path), create_parents=True, overwrite=False, progress_bar=False,
    )
    if isinstance(result, tuple):
        _code, data = result
        if isinstance(data, dict) and not data.get("success", False):
            raise RuntimeError(f"upload failed: {data}")
        if isinstance(data, dict) and data.get("success"):
            return
        raise RuntimeError(f"upload failed: {_code} {data}")
    if isinstance(result, dict):
        if not result.get("success", False):
            raise RuntimeError(f"upload failed: {result}")
        return
    if isinstance(result, str) and result.startswith("Upload"):
        return
    raise RuntimeError(f"upload failed: unexpected result {result!r}")


def _read_bytes(fs: filestation.FileStation, remote: str) -> bytes:
    buf = fs.get_file(remote, "serve")
    data = buf.getvalue() if hasattr(buf, "getvalue") else buf
    if not data:
        raise RuntimeError(f"empty download for {remote}")
    return data


def download(remote_rel: str, local_path: Path) -> None:
    fs = connect()
    remote = f"/{VAULT_SHARE}/{remote_rel.replace(chr(92), '/')}"
    local_path.parent.mkdir(parents=True, exist_ok=True)
    local_path.write_bytes(_read_bytes(fs, remote))


def hash_remote(remote_rel: str) -> str:
    fs = connect()
    remote = f"/{VAULT_SHARE}/{remote_rel.replace(chr(92), '/')}"
    tmp = Path("/tmp") / f"cg-cl-hash-{hashlib.sha256(remote.encode()).hexdigest()[:16]}"
    try:
        tmp.write_bytes(_read_bytes(fs, remote))
        return sha256_file(tmp)
    finally:
        tmp.unlink(missing_ok=True)


def write_meta(rel_path: str, content: str, *, overwrite: bool = True) -> None:
    fs = connect()
    rel_path = rel_path.replace("\\", "/")
    parent = f"/{META_SHARE}/{'/'.join(rel_path.split('/')[:-1])}"
    tmp = Path("/tmp") / f"cg-cl-meta-{hashlib.sha256(rel_path.encode()).hexdigest()[:12]}.json"
    tmp.write_text(content, encoding="utf-8")
    try:
        fs.upload_file(parent, str(tmp), create_parents=True, overwrite=overwrite)
    finally:
        tmp.unlink(missing_ok=True)


def read_meta(rel_path: str) -> str:
    fs = connect()
    remote = f"/{META_SHARE}/{rel_path.replace(chr(92), '/')}"
    return _read_bytes(fs, remote).decode("utf-8")


def delete_meta_tree(rel_path: str) -> None:
    fs = connect()
    remote = f"/{META_SHARE}/{rel_path.replace(chr(92), '/')}"
    try:
        fs.delete_folder([remote])
    except Exception:
        pass


def list_vault_prefix(prefix: str) -> list[str]:
    fs = connect()
    remote = f"/{VAULT_SHARE}/{prefix.replace(chr(92), '/')}"
    out: list[str] = []

    def walk(path: str) -> None:
        listing = fs.get_file_list(path)
        for item in listing["data"]["files"]:
            name = item["name"]
            full = f"{path.rstrip('/')}/{name}"
            if item.get("isdir"):
                walk(full)
            else:
                rel = full.split(f"/{VAULT_SHARE}/", 1)[-1]
                if rel.startswith("immutable-metadata/ledger-entries/entry-"):
                    out.append(rel)

    walk(remote)
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_up = sub.add_parser("upload")
    p_up.add_argument("local")
    p_up.add_argument("remote_rel")

    p_dl = sub.add_parser("download")
    p_dl.add_argument("remote_rel")
    p_dl.add_argument("local")

    p_hash = sub.add_parser("hash-remote")
    p_hash.add_argument("remote_rel")

    p_wm = sub.add_parser("write-meta")
    p_wm.add_argument("rel_path")
    p_wm.add_argument("content_file")

    p_rm = sub.add_parser("read-meta")
    p_rm.add_argument("rel_path")

    p_dm = sub.add_parser("delete-meta")
    p_dm.add_argument("rel_path")

    p_ls = sub.add_parser("list-ledger-entries")
    args = parser.parse_args()

    if args.cmd == "upload":
        upload(Path(args.local), args.remote_rel)
    elif args.cmd == "download":
        download(args.remote_rel, Path(args.local))
    elif args.cmd == "hash-remote":
        print(hash_remote(args.remote_rel))
    elif args.cmd == "write-meta":
        write_meta(args.rel_path, Path(args.content_file).read_text(encoding="utf-8"))
    elif args.cmd == "read-meta":
        print(read_meta(args.rel_path), end="")
    elif args.cmd == "delete-meta":
        delete_meta_tree(args.rel_path)
    elif args.cmd == "list-ledger-entries":
        entries = list_vault_prefix("immutable-metadata/ledger-entries")
        print(json.dumps(sorted(entries)))
    else:
        parser.error("unknown command")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
