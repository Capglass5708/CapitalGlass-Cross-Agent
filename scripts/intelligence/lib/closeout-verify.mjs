import fs from 'node:fs';
import { canonicalJsonBytes } from '../../harvest/lib/canonical-json.mjs';
import { hashFileContent, sha256Hex } from '../../harvest/lib/hash.mjs';
import { AUTHORITY_FINGERPRINT_VERSION } from './constants.mjs';

export function sha256FileHash(filePath) {
  const bytes = fs.readFileSync(filePath);
  return `sha256:${hashFileContent(bytes)}`;
}

export function normalizeHash(value) {
  if (!value) return null;
  return String(value).replace(/^sha256:/, '').toLowerCase();
}

export function verifyCloseoutHash({ closeoutPath, expectedHash }) {
  const actual = sha256FileHash(closeoutPath);
  const ok = normalizeHash(actual) === normalizeHash(expectedHash);
  return { ok, actualHash: actual, expectedHash };
}

export function buildAuthorityFingerprintV1({
  repo,
  workPackageId,
  missionClass,
  material,
  commitSha,
  closeoutHash,
  bibleHashAfter = null,
}) {
  const payload = {
    version: AUTHORITY_FINGERPRINT_VERSION,
    repo,
    workPackageId,
    missionClass,
    material: material === true,
    commitSha,
    closeoutHash,
    bibleHashAfter,
  };
  return `sha256:${sha256Hex(canonicalJsonBytes(payload))}`;
}

export function verifyAuthorityFingerprint({ handoff, closeout }) {
  const expected = buildAuthorityFingerprintV1({
    repo: handoff.source.repo,
    workPackageId: handoff.workPackageId,
    missionClass: handoff.mission.missionClass,
    material: handoff.mission.material,
    commitSha: handoff.source.commitSha,
    closeoutHash: handoff.closeoutHash,
    bibleHashAfter: closeout?.bibleStatus?.bibleHashAfter ?? closeout?.bibleCache?.bibleHashAfter ?? null,
  });
  const topOk = handoff.authorityFingerprint === expected;
  const sourceOk = handoff.source.authorityFingerprint === expected;
  return {
    ok: topOk && sourceOk,
    expected,
    actualTop: handoff.authorityFingerprint,
    actualSource: handoff.source.authorityFingerprint,
  };
}

export function loadCloseoutJson(closeoutPath) {
  return JSON.parse(fs.readFileSync(closeoutPath, 'utf8'));
}
