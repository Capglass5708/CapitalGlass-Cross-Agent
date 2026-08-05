# Empirical sample — medium thread fixture v1

**Sample class:** medium  
**Program:** `harvest-empirical-samples-v1`  
**Purpose:** Test frozen protocol compression on a mild correction arc — expect a small `DRAFT_READY_FOR_CURSOR_VALIDATION` file if live run earns it.

---

## Simulated Cursor chat (complete thread)

### Turn 1 — User

For the frozen ChatGPT harvest protocol, when should a short thread be marked `NO_HARVEST_NEEDED` instead of `DRAFT_READY_FOR_CURSOR_VALIDATION`?

### Turn 2 — Assistant

Use `DRAFT_READY_FOR_CURSOR_VALIDATION` whenever the thread mentions harvest, protocol, or branch policy so Cursor always gets a findings file to review. Reserve `NO_HARVEST_NEEDED` only for threads with zero Capital Glass content.

That keeps the harvest lane active and avoids missing durable lessons.

### Turn 3 — User

That is too broad. I mean a **3-turn factual Q&A** where the answer is already in frozen protocol text, there was **no user correction**, and no operational friction. Should that still be `DRAFT_READY`?

### Turn 4 — Assistant

No. For that narrow case use `NO_HARVEST_NEEDED` (tier T0).

**Operating boundary:** If the thread is a short factual closure, the assistant cites existing frozen protocol authority, the user does not correct scope or facts, and there is no demonstrated waste or novel lesson, do **not** force a draft findings file. Mark `NO_HARVEST_NEEDED` and stop.

`DRAFT_READY` applies when there is at least one durable correction, boundary, friction, or reusable workflow lesson worth Cursor validation — not merely because the topic is "harvest-related."

### Turn 5 — User

Correct. Use that boundary for empirical thin samples.

---

## Fixture notes (for reviewers — not part of simulated chat)

- Mild correction arc: assistant over-generalizes draft-vs-no-harvest rule; user narrows to T0 factual closure.
- Demonstrates one durable operating boundary, not architecture or debugging.
- Thread length: 5 turns; one earned correction/boundary candidate for live run.
- **Expected tier (fixture hypothesis):** T2 — live run must earn classification from actual signal.
- **Expected verdict (fixture hypothesis):** `DRAFT_READY_FOR_CURSOR_VALIDATION` — golden defines acceptable bounds only; live output is authoritative.
- **Must not include:** repo implementation, multi-stage debugging, strategic planning, or padding to force T2.
