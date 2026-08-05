# ChatGPT findings — golden reference (medium sample v1)

**Mode:** REVIEW_ONLY  
**Mission:** chat-thread-closeout-autopsy-harvest-chatgpt-v1  
**Lane:** CHAT_CONTEXT_ONLY  
**Harvest id:** harvest-2026-08-05-empirical-sample-medium-v1  
**Output verdict (expected bounds):** `DRAFT_READY_FOR_CURSOR_VALIDATION`

---

## Golden reference role

This file defines **acceptable bounds** for empirical review — not required exact wording, EVT ids, or invented ROI ranks. The live run must **earn** tier and verdict from demonstrated signal.

| Field | Golden (expected) | Live run (observed) |
| --- | --- | --- |
| **Expected verdict** | `DRAFT_READY_FOR_CURSOR_VALIDATION` | _set at review_ |
| **Observed verdict** | — | _null until live run_ |
| **Expected tier** | T2 | _hypothesis from fixture shape_ |
| **Observed tier** | — | _null until live run_ |

---

## Acceptable harvest outcome

### Verdict

- `DRAFT_READY_FOR_CURSOR_VALIDATION` is acceptable when the live file contains at least one durable correction or operating boundary supported by chat evidence.
- `NO_HARVEST_NEEDED` is acceptable only if the live run honestly concludes the correction arc did not yield durable intelligence (reviewer must document why).

### Durable content (bounds)

| Element | Acceptable range | Notes |
| --- | --- | --- |
| Corrections / boundaries | **1** durable item | e.g. T0 factual Q&A → `NO_HARVEST_NEEDED` when no user correction and answer cites frozen protocol |
| ROI backlog ranks | **0–2** | Only if supported by demonstrated friction; empty is valid |
| Seed candidates | **0–1** | Only if a reusable rule is clearly earned; restatement of frozen protocol is not a seed |
| Thread events | Enough to trace the correction arc | Typically 4–5 EVT rows; no narrative replay of full chat |
| Optional sections | `NONE_FOUND` where evidence absent | Required honesty |

### Tier guidance (not a mandate)

- **T2** is the fixture **hypothesis** for a mild correction arc with one boundary — not assigned by fixture size alone.
- Live run may earn T1 if signal is smaller but still valid, or fail padding gates if inflated to T2.

---

## Review pass criteria (summary)

1. One earned correction or operating boundary tied to turns 2–4  
2. Compression: durable learning separated from ordinary conversation  
3. No template padding in every section  
4. No invented `futureSavings` without friction evidence  
5. No seed promoting ordinary protocol restatement  
6. No `HARVEST_COMPLETE` or `OPERATIONAL` publication claims  
7. No architectural proposal disguised as harvest intelligence  

---

## Review failure signals

- Padding every optional section to look comprehensive  
- Inventing ROI ranks or `futureSavings` without thread support  
- Promoting "always draft when harvest is mentioned" (the **rejected** over-broad rule) as durable intelligence  
- Converting the mild correction into multi-repo architecture or implementation design  
- Artificial waste inserted only to force a T2 classification  

---

## Illustrative boundary (not required verbatim in live output)

The durable lesson should resemble:

> Short factual closure with frozen-protocol citation and no user correction → `NO_HARVEST_NEEDED` (T0). `DRAFT_READY` requires demonstrated correction, friction, or reusable workflow lesson.

Wording may differ; evidence classification must be traceable.

---

## Graph eligibility (post-review hypothesis)

If review PASS and one durable `sampleFinding` is extracted: likely `eligible` for normalized projection (subject to routing metadata at live-run commit). If live run is thin or padded: `hold`.

---

## Sections intentionally not fixed

Live output chooses its own EVT/COR/HP/ROI/seed ids. Golden does not prescribe exact packet labels beyond the bounds above.
