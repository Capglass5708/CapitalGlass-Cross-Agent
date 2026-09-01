/**
 * COLD READ-BACK verification of one replication leg.
 *
 * Designed to be run in a SEPARATE PROCESS after the writer has finished, with
 * no writer state of any kind in scope. That is the entire point: everything
 * the writer believes about a replication is exactly what a failed replication
 * also looks like from the writer's side.
 *
 * NONE of the following is accepted as evidence here, individually or together:
 *   the worker reported success · rsync/copy exited 0 · the path exists ·
 *   the receipt says replicated · a file with the right name is present ·
 *   the OTHER leg verified.
 *
 * What IS accepted: bytes read from the mount in this process, re-hashed here,
 * whose length and digest equal the values recorded in the immutable ledger
 * entry, AND which decrypt to the plaintext identity that same entry claims.
 * A hash-correct object sitting under the wrong entry's locator is a FAIL --
 * being able to find SOME valid object is not the same as having replicated
 * THIS one.
 *
 * Each leg is judged completely independently. One leg's result is never an
 * input to the other's, because the failure mode worth catching is the one
 * where a single healthy destination masks a silent second one.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';

import { sha256Prefixed, objectStorePath } from './canonical.mjs';
import { decryptObject } from './crypto.mjs';
import { computeEntryHash, entryFileName, ENTRY_DIR, scanEntries } from './ledger.mjs';
import { resolveMountAuthority, MOUNT_AUTHORITY } from './mount-transport.mjs';

export const RESULT = { PASS: 'PASS', FAIL: 'FAIL', NOT_PROVEN: 'NOT_PROVEN' };
export const PRESENCE = { YES: 'YES', NO: 'NO' };
export const REPLICATION = { VERIFIED: 'VERIFIED', FAIL: 'FAIL', NOT_PROVEN: 'NOT_PROVEN' };

/** Load an entry straight from the immutable layer. No index, no cache. */
export function loadEntryCold(vaultRoot, entryHash) {
  const p = path.join(vaultRoot, ENTRY_DIR, entryFileName(entryHash));
  if (!existsSync(p)) return { found: false, reason: 'ENTRY_NOT_FOUND' };
  const entry = JSON.parse(readFileSync(p, 'utf8'));
  const recomputed = computeEntryHash(entry, entry.prevHash);
  return { found: true, entry, entryPath: p, entryHashValid: recomputed === entry.entryHash && entry.entryHash === entryHash };
}

/**
 * Verify ONE leg.
 *
 * `legName` selects which locator in the entry is authoritative for this leg.
 * The object is located from THAT locator -- never by globbing the mount for a
 * file that looks right, which would let any object anywhere satisfy the proof.
 */
export function verifyLegReadback({ entry, legName, mountpoint, key = null, procPath = '/proc/self/mountinfo' }) {
  const observedAt = new Date().toISOString();
  const out = {
    leg: legName, mountpoint, observedAt,
    MOUNT_AUTHORITY: MOUNT_AUTHORITY.NOT_PROVEN,
    OBJECT_PRESENT: PRESENCE.NO,
    HASH_READBACK: RESULT.NOT_PROVEN,
    LEDGER_BINDING: RESULT.NOT_PROVEN,
    REPLICATION: REPLICATION.NOT_PROVEN,
    mount: null, locator: null, expected: null, observed: null, binding: null, reasons: [],
  };

  // 1. Mount authority, resolved live in THIS process.
  const mount = resolveMountAuthority(mountpoint, { procPath });
  out.mount = {
    mountpoint: mount.mountpoint, isMountpoint: mount.isMountpoint, fstype: mount.fstype,
    source: mount.source, windowsPath: mount.windowsPath, readable: mount.readable,
    entryCount: mount.entryCount, observedAt: mount.observedAt, reasons: mount.reasons,
  };
  out.MOUNT_AUTHORITY = mount.authority;
  if (mount.authority !== MOUNT_AUTHORITY.VERIFIED) {
    out.reasons.push('MOUNT_AUTHORITY_NOT_PROVEN');
    out.REPLICATION = REPLICATION.NOT_PROVEN;
    return out;
  }

  // 2. Locate the object from AUTHORITATIVE replication metadata.
  const locator = entry?.storageLocator?.[legName] ?? null;
  const expectedCiphertextHash = entry?.encryption?.ciphertextHash ?? null;
  const expectedLength = entry?.encryption?.ciphertextByteLength ?? null;
  out.locator = locator ? { rootId: locator.rootId, host: locator.host, transport: locator.transport, path: locator.path } : null;
  out.expected = { ciphertextHash: expectedCiphertextHash, ciphertextByteLength: expectedLength, contentHash: entry?.contentHash ?? null };

  if (!locator || !locator.path) {
    out.reasons.push('NO_REPLICATION_PATH_RECORDED_FOR_THIS_LEG');
    out.REPLICATION = REPLICATION.NOT_PROVEN;
    return out;
  }
  if (!expectedCiphertextHash) {
    out.reasons.push('ENTRY_RECORDS_NO_CIPHERTEXT_HASH');
    out.REPLICATION = REPLICATION.NOT_PROVEN;
    return out;
  }

  // The recorded path must be the CONTENT ADDRESS of the recorded ciphertext.
  // A locator pointing somewhere else is a mis-association, not a near miss.
  const expectedSuffix = objectStorePath(expectedCiphertextHash);
  if (!String(locator.path).endsWith(expectedSuffix)) {
    out.reasons.push('RECORDED_PATH_IS_NOT_THE_CONTENT_ADDRESS_OF_THE_RECORDED_CIPHERTEXT');
    out.REPLICATION = REPLICATION.FAIL;
    return out;
  }

  const abs = path.join(mountpoint, locator.path);
  if (!existsSync(abs)) {
    out.OBJECT_PRESENT = PRESENCE.NO;
    out.reasons.push('OBJECT_ABSENT_AT_RECORDED_PATH');
    out.REPLICATION = REPLICATION.FAIL;
    return out;
  }
  out.OBJECT_PRESENT = PRESENCE.YES;

  // 3. COLD READ from the mount. Not the spool, not the source, not a buffer.
  let bytes;
  try { bytes = readFileSync(abs); } catch (e) {
    out.reasons.push(`OBJECT_UNREADABLE:${e?.code ?? 'ERR'}`);
    out.REPLICATION = REPLICATION.FAIL;
    return out;
  }

  // 4. Recompute hash AND length from those bytes.
  const observedHash = sha256Prefixed(bytes);
  const observedLength = bytes.length;
  out.observed = { ciphertextHash: observedHash, ciphertextByteLength: observedLength, absolutePath: abs, statSize: safeSize(abs) };
  const hashOk = observedHash === expectedCiphertextHash;
  const lengthOk = expectedLength === null ? null : observedLength === expectedLength;
  if (!hashOk) out.reasons.push('CIPHERTEXT_HASH_MISMATCH_AT_DESTINATION');
  if (lengthOk === false) out.reasons.push('CIPHERTEXT_BYTE_LENGTH_MISMATCH_AT_DESTINATION');
  if (lengthOk === null) out.reasons.push('ENTRY_RECORDS_NO_CIPHERTEXT_LENGTH_TO_COMPARE');
  out.HASH_READBACK = hashOk && lengthOk === true ? RESULT.PASS : RESULT.FAIL;

  // 5. Bind back to entryHash, contentHash and source identity.
  const binding = {
    entryHash: entry.entryHash,
    entryHashRecomputed: computeEntryHash(entry, entry.prevHash),
    entryHashValid: computeEntryHash(entry, entry.prevHash) === entry.entryHash,
    evidenceId: entry.evidenceId ?? null,
    sourceNativeId: entry.sourceNativeId ?? null,
    sourceSystem: entry.sourceSystem ?? null,
    relativePath: entry.sourceObservation?.relativePath ?? null,
    legRootIdMatchesLocator: Boolean(locator.rootId),
    plaintextIdentityProven: null,
    plaintextHashObserved: null,
  };

  if (key && hashOk) {
    // The strongest binding available: decrypt the bytes that were actually on
    // the mount and confirm they reconstruct the SOURCE identity the entry
    // claims. Without this, a correct ciphertext filed under the wrong entry
    // would pass every earlier check.
    try {
      const plaintext = decryptObject({ blob: bytes, key, aad: {} });
      const ph = sha256Prefixed(plaintext);
      binding.plaintextHashObserved = ph;
      binding.plaintextIdentityProven = ph === entry.contentHash;
      binding.plaintextByteLength = plaintext.length;
      if (!binding.plaintextIdentityProven) out.reasons.push('DECRYPTED_PLAINTEXT_DOES_NOT_MATCH_ENTRY_CONTENT_HASH');
    } catch (e) {
      binding.plaintextIdentityProven = false;
      out.reasons.push('REPLICATED_OBJECT_FAILED_AUTHENTICATED_DECRYPTION');
    }
  } else if (!key) {
    out.reasons.push('NO_KEY_SUPPLIED_PLAINTEXT_IDENTITY_BINDING_NOT_ATTEMPTED');
  }
  out.binding = binding;

  const bindingOk = binding.entryHashValid
    && binding.legRootIdMatchesLocator
    && binding.plaintextIdentityProven === true;
  out.LEDGER_BINDING = binding.plaintextIdentityProven === null
    ? RESULT.NOT_PROVEN
    : (bindingOk ? RESULT.PASS : RESULT.FAIL);

  out.REPLICATION = (out.HASH_READBACK === RESULT.PASS && out.LEDGER_BINDING === RESULT.PASS)
    ? REPLICATION.VERIFIED
    : (out.HASH_READBACK === RESULT.FAIL || out.LEDGER_BINDING === RESULT.FAIL ? REPLICATION.FAIL : REPLICATION.NOT_PROVEN);
  return out;
}

function safeSize(p) { try { return statSync(p).size; } catch { return null; } }

/**
 * Both legs, side by side, each judged alone.
 *
 * `bothVerified` requires BOTH. It is stated explicitly rather than reduced to
 * an average or a count so that no reader can mistake one green leg for
 * replication.
 */
export function verifyBothLegs({ vaultRoot, entryHash, legs, key = null, procPath = '/proc/self/mountinfo' }) {
  const loaded = loadEntryCold(vaultRoot, entryHash);
  if (!loaded.found) {
    return { entryHash, entryFound: false, reason: loaded.reason, legs: {}, bothVerified: false };
  }
  const results = {};
  for (const [legName, mountpoint] of Object.entries(legs)) {
    results[legName] = verifyLegReadback({ entry: loaded.entry, legName, mountpoint, key, procPath });
  }
  const values = Object.values(results);
  return {
    entryHash,
    entryFound: true,
    entryHashValid: loaded.entryHashValid,
    contentHash: loaded.entry.contentHash,
    evidenceId: loaded.entry.evidenceId,
    durabilityStateRecorded: loaded.entry.durabilityState,
    legs: results,
    // Success on one never substitutes for the other.
    bothVerified: values.length === 2 && values.every((r) => r.REPLICATION === REPLICATION.VERIFIED),
    perLegSummary: Object.fromEntries(Object.entries(results).map(([k, r]) => [k, {
      MOUNT_AUTHORITY: r.MOUNT_AUTHORITY, OBJECT_PRESENT: r.OBJECT_PRESENT,
      HASH_READBACK: r.HASH_READBACK, LEDGER_BINDING: r.LEDGER_BINDING, REPLICATION: r.REPLICATION,
    }])),
    // Kept adjacent so two green legs cannot quietly become an immutability claim.
    STORAGE_IMMUTABILITY_AUTHORITY: {
      status: 'NOT_PROVEN',
      reasons: [
        'DRVFS_CHMOD_UNSUPPORTED_WRITE_ONCE_NOT_ENFORCEABLE_BY_FILE_MODE_ON_THIS_ROUTE',
        'NO_WORM_SNAPSHOT_OR_OFF_BOX_RETENTION_AUTHORITY_PROVEN_SEPARATELY',
      ],
      note: 'Read-back proves the bytes arrived and can be recovered intact. It does not prove they cannot be altered. This stays NOT_PROVEN even with both legs VERIFIED.',
    },
  };
}
