
import { Program } from '@aiql-org/core';
import { DocExtractor } from './extractor.js';
import { MarkdownRenderer } from './renderers/markdown.js';

export * from './types.js';
export { DocExtractor } from './extractor.js';
export { MarkdownRenderer } from './renderers/markdown.js';

export function generateDocs(ast: Program, options: { format: 'markdown' } = { format: 'markdown' }): string {
  const extractor = new DocExtractor();
  const page = extractor.extract(ast);
  
  if (options.format === 'markdown') {
    const renderer = new MarkdownRenderer();
    return renderer.render(page);
  }
  
  throw new Error(`Unsupported format: ${options.format}`);
}
