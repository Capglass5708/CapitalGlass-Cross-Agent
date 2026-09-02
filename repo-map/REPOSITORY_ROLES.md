# Repository Roles

| Repo | Role | Belongs there | Does not belong there |
| --- | --- | --- | --- |
| CapitalGlass-Cross-Agent | Coordination + cross-agent intelligence repo | Human ledger, decisions, handoffs, verification pointers, project records, **and the software for context capture, lineage, extraction, graph, and cross-project reasoning** | **Captured/accumulated data of any kind** (transcripts, raw session payloads, tool results, attachments, embeddings, accumulated graph data, historical session records), domain-application business logic, secrets, copied Bibles, full corpuses |
| CG-Platform-Governance-MCP | Protocol authority | North Star authority, capture contract, closeout validation, compounding proof | AppBuilder execution scripts |
| CG-AppBuilder-MCP | Execution adapter | Bible sync/index/cache gates, AppBuilder execution, harvest/cache operations | Final governance authority |
| Data-Extraction | Knowledge processing | Research indexes, processed knowledge packages, master index sync | Runtime app implementation |
| Scraper | Capture engine | Raw captures, manifests, vendor-docs corpus | Final app decisions |
| Computer Estimator | Parser producer | Parser evidence packages, opening detection, GPU parser work | Cross-agent ledger |
| CapitalGlassRevu | Revu markup lane | Controlled Revu MCP operations, markup binding/read-back | Detection engine authority |
| Bid Composer | Review spine | Import/review of approved evidence and scope | Raw parser research corpus |

---

**Cross-Agent boundary (2026-08-30):** this repo may contain the *software* for cross-agent
coordination and intelligence; it must never become the *datastore* for captured context.
Durable data lives in the Intelligence Hub data plane. Decision ID:
`CAD-20260830-cross-agent-software-home-not-datastore`. See
`work-progress/projects/2026-08-30_immutable-context-ledger-v1.md`.
