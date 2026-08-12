# Issued proposal corpus — knowledge builds v1

Structured intelligence derived from **23** issued Capital Glass storefront proposal PDFs on Z: `Proposals/`.

| Build | File | Purpose |
| --- | --- | --- |
| Section templates | `issued-proposal-section-templates-v1.json` | Recurring section headings and order |
| Quantity summary schema | `storefront-quantity-summary-schema-v1.json` | Tubelite T14000 quantity block fields |
| Frame / glass schema | `frame-schedule-glass-list-schema-v1.json` | Schedule row + glass list column model |
| Vertical profiles | `proposal-vertical-profiles-v1.json` | Healthcare, retail, multi-building patterns |

**Authority:** regenerate via `scripts/issued-proposal-corpus/harvest-issued-proposal-corpus-v1.py` after corpus or harvest logic changes.

**Consumers:** Bid Composer (`fixtures/issued-proposal-corpus/`), Human Estimator concepts, `capital-glass-estimating-parser` executive-summary extractor.
