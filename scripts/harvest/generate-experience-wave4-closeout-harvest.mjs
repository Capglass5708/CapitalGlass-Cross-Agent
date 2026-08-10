#!/usr/bin/env node
/**
 * T2 harvest generator for experience-opening-estimating-v1 and
 * experience-business-outcome-correlation-v1 (Wave 4 business expansion).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const DE_ROOT = path.resolve(REPO_ROOT, '../Data-Extraction');
const AS_OF = new Date().toISOString();
const SOURCE_SHA = execSync('git rev-parse HEAD', { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
const DE_SHA = execSync('git rev-parse HEAD', { cwd: DE_ROOT, encoding: 'utf8' }).trim();

const LIVE_OPENING_RECEIPT =
  'artifacts/agent-runs/experience-opening-estimating-v1/live-producer-ingestion-receipt-v1.json';
const OPENING_FIXTURE =
  'scripts/tests/fixtures/experience-opening-estimating-v1/beacon-hill-estimating-pilot.json';
const OUTCOME_FIXTURE =
  'scripts/tests/fixtures/experience-business-outcome-correlation-v1/beacon-hill-business-outcome.json';

async function loadPipelineModules() {
  const openingMod = await import(
    pathToFileURL(path.join(DE_ROOT, 'scripts/experience-graph/lib/run-estimating-experience-pipeline.mjs')).href
  );
  const outcomeMod = await import(
    pathToFileURL(path.join(DE_ROOT, 'scripts/experience-graph/lib/run-business-outcome-correlation-pipeline.mjs')).href
  );
  return { openingMod, outcomeMod };
}

function writeJson(runDir, rel, value) {
  const p = path.join(runDir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function baseAutopsy(harvestId, subject, events, wrongMoves, waste) {
  return {
    schemaVersion: 'cross-agent-thread-autopsy-bundle-v1@1.0.0',
    harvestId,
    tier: 'T2',
    wasteLedgerStatus: 'POPULATED',
    waste,
    operatorFriction: [
      {
        frictionId: 'OF-001',
        trigger: 'Human estimator must correct machine scope classification on real markups',
        operatorCost: 'medium',
        systemFix: 'Experience episode captures correction provenance for retrieval',
        evidenceRefs: events.map((e) => e.eventId),
        linkedWasteIds: waste.map((w) => w.wasteId),
        goldMineSignalClass: 'BUSINESS_WORKFLOW_SIGNAL',
        manualStep: 'Review opening scope on elevation markup',
        frequency: 'observed',
        avoidable: true,
        automationCandidate: true,
        businessWorkflow: subject,
        operatorRole: 'estimator',
        rootCause: 'Machine scope vocabulary mismatch on storefront vs window system',
      },
    ],
    executionDeltas: [
      {
        executionDeltaId: 'ED-001',
        situation: subject,
        actualExecution: {
          steps: ['Run pipeline on Beacon Hill pilot fixture with real envelope refs'],
          outcome: 'Experience episodes + deterministic relationships + retrieval pass',
        },
        optimalExecution: {
          steps: ['Reuse cg-estimating-evidence-envelope-v1', 'Correlate without new graph store'],
          outcome: 'DURABLE_COMPLETE with MODEL_INFERRED_AUTHORITY_LEAKAGE=0',
        },
        deltaCost: { time: 'low', tokens: 'low', operatorFrustration: 'low' },
        preventiveControl: 'Reuse existing estimating evidence contract — no parallel envelope',
      },
    ],
    wrongMoves,
    duplicateWork: [
      {
        duplicateId: 'DW-001',
        subject: 'Second estimating evidence envelope or retrieval stack',
        whyRepeated: 'Prior waves risked parallel authority',
        firstKnownInstance: 'cg-estimating-evidence-envelope-v1',
        priorIndexSlice: 'BY-KIND/active-work-blockers.json',
        whyMissed: 'Contract reuse gate enforced in Wave 4 scout',
        avoidableBy: 'CONTRACT_REUSE gate — extend envelope only when validation fails',
        recommendedAction: 'reuse_existing',
      },
    ],
    roiBacklog: [
      {
        rank: 1,
        title: 'Bid Composer estimating loop (follow-on milestone)',
        whyItPays: 'Connects opening evidence to proposal pricing chain',
        effort: 'medium',
        operatorValue: 'high',
        businessValue: 'high',
        platformValue: 'medium',
        agentValue: 'high',
        reliabilityValue: 'high',
        automationLeverage: 'high',
        estimatedComplexity: 'medium',
        blastRadius: 'estimating-suite',
        confidence: 'high',
        evidenceDiversity: 'pilot fixture + envelope refs',
        rootCauseLeverage: 'closes opening→bid loop',
        goldMineSignalClass: 'BUSINESS_WORKFLOW_SIGNAL',
        novelty: 'NEW',
        savedWasteIds: waste.map((w) => w.wasteId),
        seedAs: 'runbook',
      },
    ],
    doNotAdvanceMap: [
      {
        awardOrVerdict: 'experience-estimator-bid-composer-loop-v1',
        currentStatus: 'HOLD',
        doNotClaimUntil: [
          'experience-opening-estimating-v1 DURABLE_COMPLETE on main',
          'Estimating evidence contract stable after merge',
        ],
        lastKnownEvidence: [harvestId, `Data-Extraction@${DE_SHA}`],
      },
    ],
    duplicationCheck: {
      registryConsulted: true,
      hubSlicesConsulted: ['active-work-blockers.json', 'mcp-servers.json'],
      commandIndexConsulted: true,
      checkedAt: AS_OF,
      preflightReceiptHash: harvestId,
    },
  };
}

function seedPacket(harvestId, seedId, title, summary, questions, evidenceRefs) {
  return {
    schemaVersion: 'harvest-seed-packet-v1@1.0.0',
    seedId,
    kind: 'lesson',
    title,
    summary,
    retrievalQuestions: questions,
    evidenceRefs,
    sourcePacketIds: [harvestId],
    executionDeltaRefs: ['ED-001'],
    wasteIds: ['TW-001'],
    roiRank: 1,
    futureAgentInstructions: {
      whenThisAppears: title,
      startAt: [`artifacts/agent-runs/${harvestId}/thread-autopsy-bundle.json`],
      runPreflight: ['npm run test:estimating-experience-pipeline', 'npm run test:business-outcome-correlation-pipeline'],
      doNot: ['Create cg-opening-envelope-v2', 'Fabricate dimensions or business outcomes'],
      proveBeforeClaiming: ['REAL_PROJECT_PILOT=PASS', 'RETRIEVAL=PASS', 'MODEL_INFERRED_AUTHORITY_LEAKAGE=0'],
    },
    ownerRepo: 'Data-Extraction',
    targetSlice: 'BY-KIND/thread-autopsy-index.json',
    promotionClass: 'POLICY_GATED',
    status: 'CANDIDATE',
  };
}

function buildManifest(
  harvestId,
  workPackageId,
  packets,
  autopsyCounts,
  pipelineProofPath,
  { liveReceipt = null, episodeId = null } = {},
) {
  return {
    schemaVersion: 'cross-agent-harvest-manifest-v1@1.0.0',
    harvestId,
    missionClass: 'material-closeout',
    sourceCommitSha: SOURCE_SHA,
    sourceBranch: 'work/experience-opening-estimating-v1',
    sourceRepo: 'CapitalGlass-Cross-Agent',
    createdAt: AS_OF,
    updatedAt: AS_OF,
    retrievalResult: 'INDEX_HIT',
    cacheResult: 'CACHE_MISS',
    overallHarvestVerdict: 'HARVEST_COMPLETE',
    experienceGraphHarvest: {
      program: 'capital-glass-experience-graph-compounding-v1',
      workPackageId,
      pipelineProofPath,
      liveProducerReceiptPath: liveReceipt ? LIVE_OPENING_RECEIPT : null,
      featureHeadSha: DE_SHA,
      modelInferredAuthorityLeakage: 0,
      pilotProject: 'Beacon Hill / CG-2036-26',
      supplementalProject: 'Rosewood / CG-2033-26',
      projectId: '5d38b25a-c391-4d7c-8866-f8a1f4cea942',
      experienceEpisodeId: episodeId,
      literalHumanCorrections: 0,
      liveProducerIngestion: liveReceipt?.gates?.LIVE_SLICE_2_PASS ?? null,
    },
    doNotAdvance: ['Launch experience-estimator-bid-composer-loop-v1 before opening lane merged'],
    threadAutopsy: {
      tier: 'T2',
      bundlePath: `artifacts/agent-runs/${harvestId}/thread-autopsy-bundle.json`,
      seedPacketIndexPath: `artifacts/agent-runs/${harvestId}/seed-packet-index.json`,
      counts: autopsyCounts,
    },
    relatedRepos: [
      { repo: 'Data-Extraction', branch: 'work/experience-opening-estimating-v1', commitSha: DE_SHA, role: 'pipeline owner' },
      { repo: 'CapitalGlass-Cross-Agent', branch: 'work/experience-opening-estimating-v1', commitSha: SOURCE_SHA, role: 'contracts + harvest' },
    ],
    packets,
  };
}

function packet(base) {
  return {
    harvestVerdictContribution: 'RECORDED',
    ownerMcp: 'user-cg-app-mcp',
    ownerIndexingStatus: 'indexed',
    packetKind: base.packetKind,
    ...base,
  };
}

async function generateOpeningHarvest(openingPipeline, liveReceipt = null) {
  const HARVEST_ID = 'experience-opening-estimating-v1';
  const RUN_DIR = path.join(REPO_ROOT, 'artifacts/agent-runs', HARVEST_ID);
  const proofPath = liveReceipt
    ? LIVE_OPENING_RECEIPT
    : `artifacts/agent-runs/${HARVEST_ID}/estimating-experience-pipeline-proof.json`;
  writeJson(RUN_DIR, 'estimating-experience-pipeline-proof.json', openingPipeline);
  if (liveReceipt) {
    writeJson(RUN_DIR, 'live-producer-ingestion-receipt-v1.json', liveReceipt);
  }

  const episodeId = openingPipeline.episodeBundle?.episodes?.[0]?.episodeId ?? 'episode:unknown';
  const events = [
    {
      eventId: 'TE-001',
      phase: 'live-producer',
      summary: 'Beacon Hill Revu storefront WA markup HUMAN_VERIFIED on A6.2',
      evidenceRefs: [
        'CapitalGlassRevu/fixtures/markup-report/spine-proof-storefront-v1.json',
        'revu-markup-wa-001',
      ],
    },
    {
      eventId: 'TE-002',
      phase: 'live-producer',
      summary: 'Rosewood supplemental: W22 AGREE success + D-101 CE_ONLY wrong-move',
      evidenceRefs: [
        'CapitalGlassRevu/fixtures/estimating-spine/ce-reconciliation-result-sample.json',
        proofPath,
      ],
    },
    {
      eventId: 'TE-003',
      phase: 'verification',
      summary: 'Independent situation retrieval without naming pilot project or episode id',
      evidenceRefs: [openingPipeline.retrieval?.query ?? 'retrieval.pass=true', episodeId],
    },
  ];

  writeJson(RUN_DIR, 'thread-event-inventory.json', {
    schemaVersion: 'cross-agent-thread-event-inventory-v1@1.0.0',
    harvestId: HARVEST_ID,
    generatedAt: AS_OF,
    events,
  });

  const waste = [
    {
      wasteId: 'TW-001',
      type: 'rework',
      description: 'CE detected aluminum door D-101 without Revu markup validation (CE_ONLY wrong-move)',
      evidenceRefs: ['TE-002', 'D-101', episodeId],
      estimatedImpact: 'medium',
      savedBy: 'Experience episode captures parser-only opening without Revu validation',
      roiRank: 1,
      goldMineSignalClass: 'BUSINESS_WORKFLOW_SIGNAL',
    },
  ];

  writeJson(
    RUN_DIR,
    'thread-autopsy-bundle.json',
    baseAutopsy(HARVEST_ID, 'opening-estimating', events, [
      {
        wrongMoveId: 'WM-001',
        summary: 'Treat parser-only door schedule candidate as validated without Revu markup agreement',
        whyItWasWrong: 'Opening scope decisions require producer validation, not parser-only inference',
        correctFirstMove: 'Reconcile CE candidate with Revu markup evidence before trusting scope',
        preventiveControl: 'ingest-live-estimating-producer-evidence.mjs + ce-revu-reconciliation',
        executionDeltaId: 'ED-001',
      },
    ], waste),
  );

  const seedId = 'IH-EXPERIENCE-OPENING-ESTIMATING-BEACON-HILL-001';
  writeJson(RUN_DIR, `seed-packets/${seedId}.json`, seedPacket(
    HARVEST_ID,
    seedId,
    'Live estimating producer evidence becomes retrievable opening-scope precedent',
    `Live pilot: Beacon Hill storefront HUMAN_VERIFIED; Rosewood W22 AGREE; D-101 CE_ONLY wrong-move. Episode ${episodeId} with independent retrieval and product coverage expansion.`,
    [
      'aluminum door schedule detected without plan markup validation agreement',
      'storefront opening human verified on elevation markup',
      'window schedule candidate validated when revu markup agrees',
    ],
    [proofPath, LIVE_OPENING_RECEIPT, OPENING_FIXTURE],
  ));

  const packets = [
    packet({
      packetId: 'experience-opening-estimating-beacon-hill-v1',
      packetKind: 'outcome',
      packetTitle: 'Beacon Hill opening/scope Experience episodes with retrieval',
      state: 'COMPLETE',
      packetVerdict: 'PASS',
      ownerRepo: 'Data-Extraction',
      evidenceRefs: [proofPath, `Data-Extraction@${DE_SHA}`],
    }),
  ];

  writeJson(
    RUN_DIR,
    'harvest-manifest-v1.json',
    buildManifest(HARVEST_ID, HARVEST_ID, packets, {
      waste: 1,
      seeds: 1,
      roiItems: 1,
      operatorFriction: 1,
      executionDeltas: 1,
      wrongMoves: 1,
    }, proofPath, { liveReceipt, episodeId }),
  );

  writeJson(RUN_DIR, 'experience-episode-bundle.json', {
    schema: 'experience-episodes-v1@1.0.0',
    harvestId: HARVEST_ID,
    sourceRawRef: proofPath,
    episodes: openingPipeline.episodeBundle.episodes,
    relationships: openingPipeline.relationshipBundle.relationships,
    gates: openingPipeline.gates,
    productCoverage: openingPipeline.productCoverage,
  });

  console.log(`Generated ${HARVEST_ID} at ${RUN_DIR}`);
}

async function generateOutcomeHarvest(outcomePipeline) {
  const HARVEST_ID = 'experience-business-outcome-correlation-v1';
  const RUN_DIR = path.join(REPO_ROOT, 'artifacts/agent-runs', HARVEST_ID);
  const proofPath = `artifacts/agent-runs/${HARVEST_ID}/business-outcome-correlation-proof.json`;
  writeJson(RUN_DIR, 'business-outcome-correlation-proof.json', outcomePipeline);

  const events = [
    { eventId: 'TE-001', phase: 'reuse', summary: 'EG-06 hosted observations reused — no duplicate event synonyms', evidenceRefs: [OUTCOME_FIXTURE] },
    { eventId: 'TE-002', phase: 'correlation', summary: 'population_mismatch + final_output_accepted → PROPOSAL_CORRECTED', evidenceRefs: [proofPath] },
    { eventId: 'TE-003', phase: 'verification', summary: 'Business outcome retrieval + Gold Mine v2 pass', evidenceRefs: ['gates.BUSINESS_OUTCOME_RETRIEVAL=true'] },
  ];

  writeJson(RUN_DIR, 'thread-event-inventory.json', {
    schemaVersion: 'cross-agent-thread-event-inventory-v1@1.0.0',
    harvestId: HARVEST_ID,
    generatedAt: AS_OF,
    events,
  });

  const waste = [
    {
      wasteId: 'TW-001',
      type: 'rework',
      description: 'Report population mismatch required correction before acceptance',
      evidenceRefs: ['TE-002', 'obs:beacon-mismatch'],
      estimatedImpact: 'medium',
      savedBy: 'Outcome-linked episode enrichment without duplicate episodes',
      roiRank: 1,
      goldMineSignalClass: 'BUSINESS_WORKFLOW_SIGNAL',
    },
  ];

  writeJson(
    RUN_DIR,
    'thread-autopsy-bundle.json',
    baseAutopsy(HARVEST_ID, 'business-outcome-correlation', events, [
      {
        wrongMoveId: 'WM-001',
        summary: 'Create duplicate episode when business outcome arrives later',
        whyItWasWrong: 'Episode enrichment must reuse existing episode identity',
        correctFirstMove: 'enrichEpisodeBusinessOutcome on existing episode',
        preventiveControl: 'run-business-outcome-correlation-pipeline.mjs',
        executionDeltaId: 'ED-001',
      },
    ], waste),
  );

  const seedId = 'IH-EXPERIENCE-BUSINESS-OUTCOME-BEACON-HILL-001';
  writeJson(RUN_DIR, `seed-packets/${seedId}.json`, seedPacket(
    HARVEST_ID,
    seedId,
    'Proposal population mismatch corrected before final acceptance — business outcome linked',
    'Beacon Hill EG-06 chain: population_mismatch → final_output_accepted → PROPOSAL_CORRECTED with CONTRIBUTING causality. Gold Mine v2 scored.',
    ['report population mismatch corrected before proposal acceptance'],
    [proofPath, OUTCOME_FIXTURE],
  ));

  const packets = [
    packet({
      packetId: 'experience-business-outcome-beacon-hill-v1',
      packetKind: 'outcome',
      packetTitle: 'Beacon Hill business outcome correlation with retrieval',
      state: 'COMPLETE',
      packetVerdict: 'PASS',
      ownerRepo: 'Data-Extraction',
      evidenceRefs: [proofPath, `Data-Extraction@${DE_SHA}`],
    }),
  ];

  writeJson(
    RUN_DIR,
    'harvest-manifest-v1.json',
    buildManifest(HARVEST_ID, HARVEST_ID, packets, {
      waste: 1,
      seeds: 1,
      roiItems: 1,
      operatorFriction: 1,
      executionDeltas: 1,
      wrongMoves: 1,
    }, proofPath),
  );

  writeJson(RUN_DIR, 'experience-episode-bundle.json', {
    schema: 'experience-episodes-v1@1.0.0',
    harvestId: HARVEST_ID,
    sourceRawRef: proofPath,
    episodes: outcomePipeline.episodeBundle.episodes,
    relationships: outcomePipeline.relationshipBundle.relationships,
    gates: outcomePipeline.gates,
    goldMineEvaluation: outcomePipeline.goldMineEvaluation,
  });

  console.log(`Generated ${HARVEST_ID} at ${RUN_DIR}`);
}

async function main() {
  const liveReceiptPath = path.join(DE_ROOT, LIVE_OPENING_RECEIPT);
  if (!fs.existsSync(liveReceiptPath)) {
    throw new Error(`live producer receipt missing: ${liveReceiptPath}`);
  }
  const liveReceipt = JSON.parse(fs.readFileSync(liveReceiptPath, 'utf8'));
  const openingPipeline = liveReceipt.pipeline;
  if (!liveReceipt.gates?.LIVE_SLICE_2_PASS) {
    throw new Error('live producer ingestion gate failed — cannot harvest fixture-only proof');
  }
  if (!openingPipeline?.gates?.RETRIEVABLE_EXPERIENCE) {
    throw new Error('opening pipeline retrieval gate failed');
  }

  await generateOpeningHarvest(openingPipeline, liveReceipt);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
