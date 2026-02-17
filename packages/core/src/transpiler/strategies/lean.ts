import * as AST from '../../ast.js';
import { TranspilerBase } from '../base.js';

export class LeanTranspiler extends TranspilerBase {
    public transpile(program: AST.Program): string {
        let output = "-- AIQL to Lean 4 Transpilation\n";
        output += "-- Generated from AIQL v2.0.0+ with logic support\n\n";
        
        // Add standard library imports
        output += "import Mathlib.Logic.Basic\n";
        output += "import Mathlib.Tactic\n\n";
        
        // Add metadata as comments
        if (program.version) {
            output += `-- AIQL Version: ${program.version}\n`;
        }
        if (program.origin) {
            output += `-- Origin: ${program.origin}\n`;
        }
        if (program.citations && program.citations.length > 0) {
            output += `-- Citations: ${program.citations.join(', ')}\n`;
        }
        output += "\n";

        // Process all nodes in program body
        let definitionCount = 1;
        let theoremCount = 1;
        let relationshipCount = 1;

        for (const node of program.body) {
            if (AST.isIntent(node)) {
                output += this.transpileIntentLean(node, definitionCount++);
            } else if (AST.isLogicalExpression(node)) {
                output += this.transpileLogicalExpressionLean(node, theoremCount++);
            } else if (AST.isQuantifiedExpression(node)) {
                output += this.transpileQuantifiedExpressionLean(node, theoremCount++);
            } else if (AST.isRuleDefinition(node)) {
                output += this.transpileRuleDefinitionLean(node, theoremCount++);
            } else if (AST.isRelationshipNode(node)) {
                output += this.transpileRelationshipLean(node, relationshipCount++);
            }
            output += "\n";
        }

        output += "-- End of Lean transpilation\n";
        return output;
    }

    private transpileIntentLean(intent: AST.Intent, count: number): string {
        const intentName = `aiql_${intent.intentType.toLowerCase()}_${count}`;
        let output = `-- Intent: ${intent.intentType}\n`;
        
        if (intent.confidence !== undefined) {
            output += `-- Confidence: ${intent.confidence}\n`;
        }
        
        // Generate proposition from statements
        if (intent.statements && intent.statements.length > 0) {
            const stmt = intent.statements[0];
            const subject = this.expressionToString(stmt.subject);
            const object = this.expressionToString(stmt.object);
            const propName = `${subject}_${stmt.relation.name}_${object}`
                .replace(/[^a-zA-Z0-9_]/g, '_');
            
            output += `def ${intentName} : Prop := ${propName}\n`;
            
            // If confidence is very high, suggest as axiom
            if (intent.confidence && intent.confidence >= 0.95) {
                output += `axiom ${intentName}_holds : ${intentName}\n`;
            }
        }
        
        return output;
    }

    private transpileLogicalExpressionLean(expr: AST.LogicalExpression, count: number): string {
        const theoremName = `theorem_${count}`;
        let output = `-- Logical Expression\n`;
        output += `theorem ${theoremName} : `;
        
        const prop = this.logicalExprToLeanProp(expr);
        output += `${prop} := by\n  sorry\n`;
        
        return output;
    }

    private logicalExprToLeanProp(expr: AST.LogicalExpression): string {
        if (expr.operator === 'not') {
            const left = expr.left ? this.logicalNodeToLeanProp(expr.left) : 'False';
            return `¬${left}`;
        }
        
        const left = expr.left ? this.logicalNodeToLeanProp(expr.left) : 'True';
        const right = expr.right ? this.logicalNodeToLeanProp(expr.right) : 'True';
        
        switch (expr.operator) {
            case 'and':
                return `(${left} ∧ ${right})`;
            case 'or':
                return `(${left} ∨ ${right})`;
            case 'implies':
            case 'then':
                return `(${left} → ${right})`;
            case 'iff':
                return `(${left} ↔ ${right})`;
            default:
                return `(${left} ∧ ${right})`;
        }
    }

    private logicalNodeToLeanProp(node: AST.LogicalNode): string {
        if (AST.isIntent(node)) {
            if (node.statements && node.statements.length > 0) {
                const stmt = node.statements[0];
                const subject = this.expressionToString(stmt.subject);
                const object = this.expressionToString(stmt.object);
                return `${subject}_${stmt.relation.name}_${object}`
                    .replace(/[^a-zA-Z0-9_]/g, '_');
            }
            return `${node.intentType.toLowerCase()}_holds`;
        } else if (AST.isLogicalExpression(node)) {
            return this.logicalExprToLeanProp(node);
        } else if (AST.isQuantifiedExpression(node)) {
            return this.quantifiedExprToLeanProp(node);
        }
        return 'True';
    }

    private transpileQuantifiedExpressionLean(expr: AST.QuantifiedExpression, count: number): string {
        const theoremName = `quantified_${count}`;
        let output = `-- Quantified Expression\n`;
        output += `theorem ${theoremName} : `;
        
        const prop = this.quantifiedExprToLeanProp(expr);
        output += `${prop} := by\n  sorry\n`;
        
        return output;
    }

    private quantifiedExprToLeanProp(expr: AST.QuantifiedExpression): string {
        const varName = expr.variable || 'x';
        const domain = expr.domain || 'Type';
        const body = expr.body ? this.logicalNodeToLeanProp(expr.body) : 'True';
        
        if (expr.quantifier === 'forall') {
            return `∀ (${varName} : ${domain}), ${body}`;
        } else {
            return `∃ (${varName} : ${domain}), ${body}`;
        }
    }

    private transpileRuleDefinitionLean(rule: AST.RuleDefinition, count: number): string {
        const lemmaName = `inference_rule_${count}`;
        let output = `-- Inference Rule\n`;
        
        // Build premises - can be single node or conjunction
        const premiseProp = this.logicalNodeToLeanProp(rule.premises);
        const conclusion = this.logicalNodeToLeanProp(rule.conclusion);
        
        output += `lemma ${lemmaName} : ${premiseProp} → ${conclusion} := by\n  intro\n  sorry\n`;
        
        return output;
    }

    private transpileRelationshipLean(rel: AST.RelationshipNode, count: number): string {
        const relName = `relationship_${count}`;
        let output = `-- Relationship: ${rel.relationshipType} - ${rel.relationName}\n`;
        
        if (rel.confidence !== undefined) {
            output += `-- Confidence: ${rel.confidence}\n`;
        }
        
        // Create definition based on relationship type
        const sourceId = rel.source.replace(/[^a-zA-Z0-9_]/g, '_');
        const targetId = rel.target.replace(/[^a-zA-Z0-9_]/g, '_');
        
        if (rel.relationshipType === 'temporal') {
            // Temporal relationships as time ordering predicates
            output += `def ${relName} : Prop := temporal_${rel.relationName} ${sourceId} ${targetId}\n`;
            
            // Add axioms for specific temporal relations
            if (rel.relationName === 'before') {
                output += `axiom temporal_before_transitive : ∀ a b c, temporal_before a b → temporal_before b c → temporal_before a c\n`;
            } else if (rel.relationName === 'after') {
                output += `axiom temporal_after_antisym : ∀ a b, temporal_after a b → temporal_before b a\n`;
            } else if (rel.relationName === 'simultaneous' || rel.relationName === 'concurrent') {
                output += `axiom temporal_${rel.relationName}_symmetric : ∀ a b, temporal_${rel.relationName} a b → temporal_${rel.relationName} b a\n`;
            }
        } else if (rel.relationshipType === 'causal') {
            // Causal relationships as causation predicates
            output += `def ${relName} : Prop := causal_${rel.relationName} ${sourceId} ${targetId}\n`;
            
            if (rel.relationName === 'causes') {
                output += `axiom causal_implies_temporal : ∀ a b, causal_causes a b → temporal_before a b\n`;
            } else if (rel.relationName === 'depends_on') {
                output += `axiom dependency_necessary : ∀ a b, causal_depends_on a b → (¬b → ¬a)\n`;
            }
        } else if (rel.relationshipType === 'logical') {
            // Logical relationships as logical relations
            output += `def ${relName} : Prop := logical_${rel.relationName} ${sourceId} ${targetId}\n`;
            
            if (rel.relationName === 'supports') {
                output += `axiom support_implies : ∀ a b, logical_supports a b → (a → b)\n`;
            } else if (rel.relationName === 'contradicts') {
                output += `axiom contradiction_exclusive : ∀ a b, logical_contradicts a b → (a → ¬b)\n`;
            } else if (rel.relationName === 'equivalent_to') {
                output += `axiom equivalence_bidir : ∀ a b, logical_equivalent_to a b → (a ↔ b)\n`;
            }
        }
        
        // Add bidirectional axiom if specified
        if (rel.bidirectional) {
            output += `axiom ${relName}_symmetric : ${rel.relationshipType}_${rel.relationName} ${sourceId} ${targetId} → ${rel.relationshipType}_${rel.relationName} ${targetId} ${sourceId}\n`;
        }
        
        return output;
    }
}
