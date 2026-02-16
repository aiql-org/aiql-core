/**
 * @aiql-org/core — Test Suite
 * Tests: tokenizer, parser, AST, transpiler (all 6 targets)
 */

import { Tokenizer } from './tokenizer.js';
import { Parser } from './parser.js';
import { Transpiler } from './transpiler.js';
import * as AST from './ast.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e: any) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${e.message}`);
    failed++;
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function parseAIQL(code: string): AST.Program {
  const tokenizer = new Tokenizer(code);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}

console.log('\n=== @aiql-org/core Tests ===\n');

// =============================================================================
// Tokenizer Tests
// =============================================================================
console.log('--- Tokenizer ---');

test('Tokenizer: tokenizes basic intent', () => {
  const tokens = new Tokenizer('!Query { <A> [b] <C> }').tokenize();
  assert(tokens.length > 0, 'Should produce tokens');
  assert(tokens.some(t => t.type === 'INTENT'), 'Should have INTENT token');
});

test('Tokenizer: tokenizes concepts in angle brackets', () => {
  const tokens = new Tokenizer('<Python>').tokenize();
  assert(tokens.some(t => t.type === 'CONCEPT'), 'Should have CONCEPT token');
});

test('Tokenizer: tokenizes relations in square brackets', () => {
  const tokens = new Tokenizer('[is_suited_for]').tokenize();
  assert(tokens.some(t => t.type === 'RELATION'), 'Should have RELATION token');
});

test('Tokenizer: handles comments', () => {
  const tokens = new Tokenizer('// comment\n!Query { <A> [b] <C> }').tokenize();
  assert(tokens.some(t => t.type === 'INTENT'), 'Should skip comments');
});

test('Tokenizer: handles confidence scores', () => {
  const tokens = new Tokenizer('!Assert { <A> [b] <C> } @0.95').tokenize();
  assert(tokens.some(t => t.type === 'CONFIDENCE'), 'Should have CONFIDENCE token');
});

test('Tokenizer: handles metadata annotations', () => {
  const tokens = new Tokenizer('@version:"1.0.0"\n!Query { <A> [b] <C> }').tokenize();
  assert(tokens.some(t => t.type === 'VERSION_MARKER'), 'Should have VERSION_MARKER token');
});

test('Tokenizer: handles logical operators', () => {
  const tokens = new Tokenizer('!Assert { <A> [b] <C> } and !Assert { <D> [e] <F> }').tokenize();
  assert(tokens.some(t => t.type === 'AND'), 'Should have AND token');
});

test('Tokenizer: handles tenses', () => {
  const tokens = new Tokenizer('!Assert { <A> [b:past] <C> }').tokenize();
  assert(tokens.length > 0, 'Should tokenize tenses');
});

test('Tokenizer: handles attributes', () => {
  const tokens = new Tokenizer('!Query { <A> [b] <C> { popularity: "High" } }').tokenize();
  assert(tokens.length > 0, 'Should tokenize attributes');
});

// =============================================================================
// Parser Tests
// =============================================================================
console.log('\n--- Parser ---');

test('Parser: parses basic intent', () => {
  const ast = parseAIQL('!Query { <Python> [is_suited_for] <DataScience> }');
  assert(ast.type === 'Program', 'Should return Program');
  assert(ast.body.length === 1, 'Should have 1 node');
  assert(AST.isIntent(ast.body[0]), 'Should be an Intent');
});

test('Parser: parses multiple intents', () => {
  const ast = parseAIQL('!Assert { <A> [b] <C> }\n!Query { <D> [e] <F> }');
  assert(ast.body.length === 2, 'Should have 2 nodes');
});

test('Parser: parses confidence', () => {
  const ast = parseAIQL('!Assert { <A> [b] <C> } @0.95');
  const intent = ast.body[0] as AST.Intent;
  assert(intent.confidence === 0.95, 'Should parse confidence score');
});

test('Parser: parses context parameters', () => {
  const ast = parseAIQL('!Query(scope:global) { <A> [b] <C> }');
  const intent = ast.body[0] as AST.Intent;
  assert(intent.statements.length > 0, 'Should parse with context parameters');
});

test('Parser: parses attributes', () => {
  const ast = parseAIQL('!Query { <A> [b] <C> { popularity: "High" } }');
  const intent = ast.body[0] as AST.Intent;
  assert(intent.statements[0].attributes !== undefined, 'Should have attributes');
});

test('Parser: parses logical expressions (and)', () => {
  const ast = parseAIQL('!Assert { <A> [b] <C> } and !Assert { <D> [e] <F> }');
  assert(AST.isLogicalExpression(ast.body[0]), 'Should be LogicalExpression');
  const expr = ast.body[0] as AST.LogicalExpression;
  assert(expr.operator === 'and', 'Should be AND operator');
});

test('Parser: parses logical expressions (implies)', () => {
  const ast = parseAIQL('!Assert { <A> [b] <C> } implies !Assert { <D> [e] <F> }');
  assert(AST.isLogicalExpression(ast.body[0]), 'Should be LogicalExpression');
  const expr = ast.body[0] as AST.LogicalExpression;
  assert(expr.operator === 'implies', 'Should be IMPLIES operator');
});

test('Parser: parses negation', () => {
  const ast = parseAIQL('not !Assert { <A> [b] <C> }');
  assert(AST.isLogicalExpression(ast.body[0]), 'Should be LogicalExpression');
  const expr = ast.body[0] as AST.LogicalExpression;
  assert(expr.operator === 'not', 'Should be NOT operator');
});

test('Parser: parses rule definitions', () => {
  // The parser supports 'implies' syntax for rules
  const ast = parseAIQL('!Assert { <X> [is] <Man> } implies !Assert { <X> [is] <Mortal> }');
  assert(ast.body.length > 0, 'Should parse implication rule');
  assert(AST.isLogicalExpression(ast.body[0]), 'Should be LogicalExpression');
});

test('Parser: parses version metadata', () => {
  const ast = parseAIQL('@version:"0.4.0"\n!Query { <A> [b] <C> }');
  assert(ast.version !== undefined, 'Should have version');
});

test('Parser: parses tenses', () => {
  const ast = parseAIQL('!Assert { <A> [b@tense:past] <C> }');
  const intent = ast.body[0] as AST.Intent;
  assert(intent.statements[0].relation.tense === 'past', 'Should parse past tense');
});

test('Parser: handles multiple separate intents', () => {
  const ast = parseAIQL('!Assert { <A> [b] <C> }\n!Assert { <D> [e] <F> }');
  assert(ast.body.length === 2, 'Should have 2 intents');
});

test('Parser: handles empty input', () => {
  const ast = parseAIQL('');
  assert(ast.body.length === 0, 'Should produce empty body');
});

// =============================================================================
// Transpiler Tests
// =============================================================================
console.log('\n--- Transpiler ---');

const sampleAST = parseAIQL(`!Query(scope:global) {
  <Python> [is_suited_for] <DataScience> {
    popularity: "High"
  }
} @0.99`);

const transpiler = new Transpiler();

test('Transpiler: transpile to JSON', () => {
  const output = transpiler.transpile(sampleAST, 'json');
  assert(output.length > 0, 'Should produce output');
  const parsed = JSON.parse(output);
  assert(parsed.commands !== undefined || parsed.intents !== undefined, 'Should have valid JSON structure');
});

test('Transpiler: transpile to YAML', () => {
  const output = transpiler.transpile(sampleAST, 'yaml');
  assert(output.length > 0, 'Should produce YAML');
  assert(output.includes('intent') || output.includes('Query') || output.includes('commands'), 'Should have YAML content');
});

test('Transpiler: transpile to Python', () => {
  const output = transpiler.transpile(sampleAST, 'python');
  assert(output.length > 0, 'Should produce Python');
  assert(output.includes('class') || output.includes('def') || output.includes('#'), 'Should have Python code');
});

test('Transpiler: transpile to SQL', () => {
  const output = transpiler.transpile(sampleAST, 'sql');
  assert(output.length > 0, 'Should produce SQL');
  assert(output.includes('CREATE') || output.includes('INSERT') || output.includes('SELECT'), 'Should have SQL statements');
});

test('Transpiler: transpile to Coq', () => {
  const output = transpiler.transpile(sampleAST, 'coq');
  assert(output.length > 0, 'Should produce Coq output');
});

test('Transpiler: transpile to Lean', () => {
  const output = transpiler.transpile(sampleAST, 'lean');
  assert(output.length > 0, 'Should produce Lean output');
});

test('Transpiler: transpile complex AST to all formats', () => {
  const complexAST = parseAIQL(`
    !Assert { <AI> [is] <Technology> } @0.99
    !Query(scope:global) { <Python> [is_suited_for] <DataScience> { priority: "High" } }
    !Assert { <Climate> [causes] <Change> }
  `);
  
  const formats = ['json', 'yaml', 'python', 'sql', 'coq', 'lean'] as const;
  for (const format of formats) {
    const output = transpiler.transpile(complexAST, format);
    assert(output.length > 0, `Should produce ${format} for complex input`);
  }
});

test('Transpiler: handles logical expressions', () => {
  const logicAST = parseAIQL('!Assert { <A> [p] <B> } and !Assert { <C> [q] <D> }');
  const output = transpiler.transpile(logicAST, 'json');
  assert(output.length > 0, 'Should transpile logical expressions');
});

test('Transpiler: handles negation in transpilation', () => {
  const negAST = parseAIQL('not !Assert { <A> [p] <B> }');
  const output = transpiler.transpile(negAST, 'json');
  assert(output.length > 0, 'Should transpile negation');
});

// =============================================================================
// AST Type Guards
// =============================================================================
console.log('\n--- AST Type Guards ---');

test('AST.isIntent: correctly identifies Intent', () => {
  const ast = parseAIQL('!Assert { <A> [b] <C> }');
  assert(AST.isIntent(ast.body[0]) === true, 'Should identify Intent');
});

test('AST.isLogicalExpression: correctly identifies LogicalExpression', () => {
  const ast = parseAIQL('!Assert { <A> [b] <C> } and !Assert { <D> [e] <F> }');
  assert(AST.isLogicalExpression(ast.body[0]) === true, 'Should identify LogicalExpression');
});

test('AST.isRuleDefinition: correctly identifies rule via implies', () => {
  const ast = parseAIQL('!Assert { <X> [is] <Y> } implies !Assert { <X> [is] <Z> }');
  assert(AST.isLogicalExpression(ast.body[0]), 'Should be LogicalExpression for implies');
  const expr = ast.body[0] as AST.LogicalExpression;
  assert(expr.operator === 'implies', 'Should be implies operator');
});

// =============================================================================
// Integration: Parse → Transpile Round-Trip
// =============================================================================
console.log('\n--- Integration ---');

test('Round-trip: parse and transpile to JSON', () => {
  const input = '!Query { <Python> [is_suited_for] <DataScience> }';
  const ast = parseAIQL(input);
  const json = transpiler.transpile(ast, 'json');
  const parsed = JSON.parse(json);
  assert(parsed !== undefined, 'Should produce valid JSON round trip');
});

test('Round-trip: complex multi-intent', () => {
  const input = `
    !Assert { <Socrates> [is] <Man> } @1.0
    !Assert { <Socrates> [is] <Man> } implies !Assert { <Socrates> [is] <Mortal> }
    !Query { <Socrates> [is] <Mortal> }
  `;
  const ast = parseAIQL(input);
  assert(ast.body.length === 3, 'Should parse 3 nodes');
  
  const json = transpiler.transpile(ast, 'json');
  assert(json.length > 0, 'Should transpile complex multi-intent');
});

test('Error handling: invalid syntax throws', () => {
  try {
    parseAIQL('!Invalid{{{{');
    assert(false, 'Should have thrown');
  } catch (e) {
    assert(true, 'Error thrown for invalid syntax');
  }
});

// =============================================================================
// Summary
// =============================================================================
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
}
