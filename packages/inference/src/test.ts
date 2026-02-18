/**
 * @aiql-org/inference — Test Suite
 * Tests: forward chaining, backward chaining, unification, consistency, proofs
 */

import { InferenceEngine } from './inference.js';
import { Tokenizer } from '@aiql-org/core';
import { Parser } from '@aiql-org/core';
import * as AST from '@aiql-org/core';

function parseAIQL(code: string): AST.Program {
  const tokenizer = new Tokenizer(code);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e: unknown) {
    console.log(`❌ ${name}`);
    const message = e instanceof Error ? e.message : String(e);
    console.log(`   Error: ${message}`);
    failed++;
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

console.log('\n=== @aiql-org/inference Tests ===\n');

// =============================================================================
// Basic Setup
// =============================================================================
console.log('--- Basic Setup ---');

test('InferenceEngine: Initialize with empty program', () => {
  const program = parseAIQL('');
  const engine = new InferenceEngine(program);
  assert(engine.getKnowledgeBase().length === 0, 'Should have empty KB');
});

test('InferenceEngine: Initialize with facts', () => {
  const program = parseAIQL('!Assert { <Socrates> [is] <Man> }');
  const engine = new InferenceEngine(program);
  assert(engine.getKnowledgeBase().length === 1, 'Should have 1 fact');
});

test('InferenceEngine: Add facts dynamically', () => {
  const program = parseAIQL('');
  const engine = new InferenceEngine(program);
  engine.addFromAIQL('!Assert { <A> [is] <B> }');
  assert(engine.getKnowledgeBase().length === 1, 'Should have 1 fact after adding');
});

// =============================================================================
// Modus Ponens
// =============================================================================
console.log('\n--- Modus Ponens ---');

test('Modus Ponens: Simple derivation', () => {
  const code = `
    !Assert { <Socrates> [is] <Man> }
    !Assert { <Socrates> [is] <Man> } implies !Assert { <Socrates> [is] <Mortal> }
  `;
  const program = parseAIQL(code);
  const engine = new InferenceEngine(program);
  const derived = engine.forwardChain(10);
  assert(derived.length > 0, 'Should derive new facts');
});

test('Modus Ponens: Multiple steps', () => {
  const code = `
    !Assert { <A> [p] <B> }
    !Assert { <A> [p] <B> } implies !Assert { <C> [q] <D> }
    !Assert { <C> [q] <D> } implies !Assert { <E> [r] <F> }
  `;
  const program = parseAIQL(code);
  const engine = new InferenceEngine(program);
  const derived = engine.forwardChain(50);
  assert(derived.length >= 2, 'Should derive multiple steps');
});

// =============================================================================
// Modus Tollens
// =============================================================================
console.log('\n--- Modus Tollens ---');

test('Modus Tollens: Basic derivation', () => {
  const code = `
    not !Assert { <Y> [is] <Mortal> }
    !Assert { <X> [is] <Man> } implies !Assert { <Y> [is] <Mortal> }
  `;
  const program = parseAIQL(code);
  const engine = new InferenceEngine(program);
  const derived = engine.forwardChain(10);
  assert(derived.length > 0, 'Should derive negation');
});

// =============================================================================
// Hypothetical Syllogism
// =============================================================================
console.log('\n--- Hypothetical Syllogism ---');

test('Hypothetical Syllogism: Chain implications', () => {
  const code = `
    !Assert { <A> [p] <B> } implies !Assert { <C> [q] <D> }
    !Assert { <C> [q] <D> } implies !Assert { <E> [r] <F> }
  `;
  const program = parseAIQL(code);
  const engine = new InferenceEngine(program);
  const derived = engine.forwardChain(10);
  let foundChain = false;
  for (const fact of derived) {
    if (AST.isLogicalExpression(fact) && fact.operator === 'implies') {
      foundChain = true;
      break;
    }
  }
  assert(foundChain, 'Should derive chained implication');
});

// =============================================================================
// Disjunctive Syllogism
// =============================================================================
console.log('\n--- Disjunctive Syllogism ---');

test('Disjunctive Syllogism: Eliminate left disjunct', () => {
  const code = `
    !Assert { <A> [p] <B> } or !Assert { <C> [q] <D> }
    not !Assert { <A> [p] <B> }
  `;
  const program = parseAIQL(code);
  const engine = new InferenceEngine(program);
  const derived = engine.forwardChain(10);
  assert(derived.length > 0, 'Should eliminate left and keep right');
});

// =============================================================================
// Conjunction
// =============================================================================
console.log('\n--- Conjunction Elimination ---');

test('Conjunction Elimination: Extract both conjuncts', () => {
  const code = '!Assert { <A> [p] <B> } and !Assert { <C> [q] <D> }';
  const program = parseAIQL(code);
  const engine = new InferenceEngine(program);
  const derived = engine.forwardChain(10);
  assert(derived.length >= 2, 'Should extract both conjuncts');
});

// =============================================================================
// Forward Chaining
// =============================================================================
console.log('\n--- Forward Chaining ---');

test('Forward Chaining: Derive all consequences', () => {
  const code = `
    !Assert { <Base> [fact] <1> }
    !Assert { <Base> [fact] <1> } implies !Assert { <Derived> [fact] <2> }
    !Assert { <Derived> [fact] <2> } implies !Assert { <Final> [fact] <3> }
  `;
  const program = parseAIQL(code);
  const engine = new InferenceEngine(program);
  const derived = engine.forwardChain(50);
  assert(derived.length >= 2, 'Should derive chain of facts');
});

test('Forward Chaining: No infinite loops', () => {
  const code = `
    !Assert { <A> [p] <B> }
    !Assert { <A> [p] <B> } implies !Assert { <A> [p] <B> }
  `;
  const program = parseAIQL(code);
  const engine = new InferenceEngine(program);
  const derived = engine.forwardChain(100);
  assert(derived.length < 100, 'Should avoid infinite loops');
});

// =============================================================================
// Backward Chaining
// =============================================================================
console.log('\n--- Backward Chaining ---');

test('Backward Chaining: Prove fact in KB', () => {
  const program = parseAIQL('!Assert { <Socrates> [is] <Man> }');
  const engine = new InferenceEngine(program);
  const goal = program.body[0];
  const proof = engine.backwardChain(goal);
  assert(proof !== null, 'Should prove existing fact');
  if (proof) assert(proof.valid === true, 'Proof should be valid');
});

test('Backward Chaining: Fail on unprovable goal', () => {
  const program = parseAIQL('!Assert { <A> [p] <B> }');
  const engine = new InferenceEngine(program);
  const goalProgram = parseAIQL('!Assert { <Unprovable> [fact] <X> }');
  const goal = goalProgram.body[0];
  const proof = engine.backwardChain(goal);
  assert(proof === null, 'Should fail on unprovable goal');
});

// =============================================================================
// Unification
// =============================================================================
console.log('\n--- Unification ---');

test('Unification: Identical nodes unify', () => {
  const program = parseAIQL('!Assert { <A> [p] <B> }');
  const engine = new InferenceEngine(program);
  const substitution = engine.unify(program.body[0], program.body[0]);
  assert(substitution !== null, 'Identical nodes should unify');
});

test('Unification: Different nodes don\'t unify', () => {
  const program1 = parseAIQL('!Assert { <A> [p] <B> }');
  const program2 = parseAIQL('!Query { <C> [q] <D> }');
  const engine = new InferenceEngine(program1);
  const substitution = engine.unify(program1.body[0], program2.body[0]);
  assert(substitution === null, 'Different intents should not unify');
});

// =============================================================================
// Consistency
// =============================================================================
console.log('\n--- Consistency Checking ---');

test('Consistency: Consistent KB passes', () => {
  const code = `
    !Assert { <A> [p] <B> }
    !Assert { <C> [q] <D> }
  `;
  const program = parseAIQL(code);
  const engine = new InferenceEngine(program);
  const result = engine.checkConsistency();
  assert(result.consistent, 'Consistent KB should pass');
  assert(result.contradictions.length === 0, 'Should have no contradictions');
});

test('Consistency: Direct contradiction detected', () => {
  const code = `
    !Assert { <A> [p] <B> }
    not !Assert { <A> [p] <B> }
  `;
  const program = parseAIQL(code);
  const engine = new InferenceEngine(program);
  const result = engine.checkConsistency();
  assert(!result.consistent, 'Should detect contradiction');
  assert(result.contradictions.length > 0, 'Should report contradiction');
});

// =============================================================================
// Proof Construction
// =============================================================================
console.log('\n--- Proof Construction ---');

test('Proof: Prove simple fact', () => {
  const program = parseAIQL('!Assert { <Socrates> [is] <Man> }');
  const engine = new InferenceEngine(program);
  const goal = program.body[0];
  const result = engine.prove(goal);
  assert(result.provable, 'Should prove existing fact');
  assert(result.proof !== undefined, 'Should provide proof');
});

test('Proof: Fail on unprovable fact', () => {
  const program = parseAIQL('!Assert { <A> [p] <B> }');
  const engine = new InferenceEngine(program);
  const goalProgram = parseAIQL('!Assert { <Unprovable> [x] <Y> }');
  const goal = goalProgram.body[0];
  const result = engine.prove(goal);
  assert(!result.provable, 'Should not prove unprovable fact');
  assert(result.proof === undefined, 'Should not provide proof');
});

// =============================================================================
// Integration
// =============================================================================
console.log('\n--- Integration ---');

test('Integration: Multi-step reasoning', () => {
  const code = `
    !Assert { <A> [rel1] <B> }
    !Assert { <A> [rel1] <B> } implies !Assert { <C> [rel2] <D> }
    !Assert { <C> [rel2] <D> } implies !Assert { <E> [rel3] <F> }
    !Assert { <E> [rel3] <F> } implies !Assert { <G> [rel4] <H> }
  `;
  const program = parseAIQL(code);
  const engine = new InferenceEngine(program);
  const derived = engine.forwardChain(100);
  assert(derived.length >= 3, 'Should derive multi-step chain');
});

test('Integration: Combined forward and backward', () => {
  const code = `
    !Assert { <Base> [fact] <1> }
    !Assert { <Base> [fact] <1> } implies !Assert { <Mid> [fact] <2> }
    !Assert { <Mid> [fact] <2> } implies !Assert { <Final> [fact] <3> }
  `;
  const program = parseAIQL(code);
  const engine = new InferenceEngine(program);
  engine.forwardChain(50);
  const goalProgram = parseAIQL('!Assert { <Final> [fact] <3> }');
  const goal = goalProgram.body[0];
  const proof = engine.backwardChain(goal);
  assert(proof !== null || engine.getKnowledgeBase().length > 3, 
    'Should combine forward and backward reasoning');
});

// =============================================================================
// Edge Cases
// =============================================================================
console.log('\n--- Edge Cases ---');

test('Edge: Empty knowledge base', () => {
  const program = parseAIQL('');
  const engine = new InferenceEngine(program);
  const derived = engine.forwardChain(10);
  assert(derived.length === 0, 'Empty KB should derive nothing');
});

test('Edge: Self-referential implication', () => {
  const code = '!Assert { <A> [p] <B> } implies !Assert { <A> [p] <B> }';
  const program = parseAIQL(code);
  const engine = new InferenceEngine(program);
  const derived = engine.forwardChain(10);
  assert(derived.length < 10, 'Should handle self-reference');
});

// =============================================================================
// Attribute Querying (v2.7.0)
// =============================================================================
console.log('\n--- Attribute Querying ---');

test('Attribute Query: Unify variable in attribute', () => {
  // Fact: Bell invented Telephone in 1876
  const factCode = '!Assert { <Bell> [invented] <Telephone> { year: 1876 } }';
  // Query: Who invented Telephone in what year?
  const queryCode = '!Query { <?Inventor> [invented] <Telephone> { year: <?Year> } }';
  
  const program = parseAIQL(factCode);
  const engine = new InferenceEngine(program);
  
  const query = parseAIQL(queryCode).body[0];
  if (!AST.isIntent(query)) throw new Error("Query parsed incorrectly");
  
  // Find fact
  const facts = engine.getKnowledgeBase().filter(AST.isIntent);
  assert(facts.length === 1, "Should have 1 fact");
  
  // Unify
  const substitution = engine.unify(query, facts[0]);
  assert(substitution !== null, "Should unify with attribute variable");
  
  if (substitution) {
      // ?Inventor binds to <Bell> (Concept name includes brackets)
      const inventor = substitution.get("<?Inventor>");
      assert(inventor === "<Bell>", `Inventor should be <Bell>, got '${inventor}'`);
      
      // ?Year binds to "1876" (stringified number)
      const year = substitution.get("<?Year>");
      assert(year === "1876", `Year should be "1876", got '${year}'`);
  }
});

test('Attribute Query: Fail on mismatching attribute', () => {
    const factCode = '!Assert { <A> [b] <C> { year: 1999 } }';
    const queryCode = '!Query { <A> [b] <C> { year: 2000 } }';
    
    const program = parseAIQL(factCode);
    const engine = new InferenceEngine(program);
    const query = parseAIQL(queryCode).body[0];
    
    const facts = engine.getKnowledgeBase().filter(AST.isIntent);
    const substitution = engine.unify(query as AST.Intent, facts[0]);
    assert(substitution === null, "Should fail when attributes don't match");
});

// =============================================================================
// Summary
// =============================================================================
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);
console.log(`Failed: ${failed}`); // Redundant log removed in replacement
if (failed > 0) process.exit(1);
