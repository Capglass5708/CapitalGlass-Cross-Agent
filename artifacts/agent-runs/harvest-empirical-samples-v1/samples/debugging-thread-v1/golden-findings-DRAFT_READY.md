# ChatGPT findings — golden reference (debugging sample v1)

**Mode:** REVIEW_ONLY  
**Mission:** chat-thread-closeout-autopsy-harvest-chatgpt-v1  
**Lane:** CHAT_CONTEXT_ONLY  
**Harvest id:** harvest-2026-08-05-empirical-sample-debugging-v1  
**Output verdict (expected bounds):** `DRAFT_READY_FOR_CURSOR_VALIDATION`

---

## Golden reference role

Defines **acceptable bounds** for empirical review — not required exact wording, EVT ids, or log excerpts. Live run must **earn** tier and verdict from demonstrated signal.

| Field | Golden (expected) | Live run (observed) |
| --- | --- | --- |
| **Expected verdict** | `DRAFT_READY_FOR_CURSOR_VALIDATION` | _set at review_ |
| **Observed verdict** | — | _null until live run_ |
| **Expected tier** | T2 | _hypothesis from fixture shape_ |
| **Observed tier** | — | _null until live run_ |

---

## Acceptable harvest outcome

### Verdict

- `DRAFT_READY_FOR_CURSOR_VALIDATION` when live output captures at least one **reusable debugging heuristic** supported by chat evidence.
- `NO_HARVEST_NEEDED` only if live run honestly concludes the thread is a one-line typo fix with no durable lesson (reviewer must document why).

### Durable content (bounds)

| Element | Acceptable range | Notes |
| --- | --- | --- |
| Debugging heuristics | **1** | e.g. check EVT evidence classification before re-running validate; do not harvest terminal scrollback |
| Root cause | **1** localized | e.g. EVT-004 missing evidence class — not suite-wide architecture failure |
| Corrections | **1** if assistant proposed log-dump harvesting | Must trace to turns 2–3 |
| ROI backlog ranks | **0–1** | Only if thread demonstrated repeat validation friction; empty valid |
| Seed candidates | **0–1** | Only for distinct reusable heuristic; log excerpts are not seeds |
| Log / stderr content in output | **Minimal or none** | Quote error line only; not full scrollback |
| Optional sections | `NONE_FOUND` where absent | Required honesty |

### Tier guidance (not a mandate)

- **T2** is the fixture hypothesis for a localized validation-debug thread with one heuristic.
- Live run may earn T1 if signal is smaller; fail if inflated into architecture or faux incident review.

---

## Review pass criteria (summary)

1. One earned debugging heuristic separated from noisy execution logs  
2. Localized root cause (EVT classification gap) — not cross-repo ownership redesign  
3. Rejected log-dump-as-harvest proposal not promoted as intelligence  
4. No `graph:collect`, Data Extraction, or Master Graph architecture packets  
5. No strategic planning or multi-sprint remediation roadmap  
6. No template padding; honest `NONE_FOUND` where appropriate  
7. No `HARVEST_COMPLETE`, `OPERATIONAL`, or false ingest/publication claims  

---

## Review failure signals

- Pasting or summarizing entire terminal scrollback as HP/TW/ROI rows  
- Inflating missing EVT classification into suite architecture or downstream wiring findings  
- Inventing production outage, CI matrix, or cross-app blast radius without thread support  
- Promoting install warnings or unrelated green checks as durable lessons  
- Converting debugging into duplicate of architectural three-layer handoff  
- Fabricated `futureSavings` on a single-field validation fix  

---

## Illustrative heuristic (not required verbatim)

Acceptable durable lesson resembles:

> On `harvest:validate` classification failure, inspect the EVT inventory for missing evidence class before harvesting terminal noise. Noisy logs are context, not OBSERVED intelligence.

Wording may differ; evidence classification must be traceable.

---

## Graph eligibility (post-review hypothesis)

If review PASS with one review-approved debugging heuristic: likely `eligible` for one `sampleFinding`. If live output is mostly log replay: `hold`.

---

## Distinction from other sample classes

| Class | This fixture is / is not |
| --- | --- |
| medium | **Not** mild in-protocol wording correction only |
| architectural | **Not** cross-repo ownership or lane redesign |
| debugging | **Is** localized failure diagnosis + signal-vs-noise separation |
| planning | **Not** sequencing, roadmap, or scope planning |

---

## Sections intentionally not fixed

Live output chooses EVT/COR/HP/ROI/seed ids. Golden does not prescribe exact labels beyond bounds above.
