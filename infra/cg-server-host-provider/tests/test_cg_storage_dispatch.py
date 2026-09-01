#!/usr/bin/env python3
"""Adversarial tests for cg-storage-dispatch.py — no NAS required."""
from __future__ import annotations

import hashlib
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

DISPATCH = Path(__file__).resolve().parents[1] / "dispatch" / "cg-storage-dispatch.py"


class DispatchHarness(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.vault = Path(self.tmp.name) / "vault"
        self.vault.mkdir()
        self.rel = "control/live-acceptance/disposable.txt"
        target = self.vault / self.rel
        target.parent.mkdir(parents=True, exist_ok=True)
        self.content = b"worm-proof-bytes\n"
        target.write_bytes(self.content)
        self.sha = hashlib.sha256(self.content).hexdigest()

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def run_cmd(self, original_command: str) -> subprocess.CompletedProcess[str]:
        env = os.environ.copy()
        env["CG_VAULT_ROOT"] = str(self.vault)
        env["SSH_ORIGINAL_COMMAND"] = original_command
        return subprocess.run(
            [sys.executable, str(DISPATCH)],
            env=env,
            capture_output=True,
            text=True,
        )

    def test_probe_ok(self) -> None:
        r = self.run_cmd("VAULT_SSH_PROBE")
        self.assertEqual(r.returncode, 0)
        self.assertIn("VAULT_SSH_OK", r.stdout)

    def test_hash_valid(self) -> None:
        r = self.run_cmd(f"VAULT_SHA256 {self.rel}")
        self.assertEqual(r.returncode, 0)
        self.assertIn(f"hash={self.sha}", r.stdout)
        self.assertIn(f"size={len(self.content)}", r.stdout)
        self.assertIn(f"path={self.rel}", r.stdout)

    def test_nested_path(self) -> None:
        nested = "control/worm-proof/nested/file.txt"
        p = self.vault / nested
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(b"x")
        r = self.run_cmd(f"VAULT_SHA256 {nested}")
        self.assertEqual(r.returncode, 0)

    def test_refuse_traversal(self) -> None:
        for rel in ["../x", "../../x", "a/../../../x"]:
            r = self.run_cmd(f"VAULT_SHA256 {rel}")
            self.assertNotEqual(r.returncode, 0)
            self.assertIn("REFUSED", r.stderr)

    def test_refuse_absolute(self) -> None:
        r = self.run_cmd("VAULT_SHA256 /etc/passwd")
        self.assertNotEqual(r.returncode, 0)

    def test_refuse_injection(self) -> None:
        for rel in ["x;id", "x|id", "x&&id", "x$(id)", "x`id`", "x\nid"]:
            r = self.run_cmd(f"VAULT_SHA256 {rel}")
            self.assertNotEqual(r.returncode, 0, rel)

    def test_refuse_unsupported(self) -> None:
        for cmd in ["id", "bash", "ls", "VAULT_SHA256", "VAULT_SHA256 a b", "rsync --server"]:
            r = self.run_cmd(cmd)
            self.assertNotEqual(r.returncode, 0, cmd)

    def test_refuse_missing_file(self) -> None:
        r = self.run_cmd("VAULT_SHA256 control/missing.txt")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("not found", r.stderr)

    def test_refuse_directory(self) -> None:
        d = self.vault / "control/dironly"
        d.mkdir(parents=True, exist_ok=True)
        r = self.run_cmd("VAULT_SHA256 control/dironly")
        self.assertNotEqual(r.returncode, 0)


if __name__ == "__main__":
    unittest.main()
