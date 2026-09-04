#!/usr/bin/env bash
# Read-only live Git object sweep for the unpublished Cross-Agent authority commit 78365d5.
#
# WHY THIS EXISTS
#   CG-AppBuilder-MCP/scripts/agent-runtime/lib/contract-provenance.mjs pins the agent-runtime
#   authority to Cross-Agent commit 78365d5 with contractState LOCAL_COMMITTED_NOT_PUBLISHED.
#   The object is on no remote and was proven absent from CG-NIMO-01. It was authored on some
#   other host and has never left it.
#
# WHAT THIS DOES
#   Finds every Cross-Agent working tree on this host, reduces them to their DISTINCT object
#   stores, and searches each store exactly once: exact object, all refs, reflogs, stashes,
#   unreachable objects, and local bundles. Only that deduplication makes "this host is
#   exhausted" a defensible claim rather than a statement about visible worktrees.
#
# SAFETY
#   Read-only by default. It never writes to a searched repository, never fetches, never
#   pushes. On a hit it prints the exact publish commands rather than running them, because
#   publishing is a mutation the operator confirms.
#
# USAGE
#   ./recover-78365d5-live-sweep.sh                          # expects machineRole wesley_work
#   ./recover-78365d5-live-sweep.sh --expect-machine ryzen9desk
#   ./recover-78365d5-live-sweep.sh --expect-machine cg_nimo_01 --receipt out.json
#
# The machine guard is deliberate: a sweep that silently runs on the wrong host produces
# evidence attributed to a machine that was never searched.
set -uo pipefail

TARGET_SHORT="78365d5"
EXPECT_MACHINE="wesley_work"
RECEIPT=""
APPBUILDER_ROOT="${CG_APPBUILDER_ROOT:-$HOME/repos/CG-AppBuilder-MCP}"
# Estate convention puts target repos on WSL ext4 under $HOME/repos (or CG_REPOS_ROOT), so
# that is the default search root. /mnt/c is a DrvFs mount and a depth-7 scan of it costs
# minutes for a location clones are not supposed to occupy — pass it explicitly with --roots
# if a clone is genuinely suspected there.
SEARCH_ROOTS="$HOME"
[ -n "${CG_REPOS_ROOT:-}" ] && SEARCH_ROOTS="$SEARCH_ROOTS $CG_REPOS_ROOT"
# Bundle roots include the SMB-mounted recovery tiers, which are slow enough that an
# unbounded scan can look like a hang. Bounded, and its completeness is REPORTED — a
# truncated scan must never be recorded as an exhaustive one.
BUNDLE_ROOTS="${CG_BUNDLE_ROOTS:-$HOME /mnt/l /mnt/z}"
BUNDLE_TIMEOUT="${CG_BUNDLE_TIMEOUT:-180}"

while [ $# -gt 0 ]; do
  case "$1" in
    --expect-machine) EXPECT_MACHINE="$2"; shift 2 ;;
    --receipt)        RECEIPT="$2"; shift 2 ;;
    --target)         TARGET_SHORT="$2"; shift 2 ;;
    --roots)          SEARCH_ROOTS="$2"; shift 2 ;;
    --bundle-roots)   BUNDLE_ROOTS="$2"; shift 2 ;;
    --skip-bundles)   BUNDLE_ROOTS=""; shift ;;
    -h|--help)        sed -n '2,30p' "$0"; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

# ---------------------------------------------------------------- machine identity guard
# Primary: the consuming implementation's own resolver (peer-live-proof backed). It lives on
# the agent-runtime branch, so it is not present in every checkout.
RESOLVER="$APPBUILDER_ROOT/scripts/agent-runtime/lib/resolve-local-machine.mjs"
ACTUAL_ROLE=""
RESOLUTION_METHOD="NONE"
if [ -f "$RESOLVER" ]; then
  ACTUAL_ROLE="$(node -e '
    import(process.argv[1]).then(m => {
      const r = m.resolveLocalMachineRole();
      process.stdout.write(String(r.machineRole ?? ""));
    }).catch(() => process.stdout.write(""));
  ' "$RESOLVER" 2>/dev/null || true)"
  [ -n "$ACTUAL_ROLE" ] && RESOLUTION_METHOD="PEER_LIVE_PROOF_RESOLVER"
fi

# Fallback: the declared machine registry. This matches this host's name against each
# record's OWN declared windowsComputerNames — a declared mapping, not hostname inference,
# and it never borrows another machine's record as a default.
if [ -z "$ACTUAL_ROLE" ]; then
  MACHINES_DIR="$APPBUILDER_ROOT/scripts/wsl/machines"
  if [ -d "$MACHINES_DIR" ]; then
    ACTUAL_ROLE="$(node -e '
      const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
      const dir = process.argv[1];
      const host = os.hostname().toLowerCase();
      for (const f of fs.readdirSync(dir).filter(x => x.endsWith(".machine.json"))) {
        const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
        const names = (d.windowsComputerNames ?? []).map(n => String(n).toLowerCase());
        if (names.includes(host)) { process.stdout.write(String(d.machineRole ?? "")); break; }
      }
    ' "$MACHINES_DIR" 2>/dev/null || true)"
    [ -n "$ACTUAL_ROLE" ] && RESOLUTION_METHOD="DECLARED_MACHINE_REGISTRY"
  fi
fi

echo "=== machine identity ==="
echo "  resolver     : $RESOLVER"
echo "  method       : $RESOLUTION_METHOD"
echo "  machineRole  : ${ACTUAL_ROLE:-UNRESOLVED}"
echo "  expected     : $EXPECT_MACHINE"
echo "  searchRoots  : $SEARCH_ROOTS"
echo "  hostname     : $(hostname)"

if [ -z "$ACTUAL_ROLE" ]; then
  echo "REFUSING: machine identity could not be resolved. A sweep whose host is unknown" >&2
  echo "produces evidence that cannot be attributed. Run where the resolver is available." >&2
  exit 3
fi
if [ "$ACTUAL_ROLE" != "$EXPECT_MACHINE" ]; then
  echo "REFUSING: this host resolves as '$ACTUAL_ROLE', not '$EXPECT_MACHINE'." >&2
  echo "Pass --expect-machine $ACTUAL_ROLE if you intend to sweep this host." >&2
  exit 3
fi

# ------------------------------------------------- discover distinct Cross-Agent stores
# A worktree's .git is a FILE, not a directory, so test for either and let git arbitrate.
echo
echo "=== discovering Cross-Agent working trees ==="
WORKTREES=()
while IFS= read -r marker; do
  R="$(dirname "$marker")"
  git -C "$R" rev-parse --is-inside-work-tree >/dev/null 2>&1 || continue
  ORIGIN="$(git -C "$R" remote get-url origin 2>/dev/null || true)"
  case "$ORIGIN" in
    *CapitalGlass-Cross-Agent*) ;;
    *) continue ;;
  esac
  WORKTREES+=("$R")
  echo "  $R"
done < <(find $SEARCH_ROOTS -maxdepth 7 \( -name node_modules -o -name .cache -o -name .npm \) -prune \
           -o \( -type d -o -type f \) -name ".git" -print 2>/dev/null)

if [ "${#WORKTREES[@]}" -eq 0 ]; then
  echo "  (none found)"
fi

# Reduce to DISTINCT object stores. Several worktrees usually share one store; searching a
# store once per worktree would inflate the appearance of coverage without adding any.
echo
echo "=== distinct object stores ==="
declare -A STORE_REPRESENTATIVE=()
for R in "${WORKTREES[@]}"; do
  COMMON="$(git -C "$R" rev-parse --path-format=absolute --git-common-dir 2>/dev/null || true)"
  [ -n "$COMMON" ] || continue
  if [ -z "${STORE_REPRESENTATIVE[$COMMON]+set}" ]; then
    STORE_REPRESENTATIVE["$COMMON"]="$R"
    echo "  $COMMON"
  fi
done
echo "  worktrees=${#WORKTREES[@]} distinctStores=${#STORE_REPRESENTATIVE[@]}"

# ------------------------------------------------------------------------ the sweep
FOUND_FULL=""
FOUND_STORE=""
STORE_RESULTS=""

for COMMON in "${!STORE_REPRESENTATIVE[@]}"; do
  R="${STORE_REPRESENTATIVE[$COMMON]}"
  echo
  echo "=== STORE: $COMMON"
  echo "    via worktree: $R"

  TYPE="$(git -C "$R" cat-file -t "$TARGET_SHORT" 2>/dev/null || true)"
  if [ "$TYPE" = "commit" ]; then
    FOUND_FULL="$(git -C "$R" rev-parse "${TARGET_SHORT}^{commit}")"
    FOUND_STORE="$COMMON"
    echo "    FOUND_${TARGET_SHORT}=$FOUND_FULL"
    break
  fi
  echo "    exact object          : absent"

  AUTH_COMMITS="$(git -C "$R" log --all --oneline -- registry/agent-runtime/ 2>/dev/null | head -20)"
  echo "    refs touching authority: ${AUTH_COMMITS:-none}"

  REFLOG_HITS="$(git -C "$R" reflog --all 2>/dev/null | grep -iE "${TARGET_SHORT}|agent-runtime" | head -20 || true)"
  echo "    reflog hits            : ${REFLOG_HITS:-none}"

  STASHES="$(git -C "$R" stash list 2>/dev/null || true)"
  echo "    stashes                : ${STASHES:-none}"

  # Unreachable objects are the whole point: a commit can be absent from every ref and still
  # live in the store until gc prunes it.
  UNREACHABLE="$(git -C "$R" fsck --full --unreachable --no-reflogs 2>/dev/null \
    | grep -E 'unreachable commit|dangling commit' | awk '{print $3}' | head -200 || true)"
  UNREACHABLE_COUNT="$(printf '%s' "$UNREACHABLE" | grep -c . || true)"
  echo "    unreachable commits    : ${UNREACHABLE_COUNT:-0}"

  CARRIERS=""
  if [ -n "$UNREACHABLE" ]; then
    while IFS= read -r c; do
      [ -n "$c" ] || continue
      if [ -n "$(git -C "$R" ls-tree -r --name-only "$c" -- registry/agent-runtime/ 2>/dev/null)" ]; then
        CARRIERS="$CARRIERS $c"
      fi
    done <<< "$UNREACHABLE"
  fi
  echo "    unreachable carrying authority tree:${CARRIERS:- none}"

  STORE_RESULTS="$STORE_RESULTS{\"store\":\"$COMMON\",\"exactObject\":\"absent\",\"unreachableCommits\":${UNREACHABLE_COUNT:-0},\"authorityCarriers\":\"${CARRIERS:-none}\"},"
done

# ------------------------------------------------------------------- local bundle sweep
echo
echo "=== local bundles mentioning Cross-Agent (roots: ${BUNDLE_ROOTS:-none}) ==="
BUNDLE_SCAN_STATUS="COMPLETED"
[ -z "$BUNDLE_ROOTS" ] && BUNDLE_SCAN_STATUS="SKIPPED"
BUNDLES=""
[ -n "$BUNDLE_ROOTS" ] && BUNDLES="$(timeout "$BUNDLE_TIMEOUT" find $BUNDLE_ROOTS -maxdepth 6 -iname "*.bundle" 2>/dev/null | grep -i "cross-agent" | head -20 || true)"
if [ $? -eq 124 ]; then BUNDLE_SCAN_STATUS="TIMED_OUT_INCOMPLETE"; fi
if [ -z "$BUNDLES" ]; then
  echo "  (none found)"
else
  while IFS= read -r b; do
    [ -n "$b" ] || continue
    echo "  --- $b ($(date -r "$b" +%Y-%m-%d 2>/dev/null || echo unknown))"
    git bundle verify "$b" 2>&1 | tail -2 | sed 's/^/      /'
  done <<< "$BUNDLES"
fi

# ------------------------------------------------------------------------- verdict
echo
if [ -n "$FOUND_FULL" ]; then
  cat <<EOF
=== FOUND — STOP SEARCHING THIS HOST ===
  full SHA : $FOUND_FULL
  store    : $FOUND_STORE
  worktree : ${STORE_REPRESENTATIVE[$FOUND_STORE]}

Verify before publishing:
  git -C "${STORE_REPRESENTATIVE[$FOUND_STORE]}" show --stat --oneline $FOUND_FULL
  git -C "${STORE_REPRESENTATIVE[$FOUND_STORE]}" ls-tree -r --name-only $FOUND_FULL -- registry/agent-runtime/
  git -C "${STORE_REPRESENTATIVE[$FOUND_STORE]}" log --oneline $FOUND_FULL~3..$FOUND_FULL   # expect e545ab3 / 22ad7a3 / fa18bcc lineage

Then publish the EXACT object — no cherry-pick, no amend, no squash:
  git -C "${STORE_REPRESENTATIVE[$FOUND_STORE]}" branch recovery/agent-runtime-authority-78365d5 $FOUND_FULL
  git -C "${STORE_REPRESENTATIVE[$FOUND_STORE]}" push origin recovery/agent-runtime-authority-78365d5

Afterwards repin provenance to the full 40-character SHA, retaining 78365d5 as the
historical short identifier.
EOF
  VERDICT="FOUND"
else
  echo "=== NOT FOUND ON THIS HOST ==="
  echo "  Every distinct object store above was searched exactly once."
  echo "  This exhausts $ACTUAL_ROLE. It does NOT exhaust the estate."
  echo "  AUTHORITY_OBJECT_UNRECOVERABLE must NOT be declared on this result alone."
  VERDICT="EXHAUSTED_NEGATIVE"
fi

if [ -n "$RECEIPT" ]; then
  cat > "$RECEIPT" <<EOF
{
  "schemaVersion": "agent-runtime-authority-recovery-v1@1.0.0",
  "operation": "RECOVER_AGENT_RUNTIME_AUTHORITY_78365D5",
  "targetShortSha": "$TARGET_SHORT",
  "machineRole": "$ACTUAL_ROLE",
  "resolutionMethod": "$RESOLUTION_METHOD",
  "hostname": "$(hostname)",
  "recordedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "worktreesFound": ${#WORKTREES[@]},
  "distinctObjectStores": ${#STORE_REPRESENTATIVE[@]},
  "stores": [${STORE_RESULTS%,}],
  "foundFullSha": $( [ -n "$FOUND_FULL" ] && echo "\"$FOUND_FULL\"" || echo null ),
  "bundleScanStatus": "${BUNDLE_SCAN_STATUS:-SKIPPED}",
  "verdict": "$VERDICT",
  "readOnly": true,
  "secretValuesRead": false
}
EOF
  echo
  echo "receipt written: $RECEIPT"
fi

[ -n "$FOUND_FULL" ] && exit 42
exit 0
