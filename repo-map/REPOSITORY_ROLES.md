# Repository Roles

| Repo | Role | Belongs there | Does not belong there |
| --- | --- | --- | --- |
| CapitalGlass-Cross-Agent | Meeting / coordination repo | Human ledger, decisions, handoffs, verification pointers, project records | App code, MCP code, migrations, copied Bibles, full corpuses |
| CG-Platform-Governance-MCP | Protocol authority | North Star authority, capture contract, closeout validation, compounding proof | AppBuilder execution scripts |
| CG-AppBuilder-MCP | Execution adapter | Bible sync/index/cache gates, AppBuilder execution, harvest/cache operations | Final governance authority |
| Data-Extraction | Knowledge processing | Research indexes, processed knowledge packages, master index sync | Runtime app implementation |
| Scraper | Capture engine | Raw captures, manifests, vendor-docs corpus | Final app decisions |
| Computer Estimator | Parser producer | Parser evidence packages, opening detection, GPU parser work | Cross-agent ledger |
| CapitalGlassRevu | Revu markup lane | Controlled Revu MCP operations, markup binding/read-back | Detection engine authority |
| Bid Composer | Review spine | Import/review of approved evidence and scope | Raw parser research corpus |
