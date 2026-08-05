# Empirical sample — planning thread fixture v1

**Sample class:** planning  
**Program:** `harvest-empirical-samples-v1`  
**Purpose:** Test whether frozen protocol captures **ordered sequencing and scope planning** for remaining empirical work — without drifting into implementation wiring, architecture redesign, or false unblock claims.

---

## Simulated Cursor chat (complete thread)

### Turn 1 — User

Four of five empirical samples are done. What is the correct **ordered sequence** to finish the program and when can we start Data Extraction / Master Graph wiring? Downstream is still `HOLD_REPO_AUTHORITY_RESOLUTION`.

### Turn 2 — Assistant

Start Data Extraction ingest immediately on completed samples and wire `graph:collect` adapters in parallel. The planning sample can run later — three eligible samples are enough to unblock downstream. Add a sprint roadmap with M1 parser, M2 projection, and M3 protocol expansion this week.

### Turn 3 — User

No. Downstream stays on HOLD until operator resolves repo authority. Finish the **planning sample** first, then run the five-sample review gate. Do not claim implementation is unblocked from three samples alone.

### Turn 4 — Assistant

**Corrected sequence:**

1. Author `planning-thread-v1` fixture + golden (scaffold only)  
2. Run planning live sample → preserve raw output → score → routing commit  
3. Complete five-sample empirical review across all classes  
4. Compare weakness patterns; document recurring signals only  
5. Protocol change gate: edit frozen protocol only if recurrence evidence exists across classes  
6. Downstream wiring: **after** operator resolves `HOLD_REPO_AUTHORITY_RESOLUTION` — not before

### Turn 5 — User

What should the planning harvest capture — not debugging heuristics, not architecture lanes?

### Turn 6 — Assistant

**Planning harvest (durable):** Ordered closeout sequence for the empirical program with explicit scope fences — which steps are in-program (samples, review, recurrence compare) vs withheld (Data Extraction ingest, Master Graph projection, protocol expansion). One reusable planning boundary: do not treat partial sample completion as authority to bypass HOLD or skip the fifth class.

### Turn 7 — User

Good. That is the planning lesson for this sample class.

---

## Fixture notes (for reviewers — not part of simulated chat)

- **Planning class signal:** sequencing, scope fences, dependency order — not localized debug failure or ownership architecture.
- Assistant first proposes premature downstream unblock (anti-pattern); user restates HOLD and fifth-sample requirement.
- **Not** EVT classification debugging, **not** three-layer ownership table (architectural), **not** mild verdict wording only (medium).
- Thread length: 7 turns; expect **1** durable planning sequence/boundary if live run compresses well.
- **Expected tier (fixture hypothesis):** T2 — live run must earn `observedTier`.
- **Expected verdict (fixture hypothesis):** `DRAFT_READY_FOR_CURSOR_VALIDATION` — golden defines bounds only.
- **Must not include:** implementation code steps, parser schemas, graph node migrations, or `OPERATIONAL` / downstream-unblocked claims.
