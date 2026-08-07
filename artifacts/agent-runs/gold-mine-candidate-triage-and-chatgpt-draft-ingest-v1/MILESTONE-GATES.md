# gold-mine-candidate-triage-and-chatgpt-draft-ingest-v1 — Locked Gates

**Execution mode:** `MILESTONE_WAVE` G0→G4 (single wave; stop only on hard gate)

| Gate | Objective | Stop condition |
| --- | --- | --- |
| **G0** | Data-Extraction `main` owns harvest intelligence consumer | merge/test/push fail |
| **G1** | `PASS_FOUND_BOTH` — materialize two ChatGPT sources | either file missing on disk |
| **G2** | Bridge both → expand → Hub refresh → remeasure → stable-digest snapshot | `sourceSectionsDropped>0`, `distinctValidSuppressed>0` |
| **G3** | Reconcile candidates by stable identity | `distinctValidSuppressed>0` |
| **G4** | Operator review packet + digest-bound approval manifest | auto-implementation attempted |

## G1 source custody (locked)

| Harvest ID | Operator filename | Canonical ingest name |
| --- | --- | --- |
| `harvest-2026-08-07-gold-mine-compounding-protocol-upgrade-v1` | `harvest-2026-08-07-gold-mine-compounding-protocol-upgrade-v1-chatgpt-findings-source.md` | `chatgpt-findings-source.md` |
| `harvest-2026-08-07-cross-agent-authority-convergence-closeout-v1` | `harvest-2026-08-07-cross-agent-authority-convergence-closeout-v1-chatgpt-findings-source.md` | `chatgpt-findings-source.md` |

**Staging inbox (WSL):** `artifacts/agent-runs/gold-mine-candidate-triage-and-chatgpt-draft-ingest-v1/source-custody/incoming/`

## Prior milestone baseline (read-only)

- Cross-Agent: `42fc671` (`harvest-intelligence-index-expansion-and-operational-hardening-v1` closed PASS_WITH_WARN)
- Gold Mine remeasure baseline: 395 evaluated, 92 candidates, `distinctValidSuppressed=0`
