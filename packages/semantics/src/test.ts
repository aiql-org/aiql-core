/**
 * @aiql-org/semantics — Test Suite
 */

import { SemanticExplorer, SemanticGap } from './semantic-exploration.js';
// Mock InferenceEngine interface to avoid full dependency
interface MockInferenceEngine {
    // Basic shape needed by SemanticExplorer
    knowledgeBase: any[];
}

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

console.log('\n=== @aiql-org/semantics Tests ===\n');

test('SemanticExplorer: detects empty knowledge base', () => {
    const explorer = new SemanticExplorer();
    const mockKB: MockInferenceEngine = { knowledgeBase: [] };
    
    // With empty KB, it might not find gaps or find specific "empty" gaps
    const gaps = explorer.detectSemanticGaps(mockKB as any);
    assert(Array.isArray(gaps), 'Should return an array of gaps');
});

// Since we cannot easily construct a full InferenceEngine with valid AST nodes in this isolated test
// without importing @aiql-org/core and building complex objects, we will limit tests to
// basic instantiation and API surface verification for now.
// A full integration test would be better placed in a higher-level package.

test('SemanticExplorer: generates queries for gaps', () => {
    const explorer = new SemanticExplorer();
    const gap: SemanticGap = {
        gapType: 'connectivity',
        concept: 'Python',
        severity: 0.8,
        context: [],
        metrics: { statementCount: 0, averageConfidence: 0, inDegree: 0, outDegree: 0 }
    };
    
    // Mock InfereceEngine with minimal structure
    const mockKB: MockInferenceEngine = { knowledgeBase: [] };
    const queries = explorer.generateSemanticQueries(gap, mockKB as any);
    assert(queries.length > 0, 'Should generate queries');
    assert(queries[0].aiqlCode.includes('!Query'), 'Should generate AIQL Query intent');
    assert(queries[0].aiqlCode.includes('<Python>'), 'Should mention the concept');
});

test('SemanticExplorer: prioritizes gaps by severity', () => {
    const explorer = new SemanticExplorer();
    const gaps: SemanticGap[] = [
        { gapType: 'connectivity', concept: 'A', severity: 0.2, context: [], metrics: { statementCount: 0, averageConfidence: 0, inDegree: 0, outDegree: 0 } },
        { gapType: 'connectivity', concept: 'B', severity: 0.9, context: [], metrics: { statementCount: 0, averageConfidence: 0, inDegree: 0, outDegree: 0 } },
        { gapType: 'connectivity', concept: 'C', severity: 0.5, context: [], metrics: { statementCount: 0, averageConfidence: 0, inDegree: 0, outDegree: 0 } }
    ];
    
    // prioritizeGaps is public
    const prioritized = explorer.prioritizeGaps(gaps);
    assert(prioritized.length === 3, 'Should sort 3 gaps');
    assert(prioritized[0].concept === 'B', 'Highest severity should be first');
    assert(prioritized[1].concept === 'C', 'Medium severity should be second');
    assert(prioritized[2].concept === 'A', 'Lowest severity should be last');
});

console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
}
