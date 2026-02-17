import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Tokenizer } from '../src/tokenizer.js';
import { Parser } from '../src/parser.js';

describe('AIQL Examples Verification', () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const examplesDir = path.join(__dirname, '../../../examples');

    it('should parse math_physics.aiql without error', () => {
        const filePath = path.join(examplesDir, 'math_physics.aiql');
        if (!fs.existsSync(filePath)) {
            assert.fail(`Example file not found: ${filePath}`);
        }
        
        const code = fs.readFileSync(filePath, 'utf-8');
        const tokens = new Tokenizer(code).tokenize();
        const parser = new Parser(tokens);
        
        try {
            const ast = parser.parse();
            assert.ok(ast.body.length > 0);
            assert.strictEqual(ast.body[0].type, 'Intent');
        } catch (error) {
            assert.fail(`Failed to parse math_physics.aiql: ${error}`);
        }
    });

    it('should check for new features usage', () => {
         const filePath = path.join(examplesDir, 'math_physics.aiql');
         const code = fs.readFileSync(filePath, 'utf-8');
         assert.ok(code.includes('lambda'), 'Example should use lambda');
         assert.ok(code.includes('sin('), 'Example should use functions');
         assert.ok(code.includes('union'), 'Example should use sets');
    });
});
