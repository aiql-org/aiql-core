# @aiql-org/docgen

Semantic Documentation Generator for AIQL.
Extracts knowledge graphs, class definitions, rules, and workflows from AIQL code and renders them into beautiful Markdown or JSON.

## Features

- **Knowledge Extraction**: Parses AIQL AST to extract Classes, Concepts, Rules, and Tasks.
- **Graph Generation**: Automatically builds a Mermaid.js knowledge graph of your ontology.
- **Markdown Rendering**: Generates human-readable documentation with tables and icons.
- **Type Safe**: Fully typed with TypeScript.

## Usage

```typescript
import { Tokenizer, Parser } from '@aiql-org/core';
import { DocExtractor, MarkdownRenderer } from '@aiql-org/docgen';

const code = `
!DefineClass(name:Agent) {
  <Agent> [has_capability] <Reasoning>
}
`;

// 1. Parse AIQL
const tokenizer = new Tokenizer(code);
const parser = new Parser(tokenizer.tokenize());
const ast = parser.parse();

// 2. Extract Documentation Model
const extractor = new DocExtractor();
const doc = extractor.extract(ast, 'My Agent System');

// 3. Render to Markdown
const renderer = new MarkdownRenderer();
const markdown = renderer.render(doc);

console.log(markdown);
```
