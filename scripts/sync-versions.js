#!/usr/bin/env node

/**
 * Sync version across all workspace packages.
 *
 * Usage: node scripts/sync-versions.js [version]
 *
 * If no version is provided, uses the root package.json version.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(__dirname, '..');

// Read root version
const rootPkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'));
const targetVersion = process.argv[2] || rootPkg.version;

console.log(`📦 Syncing all packages to version: ${targetVersion}\n`);

const packagesDir = join(root, 'packages');
const packages = readdirSync(packagesDir).filter(name => {
  const pkgPath = join(packagesDir, name, 'package.json');
  try { statSync(pkgPath); return true; } catch { return false; }
});

let updated = 0;

for (const name of packages) {
  const pkgPath = join(packagesDir, name, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  pkg.version = targetVersion;

  // Update internal @aiql/* dependency versions
  for (const depType of ['dependencies', 'peerDependencies', 'devDependencies']) {
    if (pkg[depType]) {
      for (const [dep] of Object.entries(pkg[depType])) {
        if (dep.startsWith('@aiql-org/')) {
          pkg[depType][dep] = `^${targetVersion}`;
        }
      }
    }
  }

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`  ✅ ${pkg.name}: ${oldVersion} → ${targetVersion}`);
  updated++;
}

// Update root
rootPkg.version = targetVersion;
writeFileSync(join(root, 'package.json'), JSON.stringify(rootPkg, null, 2) + '\n');

console.log(`\n🎯 Updated ${updated} packages + root to ${targetVersion}`);
