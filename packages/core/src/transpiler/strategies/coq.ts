import * as AST from '../../ast.js';
import { TranspilerBase } from '../base.js';

export class CoqTranspiler extends TranspilerBase {
    public transpile(program: AST.Program): string {
        let output = "(* AIQL to Coq Transpilation *)\n";
        output += "(* Generated from AIQL v2.0.0+ with logic support *)\n\n";
        
        // Add standard library imports
        output += "Require Import Coq.Logic.Classical_Prop.\n";
        output += "Require Import Coq.Logic.Classical_Pred_Type.\n\n";
        
        // Add metadata as comments
        if (program.version) {
            output += `(* AIQL Version: ${program.version} *)\n`;
        }
        if (program.origin) {
            output += `(* Origin: ${program.origin} *)\n`;
        }
        if (program.citations && program.citations.length > 0) {
            output += `(* Citations: ${program.citations.join(', ')} *)\n`;
        }
        output += "\n";

        // Process all nodes in program body
        let definitionCount = 1;
        let theoremCount = 1;
        let relationshipCount = 1;

        for (const node of program.body) {
            if (AST.isIntent(node)) {
                output += this.transpileIntentCoq(node, definitionCount++);
            } else if (AST.isLogicalExpression(node)) {
                output += this.transpileLogicalExpressionCoq(node, theoremCount++);
            } else if (AST.isQuantifiedExpression(node)) {
                output += this.transpileQuantifiedExpressionCoq(node, theoremCount++);
            } else if (AST.isRuleDefinition(node)) {
                output += this.transpileRuleDefinitionCoq(node, theoremCount++);
            } else if (AST.isRelationshipNode(node)) {
                output += this.transpileRelationshipCoq(node, relationshipCount++);
            }
            output += "\n";
        }

        output += "(* End of Coq transpilation *)\n";
        return output;
    }

    private transpileIntentCoq(intent: AST.Intent, count: number): string {
        const intentName = `aiql_${intent.intentType.toLowerCase()}_${count}`;
        let output = `(* Intent: ${intent.intentType} *)\n`;
        
        if (intent.confidence !== undefined) {
            output += `(* Confidence: ${intent.confidence} *)\n`;
        }
        
        // Generate proposition from statements
        if (intent.statements && intent.statements.length > 0) {
            const stmt = intent.statements[0];
            const subject = this.expressionToString(stmt.subject);
            const object = this.expressionToString(stmt.object);
            const propName = `${subject}_${stmt.relation.name}_${object}`
                .replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
            
            output += `Definition ${intentName} : Prop := ${propName}.\n`;
            
            // If confidence is very high, suggest as axiom
            if (intent.confidence && intent.confidence >= 0.95) {
                output += `Axiom ${intentName}_holds : ${intentName}.\n`;
            }
        }
        
        return output;
    }

    private transpileLogicalExpressionCoq(expr: AST.LogicalExpression, count: number): string {
        const theoremName = `theorem_${count}`;
        let output = `(* Logical Expression *)\n`;
        output += `Theorem ${theoremName} : `;
        
        const prop = this.logicalExprToCoqProp(expr);
        output += `${prop}.\nProof.\n  (* Proof sketch *)\n  admit.\nQed.\n`;
        
        return output;
    }

    private logicalExprToCoqProp(expr: AST.LogicalExpression): string {
        if (expr.operator === 'not') {
            const left = expr.left ? this.logicalNodeToCoqProp(expr.left) : 'False';
            return `(~ ${left})`;
        }
        
        const left = expr.left ? this.logicalNodeToCoqProp(expr.left) : 'True';
        const right = expr.right ? this.logicalNodeToCoqProp(expr.right) : 'True';
        
        switch (expr.operator) {
            case 'and':
                return `(${left} /\\ ${right})`;
            case 'or':
                return `(${left} \\/ ${right})`;
            case 'implies':
            case 'then':
                return `(${left} -> ${right})`;
            case 'iff':
                return `(${left} <-> ${right})`;
            default:
                return `(${left} /\\ ${right})`;
        }
    }

    private logicalNodeToCoqProp(node: AST.LogicalNode): string {
        if (AST.isIntent(node)) {
            if (node.statements && node.statements.length > 0) {
                const stmt = node.statements[0];
                const subject = this.expressionToString(stmt.subject);
                const object = this.expressionToString(stmt.object);
                return `${subject}_${stmt.relation.name}_${object}`
                    .replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
            }
            return `${node.intentType.toLowerCase()}_holds`;
        } else if (AST.isLogicalExpression(node)) {
            return this.logicalExprToCoqProp(node);
        } else if (AST.isQuantifiedExpression(node)) {
            return this.quantifiedExprToCoqProp(node);
        }
        return 'True';
    }

    private transpileQuantifiedExpressionCoq(expr: AST.QuantifiedExpression, count: number): string {
        const theoremName = `quantified_${count}`;
        let output = `(* Quantified Expression *)\n`;
        output += `Theorem ${theoremName} : `;
        
        const prop = this.quantifiedExprToCoqProp(expr);
        output += `${prop}.\nProof.\n  (* Proof by quantifier rules *)\n  admit.\nQed.\n`;
        
        return output;
    }

    private quantifiedExprToCoqProp(expr: AST.QuantifiedExpression): string {
        const varName = expr.variable || 'x';
        const domain = expr.domain || 'Type';
        const body = expr.body ? this.logicalNodeToCoqProp(expr.body) : 'True';
        
        if (expr.quantifier === 'forall') {
            return `forall (${varName} : ${domain}), ${body}`;
        } else {
            return `exists (${varName} : ${domain}), ${body}`;
        }
    }

    private transpileRuleDefinitionCoq(rule: AST.RuleDefinition, count: number): string {
        const lemmaName = `inference_rule_${count}`;
        let output = `(* Inference Rule *)\n`;
        
        // Build premises - can be single node or conjunction
        const premiseProp = this.logicalNodeToCoqProp(rule.premises);
        const conclusion = this.logicalNodeToCoqProp(rule.conclusion);
        
        output += `Lemma ${lemmaName} : ${premiseProp} -> ${conclusion}.\n`;
        output += `Proof.\n  intros.\n  (* Apply inference rules *)\n  admit.\nQed.\n`;
        
        return output;
    }

    private transpileRelationshipCoq(rel: AST.RelationshipNode, count: number): string {
        const relName = `relationship_${count}`;
        let output = `(* Relationship: ${rel.relationshipType} - ${rel.relationName} *)\n`;
        
        if (rel.confidence !== undefined) {
            output += `(* Confidence: ${rel.confidence} *)\n`;
        }
        
        // Create predicate based on relationship type
        const sourceId = rel.source.replace(/[^a-zA-Z0-9_]/g, '_');
        const targetId = rel.target.replace(/[^a-zA-Z0-9_]/g, '_');
        
        if (rel.relationshipType === 'temporal') {
            // Temporal relationships as time ordering predicates
            output += `Definition ${relName} : Prop := temporal_${rel.relationName} ${sourceId} ${targetId}.\n`;
            
            // Add axioms for specific temporal relations
            if (rel.relationName === 'before') {
                output += `Axiom temporal_before_transitive : forall a b c, temporal_before a b -> temporal_before b c -> temporal_before a c.\n`;
            } else if (rel.relationName === 'after') {
                output += `Axiom temporal_after_antisym : forall a b, temporal_after a b -> temporal_before b a.\n`;
            } else if (rel.relationName === 'simultaneous' || rel.relationName === 'concurrent') {
                output += `Axiom temporal_${rel.relationName}_symmetric : forall a b, temporal_${rel.relationName} a b -> temporal_${rel.relationName} b a.\n`;
            }
        } else if (rel.relationshipType === 'causal') {
            // Causal relationships as causation predicates
            output += `Definition ${relName} : Prop := causal_${rel.relationName} ${sourceId} ${targetId}.\n`;
            
            if (rel.relationName === 'causes') {
                output += `Axiom causal_implies_temporal : forall a b, causal_causes a b -> temporal_before a b.\n`;
            } else if (rel.relationName === 'depends_on') {
                output += `Axiom dependency_necessary : forall a b, causal_depends_on a b -> (~ b -> ~ a).\n`;
            }
        } else if (rel.relationshipType === 'logical') {
            // Logical relationships as logical relations
            output += `Definition ${relName} : Prop := logical_${rel.relationName} ${sourceId} ${targetId}.\n`;
            
            if (rel.relationName === 'supports') {
                output += `Axiom support_implies : forall a b, logical_supports a b -> (a -> b).\n`;
            } else if (rel.relationName === 'contradicts') {
                output += `Axiom contradiction_exclusive : forall a b, logical_contradicts a b -> (a -> ~ b).\n`;
            } else if (rel.relationName === 'equivalent_to') {
                output += `Axiom equivalence_bidir : forall a b, logical_equivalent_to a b -> (a <-> b).\n`;
            }
        }
        
        // Add bidirectional axiom if specified
        if (rel.bidirectional) {
            output += `Axiom ${relName}_symmetric : ${rel.relationshipType}_${rel.relationName} ${sourceId} ${targetId} -> ${rel.relationshipType}_${rel.relationName} ${targetId} ${sourceId}.\n`;
        }
        
        return output;
    }
}
