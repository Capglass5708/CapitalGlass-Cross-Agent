#!/usr/bin/env python3
"""CG-SERVER HostExecutionProvider forced-command dispatcher.

Structural grammar only — no shell, eval, or interpolation.
Allowed: VAULT_SSH_PROBE, VAULT_SHA256 <relativePath>
"""
from __future__ import annotations

import hashlib
import os
import sys
from pathlib import Path

VAULT_ROOT = Path(os.environ.get("CG_VAULT_ROOT", "/vault")).resolve()


def refuse(message: str) -> None:
    print(f"REFUSED: {message}", file=sys.stderr)
    raise SystemExit(1)


def validate_relative_path(rel: str) -> Path:
    if not rel or rel != rel.strip():
        refuse("empty path")
    if "\x00" in rel:
        refuse("null byte")
    for ch in (";", "|", "&", "$", "`", "(", ")", "<", ">", "\n", "\r", "\\"):
        if ch in rel:
            refuse("metacharacter")
    if rel.startswith("/"):
        refuse("absolute path")
    if ".." in Path(rel).parts:
        refuse("path traversal")
    if rel.endswith("/"):
        refuse("directory path")
    target = (VAULT_ROOT / rel).resolve()
    vault_real = VAULT_ROOT.resolve()
    try:
        target.relative_to(vault_real)
    except ValueError:
        refuse("outside vault root")
    return target


def hash_one_file(rel: str) -> None:
    target = validate_relative_path(rel)
    if not target.exists():
        refuse("not found")
    if target.is_symlink():
        refuse("symlink")
    if not target.is_file():
        refuse("not a regular file")
    digest = hashlib.sha256(target.read_bytes()).hexdigest()
    size = target.stat().st_size
    print(f"hash={digest}")
    print(f"size={size}")
    print(f"path={rel}")


def main() -> None:
    cmd = os.environ.get("SSH_ORIGINAL_COMMAND", "").strip()
    if not cmd:
        refuse("empty original command")

    if cmd == "VAULT_SSH_PROBE":
        print("VAULT_SSH_OK")
        return

    if cmd.startswith("VAULT_SHA256 "):
        rel = cmd[len("VAULT_SHA256 ") :].strip()
        if not rel or " " in rel:
            refuse("too many arguments")
        hash_one_file(rel)
        return

    refuse("command not in allowlist")


if __name__ == "__main__":
    main()
