# Harvest record → validate → sync — Git pointer

**Full runbook:** `L:/Capital-Glass-Intelligence-Hub/03-protocols/harvest/harvest-record-validate-sync.md`

```bash
npm run harvest:sync-derived -- <harvest-id>
npm run harvest:render-index -- <harvest-id>
npm run harvest:validate -- <harvest-id>
npm run harvest:validate-autopsy -- --harvest-id=<id>
npm run test:harvest
npm run harvest:publish-intelligence-full -- --harvest-id=<id>
```

Authority: `artifacts/agent-runs/<harvest-id>/harvest-manifest-v1.json`. See L: for ledger ingest and freshness gate.
