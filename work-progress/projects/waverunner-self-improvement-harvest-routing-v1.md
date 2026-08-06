# Work package: waverunner-self-improvement-harvest-routing-v1

**Mission class:** implement  
**Execution mode:** MILESTONE_WAVE  
**Primary repos:** CapitalGlass-Cross-Agent, Data-Extraction  
**Target catalog:** `L:\02-catalog\SDLC Gated Wave Protocols\WaveRunner Self Improvements Harvesting`

## Authority chain

```text
ChatGPT draft → CG-AppBuilder closeout validation → Cross-Agent canonical harvest
  → Data-Extraction ingest/classify/dedupe/normalize → L classified catalog
  → Governance review → Git → Z
```

L is **retrieval-only**. No automatic WaveRunner protocol mutation.

## Commands

### Cross-Agent

```bash
npm run harvest:validate -- <harvest-id>
npm run harvest:duplication-preflight -- --harvest-id=<id>
npm run harvest:export:waverunner-self-improvement -- --harvest-id=<id> --json
npm run test:waverunner-export
```

### Data-Extraction

```bash
npm run waverunner:harvest:ingest -- --input=<handoff-json> --json
npm run waverunner:harvest:prepare -- --harvest-id=<id> --json
npm run waverunner:harvest:publish-l -- --harvest-id=<id> --json
npm run waverunner:harvest:verify -- --harvest-id=<id> --json
npm run test:waverunner-harvest
```

## Contract

- Schema: `contracts/waverunner-self-improvement-harvest-input-v1.schema.json`
- Cross-Agent export output: `artifacts/agent-runs/<harvest-id>/data-extraction-handoff/`
- Data-Extraction receipt: `artifacts/agent-runs/<harvest-id>/waverunner-publication-receipt.json`

## Acceptance

- [ ] Validated handoff exports from Cross-Agent
- [ ] Data-Extraction publishes under exact L target path
- [ ] `INGESTION_COMPLETE.json` present
- [ ] Index pointer resolves without raw scan
- [ ] Governance packet marks PROPOSAL only
