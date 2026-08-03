# WSL2 native repo library migration

**Work package:** `wsl2-native-repo-library-migration-v1`  
**Status:** `PARTIAL`  
**Verdict:** `FILESYSTEM_PASS_OPERATIONAL_CLEANUP_RECORDED`  
**Owner repo:** CG-AppBuilder-MCP  
**Harvested:** 2026-08-03 (`harvest-2026-08-03-cross-thread-platform-state-v1`)

---

## Summary

Suite migration toward WSL ext4 canonical Git roots (`$HOME/repos/<repo>`) under Remote-WSL policy. Filesystem migration evidence recorded; not every repo verified complete.

---

## Policy reference

- WSL2 Remote-WSL first (`.cursor/rules/wsl2-remote-first.mdc` in CG-AppBuilder-MCP)
- Canonical mutation root: `$HOME/repos/<repo>` on ext4
- Legacy NTFS (`/mnt/c/Developer/repos`) — read-only recovery, not publication authority

---

## Recorded state (2026-08-03)

| Host | Notes |
| --- | --- |
| WESLEY_WORK | Primary dev on ext4 under `~/repos` |
| WESLEYDESK | Ubuntu 26.04 LTS accepted post host-guard |
| RYZEN9DESK | Ext4 repo at `/home/wesley/repos/CG-AppBuilder-MCP` exists; dirty worktree on feature branch — **separate executor mission** |

---

## Remaining work

- Per-repo verification that canonical ext4 checkout is clean and tracking GitHub
- Retire NTFS-only workflows where still referenced
- RYZEN9DESK canonical workspace alignment (CG-AppBuilder-MCP `feat/ryzen9desk-wsl2-canonical-workspace-v1`)

---

## Do not advance

- Claiming migration `COMPLETE` without per-repo gate evidence
- Mixing WSL migration with RYZEN9DESK runner bootstrap (separate missions)
