
import { describe, it, expect } from 'vitest';
import { Tokenizer, Parser } from '@aiql-org/core';
import { DocExtractor } from '../src/extractor';

function parse(code: string) {
  const tokenizer = new Tokenizer(code);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}

import { DocClass, DocConsensus, DocCoordinate, DocIntent, DocTask } from '../src/types';

describe('DocExtractor', () => {
  const extractor = new DocExtractor();

  it('extracts class definitions', () => {
    const code = `
      !DefineClass(name:Agent) {
        <Agent> [has_capability] <Reasoning>
        <Agent> [has_property] <Memory>
      }
    `;
    const ast = parse(code);
    const doc = extractor.extract(ast);
    
    expect(doc.items).toHaveLength(1);
    const cls = doc.items[0] as DocClass;
    expect(cls.type).toBe('class');
    expect(cls.name).toBe('Agent');
    
    // Check properties
    expect(cls.properties).toHaveLength(2);
    expect(cls.properties).toContainEqual(expect.objectContaining({ name: '<Reasoning>' }));
    
    expect(doc.graph).toBeDefined();
    expect(doc.graph!.nodes).toContainEqual(expect.objectContaining({ id: 'Agent' }));
    expect(doc.graph!.nodes).toContainEqual(expect.objectContaining({ id: 'Reasoning' }));
    expect(doc.graph!.edges).toContainEqual(
      expect.objectContaining({ source: 'Agent', target: 'Reasoning', label: 'has_property' })
    );
  });

  it('extracts swarm intelligence protocols', () => {
    const code = `
      !Consensus {
        topic = MotionPlanning
        participants = [AgentA, AgentB]
        threshold = 0.8
      }
      !Coordinate {
        goal = SearchArea
        participants = [Drone1, Drone2]
        strategy = "hierarchical"
      }
    `;
    const ast = parse(code);
    const doc = extractor.extract(ast);

    expect(doc.items).toHaveLength(2);
    
    const consensus = doc.items.find(i => i.type === 'consensus') as DocConsensus;
    expect(consensus).toBeDefined();
    expect(consensus.topic).toContain('MotionPlanning');
    expect(consensus.threshold).toBe(0.8);

    const coordinate = doc.items.find(i => i.type === 'coordinate') as DocCoordinate;
    expect(coordinate).toBeDefined();
    expect(coordinate.goal).toContain('SearchArea');
    expect(coordinate.strategy).toBe('hierarchical');
  });

  it('extracts generic intents', () => {
    const code = `
      !Query {
        <User> [requests] <Data>
      }
    `;
    const ast = parse(code);
    const doc = extractor.extract(ast);

    expect(doc.items).toHaveLength(1);
    const intent = doc.items[0] as DocIntent;
    expect(intent.type).toBe('intent');
    expect(intent.intentType).toBe('!Query');
    expect(intent.statements).toHaveLength(1);
    expect(intent.statements[0].subject).toContain('User');
  });

  it('extracts context parameters', () => {
    const code = `
      !Task(name:MyTask, priority:high, mode:execution) {
        <Agent> [performs] <Action>
      }
    `;
    const ast = parse(code);
    const doc = extractor.extract(ast);
    
    const task = doc.items[0] as DocTask;
    expect(task.priority).toBe('high');
    expect(task.mode).toBe('execution');
  });
});
