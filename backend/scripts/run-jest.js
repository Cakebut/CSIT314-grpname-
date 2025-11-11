#!/usr/bin/env node
const { spawnSync } = require('child_process');

/**
 * run-jest.js
 * Helper wrapper so `npm run test` can accept dynamic file arguments in several forms:
 * - positional: npm run test -- tests/account.test.ts
 * - npm config: npm run test --test=tests/account.test.ts
 * - npm config via env: npm_config_test is honored when npm run forwards it
 *
 * Falls back to running `jest tests/` when no files are provided.
 */

function collectFiles() {
  const files = [];

  // 1) npm_config_test (when user runs: npm run test --test=path or npm run test -- --test=path)
  if (process.env.npm_config_test) {
    files.push(process.env.npm_config_test);
  }

  // 2) process.argv positional args (npm run test -- args)
  const argv = process.argv.slice(2);
  for (const a of argv) {
    if (!a) continue;
    if (a.startsWith('--test=')) {
      files.push(a.split('=')[1]);
    } else if (a === '--') {
      continue; // ignore
    } else if (a.startsWith('--')) {
      // skip other flags
      continue;
    } else {
      files.push(a);
    }
  }

  // Trim and normalize
  return files.map(f => (f || '').trim()).filter(Boolean);
}

const files = collectFiles();
const target = files.length ? files : ['tests'];

const jestArgs = [...target, '--runInBand', '--config', './jest.config.ts'];

console.log('[run-jest] Running jest with args:', jestArgs.join(' '));

const res = spawnSync('npx', ['jest', ...jestArgs], { stdio: 'inherit', shell: true });
if (res.error) {
  console.error('[run-jest] Failed to spawn jest:', res.error);
  process.exitCode = 1;
} else {
  process.exitCode = res.status || 0;
}
