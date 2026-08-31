# SHARED_CHECKOUT_GIT_STATE_UNPROTECTED — governance defect

| Field | Value |
| --- | --- |
| Finding ID | `SHARED_CHECKOUT_GIT_STATE_UNPROTECTED` |
| Work package | `shared-checkout-git-state-unprotected-v1` |
| Status | **OPEN — recorded, not remediated** |
| Severity | **BLOCKING for concurrent-agent mutation** |
| Class | Governance / concurrency defect. **Not operator error.** |
| Discovered | 2026-08-30, during `context-ledger-phase-0-appbuilder-v1` |
| Affected | Any repository checkout shared by more than one live agent session |

---

## Statement

The checkout mutation lease arbitrates **file edits only**. A shared checkout has **three**
shared mutable resources, and the other two are unprotected:

| Resource | What it is | Protected today? |
| --- | --- | --- |
| Working tree | The files on disk | Partially — only via `Edit`/`Write`/`NotebookEdit` tool calls |
| Git index | Staging state | **No** |
| `HEAD` / refs / branch topology | Which branch every process in the checkout operates against | **No** |

Protecting only file edits is insufficient. A single `git checkout` changes every other
agent's filesystem underneath it. A `git commit` advances whichever branch another session
happened to select. A `git add` can alter another agent's pending commit through the shared
index.

**Proposed invariant:**

> No process may mutate the working tree, Git index, `HEAD`, or repository refs of a shared
> checkout without checkout-mutation authority.

---

## Evidence (this incident)

| Fact | Detail |
| --- | --- |
| Shared checkout | `/home/wesle/repos/CG-AppBuilder-MCP` |
| Concurrent sessions | **5** live `anthropic.claude-code` processes, started 19:06–19:19 |
| Triggering action | This agent ran `git checkout -b work/context-ledger-phase-0-appbuilder-v1` at **20:12** |
| Lease state at the time | `ABSENT` — the prior holder had exited, so nothing was violated by the lease's own rules |
| Result | Three unrelated commits from another session landed on the new branch |
| Foreign commits | `7ff5ecfe` (20:15), `b6c3022f` (20:16), `cc6b267f` (20:28) |
| Their content | One file only — `contracts/proposal-generator/PG_TERMINAL_ACCEPTANCE_CONTRACT_V1.json` |
| Overlap with mission files | **None.** Fully disjoint from the 16 files in this mission's commits |
| Source corruption | **None.** No work lost, nothing overwritten |
| Actual violation | **Branch ownership** — commits landed on a branch belonging to a different mission |

The lease intercepted **neither** the branch switch **nor** the subsequent commits, because
both ran through Bash rather than a gated tool call. The lease behaved exactly as designed;
the design does not cover this.

Note the ordering: the lease was `ABSENT` when the branch was switched. Even a perfectly
enforced lease would not have prevented this, because no lease was held. Arbitration alone is
not the answer — see below.

---

## Why a Bash command filter is the wrong fix

The obvious remedy is to gate the mutating porcelain:

```
git checkout · git switch · git add · git commit · git reset · git restore · git clean
git stash · git merge · git rebase · git cherry-pick · git revert
branch create / delete / rename / force
```

That list is necessary to understand the blast radius, but it is a poor enforcement
mechanism:

- It requires perfectly parsing arbitrary shell forever — aliases, `sh -c`, `env`, absolute
  paths, `git -C`, plumbing (`update-ref`, `symbolic-ref`, `read-tree`), and anything that
  shells out.
- It fails open on every form it fails to recognise.
- It cannot protect against a session that holds no lease at all, which is exactly what
  happened here.

---

## Recommended fix — isolation, with the lease as defence in depth

> **Canonical repo checkout = coordination / read-mostly surface.
> Every mutating agent mission = dedicated worktree.**

A mission acquiring admission is assigned its own worktree, branch, `HEAD`, index and working
tree:

```
/home/wesle/worktrees/CG-AppBuilder-MCP/<mission-id>/
```

Five agents then work simultaneously and no `git switch` moves the floor under the other
four. The lease stops being the only thing preventing five sessions from sharing one index
and `HEAD`, and becomes defence in depth.

**This is not new machinery.** The estate already uses exactly this layout and naming:

```
/home/wesle/worktrees/CG-AppBuilder-MCP/phase1-native-experience-v1        [work/phase1-native-experience-v1]
/home/wesle/worktrees/CG-AppBuilder-MCP/protocol-40-parallel-v1            [work/protocol-40-parallel-v1]
/home/wesle/worktrees/CG-AppBuilder-MCP/wsl-first-control-plane-phase0-v1  [work/phase0-remediation-v1]
```

The convention exists and is followed sometimes. The defect is that it is **not enforced**,
so five sessions still shared the canonical checkout. The remediation is to make an existing
pattern mandatory at the front door, not to invent one.

---

## Acceptance — adversarial proof required

A command allowlist alone must not be accepted as closure. Required behaviour:

1. Agent A owns and mutates mission A in its own worktree.
2. Agent B attempts a branch switch in A's checkout → **DENIED**.
3. Agent B attempts `git add` / `git commit` in A's checkout → **DENIED**.
4. Agent B is assigned, or creates, its own worktree → **ALLOWED**.
5. Both agents commit concurrently in separate worktrees → both succeed.
6. Neither agent's `HEAD`, index, or working tree is affected by the other.
7. Crash / stale-session recovery still works — a dead session's worktree and lease are
   recoverable without cooperation from the holder.

---

## Immediate containment (decided 2026-08-30)

- The shared checkout is **frozen as-is**. Do not switch, reset, rebase, clean, or rewrite
  the pushed branch while sessions are live.
- `work/context-ledger-phase-0-appbuilder-v1` is treated as a **contaminated preservation
  branch**. Both sets of commits remain reachable and pushed; nobody's work is rewritten.
- Recovery happens later, out of place: a new dedicated worktree, a clean branch from the
  pre-incident base, and cherry-pick of only the Context Ledger commits (`a3cb67b1`,
  `32a3459c`, `d88c4b95`).
- The three Proposal Generator commits stay permanently reachable on the contaminated branch.
- Shared-checkout branch state is reconciled deliberately only once all sessions using it are
  dead or quiescent.

**Rationale for not switching back:** changing a working tree under an in-flight edit is
worse than a recoverable branch mixup.

---

## Related

- Lease implementation: `CG-AppBuilder-MCP/scripts/wsl/lib/checkout-mutation-lease-v1.mjs`
- Hooks: `scripts/claude-40/hooks/session-admission-gate-v1.mjs` (`PreToolUse`),
  `checkout-lease-release-on-stop-v1.mjs` (`Stop`)
- Hook import-safety fix and challenge protocol: `a3cb67b1`
- Parent mission: `work-progress/projects/2026-08-30_context-ledger-phase-0-authority-resolution-v1.md`
