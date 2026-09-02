# CG Vault SSH — constrained storage execution plane

Dedicated SSH surface for immutable-context ledger operations on `cg-server`.
This is **not** DSM administrative SSH (port 22).

## Architecture

| Surface | Port | Purpose |
| --- | --- | --- |
| DSM native SSH | 22 | Administrative only |
| CG Vault SSH | 22222 | Governed transfer + `VAULT_SHA256` |

Allowed commands (structural dispatcher — no shell):

- `VAULT_SSH_PROBE`
- `VAULT_SHA256 <vault-relative-path>`
- `rsync --server …` (governed transfer only)

## Deployment paths

### Preferred: Docker / Container Manager

Requires **Container Manager** installed on DSM (installed on cg-server 2026-09-02).

```powershell
$env:CG_VAULT_SSH_SRC = 'C:\path\to\infra\cg-vault-ssh'
.\deploy-cg-vault-ssh.ps1
```

### Fallback: Native second-instance sshd

Uses Synology `/usr/bin/sshd -f …` on port 22222 with `UsePAM no`.

```powershell
.\deploy-cg-vault-ssh-native.ps1
```

**Known Synology constraint:** DSM-patched `sshd` enforces a post-pubkey session gate
(`Permission denied, please try again`) for users without Terminal/SSH application
privilege — even on a separate port with forced-command-only `authorized_keys`.
Pubkey auth succeeds; session exec is refused before the dispatcher runs.

**Resolution (choose one):**

1. **Install Container Manager** and deploy the Docker path (vanilla OpenSSH inside the container).
2. Grant `cg-context-ledger` **Terminal & SNMP → SSH** user privilege in DSM
   (not `administrators` membership). Forced-command dispatch still constrains execution.

## Verify

Docker path SSH login user is **`vault`** (UID 1031 inside the container). DSM File Station
service identity remains **`cg-context-ledger`**. Set `CG_VAULT_SSH_USER=vault` when using
Container Manager deployment.

```bash
export CG_VAULT_SSH_HOST=100.112.81.50 CG_VAULT_SSH_PORT=22222
export CG_VAULT_SSH_KEY=~/.ssh/cg-context-ledger_ed25519
export CG_VAULT_SSH_USER=vault

ssh -i "$CG_VAULT_SSH_KEY" -p "$CG_VAULT_SSH_PORT" \
  -o BatchMode=yes -o IdentitiesOnly=yes \
  "$CG_VAULT_SSH_USER@$CG_VAULT_SSH_HOST" VAULT_SSH_PROBE
# expect: VAULT_SSH_OK

./test-adversarial-hash.sh
```

## Prover

```bash
doppler run --project cg-shared --config prd -- \
  python3 scripts/context-ledger/prove-primary-authority-v1.py
```

## Files

| File | Role |
| --- | --- |
| `cg-vault-dispatch.py` | Forced-command parser |
| `cg-vault-run.sh` | Native host entry (sets `CG_VAULT_ROOT`) |
| `sshd_config` / `sshd_config.native` | Container vs native sshd |
| `authorized_keys.native` | Key + forced command |
| `docker-compose.yml` | Container deployment |
| `rc.cg-vault-ssh.sh` | Boot hook (native) |
