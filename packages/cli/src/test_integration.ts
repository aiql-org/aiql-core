import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_PATH = path.resolve(__dirname, '../dist/cli.js');

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

console.log('\n=== @aiql-org/cli Integration Tests ===\n');

// Ensure CLI is built
if (!fs.existsSync(CLI_PATH)) {
    console.error('CLI not built. Please run `npm run build` in packages/cli first.');
    process.exit(1);
}

(async () => {
    await test('CLI: --help works', async () => {
        const { stdout } = await execAsync(`node ${CLI_PATH} --help`);
        assert(stdout.includes('Usage: aiql'), 'Should show usage');
        assert(stdout.includes('transpile'), 'Should show transpile command');
    });

    await test('CLI: --version works', async () => {
        const { stdout } = await execAsync(`node ${CLI_PATH} --version`);
        assert(/\d+\.\d+\.\d+/.test(stdout.trim()), 'Should show version number');
    });

    // Create a temporary AIQL file for testing
    const testFile = 'temp_test.aiql';
    fs.writeFileSync(testFile, '!Query { <Python> [is] <Cool> }');

    await test('CLI: transpile works (JSON)', async () => {
        const { stdout } = await execAsync(`node ${CLI_PATH} transpile ${testFile} --target json`);
        const json = JSON.parse(stdout);
        assert(json.program !== undefined || json.body !== undefined, 'Should output valid JSON AST');
    });

    await test('CLI: transpile works (Python)', async () => {
        const { stdout } = await execAsync(`node ${CLI_PATH} transpile ${testFile} --target python`);
        assert(stdout.includes('class') || stdout.includes('def') || stdout.includes('#'), 'Should output Python code');
    });

    // Cleanup
    if (fs.existsSync(testFile)) fs.unlinkSync(testFile);

    console.log('\n=== Test Summary ===');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total:  ${passed + failed}`);

    if (failed > 0) process.exit(1);
})();
