/**
 * Pre-admission secret detector proofs.
 *
 * EVERY credential-shaped string in this file is SYNTHETIC. None of them is, or
 * has ever been, a real credential for any system. They exist to trip a
 * detector, and the values are random strings generated once for this file.
 *
 * Two things are proven here and they matter in different ways:
 *   1. the detector FIRES  -- otherwise a credential reaches the immutable
 *      archive and rotation cannot undo it;
 *   2. the detector never EMITS what it found -- otherwise the control that was
 *      supposed to contain the leak becomes the leak.
 *
 * The second is tested by searching every byte of every returned object, error
 * and serialised form for the matched value. A detector that reports its
 * finding by quoting it has not contained anything.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { randomInt } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';

import {
  scanText, scanBuffer, scanFile, summarise, assertEmissionClean,
  shannonEntropy, looksHighEntropy, isLikelyPlaceholder, charClasses,
  VERDICT, SEVERITY, REDACTED, DETECTORS,
} from '../context-ledger/lib/secret-detector.mjs';

// --- SYNTHETIC credential material, CONSTRUCTED AT RUNTIME ---
//
// No credential-shaped LITERAL lives in this file any more. Each sample is
// assembled per run from two parts that are not the same kind of thing:
//
//   1. the issuer's PUBLIC FORMAT MARKER -- 'ghp_', 'AKIA', 'dp.st.', a PEM
//      header line. These are published documentation, carry no entropy, and
//      are the exact bytes the structural detectors key on. They stay literal.
//      Randomising them is what made earlier attempts stop firing: a mask that
//      rewrites 'AKIA' has destroyed the only thing the rule matches.
//   2. the ENTROPY, drawn from the issuer's own alphabet at the issuer's own
//      length. In a real token this is the only part that is ever secret, and
//      here it is the only part that is generated.
//
// The literals that used to sit here were provably synthetic -- 21 of 26 shared
// 12+ character runs ACROSS DIFFERENT PROVIDERS (anthropic and bearer shared 44
// consecutive characters), and independent issuers cannot collide like that. But
// "provably synthetic" is an argument and push protection reads bytes, so the
// fix is to stop shipping the bytes. An allowlist entry would have silenced the
// scanner rather than satisfied it, which is the same defect class as a field
// that asserts a measurement nothing recomputes.
//
// Every constructor is PROVED against the live registry before the suite uses
// it: mint() refuses any value that does not actually trip the rule it names,
// so a fixture cannot quietly stop proving what its name says it proves. The
// detector is never adjusted to fit a fixture -- that would invert the test.
const LOWER = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)).join('');
const UPPER = LOWER.toUpperCase();
const DIGIT = Array.from({ length: 10 }, (_, i) => String(i)).join('');
const ALNUM = `${LOWER}${UPPER}${DIGIT}`;
const UPPER_DIGIT = `${UPPER}${DIGIT}`;
const HEX = `${DIGIT}${LOWER.slice(0, 6)}`;
const B64 = `${ALNUM}+/`;
const B64URL = `${ALNUM}-_`;

/** n characters from `alphabet`, CSPRNG-drawn. Entropy only -- never a prefix. */
function ent(alphabet, n) {
  let out = '';
  for (let i = 0; i < n; i += 1) out += alphabet[randomInt(alphabet.length)];
  return out;
}
/**
 * n characters with all three alphanumeric classes GUARANTEED present.
 *
 * The three CONTEXTUAL detectors (bearer, env assignment, structured field) are
 * not structural: they gate on looksHighEntropy(), which demands charClasses()
 * >= 3. A free 24-character draw omits digits entirely about 1.5% of the time,
 * so a plain random constructor would leave a rare, real miss behind -- not a
 * flake in the test, a fixture that genuinely stopped exercising its rule.
 * Forcing the classes makes the shape deterministic without moving the gate.
 */
function entMixed(n) {
  const chars = [LOWER, UPPER, DIGIT].map((a) => a[randomInt(a.length)]);
  while (chars.length < n) chars.push(ALNUM[randomInt(ALNUM.length)]);
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
/** A real base64url JWT segment, so the shape is honest rather than merely regex-shaped. */
const seg = (obj) => Buffer.from(JSON.stringify(obj), 'utf8').toString('base64url');
const uuidish = () => [8, 4, 4, 4, 12].map((n) => ent(HEX, n)).join('-');

/**
 * One explicit constructor per provider. `rule` is the detector this shape
 * exists to exercise; `make` builds a value matching that rule's regex exactly
 * -- issuer alphabet, issuer length, issuer prefix.
 */
const CONSTRUCTORS = {
  github: { rule: 'github-token', make: () => `ghp_${ent(ALNUM, 36)}` },
  githubPat: { rule: 'github-fine-grained-pat', make: () => `github_pat_${ent(ALNUM, 22)}_${ent(ALNUM, 59)}` },
  aws: { rule: 'aws-access-key-id', make: () => `AKIA${ent(UPPER_DIGIT, 16)}` },
  awsSecret: { rule: 'aws-secret-access-key', make: () => `aws_secret_access_key = ${ent(B64, 40)}` },
  doppler: { rule: 'doppler-token', make: () => `dp.st.dev.${ent(ALNUM, 40)}` },
  supabaseSbp: { rule: 'supabase-access-token', make: () => `sbp_${ent(HEX, 40)}` },
  jwt: {
    rule: 'jwt-token',
    make: () => [
      seg({ alg: 'HS256', typ: 'JWT' }),
      seg({ sub: ent(ALNUM, 12), role: 'anon', iat: 1767225600 }),
      ent(B64URL, 43),
    ].join('.'),
  },
  anthropic: { rule: 'anthropic-api-key', make: () => `sk-ant-api03-${ent(B64URL, 93)}AA` },
  openai: { rule: 'openai-api-key', make: () => `sk-proj-${ent(ALNUM, 48)}` },
  google: { rule: 'google-api-key', make: () => `AIza${ent(ALNUM, 35)}` },
  slack: { rule: 'slack-token', make: () => `xoxb-${ent(DIGIT, 13)}-${ent(DIGIT, 13)}-${ent(ALNUM, 24)}` },
  stripe: { rule: 'stripe-secret-key', make: () => `sk_live_${ent(ALNUM, 24)}` },
  npm: { rule: 'npm-access-token', make: () => `npm_${ent(ALNUM, 36)}` },
  sendgrid: { rule: 'sendgrid-api-key', make: () => `SG.${ent(ALNUM, 22)}.${ent(ALNUM, 43)}` },
  twilio: { rule: 'twilio-api-key', make: () => `SK${ent(HEX, 32)}` },
  cloudflareToken: { rule: 'cloudflare-api-token', make: () => `CLOUDFLARE_API_TOKEN=${ent(ALNUM, 40)}` },
  cloudflareGlobal: { rule: 'cloudflare-global-api-key', make: () => `cf_api_key: ${ent(HEX, 37)}` },
  railway: { rule: 'railway-token', make: () => `RAILWAY_TOKEN=${uuidish()}` },
  vercel: { rule: 'vercel-token', make: () => `VERCEL_TOKEN=${ent(ALNUM, 24)}` },
  pem: {
    rule: 'private-key-pem-block',
    make: () => `-----BEGIN RSA PRIVATE KEY-----\n${ent(B64, 64)}\n${ent(B64, 64)}\n-----END RSA PRIVATE KEY-----`,
  },
  openssh: {
    rule: 'private-key-pem-block',
    make: () => `-----BEGIN OPENSSH PRIVATE KEY-----\n${ent(B64, 64)}\n-----END OPENSSH PRIVATE KEY-----`,
  },
  connString: {
    rule: 'connection-string-credentials',
    make: () => `postgresql://cgapp:${ent(ALNUM, 24)}@db.internal:5432/cgapp`,
  },
  bearer: { rule: 'authorization-bearer-token', make: () => `Authorization: Bearer ${entMixed(48)}` },
  basic: {
    rule: 'authorization-basic-credentials',
    make: () => `authorization: Basic ${Buffer.from(`cgapp:${ent(ALNUM, 18)}`, 'utf8').toString('base64')}`,
  },
  envAssign: { rule: 'env-credential-assignment', make: () => `DATABASE_PASSWORD=${entMixed(24)}` },
  jsonField: { rule: 'structured-credential-field', make: () => `{"api_key":"${entMixed(32)}"}` },
};

const RULE_BY_ID = new Map(DETECTORS.map((d) => [d.id, d]));

/**
 * Build a sample and prove it trips the rule it claims -- through scanText, so
 * the pattern AND the placeholder/entropy acceptance path both have to agree.
 * A constructor that drifts out of format fails loudly at load time instead of
 * silently producing a fixture that proves nothing.
 *
 * The retry loop is not slack in the check. It covers one narrow case: a random
 * draw can land the substring 'fake' or 'example' inside its own entropy, and
 * the detector then suppresses it as a deliberate placeholder -- correctly, and
 * about 6 times in 100_000. Redrawing is the honest response; loosening
 * isLikelyPlaceholder to accommodate a fixture would invert the test. Sixty-four
 * failures in a row means the constructor is genuinely wrong, and that throws.
 */
function mint(name, { rule, make }) {
  if (!RULE_BY_ID.has(rule)) throw new Error(`fixture ${name} names a detector that does not exist: ${rule}`);
  for (let attempt = 0; attempt < 64; attempt += 1) {
    const sample = make();
    if (scanText(sample).some((f) => f.detectorId === rule)) return sample;
  }
  throw new Error(`fixture ${name} never tripped ${rule}: the constructor no longer matches the detector`);
}

const SYN = Object.fromEntries(
  Object.entries(CONSTRUCTORS).map(([name, spec]) => [name, mint(name, spec)]),
);

const ALL_VALUES = Object.values(SYN);

function extractSecretish(text) {
  // The longest credential-looking run in the sample, used to prove it is
  // absent from output. Coarse on purpose: over-matching makes the leak test
  // stricter, never weaker.
  return (text.match(/[A-Za-z0-9_\-+/=.]{16,}/g) ?? []).sort((a, b) => b.length - a.length)[0] ?? text;
}

test('every synthetic credential sample trips at least one detector', () => {
  const missed = [];
  for (const [name, sample] of Object.entries(SYN)) {
    const r = scanBuffer(Buffer.from(sample, 'utf8'));
    if (r.verdict !== VERDICT.SECRET_DETECTED) missed.push(name);
  }
  assert.deepEqual(missed, [], `undetected credential shapes reach the immutable archive: ${missed.join(', ')}`);
});

test('the required detector families are all present and firing', () => {
  const expect = {
    github: 'github-token',
    githubPat: 'github-fine-grained-pat',
    aws: 'aws-access-key-id',
    awsSecret: 'aws-secret-access-key',
    doppler: 'doppler-token',
    supabaseSbp: 'supabase-access-token',
    jwt: 'jwt-token',
    pem: 'private-key-pem-block',
    connString: 'connection-string-credentials',
    bearer: 'authorization-bearer-token',
    basic: 'authorization-basic-credentials',
    cloudflareToken: 'cloudflare-api-token',
    cloudflareGlobal: 'cloudflare-global-api-key',
    railway: 'railway-token',
    vercel: 'vercel-token',
    envAssign: 'env-credential-assignment',
    jsonField: 'structured-credential-field',
  };
  for (const [k, detectorId] of Object.entries(expect)) {
    const r = scanBuffer(Buffer.from(SYN[k], 'utf8'));
    assert.ok(r.detectorIds.includes(detectorId), `${k} should trip ${detectorId}, got ${r.detectorIds.join(',')}`);
  }
});

test('NO detector output ever contains the matched value, in any form', () => {
  for (const sample of ALL_VALUES) {
    const needle = extractSecretish(sample);
    const r = scanBuffer(Buffer.from(sample, 'utf8'));
    const serialised = JSON.stringify({
      findings: r.findings, detectorIds: r.detectorIds, countsByDetector: r.countsByDetector,
      verdict: r.verdict, highestSeverity: r.highestSeverity, findingCount: r.findingCount,
    });
    assert.ok(!serialised.includes(needle), 'detector output leaked the matched value');
    // Not even a fragment: any 12-char window of the secret must be absent.
    for (let i = 0; i + 12 <= needle.length; i += 4) {
      assert.ok(!serialised.includes(needle.slice(i, i + 12)), 'detector output leaked a fragment of the matched value');
    }
    for (const f of r.findings) {
      assert.deepEqual(Object.keys(f).sort(), ['detectorId', 'length', 'offset', 'redacted', 'severity']);
      assert.equal(f.redacted, REDACTED);
      assert.equal(typeof f.offset, 'number');
      assert.ok(f.length > 0);
    }
  }
});

test('offsets and lengths point AT the value, so remediation is possible without disclosure', () => {
  const prefix = 'config file line 1\nGITHUB_TOKEN=';
  const text = `${prefix}${SYN.github}\ntrailing`;
  const r = scanBuffer(Buffer.from(text, 'utf8'));
  const f = r.findings.find((x) => x.detectorId === 'github-token');
  assert.ok(f, 'github token must be found');
  assert.equal(text.slice(f.offset, f.offset + f.length), SYN.github, 'offset/length must bracket the value exactly');
});

test('ordinary prose, code and documentation do not trip the detector', () => {
  const clean = [
    'The Builder lane holds the only mutation authority for this worktree.',
    'export const KEY_REF = process.env.CONTEXT_LEDGER_EVIDENCE_KEY;',
    'Set API_KEY=${DOPPLER_MANAGED_VALUE} before running the migration.',
    'const token = "<your-token-here>";',
    'password: changeme',
    'AWS_SECRET_ACCESS_KEY=REDACTED',
    'contentHash: sha256:9f3a7c21b58d04e6297fb1c8a05d3e74629bc10f9f3a7c21b58d04e6297fb1c8',
    'A monkey typed on a keyboard for a very long time indeed and produced nothing.',
    '{"apiKeyName":"prod","apiKeyRotatedAt":"2026-08-31T00:00:00.000Z"}',
    'PASSWORD=xxxxxxxxxxxxxxxxxx',
  ];
  for (const c of clean) {
    const r = scanBuffer(Buffer.from(c, 'utf8'));
    assert.equal(r.verdict, VERDICT.CLEAN, `false positive on: ${c.slice(0, 60)} -> ${r.detectorIds.join(',')}`);
  }
});

// Generated, not stored. The previous literal here came from the obsolete
// fixture alphabet and was the last residue of it in this file. The test needs
// a HIGH-ENTROPY, non-placeholder value -- not any particular value.
//
// VALIDATED AT CONSTRUCTION, for the same reason mint() validates its tokens: a
// free random draw does not GUARANTEE it clears the entropy threshold or avoids
// looking like a placeholder. A first version of this used a bare entMixed(24)
// and was flaky at roughly 8 percent -- the literal it replaced happened to be
// high-entropy, and randomness does not inherit that property. Asserting the
// property at construction is what makes the replacement equivalent.
const HIGH_ENTROPY_SAMPLE = (() => {
  for (let i = 0; i < 200; i += 1) {
    const c = entMixed(24);
    if (looksHighEntropy(c) && !isLikelyPlaceholder(c) && shannonEntropy(c) > 4.0) return c;
  }
  throw new Error('HIGH_ENTROPY_SAMPLE_CONSTRUCTION_FAILED');
})();

test('entropy heuristic separates random values from names and prose', () => {
  assert.ok(shannonEntropy('aaaaaaaaaaaaaaaaaaaa') < 0.1);
  assert.ok(shannonEntropy(HIGH_ENTROPY_SAMPLE) > 4.0);
  assert.equal(charClasses('abc'), 1);
  assert.equal(charClasses('Abc1-'), 4);

  assert.equal(looksHighEntropy(HIGH_ENTROPY_SAMPLE), true);
  assert.equal(looksHighEntropy('the_quick_brown_fox_jumps'), false);
  assert.equal(looksHighEntropy('short'), false);
  assert.equal(looksHighEntropy('${SOME_TEMPLATE_VARIABLE}'), false);

  assert.equal(isLikelyPlaceholder('changeme'), true);
  assert.equal(isLikelyPlaceholder('<your-token>'), true);
  assert.equal(isLikelyPlaceholder('process.env.SECRET'), true);
  assert.equal(isLikelyPlaceholder('xxxxxxxxxxxx'), true);
  assert.equal(isLikelyPlaceholder(HIGH_ENTROPY_SAMPLE), false);
});

test('a secret straddling a streaming chunk boundary is still detected', async () => {
  // Without overlapping chunks this is a silent false negative that gets MORE
  // likely as files get bigger -- i.e. exactly on the largest transcripts.
  const dir = mkdtempSync(path.join(os.tmpdir(), 'secret-chunk-'));
  try {
    const CHUNK = 4 * 1024 * 1024;
    const filler = `${'a'.repeat(CHUNK - 20)}\n`;   // token must start on a word boundary
    const file = path.join(dir, 'straddle.txt');
    writeFileSync(file, `${filler}${SYN.github}\n${'b'.repeat(1024)}`);
    const r = await scanFile(file);
    assert.equal(r.verdict, VERDICT.SECRET_DETECTED, 'a token spanning the chunk boundary must not be missed');
    assert.ok(r.detectorIds.includes('github-token'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('scanFile reports scanned bytes matching the file size', async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'secret-size-'));
  try {
    const file = path.join(dir, 'clean.md');
    const body = '# Clean document\n\nNothing sensitive here at all.\n';
    writeFileSync(file, body);
    const r = await scanFile(file);
    assert.equal(r.verdict, VERDICT.CLEAN);
    assert.equal(r.scannedBytes, Buffer.byteLength(body));
    assert.equal(r.findingCount, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('the emission guard refuses to write an artifact that would carry a secret', () => {
  assert.throws(
    () => assertEmissionClean({ note: 'diagnostic', value: SYN.github }, 'receipt'),
    (e) => e.message === 'EMISSION_WOULD_LEAK_SECRET'
      && e.detectorIds.includes('github-token')
      && !JSON.stringify(e).includes(SYN.github),   // the refusal must not leak it either
    'an artifact describing a leak must not become the leak',
  );
  assert.deepEqual(assertEmissionClean({ detectorId: 'github-token', offset: 12, length: 40, redacted: REDACTED }, 'ok'), { clean: true, label: 'ok' });
});

test('severity is assigned and the summary reflects the worst finding', () => {
  const r = scanBuffer(Buffer.from(`${SYN.pem}\n${SYN.jwt}`, 'utf8'));
  assert.equal(r.highestSeverity, SEVERITY.CRITICAL);
  assert.ok(r.findingCount >= 2);
  assert.deepEqual(summarise([]).verdict, VERDICT.CLEAN);
  assert.equal(summarise([]).highestSeverity, null);
});

test('detector registry is well formed: unique ids, global patterns, declared severity', () => {
  const ids = DETECTORS.map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate detector ids would make counts ambiguous');
  for (const d of DETECTORS) {
    assert.ok(d.pattern instanceof RegExp, `${d.id} needs a RegExp`);
    assert.ok(d.pattern.flags.includes('g'), `${d.id} must be global or it finds only the first match`);
    assert.ok(Object.values(SEVERITY).includes(d.severity), `${d.id} needs a declared severity`);
  }
});

test('scanText offsets are absolute when a baseOffset is supplied', () => {
  const r = scanText(`GITHUB_TOKEN=${SYN.github}`, { baseOffset: 1000 });
  assert.ok(r.length > 0);
  for (const f of r) assert.ok(f.offset >= 1000, 'chunked scans must report absolute file offsets');
});
