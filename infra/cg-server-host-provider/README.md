# CG-SERVER HostExecutionProvider (`container-dispatch`)

Neutral host substrate beneath the frozen Office Admin contract `cg-server-storage-v1`.

## Architecture classification

```text
Office Admin admission → CG_EXECUTOR_AGENT → cg-server-storage-v1 → container-dispatch → CG-SERVER
```

SSH and Container Manager are **transport/substrate only** — never authority.

## Frozen client compatibility

Office Admin `container-dispatch` client (`ea330bb`) expects:

| Operation | Command | Success |
| --- | --- | --- |
| Probe | `VAULT_SSH_PROBE` | `VAULT_SSH_OK` |
| Hash | `VAULT_SHA256 <relativePath>` | `hash=`, `size=`, `path=` lines |

Service: `cg-context-ledger@100.112.81.50:22222`

## Storage binding

| Field | Value |
| --- | --- |
| `storageAuthorityId` | `capital-glass-immutable-context-vault-v1` |
| `machineIdentity` | `CG-SERVER` |
| Host path | `/volume1/Capital Glass/Capital-Glass-AI-Evidence-Vault` |
| Container path | `/vault` |

## Mount contract note

`compose.yaml` mounts the vault **`:ro`** because `storage.probe` and `storage.hash` are read-only.

Frozen Office Admin storage authority metadata lists `mountMode: rw`.

```text
MOUNT_CONTRACT_MISMATCH = FOUND
RECOMMENDATION = align metadata to :ro or document rw requirement if future write ops need it
```

Provider prefers least privilege (`:ro`).

## Security boundary

- Non-privileged container, no Docker socket, no host `/` mount
- Only canonical vault share mounted
- Forced command dispatcher — no interactive shell
- Password auth disabled, root login disabled, forwarding disabled

## Deployment (WESLEY WORK + IT Vault)

```powershell
Test-Path 'D:\Admin Keys\Capital-Glass-IT-Vault'  # must be True
cd <CapitalGlass-Cross-Agent>\infra\cg-server-host-provider\scripts
.\install-container-manager.ps1
.\deploy-provider.ps1
.\verify-provider.ps1
```

If Container Manager is **broken** (`install_corruption`), repair via DSM Package Center before CLI install.

## Local tests (no NAS)

```bash
python3 infra/cg-server-host-provider/tests/test_cg_storage_dispatch.py
```

## Acceptance handoff

After `verify-provider.ps1` passes, resume on **NIMO** with `CG-NIMO-01` as controller:

```bash
export CG_VAULT_DOCKER_LIVE=1
npm run executor:execute -- --controller CG-NIMO-01 ...
```

Primary milestone: `storage.hash LIVE_OBSERVED = PASS` through governed spine.
