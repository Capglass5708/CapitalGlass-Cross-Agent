# Experience Harvest Adapter v1

**Contract:** `experience-harvest-adapter-v1`  
**Owner:** CapitalGlass-Cross-Agent (registry/pointers)  
**Program:** `capital-glass-experience-graph-compounding-v1`

## Purpose

Map Harvest outputs into Experience Graph entities without creating a second graph authority.

## Namespace boundaries

| Prefix | Entity | Layer |
| --- | --- | --- |
| `obs:` | Harvest observation | Harvest / product emitter |
| `xobs:` | Experience observation | Experience Graph |
| `episode:` | Experience episode | Experience Graph |
| `pattern:` | Experience pattern | Experience Graph |

Observation ≠ episode ≠ pattern. Do not deduplicate these layers.

## Mappings

### Thread autopsy → episode

| Autopsy field | Episode field |
| --- | --- |
| problem summary | `problem` |
| actions attempted | `actionsAttempted[]` |
| operator intervention | `operatorIntervention` |
| resolution / outcome | `outcome` |
| applicability hints | `applicability` |
| root cause (if known) | `rootCauseKey` |
| activation condition | `triggerFingerprint` |
| context digest | `contextCompatibilityDigest` |

### Harvest obs → Experience observation

| Harvest obs | Experience observation |
| --- | --- |
| `obs:*` id | new `xobs:*` id (preserve `sourceRawRef`) |
| event class | `eventClass` |
| evidence | `evidence` + `sourceExcerptHash` |
| provenance | `provenance` |

### Gold Mine projection → episode/pattern refs

Gold Mine candidates link to `episode:` and `pattern:` refs only — never replace source evidence.

### Reflex Shadow observation → Experience observation subset

Shadow observations (`DERIVED_SHADOW_PROJECTION`) may emit `xobs:` records with `provenance.emitter=reflex-shadow` when mapped through this adapter. They never grant autonomy.

## Roundtrip invariants

- `EXPERIENCE_SOURCE_ROUNDTRIP_PASS` — every derived record preserves `sourceRawRef` and `sourceExcerptHash`
- `EXPERIENCE_NO_SUPPRESSION_PASS` — valid intelligence is never dropped during projection

## Authority

- Correlation, normalization, root-cause analysis: **Data-Extraction**
- Registry and compact retrieval: **CapitalGlass-Cross-Agent**
- Graph validation: **CG-MASTER-GRAPH**
- Orchestration / runtime consumption: **CG-AppBuilder-MCP**
