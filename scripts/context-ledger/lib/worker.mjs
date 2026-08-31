/**
 * Phase 0 replication worker.
 *
 *   spool -> plaintextHash -> AES-256-GCM -> ciphertextHash -> envelope
 *         -> immutable ledger entry -> independent primary -> independent backup
 *         -> remote verification -> FULLY_PROTECTED
 *
 * The spool copy is NEVER deleted before FULLY_PROTECTED. PRIMARY_VERIFIED
 * alone does not authorise cleanup -- keeping the local copy through the second
 * leg is the entire reason the spool exists.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { sha256Prefixed, objectStorePath } from './canonical.mjs';
import { encryptObject, decryptObject, ALGORITHM, DEFAULT_KEY_VERSION, ENVELOPE_VERSION } from './crypto.mjs';
import { appendEntry } from './ledger.mjs';

export const STATE = {
  CAPTURED_LOCAL: 'CAPTURED_LOCAL',
  HASHED_ENCRYPTED: 'HASHED_ENCRYPTED',
  PRIMARY_VERIFIED: 'PRIMARY_VERIFIED',
  BACKUP_VERIFIED: 'BACKUP_VERIFIED',
  FULLY_PROTECTED: 'FULLY_PROTECTED',
  INTEGRITY_INCIDENT: 'INTEGRITY_INCIDENT',
};

export function spoolWrite(spoolRoot, plaintext) {
  const plaintextHash = sha256Prefixed(plaintext);
  const abs = path.join(spoolRoot, objectStorePath(plaintextHash));
  mkdirSync(path.dirname(abs), { recursive: true });
  if (!existsSync(abs)) writeFileSync(abs, plaintext);
  return { plaintextHash, spoolPath: abs, state: STATE.CAPTURED_LOCAL };
}

export function protectObject({
  plaintext, key, keyRef, spoolRoot, vaultRoot, metaRoot, primary, backup,
  sourceSystem = 'synthetic', sourceNativeId = null, machineId = 'CG-NIMO-01',
  aad = {}, keyVersion = DEFAULT_KEY_VERSION,
}) {
  const result = { state: STATE.CAPTURED_LOCAL, incidents: [], spoolEligibleForCleanup: false };

  // 1. spool first -- capture is fast and local, never gated on the network
  const { plaintextHash, spoolPath } = spoolWrite(spoolRoot, plaintext);
  Object.assign(result, { plaintextHash, spoolPath });

  // 2. encrypt BEFORE either destination sees anything
  const { blob, ciphertextHash, nonce, aadHash, aad: aadCanonical } =
    encryptObject({ plaintext, key, plaintextHash, aad, keyVersion });
  Object.assign(result, { ciphertextHash, algorithm: ALGORITHM, keyRef, nonce, aadHash, keyVersion });
  result.state = STATE.HASHED_ENCRYPTED;

  // 3. INDEPENDENT fan-out. Each adapter receives the same spool-derived blob.
  //    The backup leg never reads, derives from, or waits on the primary.
  const legs = { primary: { target: primary }, backup: { target: backup } };
  for (const [name, leg] of Object.entries(legs)) {
    try {
      leg.put = leg.target.put(ciphertextHash, blob);
      const v = leg.target.verify(ciphertextHash);       // re-hashed AT the destination
      leg.present = v.present;
      leg.hash = v.hash;
      leg.verified = v.present && v.hash === ciphertextHash;
      if (v.present && v.hash !== ciphertextHash) {
        result.incidents.push({ leg: name, code: 'REMOTE_HASH_MISMATCH', expected: ciphertextHash, observed: v.hash });
      }
    } catch (e) {
      leg.verified = false;
      leg.error = e.message;
      result.incidents.push({ leg: name, code: e.message });
    }
  }
  result.legs = legs;

  if (legs.primary.verified) result.state = STATE.PRIMARY_VERIFIED;
  if (legs.primary.verified && legs.backup.verified) result.state = STATE.BACKUP_VERIFIED;

  // A hash mismatch is an integrity incident, never a silent repair or retry.
  if (result.incidents.some((i) => i.code === 'REMOTE_HASH_MISMATCH')) result.state = STATE.INTEGRITY_INCIDENT;

  // 4. three-way equality is the ONLY thing that authorises FULLY_PROTECTED
  const allThreeMatch = Boolean(
    legs.primary.verified && legs.backup.verified &&
    legs.primary.hash === ciphertextHash && legs.backup.hash === ciphertextHash &&
    legs.primary.hash === legs.backup.hash,
  );
  result.allThreeMatch = allThreeMatch;
  result.ciphertextHashesIdentical = legs.primary.hash != null && legs.primary.hash === legs.backup.hash;
  if (allThreeMatch && result.state !== STATE.INTEGRITY_INCIDENT) result.state = STATE.FULLY_PROTECTED;

  // 5. immutable ledger entry
  const appended = appendEntry({
    vaultRoot, metaRoot,
    body: {
      evidenceId: `${sourceSystem}:${sourceNativeId ?? plaintextHash}`,
      sourceSystem, sourceNativeId, machineId,
      contentHash: plaintextHash,
      provenanceClass: 'DISCOVERED',
      encryption: {
        algorithm: ALGORITHM, envelopeVersion: ENVELOPE_VERSION, keyRef, keyVersion,
        plaintextHash, ciphertextHash, nonce, aad: aadCanonical, aadHash,
      },
      storageLocator: {
        spoolPath,
        primary: { rootId: primary.id, host: primary.host, path: legs.primary.put?.path ?? null, transport: primary.kind },
        backup: { rootId: backup.id, host: backup.host, path: legs.backup.put?.path ?? null, transport: backup.kind },
      },
      durabilityState: result.state,
      durabilityProof: {
        plaintextHash,
        primaryHash: legs.primary.hash ?? null,
        backupHash: legs.backup.hash ?? null,
        allThreeMatch,
        ciphertextHashesIdentical: result.ciphertextHashesIdentical,
      },
      propagationPolicy: { deletesPropagate: false, modificationsPropagate: false },
      chainIntegrity: { headTransition: 'COMPARE_AND_SWAP', seqAssignedUnderCas: true },
      transportRealRemote: { primary: primary.isRealRemote === true, backup: backup.isRealRemote === true },
    },
  });
  result.ledgerEntry = appended.entry;
  result.ledgerPath = appended.entryPath;
  result.duplicate = appended.duplicate;

  // 6. spool cleanup eligibility -- FULLY_PROTECTED only
  result.spoolEligibleForCleanup = result.state === STATE.FULLY_PROTECTED;
  return result;
}

/** Cleanup refuses on anything short of FULLY_PROTECTED. */
export function cleanupSpool(result) {
  if (result.state !== STATE.FULLY_PROTECTED) {
    const e = new Error('SPOOL_CLEANUP_FORBIDDEN'); e.state = result.state; throw e;
  }
  rmSync(result.spoolPath, { force: true });
  return { removed: true };
}

/**
 * Restore EXCLUSIVELY from one target. A backup is proven by reconstruction.
 *
 * Note the two hashes are NOT interchangeable and an earlier revision of this
 * function conflated them: the object is ADDRESSED by ciphertextHash (that is
 * what is on disk) but its IDENTITY is plaintextHash. Verifying the recovered
 * plaintext against the storage address always fails, and -- worse -- would
 * have made a correct restore look like corruption.
 */
export function restoreFrom(target, { ciphertextHash, plaintextHash, aad = {} }, key) {
  if (!ciphertextHash || !plaintextHash) {
    throw new TypeError('restoreFrom requires both ciphertextHash (address) and plaintextHash (identity)');
  }
  const blob = target.fetch(ciphertextHash);
  const storedHash = sha256Prefixed(blob);
  if (storedHash !== ciphertextHash) {
    const e = new Error('REMOTE_HASH_MISMATCH'); e.expected = ciphertextHash; e.observed = storedHash; throw e;
  }
  const plaintext = decryptObject({ blob, key, aad });   // GCM authenticates plaintext AND aad here
  const recoveredHash = sha256Prefixed(plaintext);
  return {
    plaintext, recoveredHash,
    matches: recoveredHash === plaintextHash,
    restoredFrom: target.id, verifiedCiphertext: true,
  };
}
