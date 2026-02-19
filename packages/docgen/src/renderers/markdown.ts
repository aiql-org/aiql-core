import { DocPage, DocClass, DocRule, DocTask,
  DocConsensus,
  DocCoordinate,
  DocIntent } from '../types.js';

export class MarkdownRenderer {
  render(doc: DocPage): string {
    const lines: string[] = [];

    const classes = doc.items.filter(i => i.type === 'class') as DocClass[];
    const rules = doc.items.filter(i => i.type === 'rule') as DocRule[];
    const tasks = doc.items.filter(i => i.type === 'task') as DocTask[];
    const consensus = doc.items.filter(i => i.type === 'consensus') as DocConsensus[];
    const coordinate = doc.items.filter(i => i.type === 'coordinate') as DocCoordinate[];
    const intents = doc.items.filter(i => i.type === 'intent') as DocIntent[];

    // 1. Title
    lines.push(`# ${doc.title}\n`);

    // 2. Table of Contents
    lines.push(`## Table of Contents`);
    if (classes.length) lines.push(`- [Classes](#classes)`);
    if (rules.length) lines.push(`- [Rules](#rules)`);
    if (tasks.length) lines.push(`- [Tasks](#tasks)`);
    if (consensus.length || coordinate.length) lines.push(`- [Swarm Protocols](#swarm-protocols)`);
    if (intents.length) lines.push(`- [Intents](#intents)`);
    lines.push(`- [Knowledge Graph](#knowledge-graph)\n`);

    // 3. Knowledge Graph
    if (doc.graph && doc.graph.nodes.length > 0) {
      lines.push(`## Knowledge Graph\n`);
      lines.push('```mermaid');
      lines.push('graph TD');
      doc.graph.nodes.forEach(n => {
        // Simple shape based on type
        const shape = n.type === 'class' ? '([' + n.label + '])' : '[' + n.label + ']';
        lines.push(`  ${n.id}${shape}`);
      });
      doc.graph.edges.forEach(e => {
         lines.push(`  ${e.source} -->|${e.label}| ${e.target}`);
      });
      lines.push('```\n');
    }

    // 4. Classes
    if (classes.length > 0) {
      lines.push(`## Classes\n`);
      classes.forEach(c => lines.push(this.renderClass(c)));
    }

    // 5. Rules
    if (rules.length > 0) {
      lines.push(`## Rules\n`);
      rules.forEach(r => lines.push(this.renderRule(r)));
    }

    // 6. Tasks
    if (tasks.length > 0) {
      lines.push(`## Tasks\n`);
      tasks.forEach(t => lines.push(this.renderTask(t)));
    }

    // 7. Swarm Protocols
    if (consensus.length > 0 || coordinate.length > 0) {
      lines.push(`## Swarm Protocols\n`);
      consensus.forEach(c => lines.push(this.renderConsensus(c)));
      coordinate.forEach(c => lines.push(this.renderCoordinate(c)));
    }

    // 8. General Intents
    if (intents.length > 0) {
      lines.push(`## Intents\n`);
      intents.forEach(i => lines.push(this.renderIntent(i)));
    }

    return lines.join('\n');
  }

  private renderClass(doc: DocClass): string {
    const lines = [`### Class: ${doc.name}`];
    if (doc.superClass) lines.push(`**Inherits from:** \`${doc.superClass}\`\n`);
    
    if (doc.properties.length > 0) {
      lines.push(`#### Properties`);
      lines.push(`| Property | Attributes |`);
      lines.push(`| --- | --- |`);
      doc.properties.forEach(p => {
        const attrs = p.attributes ? JSON.stringify(p.attributes) : '-';
        lines.push(`| \`${p.name}\` | ${attrs} |`);
      });
      lines.push('');
    }
    return lines.join('\n');
  }

  private renderRule(doc: DocRule): string {
    return [
      `### Rule: ${doc.name}`,
      `**Confidence:** ${doc.confidence || 'N/A'}`,
      `**Premise:**`,
      `\`\`\``,
      doc.premise,
      `\`\`\``,
      `**Conclusion:**`,
      `\`\`\``,
      doc.conclusion,
      `\`\`\`\n`
    ].join('\n');
  }

  private renderTask(doc: DocTask): string {
    return [
      `### Task: ${doc.name}`,
      `**ID:** \`${doc.id}\``,
      `**Priority:** ${doc.priority || '-'}`,
      `**Mode:** ${doc.mode || '-'}`,
      `#### Steps`,
      ...doc.steps.map((s, i) => `${i + 1}. **${s.relation}** ${s.object} (Subject: ${s.subject})`),
      '\n'
    ].join('\n');
  }

  private renderConsensus(doc: DocConsensus): string {
    return [
      `### Consensus: ${doc.topic}`,
      `**Type:** Consensus Protocol`,
      `**Threshold:** ${doc.threshold}`,
      `**Participants:** ${doc.participants.join(', ')}`,
      '\n'
    ].join('\n');
  }

  private renderCoordinate(doc: DocCoordinate): string {
    return [
      `### Coordinate: ${doc.goal}`,
      `**Type:** Coordination Protocol`,
      `**Strategy:** ${doc.strategy}`,
      `**Participants:** ${doc.participants.join(', ')}`,
      '\n'
    ].join('\n');
  }

  private renderIntent(doc: DocIntent): string {
    return [
      `### Intent: ${doc.name}`,
      `**Type:** ${doc.intentType}`,
      `#### Statements`,
      ...doc.statements.map((s, i) => `${i + 1}. **${s.relation}** ${s.object} (Subject: ${s.subject})`),
      '\n'
    ].join('\n');
  }
}
