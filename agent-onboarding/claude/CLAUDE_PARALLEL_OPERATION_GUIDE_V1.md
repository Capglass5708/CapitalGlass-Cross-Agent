# Claude — Parallel Operation Guide v1

**Work package:** `claude-full-estate-platform-integration-v1`  
**Audience:** Claude running **at the same time** as Cursor (and optionally ChatGPT)  
**Principle:** One platform, multiple client surfaces — **not** multiple truths

---

## 1. What “parallel” means here

Wesley may have **Cursor open on a implementation lane** and **Claude open on a planning, investigation, or review lane** at the same time.

That is **supported** when you follow **lane discipline**:

| OK in parallel | Not OK in parallel |
| --- | --- |
| Claude investigates while Cursor implements **different** work package | Two agents mutating **same repo / same branch** without coordination |
| Claude updates Cross-Agent ledger while Cursor codes in owner repo | Both agents running **material closeout** on same WP |
| Claude reviews Cursor diff / plan | Both pushing to **same feature branch** |
| Claude runs read-only MCP / scout / Luna | Both invoking **WaveRunner execute** on same milestone lock |
| ChatGPT distills paste into ledger | Duplicate contradictory ledger entries |

**Default split (recommended):**

| Surface | Primary lane |
| --- | --- |
| **Cursor** | Implementation, MCP-heavy execution, gates, tests, commits in **owner repo** |
| **Claude** | Investigation, architecture, plan review, ledger updates, operator Q&A, cross-repo coordination |
| **ChatGPT** | Plans/reviews when asked; harvest distillation from pasted output |

Wesley may override — but **one active writer per repo branch** unless a mission explicitly defines parallel lanes.

---

## 2. Shared coordination bus (all agents)

Every parallel agent reads and writes the **same** coordination surfaces:

| Bus | Location | Purpose |
| --- | --- | --- |
| **Live ledger** | `CapitalGlass-Cross-Agent/work-progress/ACTIVE_WORK.md` | What is active right now |
| **Handoff** | `handoffs/CURRENT_HANDOFF.md` | Reconciled snapshot |
| **Project files** | `work-progress/projects/<id>.md` | Per–work-package truth |
| **Hub compact** | L: `00-master-index/BY-KIND/*.json` | Blockers, open actions, MCP catalog |
| **Git** | GitHub `main` + feature branches | Code truth |
| **Hop packet** | AppBuilder `dual-machine:write-hop-packet` + Z: mirror | Cross-desk SHA epoch |
| **Direct Connect handoffs** | `Z:\Office\Wes\Direct Connect\handoffs` | Cross-desk missions |

**Rule:** If Cursor changed status, Claude must **read the ledger** — not assume the chat you’re in is current.

---

## 3. Identity — distinguish Claude from Cursor

Every Claude-originated artifact should be identifiable:

```json
{
  "clientSurface": "CLAUDE",
  "operator": "wesley@capitalglasstx.com",
  "workPackageId": "<id>",
  "missionClass": "investigate",
  "parallelWith": ["CURSOR"],
  "ownerRepo": "CG-AppBuilder-MCP"
}
```

| Field | Values |
| --- | --- |
| `clientSurface` | `CLAUDE` \| `CURSOR` \| `CHATGPT` \| `HUMAN` |
| `parallelWith` | Other active surfaces this session knows about |

When updating **`ACTIVE_WORK.md`**, set **Source: Claude** in the entry.

When Cursor is simultaneously working the **same** work package, add a line:

```text
Parallel lane: Cursor = implementation; Claude = investigation/review
```

---

## 4. Lane lease discipline (avoid dual-writer)

Before Claude advises **commits, pushes, or file edits** in a repo:

| Check | Action |
| --- | --- |
| Is Cursor actively implementing same WP? | Ask Wesley which surface **owns the write lane** |
| Is WaveRunner milestone **locked**? | Do not advise conflicting branch work |
| Is repo dirty with uncommitted Cursor work? | **Do not** advise reset/clean — preserve current-or-newer code |
| Cross-desk mission on RYZEN9? | Check Direct Connect handoff + GHA dispatch — not ad-hoc SSH |

**Lane lease pattern** (from dual-machine desk sync):

- **Git** = code bus (GitHub `main`)
- **Hop packet** = fast SHA epoch check
- **Lane leases** = prevent dual-writer on same branch

If unsure: **read-only** until Wesley confirms write lane.

---

## 5. Parallel session workflow

### When Wesley starts Claude mid-flight

1. Ask: **work package id**, **owner repo**, **is Cursor active on this WP?**
2. Read `ACTIVE_WORK.md` + project file + `CURRENT_HANDOFF.md`
3. Run scout + Luna (CLI from WSL if no MCP)
4. State your lane: *“Claude = investigate/plan; Cursor owns implementation unless you say otherwise.”*

### When Claude finishes a parallel turn

If material to the estate:

1. Draft ledger entry (status, blockers, next action, **Source: Claude**)
2. Tell Wesley to commit Cross-Agent or paste entry for Cursor to land
3. Do **not** claim PASS/PROVEN unless verifier receipts exist

### When Cursor and Claude disagree

**Git + ledger + receipts win** over either chat. Ask for refresh — do not argue from memory.

---

## 6. MCP in parallel

| Scenario | Guidance |
| --- | --- |
| Cursor has MCP connected; Claude Project does not | Claude uses **WSL CLI equivalents** from Protocol Guide, or Wesley enables MCP in Claude Code using same inventory |
| Both could call same MCP | Prefer **read-only** MCP from Claude; **mutating** deploy/GitHub ops stay with Cursor unless Wesley assigns Claude |
| Doppler / secrets | **Neither** surface pastes values — names only |
| Office Admin | Both call preflight; **neither** executes scripts via MCP |

MCP inventory: `Z:\Capital-Glass-Dev\Cursor-MCP-Kit\mcp-inventory.json`

---

## 7. Protocol parallelism

| Protocol | Parallel rule |
| --- | --- |
| **Auto v3.2 closeout** | **One closeout per work package per material wave** — coordinate who runs `auto:v3:session-closeout` |
| **WaveRunner** | One milestone lock — do not double-orchestrate |
| **Hub publish** | Serialize ingest after ledger edits — run once after both agents’ notes are merged |
| **Harvest** | ChatGPT/Cursor produce; Cross-Agent owns harvest records — Claude may distill, not duplicate harvest |
| **3-way composer** | Cursor subagents execute roles; Claude may **critique** textually, not replace Verifier PASS |

---

## 8. Recommended operator setup (parallel-ready)

| # | Setup |
| --- | --- |
| 1 | Claude Project with **all required uploads** (see `CLAUDE_SETUP_CHECKLIST.md`) |
| 2 | Custom instructions pasted from `CLAUDE_CUSTOM_INSTRUCTIONS.txt` |
| 3 | Cursor on WSL Suite workspace — same `~/repos` |
| 4 | Cross-Agent git pull at session start on both surfaces |
| 5 | Declare work package at start of **each** chat turn when material |
| 6 | Optional: Claude Code with MCP wired from Cursor-MCP-Kit for live tool parity |

---

## 9. Test prompt (parallel awareness)

```text
Wesley is also running Cursor on work package <id>. Confirm your lane (Claude vs Cursor),
list the MCPs you would use for investigate-only work, the protocols you would run first
in WSL bash, and what you would NOT do in parallel to avoid dual-writer conflict.
```

Correct answer: names **clientSurface=CLAUDE**, read-only or coordination lane unless write assigned, cites scout/Luna/auto-v32 order, refuses simultaneous commit to same branch.

---

## 10. Agent Fast Path

- **Parallel OK** with lane discipline — not with dual-writer
- **Shared ledger** — read before advise; write with Source: Claude
- **Cursor** usually owns implementation MCP + commits
- **Claude** owns investigate/plan/review/ledger unless Wesley swaps lanes
- **clientSurface=CLAUDE** on every receipt you originate
- **Same protocols** as Cursor — see `CLAUDE_MCP_AND_PROTOCOL_GUIDE_V1.md`
