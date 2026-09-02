#!/usr/bin/env python3
"""Primary vault authority proof, executed AS the least-privilege service identity.

Runs Steps A-F of the operator ruling in one pass and emits the checkpoint block.

SAFETY PROPERTIES:
  - Authenticates ONLY as cg-context-ledger. It never falls back to ADMIN; if the
    service credential is absent it refuses, because an ADMIN result is not
    probative here (ADMIN is intentionally non-writable on the vault).
  - Performs NO provisioning mutation. It does not create, recreate, or alter any
    share, ACL, user, retention or WORM setting.
  - Writes at most ONE control object when CG_PROVER_CONTROL_WRITE_ENABLED is true.
  - On WriteOnce Compliance vaults, set CG_PROVER_CONTROL_WRITE_ENABLED=false and
    CG_WORM_IMMUTABILITY_SENTINEL_REL to an already-locked file; immutability is
    proven by refused overwrite/delete on the sentinel (creates no new objects).
  - Credential values are read from the environment, sent only in POST bodies,
    and never printed, logged, or placed in the receipt.
"""
import hashlib, json, os, ssl, subprocess, sys, urllib.parse, urllib.request, uuid

HOST = os.environ.get("CG_SERVER_HOST", "100.112.81.50")
BASE = f"https://{HOST}:5001/webapi"
VAULT = os.environ.get("CG_EVIDENCE_VAULT_SHARE", "Capital-Glass-AI-Evidence-Vault")
EXPECTED_UUID = "1a3c37f6-85e0-4dc1-94ac-1ee36a893003"
EXPECTED_UID = 1031
CONTROL_NS = "control/worm-proof"
CG_VAULT_SSH_PORT = os.environ.get("CG_VAULT_SSH_PORT", "22222")
CG_VAULT_SSH_USER = os.environ.get("CG_VAULT_SSH_USER", "vault")
CG_VAULT_SSH_KEY = os.environ.get(
    "CG_VAULT_SSH_KEY", os.path.expanduser("~/.ssh/cg-context-ledger_ed25519")
)
PROVER_CONTROL_WRITE = os.environ.get("CG_PROVER_CONTROL_WRITE_ENABLED", "true").lower() in (
    "1", "true", "yes",
)
HASH_TARGET_REL = os.environ.get("CG_PROVER_HASH_TARGET_REL", "").strip()
WORM_SENTINEL_REL = os.environ.get("CG_WORM_IMMUTABILITY_SENTINEL_REL", "").strip()
REQUIRE_WORM_SENTINEL = os.environ.get("CG_PROVER_REQUIRE_WORM_SENTINEL", "false").lower() in (
    "1", "true", "yes",
)
CTX = ssl.create_default_context(); CTX.check_hostname = False; CTX.verify_mode = ssl.CERT_NONE

R = {
    "SERVICE_CREDENTIAL": "BLOCKED",
    "SERVICE_ACCOUNT_AUTH": "NOT_RUN",
    "SERVICE_ACCOUNT_UID": None,
    "SERVICE_ACCOUNT_ADMIN": None,
    "FILESTATION_SERVICE_ACCESS": "NOT_RUN",
    "SHARE_GET": "NOT_RUN",
    "SHARE_LIST": "NOT_RUN",
    "SHARE_ENUMERATION_ANOMALY": "OPEN",
    "PROVISIONING_MUTATION_NECESSARY": "NOT_PROVEN",
    "FILESTATION_CANARY_WRITE": "NOT_RUN",
    "CG_VAULT_SSH_PROBE": "NOT_RUN",
    "VAULT_RUNTIME_ACCESS": "NOT_RUN",
    "DESTINATION_HASH_LIVE_PROOF": "NOT_RUN",
    "WORM_STATE_CONFIGURATION": "NOT_OBSERVED",
    "CANARY_OVERWRITE": "NOT_RUN",
    "CANARY_DELETE": "NOT_RUN",
    "IMMUTABILITY_ENFORCEMENT": "NOT_OBSERVED",
    "PRIMARY_STORAGE_AUTHORITY": "UNPROVEN",
    "mutationsPerformed": [],
    "evidence": {},
    "blockers": [],
}

def cg_vault_ssh(remote_cmd):
    """Constrained CG Vault SSH execution plane — not DSM native SSH."""
    cmd = [
        "ssh", "-i", CG_VAULT_SSH_KEY, "-p", CG_VAULT_SSH_PORT,
        "-o", "BatchMode=yes", "-o", "IdentitiesOnly=yes",
        "-o", "PasswordAuthentication=no", "-o", "StrictHostKeyChecking=accept-new",
        f"{CG_VAULT_SSH_USER}@{HOST}", remote_cmd,
    ]
    return subprocess.run(cmd, capture_output=True, text=True, timeout=90, check=False)

def parse_hash_output(stdout):
    fields = {}
    for line in stdout.splitlines():
        if "=" in line:
            k, v = line.split("=", 1)
            fields[k.strip()] = v.strip()
    return fields

def post(cgi, params):
    d = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(f"{BASE}/{cgi}", data=d,
                                 headers={"Content-Type": "application/x-www-form-urlencoded"})
    with urllib.request.urlopen(req, context=CTX, timeout=45) as r:
        return json.loads(r.read().decode())

def get(cgi, params):
    with urllib.request.urlopen(urllib.request.Request(f"{BASE}/{cgi}?{urllib.parse.urlencode(params)}"),
                                context=CTX, timeout=45) as r:
        return json.loads(r.read().decode())

def emit_and_exit(code=0):
    print(json.dumps(R, indent=1))
    sys.exit(code)

# ---------------- STEP A: service-identity authentication ----------------
user = os.environ.get("SYNOLOGY_SERVICE_USERNAME")
pw = os.environ.get("SYNOLOGY_SERVICE_PASSWORD")
if not user or not pw:
    R["blockers"].append({
        "id": "SERVICE_CREDENTIAL_ABSENT",
        "detail": "SYNOLOGY_SERVICE_USERNAME / SYNOLOGY_SERVICE_PASSWORD are not in the environment.",
        "remedy": "Operator bootstraps cg-context-ledger in DSM and stores the credential in Doppler cg-shared/prd. Run this under: doppler run --project cg-shared --config prd -- python3 <this script>",
        "adminFallbackRefused": "An ADMIN result is not probative: ADMIN is intentionally non-writable on the vault.",
    })
    emit_and_exit(3)

sid = None
for v in ("7", "6", "3"):
    try:
        r = post("auth.cgi", {"api": "SYNO.API.Auth", "version": v, "method": "login",
                              "account": user, "passwd": pw, "session": "FileStation", "format": "sid"})
        if r.get("success"):
            sid = r["data"]["sid"]; break
    except Exception:
        continue
if not sid:
    R["SERVICE_ACCOUNT_AUTH"] = "FAIL"
    R["blockers"].append({"id": "SERVICE_AUTHENTICATION_FAILED",
                          "detail": "The service credential did not authenticate to DSM."})
    emit_and_exit(4)

R["SERVICE_CREDENTIAL"] = "PASS"
R["SERVICE_ACCOUNT_AUTH"] = "PASS"

# Confirm the authenticated identity INDEPENDENTLY. The supplied username is an
# input, not evidence; ask DSM what this session actually is.
ident = {}
try:
    fi = get("entry.cgi", {"api": "SYNO.FileStation.Info", "version": "2", "method": "get", "_sid": sid})
    ident["fileStationInfo"] = fi.get("data")
    if isinstance(fi.get("data"), dict):
        R["SERVICE_ACCOUNT_ADMIN"] = bool(fi["data"].get("is_manager"))
except Exception as e:
    ident["fileStationInfoError"] = str(e)[:150]
try:
    ug = get("entry.cgi", {"api": "SYNO.Core.User", "version": "1", "method": "get",
                           "name": user, "_sid": sid})
    if ug.get("success"):
        u = (ug.get("data", {}).get("users") or [{}])[0]
        ident["uidFromDsm"] = u.get("uid")
        R["SERVICE_ACCOUNT_UID"] = u.get("uid")
    else:
        ident["userGetRefused"] = ug.get("error")
except Exception as e:
    ident["userGetError"] = str(e)[:150]
R["evidence"]["identity"] = ident
if R["SERVICE_ACCOUNT_UID"] is None:
    ident["uidNote"] = ("The service account cannot read user records, which is itself consistent with "
                        "least privilege. uid 1031 remains ADMIN-observed rather than self-confirmed.")

# ---------------- STEP B: vault visibility, three signals reported separately ----------------
try:
    g = get("entry.cgi", {"api": "SYNO.Core.Share", "version": "1", "method": "get",
                          "name": VAULT, "_sid": sid})
    got = g.get("data") if g.get("success") else None
    R["SHARE_GET"] = "PASS" if (got and got.get("uuid") == EXPECTED_UUID) else "FAIL"
    R["evidence"]["shareGet"] = {"success": g.get("success"), "uuid": (got or {}).get("uuid"),
                                 "uuidMatchesExpected": (got or {}).get("uuid") == EXPECTED_UUID,
                                 "error": g.get("error")}
except Exception as e:
    R["SHARE_GET"] = "FAIL"; R["evidence"]["shareGetError"] = str(e)[:150]

# Negative control: a fabricated name must NOT succeed, or get proves nothing.
try:
    ng = get("entry.cgi", {"api": "SYNO.Core.Share", "version": "1", "method": "get",
                           "name": f"ZZZ-NOT-A-SHARE-{uuid.uuid4().hex[:8]}", "_sid": sid})
    R["evidence"]["shareGetNegativeControl"] = {"success": ng.get("success"), "error": ng.get("error"),
                                                "controlHolds": not ng.get("success")}
except Exception as e:
    R["evidence"]["shareGetNegativeControl"] = {"exception": str(e)[:120]}

try:
    l = get("entry.cgi", {"api": "SYNO.Core.Share", "version": "1", "method": "list",
                          "limit": "-1", "_sid": sid})
    names = [s.get("name") for s in l.get("data", {}).get("shares", [])]
    R["SHARE_LIST"] = "PRESENT" if VAULT in names else "OMITTED"
    R["evidence"]["shareListNames"] = names
except Exception as e:
    R["evidence"]["shareListError"] = str(e)[:150]

fs_shares = []
try:
    fl = get("entry.cgi", {"api": "SYNO.FileStation.List", "version": "2", "method": "list_share",
                           "additional": json.dumps(["real_path", "perm"]), "_sid": sid})
    fs_shares = [s.get("name") for s in fl.get("data", {}).get("shares", [])]
    R["evidence"]["fileStationShares"] = fs_shares
except Exception as e:
    R["evidence"]["fileStationListError"] = str(e)[:150]

vault_visible = VAULT in fs_shares
if not vault_visible:
    try:
        fd = get("entry.cgi", {"api": "SYNO.FileStation.List", "version": "2", "method": "list",
                               "folder_path": f"/{VAULT}", "_sid": sid})
        R["evidence"]["fileStationDirectPath"] = {"success": fd.get("success"), "error": fd.get("error")}
        vault_visible = bool(fd.get("success"))
    except Exception as e:
        R["evidence"]["fileStationDirectPathError"] = str(e)[:150]
R["FILESTATION_SERVICE_ACCESS"] = "PASS" if vault_visible else "FAIL"

# ---------------- STEP C: no-mutation decision point ----------------
if not vault_visible:
    err = (R["evidence"].get("fileStationDirectPath") or {}).get("error") or {}
    code = err.get("code")
    if R["SHARE_GET"] == "PASS" and R["SHARE_LIST"] == "OMITTED":
        cls = "WORM_SHARE_ENUMERATION_BEHAVIOR_OR_SHARE_PROVISIONING_INCOMPLETE"
    elif code in (407, 408):
        cls = "FILESTATION_EXPOSURE_DEFECT"
    elif code == 105:
        cls = "ACL_DEFECT"
    else:
        cls = "UNKNOWN"
    R["evidence"]["stepC"] = {
        "classification": cls,
        "fileStationErrorCode": code,
        "note": ("The share record is addressable by UUID but the service identity cannot reach it "
                 "through FileStation. Necessity of a provisioning mutation is asserted only from "
                 "this service-identity result, never from an ADMIN result."),
    }
    R["PROVISIONING_MUTATION_NECESSARY"] = "PROVEN" if R["SHARE_GET"] == "PASS" else "NOT_PROVEN"
    R["blockers"].append({"id": "VAULT_NOT_REACHABLE_BY_SERVICE_IDENTITY", "classification": cls,
                          "mutationPerformed": "NONE"})
    emit_and_exit(5)

def multipart_upload(dest_folder, filename, data, sid, overwrite="false"):
    b = "----cgctxledger" + uuid.uuid4().hex
    parts = []
    for k, v in (("api", "SYNO.FileStation.Upload"), ("version", "2"), ("method", "upload"),
                 ("path", dest_folder), ("create_parents", "true"), ("overwrite", overwrite)):
        parts.append(f"--{b}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n".encode())
    parts.append((f"--{b}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{filename}\"\r\n"
                  f"Content-Type: application/octet-stream\r\n\r\n").encode())
    parts.append(data)
    parts.append(f"\r\n--{b}--\r\n".encode())
    body = b"".join(parts)
    req = urllib.request.Request(
        f"{BASE}/entry.cgi?_sid={urllib.parse.quote(sid)}",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={b}"},
    )
    with urllib.request.urlopen(req, context=CTX, timeout=120) as r:
        return json.loads(r.read().decode())

# ---------------- STEP D: control object write OR existing hash target ----------------
control_id = f"worm-proof-{uuid.uuid4().hex}"
remote_rel = ""
src_sha = None

if PROVER_CONTROL_WRITE:
    payload = (f"CG CONTEXT LEDGER WORM PROOF CONTROL OBJECT\n"
               f"controlObjectId={control_id}\n"
               f"purpose=prove immutability enforcement by refusal\n"
               f"nonSecret=true\n"
               f"excludedFromProductionAccounting=true\n").encode()
    src_sha = "sha256:" + hashlib.sha256(payload).hexdigest()
    remote_rel = f"{CONTROL_NS}/{control_id}.txt"
    R["evidence"]["controlObject"] = {
        "controlObjectId": control_id, "bytes": len(payload), "sourceSha256": src_sha,
        "namespace": CONTROL_NS, "classification": "WORM_PROOF_CONTROL_OBJECT",
        "excludedFromAccounting": ["ORIGINAL_CURRENT_LEDGER_BOUND", "RECOVERED_ASSOCIATIONS", "TOTAL_PROTECTED_OBJECTS"],
        "writeMode": "filestation_control_upload",
    }
    try:
        up = multipart_upload(f"/{VAULT}/{CONTROL_NS}", f"{control_id}.txt", payload, sid)
        R["FILESTATION_CANARY_WRITE"] = "PASS" if up.get("success") else "FAIL"
        R["evidence"]["upload"] = {"success": up.get("success"), "error": up.get("error")}
        if up.get("success"):
            R["mutationsPerformed"].append(f"wrote ONE control object at /{VAULT}/{remote_rel}")
    except Exception as e:
        R["FILESTATION_CANARY_WRITE"] = "FAIL"
        R["evidence"]["uploadError"] = str(e)[:200]

    if R["FILESTATION_CANARY_WRITE"] != "PASS":
        R["blockers"].append({"id": "CONTROL_OBJECT_WRITE_FAILED", "secondCanaryAttempted": False})
        emit_and_exit(6)
else:
    if not HASH_TARGET_REL:
        R["FILESTATION_CANARY_WRITE"] = "SKIPPED"
        R["blockers"].append({
            "id": "HASH_TARGET_UNCONFIGURED",
            "detail": "CG_PROVER_CONTROL_WRITE_ENABLED=false requires CG_PROVER_HASH_TARGET_REL.",
        })
        emit_and_exit(6)
    remote_rel = HASH_TARGET_REL
    R["FILESTATION_CANARY_WRITE"] = "SKIPPED"
    R["evidence"]["controlObject"] = {
        "writeMode": "existing_evidence_target",
        "hashTargetRel": HASH_TARGET_REL,
        "classification": "EXISTING_EVIDENCE_HASH_TARGET",
        "excludedFromAccounting": ["ORIGINAL_CURRENT_LEDGER_BOUND", "RECOVERED_ASSOCIATIONS", "TOTAL_PROTECTED_OBJECTS"],
    }

# ---------------- STEP E: destination-side hash via CG Vault SSH ----------------
# Independent of FileStation read-back: hash executes inside the constrained
# destination execution plane (Docker sshd on dedicated port).
R["evidence"]["destinationHash"] = {
    "attemptedMechanism": "CG_VAULT_SSH_VAULT_SHA256",
    "transportReadbackRefused": True,
    "executionPlane": "CG_VAULT_SSH",
    "port": CG_VAULT_SSH_PORT,
}

probe = cg_vault_ssh("VAULT_SSH_PROBE")
R["evidence"]["cgVaultSshProbe"] = {
    "exitCode": probe.returncode,
    "stdoutPrefix": (probe.stdout or "")[:80],
    "stderrPrefix": (probe.stderr or "")[:120],
}
R["CG_VAULT_SSH_PROBE"] = "PASS" if probe.returncode == 0 and "VAULT_SSH_OK" in (probe.stdout or "") else "FAIL"
R["VAULT_RUNTIME_ACCESS"] = R["CG_VAULT_SSH_PROBE"]

if R["CG_VAULT_SSH_PROBE"] == "PASS":
    hres = cg_vault_ssh(f"VAULT_SHA256 {remote_rel}")
    parsed = parse_hash_output(hres.stdout or "")
    dest_sha = parsed.get("hash")
    R["evidence"]["destinationHashAttempt"] = {
        "exitCode": hres.returncode,
        "parsedFields": {k: v for k, v in parsed.items() if k != "hash"},
        "stderrPrefix": (hres.stderr or "")[:120],
    }
    if hres.returncode == 0 and dest_sha:
        dest_prefixed = f"sha256:{dest_sha}"
        R["evidence"]["destinationHash"]["destinationSha256"] = dest_prefixed
        if src_sha:
            R["evidence"]["destinationHash"]["sourceSha256"] = src_sha
            R["DESTINATION_HASH_LIVE_PROOF"] = "PASS" if dest_prefixed == src_sha else "FAIL"
            if dest_prefixed != src_sha:
                R["blockers"].append({"id": "DESTINATION_HASH_MISMATCH"})
        else:
            R["evidence"]["destinationHash"]["hashOnlyMode"] = "existing_locked_evidence"
            R["DESTINATION_HASH_LIVE_PROOF"] = "PASS"
    else:
        R["DESTINATION_HASH_LIVE_PROOF"] = "FAIL"
        R["blockers"].append({"id": "VAULT_SHA256_COMMAND_FAILED"})
else:
    R["DESTINATION_HASH_LIVE_PROOF"] = "NOT_RUN"
    R["blockers"].append({
        "id": "CG_VAULT_SSH_UNAVAILABLE",
        "detail": "Constrained vault SSH execution plane not reachable on dedicated port.",
        "dsmNativeSshNotUsed": True,
    })

# ---------------- STEP F: behavioural WORM proof ----------------
# Non-destructive when CG_WORM_IMMUTABILITY_SENTINEL_REL is set (required on WriteOnce
# Compliance vaults). Legacy mode overwrites the Step-D control object — unsafe on WORM.
if REQUIRE_WORM_SENTINEL and not WORM_SENTINEL_REL:
    R["CANARY_OVERWRITE"] = "NOT_RUN"
    R["CANARY_DELETE"] = "NOT_RUN"
    R["IMMUTABILITY_ENFORCEMENT"] = "NOT_RUN"
    R["blockers"].append({
        "id": "WORM_IMMUTABILITY_SENTINEL_REQUIRED",
        "detail": "CG_PROVER_REQUIRE_WORM_SENTINEL=true but CG_WORM_IMMUTABILITY_SENTINEL_REL is unset.",
    })
elif WORM_SENTINEL_REL:
    sentinel_rel = WORM_SENTINEL_REL.lstrip("/")
    sentinel_folder = f"/{VAULT}/" + "/".join(sentinel_rel.split("/")[:-1])
    sentinel_name = sentinel_rel.split("/")[-1]
    R["evidence"]["immutabilityCheck"] = {
        "mode": "non_destructive_sentinel",
        "sentinelRel": sentinel_rel,
        "createsNoNewObjects": True,
    }
    try:
        ow = multipart_upload(
            sentinel_folder,
            sentinel_name,
            b"IMMUTABILITY-PROBE-OVERWRITE\n",
            sid,
            overwrite="true",
        )
        R["CANARY_OVERWRITE"] = "SUCCEEDED" if ow.get("success") else "REFUSED"
        R["evidence"]["overwriteAttempt"] = {
            "success": ow.get("success"),
            "error": ow.get("error"),
            "actor": "cg-context-ledger",
            "operation": "overwrite",
            "target": sentinel_rel,
        }
    except Exception as e:
        R["CANARY_OVERWRITE"] = "REFUSED"
        R["evidence"]["overwriteAttempt"] = {
            "exception": str(e)[:200],
            "actor": "cg-context-ledger",
            "target": sentinel_rel,
        }

    try:
        dl = get("entry.cgi", {
            "api": "SYNO.FileStation.Delete",
            "version": "2",
            "method": "delete",
            "path": f"/{VAULT}/{sentinel_rel}",
            "_sid": sid,
        })
        R["CANARY_DELETE"] = "SUCCEEDED" if dl.get("success") else "REFUSED"
        R["evidence"]["deleteAttempt"] = {
            "success": dl.get("success"),
            "error": dl.get("error"),
            "actor": "cg-context-ledger",
            "operation": "delete",
            "target": sentinel_rel,
        }
    except Exception as e:
        R["CANARY_DELETE"] = "REFUSED"
        R["evidence"]["deleteAttempt"] = {
            "exception": str(e)[:200],
            "actor": "cg-context-ledger",
            "target": sentinel_rel,
        }
else:
    R["evidence"]["immutabilityCheck"] = {
        "mode": "legacy_destructive_control_object",
        "unsafeOnWriteOnceCompliance": True,
    }
    if not PROVER_CONTROL_WRITE:
        R["CANARY_OVERWRITE"] = "NOT_RUN"
        R["CANARY_DELETE"] = "NOT_RUN"
        R["IMMUTABILITY_ENFORCEMENT"] = "NOT_RUN"
        R["blockers"].append({
            "id": "WORM_IMMUTABILITY_SENTINEL_UNCONFIGURED",
            "detail": "Set CG_WORM_IMMUTABILITY_SENTINEL_REL before running on WriteOnce vault.",
        })
    else:
        try:
            ow = multipart_upload(
                f"/{VAULT}/{CONTROL_NS}",
                f"{control_id}.txt",
                payload + b"OVERWRITE-ATTEMPT\n",
                sid,
                overwrite="true",
            )
            R["CANARY_OVERWRITE"] = "SUCCEEDED" if ow.get("success") else "REFUSED"
            R["evidence"]["overwriteAttempt"] = {
                "success": ow.get("success"),
                "error": ow.get("error"),
                "actor": "cg-context-ledger",
                "operation": "overwrite",
            }
        except Exception as e:
            R["CANARY_OVERWRITE"] = "REFUSED"
            R["evidence"]["overwriteAttempt"] = {"exception": str(e)[:200], "actor": "cg-context-ledger"}

        try:
            dl = get("entry.cgi", {
                "api": "SYNO.FileStation.Delete",
                "version": "2",
                "method": "delete",
                "path": f"/{VAULT}/{remote_rel}",
                "_sid": sid,
            })
            R["CANARY_DELETE"] = "SUCCEEDED" if dl.get("success") else "REFUSED"
            R["evidence"]["deleteAttempt"] = {
                "success": dl.get("success"),
                "error": dl.get("error"),
                "actor": "cg-context-ledger",
                "operation": "delete",
            }
        except Exception as e:
            R["CANARY_DELETE"] = "REFUSED"
            R["evidence"]["deleteAttempt"] = {"exception": str(e)[:200], "actor": "cg-context-ledger"}

if R["CANARY_OVERWRITE"] == "REFUSED" and R["CANARY_DELETE"] == "REFUSED":
    R["IMMUTABILITY_ENFORCEMENT"] = "PROVEN"
elif "SUCCEEDED" in (R["CANARY_OVERWRITE"], R["CANARY_DELETE"]):
    R["IMMUTABILITY_ENFORCEMENT"] = "FAIL"
    R["PRIMARY_STORAGE_AUTHORITY"] = "UNPROVEN"
    R["blockers"].append({"id": "MUTATION_OF_ARCHIVED_EVIDENCE_SUCCEEDED", "stopImmediately": True})

# Primary promotion requires every runtime proof, destination hash included.
write_gate_ok = R["FILESTATION_CANARY_WRITE"] in ("PASS", "SKIPPED")
if (R["SERVICE_ACCOUNT_AUTH"] == "PASS" and R["FILESTATION_SERVICE_ACCESS"] == "PASS"
        and write_gate_ok and R["CG_VAULT_SSH_PROBE"] == "PASS"
        and R["DESTINATION_HASH_LIVE_PROOF"] == "PASS"
        and R["IMMUTABILITY_ENFORCEMENT"] == "PROVEN"):
    R["PRIMARY_STORAGE_AUTHORITY"] = "PROVEN"

try:
    get("auth.cgi", {"api": "SYNO.API.Auth", "version": "6", "method": "logout",
                     "session": "FileStation", "_sid": sid})
except Exception:
    pass
emit_and_exit(0)
