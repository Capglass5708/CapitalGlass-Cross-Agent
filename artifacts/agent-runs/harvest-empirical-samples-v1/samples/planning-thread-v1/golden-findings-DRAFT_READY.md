# ChatGPT findings — golden reference (planning sample v1)

**Mode:** REVIEW_ONLY  
**Mission:** chat-thread-closeout-autopsy-harvest-chatgpt-v1  
**Lane:** CHAT_CONTEXT_ONLY  
**Harvest id:** harvest-2026-08-05-empirical-sample-planning-v1  
**Output verdict (expected bounds):** `DRAFT_READY_FOR_CURSOR_VALIDATION`

---

## Golden reference role

Defines **acceptable bounds** for empirical review — not required exact wording, step numbers, or roadmap tables. Live run must **earn** tier and verdict from demonstrated signal.

| Field | Golden (expected) | Live run (observed) |
| --- | --- | --- |
| **Expected verdict** | `DRAFT_READY_FOR_CURSOR_VALIDATION` | _set at review_ |
| **Observed verdict** | — | _null until live run_ |
| **Expected tier** | T2 | _hypothesis from fixture shape_ |
| **Observed tier** | — | _null until live run_ |

---

## Acceptable harvest outcome

### Verdict

- `DRAFT_READY_FOR_CURSOR_VALIDATION` when live output captures at least one **reusable planning sequence or scope fence** supported by chat evidence.
- `NO_HARVEST_NEEDED` only if live run honestly concludes the thread restates already-frozen program order with no new boundary (reviewer must document why).

### Durable content (bounds)

| Element | Acceptable range | Notes |
| --- | --- | --- |
| Planning sequences / scope fences | **1** | e.g. finish fifth sample before downstream; HOLD until authority resolved |
| Corrections | **1** if assistant proposed premature unblock | Must trace to turns 2–3 |
| ROI backlog ranks | **0–1** | Only if thread demonstrated repeat planning waste; empty valid |
| Seed candidates | **0–1** | Only for distinct planning boundary; sprint roadmaps are not seeds |
| Implementation detail | **None** | No parser code, graph adapters, or env wiring |
| Optional sections | `NONE_FOUND` where absent | Required honesty |

### Tier guidance (not a mandate)

- **T2** is the fixture hypothesis for a sequencing thread with one planning boundary.
- Live run may earn T1 if signal is smaller; fail if inflated into implementation spec or architecture redesign.

---

## Review pass criteria (summary)

1. One earned planning sequence or scope fence with explicit ordering  
2. Rejected premature downstream-unblock proposal not promoted as intelligence  
3. `HOLD_REPO_AUTHORITY_RESOLUTION` preserved; no false authority resolution  
4. No implementation wiring, parser design, or graph adapter detail  
5. No duplicate of architectural three-layer handoff as primary finding  
6. No template padding; honest `NONE_FOUND` where appropriate  
7. No `HARVEST_COMPLETE`, `OPERATIONAL`, or downstream-unblocked claims  

---

## Review failure signals

- Sprint roadmap with M1/M2/M3 implementation tasks treated as harvest packets  
- Claiming Data Extraction or Master Graph wiring authorized from partial sample set  
- Inflating program closeout into suite architecture redesign  
- Fabricated `futureSavings` on sequencing prose alone  
- Converting planning into debugging EVT heuristics or medium verdict-boundary only  

---

## Illustrative planning boundary (not required verbatim)

Acceptable durable lesson resembles:

> Finish all five empirical samples and run recurrence compare before downstream wiring; `HOLD_REPO_AUTHORITY_RESOLUTION` is not cleared by partial sample completion.

Wording may differ; scope fences must be traceable to chat turns.

---

## Graph eligibility (post-review hypothesis)

If review PASS with one review-approved planning boundary: likely `eligible` for one `sampleFinding`. If live output is mostly roadmap padding: `hold`.

---

## Distinction from other sample classes

| Class | This fixture is / is not |
| --- | --- |
| thin | **Not** factual closure with no friction |
| medium | **Not** mild in-protocol wording correction only |
| architectural | **Not** cross-repo ownership lane design (may reference HOLD without re-deriving three-layer table) |
| debugging | **Not** localized validation failure diagnosis |
| planning | **Is** ordered sequencing + scope fences for program closeout |

---

## Sections intentionally not fixed

Live output chooses EVT/COR/HP/ROI/seed ids. Golden does not prescribe exact step labels beyond bounds above.
