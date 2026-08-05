# ChatGPT findings — golden reference (architectural sample v1)

**Mode:** REVIEW_ONLY  
**Mission:** chat-thread-closeout-autopsy-harvest-chatgpt-v1  
**Lane:** CHAT_CONTEXT_ONLY  
**Harvest id:** harvest-2026-08-05-empirical-sample-architectural-v1  
**Output verdict (expected bounds):** `DRAFT_READY_FOR_CURSOR_VALIDATION`

---

## Golden reference role

Defines **acceptable bounds** for empirical review — not required exact wording, packet ids, or invented architecture proposals. Live run must **earn** tier and verdict from demonstrated signal.

| Field | Golden (expected) | Live run (observed) |
| --- | --- | --- |
| **Expected verdict** | `DRAFT_READY_FOR_CURSOR_VALIDATION` | _set at review_ |
| **Observed verdict** | — | _null until live run_ |
| **Expected tier** | T2 | _hypothesis from fixture shape_ |
| **Observed tier** | — | _null until live run_ |

---

## Acceptable harvest outcome

### Verdict

- `DRAFT_READY_FOR_CURSOR_VALIDATION` when live output captures at least one durable **architecture or ownership** boundary supported by chat evidence.
- `NO_HARVEST_NEEDED` only if live run honestly concludes the thread restates committed handoff docs without new boundary (reviewer must document why).

### Durable content (bounds)

| Element | Acceptable range | Notes |
| --- | --- | --- |
| Ownership / architecture boundaries | **1–2** | e.g. immutable raw in Cross-Agent; normalization in Data Extraction; eligible projections only in Master Graph |
| Corrections | **1+** if assistant proposed wrong lane (direct markdown → graph) | Must trace to turns 2–4 |
| ROI backlog ranks | **0–2** | Only if thread demonstrated rework risk from wrong architecture; empty valid |
| Seed candidates | **0–1** | Only for distinct reusable ownership rule; not restatement of manifest |
| Thread events | Enough to trace ownership correction | Typically 5–7 EVT rows; no transcript replay |
| Optional sections | `NONE_FOUND` where absent | Required honesty |

### Tier guidance (not a mandate)

- **T2** is the fixture hypothesis for architecture ownership friction without T3 advancement synthesis.
- Live run may earn T1 if compressed signal is smaller, or fail if inflated into faux-T3 product proposals.
- **T3** requires separate advancement protocol output — not expected from this fixture.

---

## Review pass criteria (summary)

1. Durable cross-system ownership boundary tied to chat turns  
2. Rejected shortcut (direct `graph:collect` on raw markdown) not promoted as intelligence  
3. No implementation steps, migrations, or repo wiring presented as harvest findings  
4. No debugging narrative (root-cause of a failed run)  
5. No strategic planning roadmap disguised as OBSERVED harvest  
6. No template padding; honest `NONE_FOUND` where appropriate  
7. No `HARVEST_COMPLETE`, `OPERATIONAL`, or ingest/publication claims  

---

## Review failure signals

- Treating architecture discussion as permission to implement Data Extraction or MG wiring in harvest output  
- Inventing ROI/`futureSavings` for hypothetical multi-repo savings without thread friction  
- Proposing new parallel envelopes when user explicitly forbade duplicate scaffold  
- Collapsing medium-class operating rules (draft vs no-harvest) into this sample  
- Padding every packet type to look like a major architecture review  
- Claiming `INDEX_HIT` or hub publication status  

---

## Illustrative boundaries (not required verbatim)

Acceptable durable lessons resemble:

> Raw empirical markdown stays immutable in Cross-Agent. Data Extraction owns normalization. Master Graph receives eligible projections only — not raw ChatGPT output via `graph:collect`.

> Extend existing downstream handoff and routing metadata; do not fork a parallel contribution contract tree while authority is on HOLD.

Wording may differ; evidence classification must be traceable.

---

## Graph eligibility (post-review hypothesis)

If review PASS with 1–2 review-approved ownership findings: likely `eligible` for `sampleFinding` projection. If live output merely restates committed manifest without new boundary: `hold`.

---

## Distinction from other sample classes

| Class | This fixture is / is not |
| --- | --- |
| medium | **Not** a mild in-protocol correction arc only |
| architectural | **Is** cross-repo lane and ownership boundary |
| debugging | **Not** failure diagnosis or multi-step root cause |
| planning | **Not** roadmap, sequencing, or sprint scope |

---

## Sections intentionally not fixed

Live output chooses EVT/COR/HP/ROI/seed ids. Golden does not prescribe exact labels beyond bounds above.
