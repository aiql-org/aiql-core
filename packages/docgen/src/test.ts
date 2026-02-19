
import { DocExtractor } from './extractor.js';
import { MarkdownRenderer } from './renderers/markdown.js';
import { Tokenizer, Parser } from '@aiql-org/core';

const code = `
!DefineClass(name:TestAgent) {
  <TestAgent> [has_capability] <Reasoning>
  <TestAgent> [has_property] <Memory>
}
`;

try {
  console.log('Testing DocExtractor...');
  const tokenizer = new Tokenizer(code);
  const parser = new Parser(tokenizer.tokenize());
  const ast = parser.parse();

  const extractor = new DocExtractor();
  const doc = extractor.extract(ast, 'Test Doc');


  if (doc.items.length !== 1) {
    throw new Error(`Expected 1 item, got ${doc.items.length}`);
  }

  if (doc.items[0].name !== 'TestAgent') {
    throw new Error(`Expected TestAgent, got ${doc.items[0].name}`);
  }

  console.log('Testing MarkdownRenderer...');
  const renderer = new MarkdownRenderer();
  const md = renderer.render(doc);

  if (!md.includes('# Test Doc')) {
    throw new Error('Markdown missing title');
  }

  console.log('✅ DocGen tests passed');
} catch (e) {
  console.error('❌ DocGen tests failed:', e);
  process.exit(1);
}
