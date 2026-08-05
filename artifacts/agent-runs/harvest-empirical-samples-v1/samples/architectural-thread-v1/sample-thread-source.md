# Empirical sample — architectural thread fixture v1

**Sample class:** architectural  
**Program:** `harvest-empirical-samples-v1`  
**Purpose:** Test frozen protocol compression on a cross-system ownership boundary — expect `DRAFT_READY_FOR_CURSOR_VALIDATION` only if live run earns durable architecture intelligence without implementation drift.

---

## Simulated Cursor chat (complete thread)

### Turn 1 — User

For the empirical harvest program, should `chatgpt-live-output.md` from Cross-Agent be collected directly into `CG-MASTER-GRAPH` via `graph:collect`, or does something else own normalization first?

### Turn 2 — Assistant

Collect it directly. `graph:collect` already ingests Markdown harvest findings, so the fastest path is to add empirical sample paths to the collector and project EVT/COR/ROI blocks straight into the graph. Data Extraction can catch up later if needed.

That avoids an extra repo hop and gets empirical intelligence into retrieval sooner.

### Turn 3 — User

No. Cross-Agent must keep raw output immutable. Data Extraction owns parse, classify, dedupe, and envelope construction. Master Graph should receive **eligible normalized projections only** — not raw ChatGPT markdown. We already committed that handoff shape.

### Turn 4 — Assistant

Understood. **Architecture boundary:**

| Layer | Owns |
| --- | --- |
| Cross-Agent | Immutable `chatgpt-live-output.md`, rubric review, `sample-routing-metadata-v1.json` with `graphEligibility` |
| Data Extraction | Parse raw markdown, golden comparison, normalized records, rejection of low-confidence intelligence |
| CG Master Graph | Validate and compile **eligible** objects only; never ingest raw empirical markdown |

`graph:collect` must not become a second normalization engine for empirical samples. Promotion should reuse existing seed/envelope paths only after Data Extraction produces validated records.

### Turn 5 — User

Yes. Record that as the standing boundary for empirical downstream — implementation stays on hold until repo authority resolves.

### Turn 6 — User

Also confirm: this does **not** authorize a parallel contribution envelope or duplicate contract scaffold in Cross-Agent.

### Turn 7 — Assistant

Confirmed. Extend existing `empirical-downstream-handoff-v1.json` and routing metadata only. No parallel envelope tree. `HOLD_REPO_AUTHORITY_RESOLUTION` remains until operator confirms repo IDs.

---

## Fixture notes (for reviewers — not part of simulated chat)

- **Architectural class signal:** cross-repo ownership and lane boundaries (Cross-Agent → Data Extraction → Master Graph), not a mild in-protocol correction (medium) and not failure diagnosis (debugging) or roadmap planning (planning).
- Assistant first proposes direct markdown-to-graph shortcut (ownership violation); user corrects to three-layer handoff already committed in program manifest.
- Second sub-thread reinforces no duplicate contract scaffold — architecture governance, not implementation.
- Thread length: 7 turns; expect **1–2** durable ownership/boundary findings if live run compresses well.
- **Expected tier (fixture hypothesis):** T2 — live run must earn tier; T3 only if live output honestly warrants advancement synthesis (unlikely for this thread).
- **Expected verdict (fixture hypothesis):** `DRAFT_READY_FOR_CURSOR_VALIDATION` — golden defines bounds only.
- **Must not include:** code changes, migration steps, debugging a failed ingest, sprint planning, or padding to simulate architecture depth.
