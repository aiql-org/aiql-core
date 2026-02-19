
import { DocPage, DocItem, DocClass, DocRule, DocTask } from '../types.js';

export class MarkdownRenderer {
  render(page: DocPage): string {
    const lines: string[] = [];
    
    // Header
    lines.push(`# ${page.title}`);
    lines.push('');
    
    if (page.graph && page.graph.nodes.length > 0) {
      lines.push('## 🧠 Knowledge Graph');
      lines.push('');
      lines.push('```mermaid');
      lines.push('graph TD');
      for (const edge of page.graph.edges) {
        lines.push(`    ${edge.source} -->|${edge.label}| ${edge.target}`);
      }
      lines.push('```');
      lines.push('');
    }

    // Items
    for (const item of page.items) {
      lines.push(`## ${this.getTypeIcon(item.type)} ${item.name}`);
      // Metadata
      if (item.metadata) {
          const meta = [];
          if (item.metadata.version) meta.push(`**Version:** ${item.metadata.version}`);
          if (item.metadata.origin) meta.push(`**Origin:** ${item.metadata.origin}`);
          if (meta.length) lines.push(meta.join(' | '));
          lines.push('');
      }

      if (item.type === 'class') {
        this.renderClass(item as DocClass, lines);
      } else if (item.type === 'rule') {
        this.renderRule(item as DocRule, lines);
      } else if (item.type === 'task') {
        this.renderTask(item as DocTask, lines);
      }
      
      lines.push('---');
      lines.push('');
    }

    return lines.join('\n');
  }

  private getTypeIcon(type: string): string {
    switch(type) {
      case 'class': return '📚';
      case 'rule': return '⚖️';
      case 'task': return '⚡';
      default: return '📄';
    }
  }

  private renderClass(doc: DocClass, lines: string[]) {
    if (doc.superClass) {
      lines.push(`**Superclass:** ${doc.superClass}`);
      lines.push('');
    }

    if (doc.properties.length > 0) {
      lines.push('| Property | Target | Attributes |');
      lines.push('|:---|:---|:---|');
      for (const prop of doc.properties) {
        const attrs = prop.attributes ? JSON.stringify(prop.attributes) : '-';
        lines.push(`| ${prop.name} | - | ${attrs} |`);
      }
      lines.push('');
    }
  }

  private renderRule(doc: DocRule, lines: string[]) {
    // Simplified literal rendering
    lines.push('```aiql');
    lines.push('// Logic representation placeholder');
    lines.push('```');
    lines.push('');
  }

  private renderTask(doc: DocTask, lines: string[]) {
    if (doc.steps.length > 0) {
       lines.push('| Subject | Relation | Object | Parameters |');
       lines.push('|:---|:---|:---|:---|');
       for (const step of doc.steps) {
         const params = step.parameters ? JSON.stringify(step.parameters) : '-';
         lines.push(`| ${step.subject} | \`[${step.relation}]\` | ${step.object} | ${params} |`);
       }
       lines.push('');
    }
  }
}
