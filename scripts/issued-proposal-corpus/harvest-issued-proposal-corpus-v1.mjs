#!/usr/bin/env node
/**
 * Regenerate issued proposal corpus artifacts from Z: sample PDFs.
 * @see harvest-issued-proposal-corpus-v1.py
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const py = path.join(__dirname, 'harvest-issued-proposal-corpus-v1.py');
const result = spawnSync('python3', [py], { stdio: 'inherit', encoding: 'utf8' });
process.exit(result.status ?? 1);
