#!/bin/sh
# CG Vault SSH forced-command entry (native host — no shell interpolation).
export CG_VAULT_ROOT='/volume1/Capital Glass/Capital-Glass-AI-Evidence-Vault'
exec /usr/bin/python3 /volume1/docker/cg-vault-ssh/bin/cg-vault-dispatch.py
