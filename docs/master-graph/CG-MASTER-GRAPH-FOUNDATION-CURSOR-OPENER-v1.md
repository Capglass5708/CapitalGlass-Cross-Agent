# CG Master Graph Foundation — Cursor opener v1

Work package: `capital-glass-master-graph-foundation-v1`  
Graph authority: **CG-MASTER-GRAPH** (`$HOME/repos/CG-MASTER-GRAPH`)

## Start here

1. Read `CG-MASTER-GRAPH/docs/CG-MASTER-GRAPH-STARTER.md`
2. Run `npm run validate` in the graph repo (WSL ext4 required)
3. Consult Intelligence Hub slice: `00-master-index/BY-KIND/master-graph-release.json`
4. For harvest contributions: `CapitalGlass-Cross-Agent/docs/master-graph/CG-HARVEST-TO-GRAPH-HARVEST-LANE-v1.md`

## Validate gate

```bash
cd "$HOME/repos/CG-MASTER-GRAPH"
npm run validate
```

Expected: `CG_MASTER_GRAPH_FOUNDATION_VALIDATED`

## Publication

```bash
npm run master-graph:publish-hub   # from Cross-Agent
```

## Do not

- Bulk-merge `started-a-graph` into graph repo
- Treat Cross-Agent harvest JSON as canonical graph truth without compiler promotion
