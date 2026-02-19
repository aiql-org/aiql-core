
import { 
  Program, 
  Intent, 
  RuleDefinition, 
  isIntent, 
  isRuleDefinition,
  Expression,
  isConcept,
  isLiteral,
  isConsensusNode,
  isCoordinateNode,
  ConsensusNode,
  CoordinateNode,
  isIdentifier
} from '@aiql-org/core';
import { 
  DocPage, 
  DocItem, 
  DocClass, 
  DocRule, 
  DocTask, 
  DocGraphNode, 
  DocGraphEdge, 
  DocPropertyDetail,
  DocConsensus,
  DocCoordinate,
  DocIntent 
} from './types.js';

export class DocExtractor {
  extract(ast: Program, title: string = 'AIQL Documentation'): DocPage {
    const items: DocItem[] = [];
    const nodes: DocGraphNode[] = [];
    const edges: DocGraphEdge[] = [];

    // Process Body
    for (const node of ast.body) {
      if (isIntent(node)) {
        const intent = node as Intent;
        
        // !DefineClass
        if (intent.intentType === '!DefineClass') {
          const docClass = this.extractClass(intent);
          items.push(docClass);
          this.addToGraph(docClass, nodes, edges);
        }
        
        // !Task
        else if (intent.intentType === '!Task') {
          items.push(this.extractTask(intent));
        }
        
        // Generic Intent Fallback
        else {
          items.push(this.extractGenericIntent(intent));
        }

      } else if (isRuleDefinition(node)) {
        const docRule = this.extractRule(node as RuleDefinition);
        items.push(docRule);
      } else if (isConsensusNode(node)) {
        items.push(this.extractConsensus(node));
      } else if (isCoordinateNode(node)) {
        items.push(this.extractCoordinate(node));
      }
    }

    return {
      title,
      items,
      graph: { nodes, edges }
    };
  }

  private extractClass(intent: Intent): DocClass {
    const className = intent.contextParams?.name || 'Unknown';
    let superClass: string | undefined;
    const properties: DocPropertyDetail[] = [];

    // Parse statements to find properties and inheritance
    for (const stmt of intent.statements) {
      // Clean relation name (remove [ ])
      const relationName = stmt.relation.name.replace(/^\[|\]$/g, '');

      // subclass_of
      if (relationName === 'subclass_of') {
         superClass = this.exprToString(stmt.object);
      }
      // has_property or has_capability
      else if (relationName === 'has_property' || relationName === 'has_capability') {
         properties.push({
           name: this.exprToString(stmt.object),
           attributes: stmt.attributes as Record<string, unknown> | undefined
         });
      }
    }

    return {
      id: className,
      type: 'class',
      name: className,
      superClass,
      properties,
      metadata: {
        version: intent.version,
        origin: intent.origin,
        citations: intent.citations
      }
    };
  }

  private extractRule(rule: RuleDefinition): DocRule {
    return {
      id: rule.ruleId,
      type: 'rule',
      name: rule.ruleId,
      premise: 'Logic Complex', // TODO: stringify logic
      conclusion: 'Logic Complex',
      confidence: rule.confidence,
      metadata: {
         // RuleDefinition might not have version/origin in standard AST? 
         // Checking ast.ts... it extends Node, no shared metadata on base Node?
         // Program/Intent have them. RuleDefinition might strictly be logic.
         // Assuming base types for now.
      }
    };
  }

  private extractTask(intent: Intent): DocTask {
    const steps = intent.statements.map(stmt => ({
      subject: this.exprToString(stmt.subject),
      relation: stmt.relation.name,
      object: this.exprToString(stmt.object),
      parameters: stmt.attributes as Record<string, unknown> | undefined
    }));

    return {
      id: intent.identifier || 'task',
      type: 'task',
      name: intent.contextParams?.name || 'Task',
      priority: intent.contextParams?.priority,
      mode: intent.contextParams?.mode,
      steps,
      metadata: {
        version: intent.version
      }
    };
  }

  private extractConsensus(node: ConsensusNode): DocConsensus {
    return {
      id: node.identifier || 'consensus',
      type: 'consensus',
      name: 'Consensus Protocol',
      topic: this.exprToString(node.topic),
      participants: node.participants.map(p => this.exprToString(p)),
      threshold: node.threshold,
      metadata: {
        version: node.version,
        context: node.contextParams
      }
    };
  }

  private extractCoordinate(node: CoordinateNode): DocCoordinate {
    return {
      id: node.identifier || 'coordinate',
      type: 'coordinate',
      name: 'Coordination Protocol',
      goal: this.exprToString(node.goal),
      participants: node.participants.map(p => this.exprToString(p)),
      strategy: node.strategy,
      metadata: {
        version: node.version,
        context: node.contextParams
      }
    };
  }

  private extractGenericIntent(intent: Intent): DocIntent {
    const steps = intent.statements.map(stmt => ({
      subject: this.exprToString(stmt.subject),
      relation: stmt.relation.name,
      object: this.exprToString(stmt.object),
      parameters: stmt.attributes as Record<string, unknown> | undefined
    }));

    return {
      id: intent.identifier || 'intent',
      type: 'intent',
      name: intent.intentType,
      intentType: intent.intentType,
      statements: steps,
      metadata: {
        version: intent.version,
        context: intent.contextParams
      }
    };
  }

  private addToGraph(item: DocClass, nodes: DocGraphNode[], edges: DocGraphEdge[]) {
    nodes.push({ id: item.name, label: item.name, type: 'class' });
    if (item.superClass) {
      nodes.push({ id: item.superClass, label: item.superClass, type: 'class' });
      edges.push({ source: item.name, target: item.superClass, label: 'subclass_of' });
    }
    for (const prop of item.properties) {
       // Only add edge if looks like a Class concept (e.g. <Reasoning>)
       // Simplified logic
       const target = prop.name.replace(/[<>]/g, '');
       nodes.push({ id: target, label: target, type: 'concept' });
       edges.push({ source: item.name, target, label: 'has_property' });
    }
  }

  private exprToString(expr: Expression): string {
    if (isIdentifier(expr)) return expr.name;
    if (isConcept(expr)) {
      // Parser might include <> in name already
      const cleanName = expr.name.replace(/^<|>$/g, '');
      return `<${cleanName}>`;
    }
    if (isLiteral(expr)) return JSON.stringify(expr.value);
    // Fallback
    return 'Expr'; 
  }
}
