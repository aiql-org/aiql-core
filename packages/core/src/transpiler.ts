
import * as AST from './ast.js';
import * as yaml from 'js-yaml';
import { SQLTranspiler } from './transpilers/sql.js';
import { PythonTranspiler } from './transpilers/python.js';

export class Transpiler {
    /**
     * Transpile AIQL Program to a target language.
     * 
     * Supported Targets:
     * - `python`: Generates executable Python code using the AIQL runtime library.
     * - `json`: Exports a simplified JSON representation for API interchange.
     * - `yaml`: Exports a human-readable YAML representation.
     * - `sql`: Generates SQL DDL and DML for persisting knowledge in relational databases.
     * - `coq`: (Experimental) Generates Coq specifications for formal verification.
     * - `lean`: (Experimental) Generates Lean 4 theorem prover code.
     * 
     * @param program - The AST Program to transpile.
     * @param target - The target language format (default: 'python').
     * @returns {string} The transpiled code or data string.
     */
    transpile(program: AST.Program, target: 'python' | 'json' | 'yaml' | 'sql' | 'coq' | 'lean' = 'python'): string {
        try {
            switch (target) {
                case 'json':
                    // Convert AST to clearer JSON representation for interchange
                    return JSON.stringify(this.toInterchangeFormat(program), null, 2);
                case 'yaml':
                    // Convert to YAML
                    return yaml.dump(this.toInterchangeFormat(program));
                case 'sql':
                    // Convert to SQL (storage + query formats)
                    return this.toSQL(program);
                case 'coq':
                    // Convert to Coq (Gallina specification language)
                    return this.toCoq(program);
                case 'lean':
                    // Convert to Lean 4 (theorem prover)
                    return this.toLean(program);
                case 'python':
                default:
                    return this.toPython(program);
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            return `Error: ${message}`;
        }
    }

    private toInterchangeFormat(program: AST.Program): Record<string, unknown> {
        // Simplify AST for clean JSON/YAML with full v2.0.0+ logic support
        const body = program.body.map(node => {
            if (AST.isIntent(node)) {
                return this.intentToObject(node);
            } else if (AST.isLogicalExpression(node)) {
                return this.logicalExpressionToObject(node);
            } else if (AST.isQuantifiedExpression(node)) {
                return this.quantifiedExpressionToObject(node);
            } else if (AST.isRuleDefinition(node)) {
                return this.ruleDefinitionToObject(node);
            } else if (AST.isRelationshipNode(node)) {
                return this.relationshipToObject(node);
            }
            return null;
        }).filter(n => n !== null);

        const intents = program.body.filter(AST.isIntent).map(intent => {
            const intentObj: Record<string, unknown> = {
                intentType: intent.intentType,
                scope: intent.scope,
                contextParams: intent.contextParams,
                confidence: intent.confidence,
                coherence: intent.coherence,  // v2.6.0: Quantum coherence
                statements: intent.statements.map((node: AST.Statement) => {
                    const stmtObj: Record<string, unknown> = {
                        subject: node.subject.name,
                        predicate: node.relation.name,
                        object: node.object.name,
                        ...node.attributes
                    };
                    // Add tense if present on relation
                    if (node.relation.tense) {
                        stmtObj.tense = node.relation.tense;
                    }
                    return stmtObj;
                })
            };
            
            // Add new metadata fields if present
            if (intent.identifier) intentObj.identifier = intent.identifier;
            if (intent.groupIdentifier) intentObj.groupIdentifier = intent.groupIdentifier;
            if (intent.sequenceNumber !== undefined) intentObj.sequenceNumber = intent.sequenceNumber;
            if (intent.temperature !== undefined) intentObj.temperature = intent.temperature;
            if (intent.entropy !== undefined) intentObj.entropy = intent.entropy;
            if (intent.coherence !== undefined) intentObj.coherence = intent.coherence;  // v2.6.0
            if (intent.version) intentObj.version = intent.version;
            if (intent.origin) intentObj.origin = intent.origin;
            if (intent.citations && intent.citations.length > 0) intentObj.citations = intent.citations;
            
            // Add security metadata if present
            if (intent.security) {
                const security = intent.security as AST.SecurityMetadata;
                intentObj.security = {
                    signed: security.signed,
                    encrypted: security.encrypted,
                    signerAgentId: security.signerAgentId,
                    recipientAgentId: security.recipientAgentId,
                    timestamp: security.timestamp,
                };
                
                // Only include signature/encrypted data if they exist
                if (security.signature) {
                    (intentObj.security as Record<string, unknown>).signature = security.signature;
                }
                if (security.encryptedData) {
                    (intentObj.security as Record<string, unknown>).encryptedData = security.encryptedData;
                }
            }
            
            return intentObj;
        });
        
        const result: Record<string, unknown> = { 
            body,  // Complete v2.0.0 body with all node types
            intents  // Legacy field for backwards compatibility
        };
        
        // Add program-level metadata if present
        if (program.version) result.version = program.version;
        if (program.origin) result.origin = program.origin;
        if (program.citations && program.citations.length > 0) result.citations = program.citations;
        
        // Add program-level security if present
        if (program.security) {
            result.security = program.security;
        }
        
        return result;
    }

    // Helper method to convert Intent to object
    private intentToObject(intent: AST.Intent): Record<string, unknown> {
        const intentObj: Record<string, unknown> = {
            nodeType: 'Intent',
            intentType: intent.intentType,
            scope: intent.scope,
            contextParams: intent.contextParams,
            confidence: intent.confidence,
            coherence: intent.coherence,  // v2.6.0
            statements: intent.statements.map((node: AST.Statement) => {
                const stmtObj: Record<string, unknown> = {
                    subject: node.subject.name,
                    predicate: node.relation.name,
                    object: node.object.name,
                    ...node.attributes
                };
                // Add tense if present on relation
                if (node.relation.tense) {
                    stmtObj.tense = node.relation.tense;
                }
                return stmtObj;
            })
        };
        
        // Add new metadata fields if present
        if (intent.identifier) intentObj.identifier = intent.identifier;
        if (intent.groupIdentifier) intentObj.groupIdentifier = intent.groupIdentifier;
        if (intent.sequenceNumber !== undefined) intentObj.sequenceNumber = intent.sequenceNumber;
        if (intent.temperature !== undefined) intentObj.temperature = intent.temperature;
        if (intent.entropy !== undefined) intentObj.entropy = intent.entropy;
        if (intent.coherence !== undefined) intentObj.coherence = intent.coherence;  // v2.6.0
        if (intent.version) intentObj.version = intent.version;
        if (intent.origin) intentObj.origin = intent.origin;
        if (intent.citations && intent.citations.length > 0) intentObj.citations = intent.citations;
        
        // Add security metadata if present
        if (intent.security) {
            const security = intent.security as AST.SecurityMetadata;
            intentObj.security = {
                signed: security.signed,
                encrypted: security.encrypted,
                signerAgentId: security.signerAgentId,
                recipientAgentId: security.recipientAgentId,
                timestamp: security.timestamp,
            };
            
            // Only include signature/encrypted data if they exist
            if (security.signature) {
                (intentObj.security as Record<string, unknown>).signature = security.signature;
            }
            if (security.encryptedData) {
                (intentObj.security as Record<string, unknown>).encryptedData = security.encryptedData;
            }
        }
        
        return intentObj;
    }

    // Helper method to convert LogicalExpression to object (recursive)
    private logicalExpressionToObject(expr: AST.LogicalExpression): Record<string, unknown> {
        const obj: Record<string, unknown> = {
            nodeType: 'LogicalExpression',
            operator: expr.operator
        };

        // Add left operand (recursive for nested expressions)
        if (expr.left) {
            if (AST.isIntent(expr.left)) {
                obj.left = this.intentToObject(expr.left);
            } else if (AST.isLogicalExpression(expr.left)) {
                obj.left = this.logicalExpressionToObject(expr.left);
            } else if (AST.isQuantifiedExpression(expr.left)) {
                obj.left = this.quantifiedExpressionToObject(expr.left);
            }
        }

        // Add right operand (optional for unary NOT)
        if (expr.right) {
            if (AST.isIntent(expr.right)) {
                obj.right = this.intentToObject(expr.right);
            } else if (AST.isLogicalExpression(expr.right)) {
                obj.right = this.logicalExpressionToObject(expr.right);
            } else if (AST.isQuantifiedExpression(expr.right)) {
                obj.right = this.quantifiedExpressionToObject(expr.right);
            }
        }

        return obj;
    }

    // Helper method to convert QuantifiedExpression to object
    private quantifiedExpressionToObject(expr: AST.QuantifiedExpression): Record<string, unknown> {
        const obj: Record<string, unknown> = {
            nodeType: 'QuantifiedExpression',
            quantifier: expr.quantifier,
            variable: expr.variable
        };

        if (expr.domain) {
            obj.domain = expr.domain;
        }

        // Recursively convert body
        if (AST.isIntent(expr.body)) {
            obj.body = this.intentToObject(expr.body);
        } else if (AST.isLogicalExpression(expr.body)) {
            obj.body = this.logicalExpressionToObject(expr.body);
        } else if (AST.isQuantifiedExpression(expr.body)) {
            obj.body = this.quantifiedExpressionToObject(expr.body);
        }

        return obj;
    }

    // Helper method to convert RuleDefinition to object
    private ruleDefinitionToObject(rule: AST.RuleDefinition): Record<string, unknown> {
        return {
            nodeType: 'RuleDefinition',
            ruleId: rule.ruleId,
            domain: rule.domain,
            bidirectional: rule.bidirectional,
            confidence: rule.confidence,
            premises: AST.isIntent(rule.premises) 
                ? this.intentToObject(rule.premises)
                : AST.isLogicalExpression(rule.premises)
                    ? this.logicalExpressionToObject(rule.premises)
                    : AST.isQuantifiedExpression(rule.premises)
                        ? this.quantifiedExpressionToObject(rule.premises)
                        : null,
            conclusion: AST.isIntent(rule.conclusion) 
                ? this.intentToObject(rule.conclusion)
                : AST.isLogicalExpression(rule.conclusion)
                    ? this.logicalExpressionToObject(rule.conclusion)
                    : AST.isQuantifiedExpression(rule.conclusion)
                        ? this.quantifiedExpressionToObject(rule.conclusion)
                        : null
        };
    }

    /**
     * Convert RelationshipNode to simple object for JSON/YAML (v2.1.0)
     */
    private relationshipToObject(rel: AST.RelationshipNode): Record<string, unknown> {
        const obj: Record<string, unknown> = {
            nodeType: 'Relationship',
            relationshipType: rel.relationshipType,
            source: rel.source,
            target: rel.target,
            relationName: rel.relationName
        };
        
        if (rel.confidence !== undefined) {
            obj.confidence = rel.confidence;
        }
        
        if (rel.bidirectional) {
            obj.bidirectional = true;
        }
        
        if (rel.statements && rel.statements.length > 0) {
            obj.statements = rel.statements.map(stmt => ({
                subject: stmt.subject.name,
                predicate: stmt.relation.name,
                object: stmt.object.name,
                ...stmt.attributes
            }));
        }
        
        if (rel.metadata) {
            obj.metadata = rel.metadata;
        }
        
        return obj;
    }

    private toPython(program: AST.Program): string {
        return new PythonTranspiler().transpile(program);
    }

    // =============================================================================
    // SQL TRANSPILATION
    // =============================================================================
    private toSQL(program: AST.Program): string {
        return new SQLTranspiler().transpile(program);
    }



    // ========================================
    // Coq Transpilation (Gallina Syntax)
    // ========================================

    private toCoq(program: AST.Program): string {
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
            const propName = `${stmt.subject.name}_${stmt.relation.name}_${stmt.object.name}`
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
                return `${stmt.subject.name}_${stmt.relation.name}_${stmt.object.name}`
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

    // ========================================
    // Lean 4 Transpilation
    // ========================================

    private toLean(program: AST.Program): string {
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
            const propName = `${stmt.subject.name}_${stmt.relation.name}_${stmt.object.name}`
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
                return `${stmt.subject.name}_${stmt.relation.name}_${stmt.object.name}`
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
