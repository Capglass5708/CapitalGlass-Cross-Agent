# Empirical sample — debugging thread fixture v1

**Sample class:** debugging  
**Program:** `harvest-empirical-samples-v1`  
**Purpose:** Test whether frozen protocol compresses **reusable debugging intelligence** without treating noisy execution logs as harvest packets — and without inflating a local validation failure into architecture.

---

## Simulated Cursor chat (complete thread)

### Turn 1 — User

I ran `npm run harvest:validate` on a draft empirical `chatgpt-live-output.md` and it failed with:

```text
EVT-004 missing evidence classification (required: CHAT_DIRECT | ATTACHMENT_SOURCE | ...)
```

There is also a long terminal scrollback above that line (install noise, path warnings, prior green checks). What should I keep from this thread?

### Turn 2 — Assistant

Harvest the full failure context. Copy the entire terminal output into the findings file as execution evidence — every line may matter for future agents. Add an HP packet for each stderr line and rank the validation failure as ROI-001 so Cursor never misses ingest errors again.

### Turn 3 — User

No. The scrollback is noise. The **only** durable fact is: EVT-004 exists in the live output table but has no evidence class column value. Fix that classification issue — do not treat the terminal dump as intelligence.

### Turn 4 — Assistant

Root cause: **EVT-004 row incomplete** — the event is documented but `evidence class` is blank, so `harvest:validate` fails the mandatory classification gate.

**Immediate fix:** edit the live output EVT table; set EVT-004 to `CHAT_DIRECT` if it maps to a visible chat turn, or remove the row if it was invented.

### Turn 5 — User

What is the reusable debugging lesson — not the architecture, not a new ingest pipeline?

### Turn 6 — Assistant

**Debugging heuristic (durable):** When empirical live output fails `harvest:validate` on classification, inspect the EVT inventory first — one missing `CHAT_DIRECT` / `ATTACHMENT_SOURCE` label is a common local defect. Do **not** promote raw terminal scrollback, install warnings, or passing gate lines into harvest packets. Noisy logs are execution context, not OBSERVED intelligence.

Re-run validate after fixing the EVT row only.

### Turn 7 — User

Good. That is the lesson for this sample class.

---

## Fixture notes (for reviewers — not part of simulated chat)

- **Debugging class signal:** local validation failure diagnosis + separation of signal (EVT classification gap) from noise (terminal scrollback).
- Assistant first proposes log-dump harvesting (anti-pattern); user restricts to one concrete defect and one reusable heuristic.
- **Not** cross-repo ownership (architectural), **not** mild protocol wording correction only (medium), **not** roadmap/planning.
- Thread length: 7 turns; expect **1** durable debugging heuristic if live run compresses well.
- **Expected tier (fixture hypothesis):** T2 — live run must earn `observedTier` from actual signal.
- **Expected verdict (fixture hypothesis):** `DRAFT_READY_FOR_CURSOR_VALIDATION` — golden defines bounds only.
- **Must not include:** graph:collect debate, Data Extraction wiring, multi-stage production outage, or padding every packet type with log excerpts.
