import fs from 'node:fs';
import path from 'node:path';

import {
  loadCloseoutJson,
  verifyAuthorityFingerprint,
  verifyCloseoutHash,
} from './closeout-verify.mjs';
import {
  classifyEvidenceReality,
  inferMeasurementQuality,
} from './evidence-classifier.mjs';
import { buildDerivedObjects } from './derived-object-builder-v1.mjs';
import { compileHubCompactPayload } from './hub-compact-compiler-v1.mjs';
import { publishOperationalIntelligenceToSharedDevHub } from './hub-operational-intelligence-publish-v1.mjs';
import { resolveSharedDevHubWriteEligibility } from './supabase-intelligence-store-v1.mjs';
import { projectMissionLedgerRecord } from './mission-ledger-projector-v1.mjs';
import { dryRunLedgerDir, resolveCloseoutPath } from './paths.mjs';
import { reconstructAllProvenance } from './provenance-reconstruct-v1.mjs';
import { buildRelationshipEdges } from './relationship-edge-builder-v1.mjs';
import {
  assertNoProducerIntelligencePayload,
  validateEnvelopeSchema,
  validateHandoffSchema,
} from './schema-validate.mjs';
import { INGEST_RECEIPT_SCHEMA } from './constants.mjs';

function fail(stage, code, message, details = {}) {
  const error = new Error(message);
  error.stage = stage;
  error.code = code;
  error.details = details;
  return error;
}

function assertNoRawCloseoutCopy({ ledger, hubCompact, closeoutBytes }) {
  const closeoutText = closeoutBytes.toString('utf8');
  const ledgerText = JSON.stringify(ledger);
  const hubText = JSON.stringify(hubCompact);
  if (ledgerText.includes(closeoutText)) {
    throw fail('LEDGER_PROJECTION', 'RAW_CLOSEOUT_COPIED', 'Mission ledger copied raw closeout body');
  }
  if (hubText.includes(closeoutText)) {
    throw fail('HUB_COMPACT_COMPILE', 'RAW_CLOSEOUT_COPIED', 'Hub compact payload copied raw closeout body');
  }
}

function writeDryRunArtifacts({
  ledger,
  derivedObjects,
  relationships,
  hubCompact,
  provenance,
  receipt,
  dryRun,
  outputRoot,
}) {
  if (!dryRun) return { outputDir: null, writesPerformed: false };
  const outputDir = dryRunLedgerDir(ledger.ledgerId, outputRoot);
  fs.mkdirSync(path.join(outputDir, 'derived-objects'), { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'mission-ledger.json'), `${JSON.stringify(ledger, null, 2)}\n`);
  for (const object of derivedObjects) {
    fs.writeFileSync(
      path.join(outputDir, 'derived-objects', `${object.identity.objectId}.json`),
      `${JSON.stringify(object, null, 2)}\n`,
    );
  }
  fs.writeFileSync(path.join(outputDir, 'relationships.json'), `${JSON.stringify(relationships, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, 'hub-compact.json'), `${JSON.stringify(hubCompact, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, 'provenance.json'), `${JSON.stringify(provenance, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, 'ingest-receipt-v1.json'), `${JSON.stringify(receipt, null, 2)}\n`);
  return { outputDir, writesPerformed: true, writeScope: 'LOCAL_ARTIFACTS_ONLY' };
}

export async function runIntelligenceIngest({
  handoff,
  handoffPath = null,
  mode = 'dry-run',
  repoRoot = null,
  outputRoot = null,
  generatedAt = new Date().toISOString(),
  hubStore = null,
  writeEligibility = resolveSharedDevHubWriteEligibility(),
}) {
  const steps = [];
  const pushStep = (name, ok, details = {}) => steps.push({ name, ok, ...details });

  const handoffValidation = validateHandoffSchema(handoff);
  pushStep('validate_handoff_schema', handoffValidation.ok, { errors: handoffValidation.errors });
  if (!handoffValidation.ok) {
    throw fail('HANDOFF_VALIDATION', 'HANDOFF_SCHEMA_INVALID', 'Handoff schema validation failed', {
      errors: handoffValidation.errors,
    });
  }

  const producerGuard = assertNoProducerIntelligencePayload(handoff);
  pushStep('reject_producer_derived_objects', producerGuard.ok, { forbiddenKeys: producerGuard.forbiddenKeys });
  if (!producerGuard.ok) {
    throw fail(
      'HANDOFF_VALIDATION',
      'PRODUCER_DERIVED_OBJECTS_FORBIDDEN',
      'Producer supplied derived intelligence payload',
      producerGuard,
    );
  }

  const closeoutPath = resolveCloseoutPath(handoff, { repoRoot });
  pushStep('resolve_closeout', Boolean(closeoutPath), { closeoutPath });
  if (!closeoutPath) {
    throw fail('CLOSEOUT_RESOLVE', 'CLOSEOUT_NOT_FOUND', 'Unable to resolve closeoutRef', {
      closeoutRef: handoff.closeoutRef,
    });
  }

  const closeoutBytes = fs.readFileSync(closeoutPath);
  const hashResult = verifyCloseoutHash({ closeoutPath, expectedHash: handoff.closeoutHash });
  pushStep('verify_closeout_hash', hashResult.ok, {
    expectedHash: hashResult.expectedHash,
    actualHash: hashResult.actualHash,
  });
  if (!hashResult.ok) {
    throw fail('CLOSEOUT_HASH_VERIFICATION', 'CLOSEOUT_HASH_MISMATCH', 'Closeout hash mismatch before projection', hashResult);
  }

  const closeout = loadCloseoutJson(closeoutPath);
  if (handoff.mission.material === true && closeout.correlation) {
    const { validateCorrelationBlock, loadCorrelationRegistries, resolveAppBuilderRoot } = await import(
      './correlation-markers-v1.mjs',
    );
    const registries = loadCorrelationRegistries({ appBuilderRoot: resolveAppBuilderRoot() });
    const correlationValidation = validateCorrelationBlock(closeout.correlation, registries);
    pushStep('validate_correlation_markers', correlationValidation.ok, { errors: correlationValidation.errors });
    if (!correlationValidation.ok) {
      throw fail(
        'CORRELATION_VALIDATION',
        'CORRELATION_MARKERS_INVALID',
        'Correlation block failed validation',
        correlationValidation,
      );
    }
  }

  const authorityResult = verifyAuthorityFingerprint({ handoff, closeout });
  pushStep('verify_authority_fingerprint', authorityResult.ok, {
    expected: authorityResult.expected,
    actualTop: authorityResult.actualTop,
    actualSource: authorityResult.actualSource,
  });
  if (!authorityResult.ok) {
    throw fail(
      'AUTHORITY_FINGERPRINT',
      'AUTHORITY_FINGERPRINT_MISMATCH',
      'Authority fingerprint mismatch before projection',
      authorityResult,
    );
  }

  const evidence = classifyEvidenceReality({ handoff, closeout });
  pushStep('classify_evidence_reality', true, evidence);
  const measurementQuality = inferMeasurementQuality({ closeout, evidenceReality: evidence.evidenceReality });

  const ledger = projectMissionLedgerRecord({
    handoff,
    closeout,
    closeoutPath,
    closeoutHash: hashResult.actualHash,
    authorityFingerprint: authorityResult.expected,
    evidenceReality: evidence.evidenceReality,
    measurementQuality,
    generatedAt,
  });
  pushStep('project_mission_ledger', true, { ledgerId: ledger.ledgerId });

  const derivedObjects = buildDerivedObjects({
    ledger,
    handoff,
    closeout,
    evidenceReality: evidence.evidenceReality,
    measurementQuality,
    generatedAt,
  });
  for (const object of derivedObjects) {
    const envelopeValidation = validateEnvelopeSchema(object);
    if (!envelopeValidation.ok) {
      throw fail('DERIVED_OBJECT_BUILD', 'ENVELOPE_SCHEMA_INVALID', 'Derived envelope failed schema validation', {
        objectId: object.identity.objectId,
        errors: envelopeValidation.errors,
      });
    }
    if (object.authority.progressionAuthority !== false) {
      throw fail('DERIVED_OBJECT_BUILD', 'PROGRESSION_AUTHORITY_FORBIDDEN', 'Derived object claimed progression authority');
    }
    if (object.authority.authorityClass !== 'DERIVED_INTELLIGENCE') {
      throw fail('DERIVED_OBJECT_BUILD', 'SOURCE_AUTHORITY_INVALID', 'Derived object must remain DERIVED_INTELLIGENCE');
    }
    if (object.authority.rawTelemetryDuplicated !== false) {
      throw fail('DERIVED_OBJECT_BUILD', 'RAW_TELEMETRY_DUPLICATED', 'Derived object must not duplicate raw telemetry');
    }
  }
  pushStep('build_derived_objects', true, {
    count: derivedObjects.length,
    objectIds: derivedObjects.map((object) => object.identity.objectId),
  });

  const relationships = buildRelationshipEdges({ ledger, derivedObjects, closeout });
  pushStep('build_relationship_edges', true, {
    count: relationships.length,
    relationshipIds: relationships.map((edge) => edge.relationshipId),
  });

  const hubMode = mode === 'shared-dev-hub' ? 'shared-dev-hub' : 'dry-run';
  const hubCompact = compileHubCompactPayload({
    ledger,
    derivedObjects,
    relationships,
    mode: hubMode,
    generatedAt,
  });
  pushStep('compile_hub_compact', true, { mode: hubMode, objectCount: hubCompact.objects.length });

  assertNoRawCloseoutCopy({ ledger, hubCompact, closeoutBytes });

  const provenance = reconstructAllProvenance({ derivedObjects, ledger, handoff });
  pushStep('reconstruct_provenance', provenance.ok, {
    count: provenance.reconstructions.length,
  });
  if (!provenance.ok) {
    throw fail('PROVENANCE_RECONSTRUCTION', 'PROVENANCE_BROKEN', 'Provenance reconstruction failed', provenance);
  }

  let hubPublication = null;
  let firstRealMissionHubProof = evidence.firstRealMissionEligible
    ? 'WAITING_FOR_SHARED_DEV_HUB_READBACK'
    : 'WAITING_FOR_REAL_MISSION';

  if (mode === 'shared-dev-hub') {
    hubPublication = await publishOperationalIntelligenceToSharedDevHub({
      ledger,
      derivedObjects,
      relationships,
      hubCompact,
      evidenceReality: evidence.evidenceReality,
      firstRealMissionEligible: evidence.firstRealMissionEligible,
      store: hubStore,
      eligibility: writeEligibility,
    });
    firstRealMissionHubProof = hubPublication.firstRealMissionHubProof ?? firstRealMissionHubProof;
  }

  const receipt = {
    schemaVersion: INGEST_RECEIPT_SCHEMA,
    mode,
    handoffPath,
    workPackageId: handoff.workPackageId,
    closeoutHash: hashResult.actualHash,
    authorityFingerprint: authorityResult.expected,
    ledgerId: ledger.ledgerId,
    evidenceReality: evidence.evidenceReality,
    firstRealMissionEligible: evidence.firstRealMissionEligible,
    generatedAt,
    steps,
    acceptance: {
      INTELLIGENCE_INGEST_IMPLEMENTED: true,
      HANDOFF_VALIDATION_PASS: true,
      CLOSEOUT_HASH_VERIFICATION_PASS: true,
      LEDGER_PROJECTION_PASS: true,
      DERIVED_OBJECT_BUILD_PASS: true,
      RELATIONSHIP_EDGE_BUILD_PASS: true,
      HUB_COMPACT_COMPILE_PASS: true,
      PROVENANCE_RECONSTRUCTION_PASS: true,
      IDEMPOTENT_REINGEST_PASS: null,
      LOCAL_RUNTIME_VALIDATED: null,
      FIRST_REAL_MISSION_HUB_PROOF: firstRealMissionHubProof,
      SHARED_DEV_KNOWLEDGE_OBJECT_WRITTEN: hubPublication?.acceptance?.sharedDevKnowledgeObjectWritten ?? null,
      RELATIONSHIP_WRITTEN: hubPublication?.acceptance?.relationshipWritten ?? null,
      HUB_BODY_HASH_READBACK_MATCH: hubPublication?.acceptance?.hubBodyHashReadbackMatch ?? null,
      RETRIEVAL_SUCCESSFUL: hubPublication?.acceptance?.retrievalSuccessful ?? null,
    },
    artifacts: {
      missionLedger: ledger,
      derivedObjects,
      relationships,
      hubCompact,
      provenance,
    },
    writes: {
      lDrive: false,
      zDrive: false,
      supabase:
        mode === 'shared-dev-hub'
          ? hubPublication?.executed === true
            ? 'SHARED_DEV_HUB_WRITTEN'
            : 'PLANNED_NOT_EXECUTED'
          : false,
    },
    hubPublication,
    verdict:
      mode === 'shared-dev-hub'
        ? hubPublication?.verdict ?? 'INGEST_SHARED_DEV_STRUCTURAL_PASS'
        : 'INGEST_DRY_RUN_PASS',
  };

  const dryRun = mode === 'dry-run' || mode === 'shared-dev-hub';
  const writeResult = writeDryRunArtifacts({
    ledger,
    derivedObjects,
    relationships,
    hubCompact,
    provenance,
    receipt,
    dryRun,
    outputRoot: outputRoot ?? undefined,
  });
  receipt.outputDir = writeResult.outputDir;
  receipt.writesPerformed = writeResult.writesPerformed;
  receipt.writeScope = writeResult.writeScope ?? null;

  return receipt;
}
