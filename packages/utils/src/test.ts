/**
 * @aiql-org/utils — Test Suite
 */

import { readAiqlFile, writeOutput, discoverAiqlFiles, getTargetExtension, formatTargetName } from './index.js';
import * as fs from 'fs';
import * as path from 'path';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e: unknown) {
    failed++;
    console.error(`  ❌ ${name}: ${(e as Error).message}`);
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

console.log('\n=== @aiql-org/utils Tests ===\n');

const TEST_FILE = path.join(process.cwd(), 'temp_test_utils.aiql');

test('writeOutput: writes content to file', () => {
  writeOutput(TEST_FILE, 'Hello AIQL');
  assert(fs.existsSync(TEST_FILE), 'File should exist');
  assert(fs.readFileSync(TEST_FILE, 'utf-8') === 'Hello AIQL', 'Content should match');
});

test('readAiqlFile: reads content from file', () => {
  const content = readAiqlFile(TEST_FILE);
  assert(content === 'Hello AIQL', 'Should read correct content');
});

test('discoverAiqlFiles: finds .aiql files', () => {
  const files = discoverAiqlFiles(process.cwd());
  assert(files.length > 0, 'Should find files');
  assert(files.some(f => f.endsWith('temp_test_utils.aiql')), 'Should find created file');
});

test('getTargetExtension: returns correct extension', () => {
  assert(getTargetExtension('python') === '.py', 'Python extension correct');
  assert(getTargetExtension('json') === '.json', 'JSON extension correct');
  assert(getTargetExtension('unknown') === '.txt', 'Default extension correct');
});

test('formatTargetName: formats names correctly', () => {
  assert(formatTargetName('coq') === 'Coq (Gallina)', 'Coq name correct');
  assert(formatTargetName('python') === 'Python', 'Python name correct');
});

// Cleanup
if (fs.existsSync(TEST_FILE)) {
  fs.unlinkSync(TEST_FILE);
}

console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
}
