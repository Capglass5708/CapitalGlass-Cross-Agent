import fs from 'node:fs';
import path from 'node:path';

import {
  buildAuthorityFingerprintV1,
  sha256FileHash,
} from './closeout-verify.mjs';
import { buildCorrelationBlock, computeMarkerSetHash } from './correlation-markers-v1.mjs';
import { HANDOFF_SCHEMA } from './constants.mjs';

export function buildMaterialCloseout({
  workPackageId,
  task = 'Operational intelligence ingest validation mission',
  outcome = 'LOCAL_RUNTIME_VALIDATED',
  missionClass = 'fix',
  aiCacheHit = true,
} = {}) {
  return {
    task,
    missionClass,
    outcome,
    hostMode: 'wsl',
    topology: 'single',
    confidence: 'HIGH',
    cheapSingleAgentOk: true,
    cheapestRedo: 'Re-run intelligence ingest dry-run with matching closeout hash',
    deterministicFirst: true,
    mixedMissions: false,
    aiCacheHit,
    aiCacheEvidence: {
      schemaVersion: 'auto-v32-closeout-cache-evidence-v1@1.0.0',
      status: 'HIT',
      cacheKeyHash: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    },
    bibleCache: {
      bibleHashAfter: '264bc4c19e72ebdc2c537db997b91b5d06a9918dfd45051532606ac5750342ee',
      reuseDecision: 'REUSE_CACHED_BIBLE_AUTHORITY_VALID',
    },
    workPackageId,
  };
}

export function writeAuthoritativeHandoffFixture(tempRoot, options = {}) {
  const workPackageId = options.workPackageId ?? 'capital-glass-intelligence-ingest-real-v1';
  const closeout = options.closeout ?? buildMaterialCloseout({ workPackageId, ...options.closeoutOverrides });
  const closeoutRel = `artifacts/agent-runs/${workPackageId}/session-closeout-v3.2.json`;
  const closeoutPath = path.join(tempRoot, closeoutRel);
  fs.mkdirSync(path.dirname(closeoutPath), { recursive: true });

  if (options.material !== false) {
    closeout.workPackageId = workPackageId;
    closeout.primaryRepo = 'CG-AppBuilder-MCP';
    closeout.correlation = buildCorrelationBlock({
      closeout,
      producerRepo: 'CG-AppBuilder-MCP',
      capabilityIds: closeout.aiCacheHit === true ? ['CACHE'] : [],
    });
    closeout.correlation.markerSetHash = computeMarkerSetHash(closeout.correlation.markers);
  }

  fs.writeFileSync(closeoutPath, `${JSON.stringify(closeout, null, 2)}\n`);

  const closeoutHash = sha256FileHash(closeoutPath);
  const commitSha = options.commitSha ?? 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  const authorityFingerprint = buildAuthorityFingerprintV1({
    repo: 'CG-AppBuilder-MCP',
    workPackageId,
    missionClass: options.missionClass ?? 'fix',
    material: options.material !== false,
    commitSha,
    closeoutHash,
    bibleHashAfter: closeout.bibleCache?.bibleHashAfter ?? null,
  });

  const handoff = {
    schema: HANDOFF_SCHEMA,
    workPackageId,
    closeoutRef: closeoutRel,
    closeoutHash,
    authorityFingerprint,
    source: {
      repo: 'CG-AppBuilder-MCP',
      closeoutPath: closeoutRel,
      closeoutHash,
      authorityFingerprint,
      commitSha,
    },
    mission: {
      missionClass: options.missionClass ?? 'fix',
      material: options.material !== false,
      startedAt: options.startedAt ?? '2026-08-17T02:00:00.000Z',
      closedAt: options.closedAt ?? '2026-08-17T03:00:00.000Z',
    },
    producer: {
      system: 'CG-AppBuilder-MCP',
      role: 'EVIDENCE_PRODUCER',
    },
    consumer: {
      system: 'CapitalGlass-Cross-Agent',
      role: 'INTELLIGENCE_PROCESSOR',
    },
    observedAt: options.observedAt ?? '2026-08-17T03:00:01.000Z',
  };

  const handoffPath = path.join(tempRoot, 'handoff.json');
  fs.writeFileSync(handoffPath, `${JSON.stringify(handoff, null, 2)}\n`);

  return {
    handoff,
    handoffPath,
    closeoutPath,
    closeoutHash,
    authorityFingerprint,
    closeoutRel,
  };
}
