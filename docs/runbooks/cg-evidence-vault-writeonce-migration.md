# Evidence Vault WriteOnce (WORM) Migration — DSM 7.3

**Closes:** storage lane blocker `IMMUTABILITY_ENFORCEMENT` (`CANARY_OVERWRITE SUCCEEDED` → must become `REFUSED`)  
**Host:** CG-SERVER (`100.112.81.50`)  
**Current share:** `Capital-Glass-AI-Evidence-Vault`  
**Prover:** `scripts/context-ledger/prove-primary-authority-v1.py`  
**Scoreboard:** `artifacts/agent-runs/cg-secret-and-storage-authority-100-v1/primary-storage-execution-plane-v1-scoreboard.json`

**Operator-executed on the NAS.** None of this is automatable from the repo.

> **Irreversibility warning:** Compliance-mode WriteOnce and its retention **cannot be undone or shortened**. Do a full dry run (Step 6) before touching real evidence.

---

## 0. Preconditions — verify on the box, do not assume

| Gate | How to check | If it fails |
| --- | --- | --- |
| Model supports WriteOnce | [Synology WriteOnce compatibility list](https://sy.to/wormmodels) | Lane blocked — fall back to Immutable Snapshots as partial mitigation |
| Volume is Btrfs | Storage Manager → volume file system | ext4 → separate project: back up, reformat Btrfs, restore (full wipe; no in-place convert) |
| DSM ≥ 7.2 | Control Panel → Info Center | 7.3 confirmed — OK |
| ACL supported on the share | UID 1031 read already granted on current share | Re-grant on the new share (Step 3) |

**Facts (Synology, Sep 2026):**

- WriteOnce is **Btrfs-only** — no in-place ext4→Btrfs conversion (volume format = full wipe).
- WriteOnce mode (**Enterprise** vs **Compliance**) is set **at folder creation** and **cannot be switched** later.
- **Compliance:** no admin delete; folder/volume/pool cannot be removed until retention expires.
- **Enterprise:** admin privileged-delete escape hatch remains.

---

## 1. Decisions required before creating anything

| Decision | Guidance |
| --- | --- |
| **Mode** | **Compliance** for the real evidence vault (no admin delete). Use **Enterprise** only for the Step 6 dry run. |
| **Retention** | Business/compliance input. Can be **extended**, never **shortened** once locked. Do not over-set during testing. |
| **Lock policy** | Auto Lock timer vs Lock Immediately — match how evidence lands (short auto-lock if prover writes atomically). |
| **Lock state** | **Immutable** for evidence artifacts (not Append-only). |

---

## 2. Create the WriteOnce share (new folder — no in-place convert)

1. Control Panel → Shared Folder → **Create** → e.g. `Capital-Glass-AI-Evidence-Vault-WORM`
2. Enable **Protect this shared folder with WriteOnce**; choose mode, auto-lock, retention, lock state from Step 1.
3. Creation triggers a full Btrfs data scrub — expect it to run.

---

## 3. Migrate evidence — verify hashes BEFORE locking

Order matters: a corrupt/incomplete copy that gets locked is unrecoverable.

1. **Copy** (not move) existing evidence from `Capital-Glass-AI-Evidence-Vault` → new WORM share.
2. Run `VAULT_SHA256` on source and destination; confirm every hash matches while files are still **Open**.
3. Only after hashes match, allow auto-lock to fire (or lock manually: File Station → right-click → WriteOnce → Lock).
4. Do **not** decommission the old share until the prover is green against the new one and retention on the WORM copy is confirmed active.

---

## 4. Repoint the storage plane (mirror the bind-mount fix)

The same class of error that had the container reading the empty staging tree — repoint **every** reference to the WORM share path.

| Surface | Action |
| --- | --- |
| `infra/cg-vault-ssh/docker-compose.yml` | Bind mount → `/volume1/Capital-Glass-AI-Evidence-Vault-WORM` |
| Doppler `CG_VAULT_*` / `CG_EVIDENCE_VAULT_SHARE` | Share name/path |
| Prover `CG_EVIDENCE_VAULT_SHARE` | New share name |
| ACL | Re-grant UID 1031 (`vault` / `cg-context-ledger`) read ACE (read-data, read-attributes, traverse; no write/delete) |

**Protocol note:** Advanced lock management is richest over SMB/NFS. The Docker bind mount is sufficient for write-new + read + refuse-overwrite. Programmatic lock-state changes use DSM UI or SMB — not the bind mount.

---

## 5. Redesign the prover immutability check (**do this FIRST**)

The legacy canary test is **unsafe on WriteOnce Compliance**: each run that writes a control object leaves locked residue until retention expires.

**Implemented (repo):** non-destructive sentinel mode in `prove-primary-authority-v1.py`.

| Env var | Purpose |
| --- | --- |
| `CG_WORM_IMMUTABILITY_SENTINEL_REL` | Vault-relative path to an **already-locked** file; prover attempts overwrite/delete and expects refusal |
| `CG_PROVER_CONTROL_WRITE_ENABLED=false` | Skip File Station control-object upload on WORM vault |
| `CG_PROVER_HASH_TARGET_REL` | Existing evidence path for `VAULT_SHA256` when control write is disabled |
| `CG_PROVER_REQUIRE_WORM_SENTINEL=true` | Fail closed if sentinel unset (use after migration) |
| `CG_EVIDENCE_VAULT_SHARE` | Share name for File Station API paths |

**Expected after WORM migration:**

| Field | Expected |
| --- | --- |
| `CANARY_OVERWRITE` | `REFUSED` |
| `CANARY_DELETE` | `REFUSED` |
| `IMMUTABILITY_ENFORCEMENT` | `PROVEN` |
| `DESTINATION_HASH_LIVE_PROOF` | `PASS` |
| `PRIMARY_STORAGE_AUTHORITY` | `PROVEN` |

**Never** run legacy destructive mode (`CG_WORM_IMMUTABILITY_SENTINEL_REL` unset + control write) against a Compliance WORM folder.

---

## 6. Dry run before the real thing (strongly recommended)

1. Create a throwaway **Enterprise** WriteOnce folder with **short retention** (e.g. 1 day).
2. Copy a sample, verify hash, lock, point scratch prover at it with sentinel configured.
3. Confirm overwrite/delete are **REFUSED** and **no new locked residue** is created.
4. Delete the Enterprise test folder (admin can, in Enterprise mode).
5. Only then build the real **Compliance** vault and migrate.

---

## 7. Verify and update scoreboard

```bash
export CG_VAULT_SSH_USER=vault
export CG_PROVER_CONTROL_WRITE_ENABLED=false
export CG_PROVER_HASH_TARGET_REL=control/worm-proof/<locked-sentinel>.txt
export CG_WORM_IMMUTABILITY_SENTINEL_REL=control/worm-proof/<locked-sentinel>.txt
export CG_EVIDENCE_VAULT_SHARE=Capital-Glass-AI-Evidence-Vault-WORM
export CG_PROVER_REQUIRE_WORM_SENTINEL=true

doppler run --project cg-shared --config prd -- \
  python3 scripts/context-ledger/prove-primary-authority-v1.py
```

Update scoreboard: `PARTIAL_WORM_ONLY` → storage lane **PROVEN** when all fields green.

Also confirm: new evidence can still be **written** (create/append in Open state) and UID 1031 can still **read**.

---

## Risk register

| Risk | Mitigation |
| --- | --- |
| Compliance mode + retention are irreversible | Dry run in Enterprise mode first (Step 6) |
| Locking a corrupt/incomplete copy | Verify hashes before locking (Step 3) |
| Prover canaries permanently pollute the vault | Sentinel mode + `CG_PROVER_CONTROL_WRITE_ENABLED=false` (Step 5) |
| Volume is ext4, not Btrfs | Full backup + reformat + restore — separate project |
| Model doesn't support WriteOnce | Fall back to Immutable Snapshots; lane stays `PARTIAL` |
| Retention set too long during testing | Never test retention on the real Compliance folder |
| Wrong bind mount (staging tree) | Audit paths — see `siblingPathAudit` in scoreboard |

---

## Notes

- Each WriteOnce folder has its own Tamper-Proof Clock; actual retention may run slightly longer than specified.
- Reserved DSM system sub-directories inside a WriteOnce folder are exempt from retention — expected, not a leak.
- Optional hardening: enable **Immutable Snapshots** on the WORM share for a second WORM layer.

---

## Related

- `infra/cg-vault-ssh/README.md` — Docker vault SSH execution plane
- `runbooks/CONTEXT_LEDGER_NAS_PROVISIONING_RUNBOOK.md` — NAS provisioning (update vault path when migrating)
- Scoreboard: `primary-storage-execution-plane-v1-scoreboard.json`
