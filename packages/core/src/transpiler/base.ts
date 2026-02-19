import * as AST from '../ast.js';

export interface SoulProcessCall {
    type: string;
    intensity: number | string;
    source: string;
}

export abstract class TranspilerBase {
    /**
     * Transpile an AIQL program to the target language string or object.
     */
    abstract transpile(program: AST.Program): string | Record<string, unknown>;

    /**
     * Shared logic to detect affective relations and generate soul process calls.
     */
    protected detectAffectiveRelations(intent: AST.Intent): string[] {
        const calls = this.getSoulProcessCalls(intent);
        return calls.map(call => 
            `${call.source} → soul.process({type: "${call.type}", intensity: ${call.intensity}})`
        );
    }

    /**
     * Get structured soul process calls from an intent.
     */
    protected getSoulProcessCalls(intent: AST.Intent): SoulProcessCall[] {
        const affectiveRelations = ['feels', 'desires', 'experiences', 'seeks', 'wants', 'avoids'];
        
        const calls: SoulProcessCall[] = [];
        
        for (const node of intent.statements) {
            let relation = node.relation.name.toLowerCase();
            
            // Strip square brackets if present (e.g. [feels] -> feels)
            if (relation.startsWith('[') && relation.endsWith(']')) {
                relation = relation.substring(1, relation.length - 1);
            }
            
            if (affectiveRelations.includes(relation)) {
                let emotion = AST.isConcept(node.object) ? node.object.name : 'Unknown';
                
                // Strip angle brackets if present (e.g. <Joy> -> Joy)
                if (emotion.startsWith('<') && emotion.endsWith('>')) {
                    emotion = emotion.substring(1, emotion.length - 1);
                }

                let stimulusType = 'Unknown';
                
                // Map emotions to soul stimulus types
                if (['Joy', 'Happiness', 'Delight'].includes(emotion)) {
                    stimulusType = 'Reward';
                } else if (['Suffering', 'Pain', 'Sadness'].includes(emotion)) {
                    stimulusType = 'Pain';
                } else if (['Stress', 'Anxiety', 'Tension'].includes(emotion)) {
                    stimulusType = 'Stress';
                } else if (['Curiosity', 'Interest', 'Wonder'].includes(emotion)) {
                    stimulusType = 'Novelty';
                }
                
                let intensity: number | string = 'unspecified';
                if (node.attributes?.intensity !== undefined) {
                    const val = node.attributes.intensity;
                    if (typeof val === 'boolean') {
                        intensity = val ? 1.0 : 0.0;
                    } else if (typeof val === 'number' || typeof val === 'string') {
                        intensity = val;
                    } else {
                        intensity = this.expressionToString(val);
                    }
                }
                
                // subject is Expression, but for affective relations we expect Concept generally
                const subjectName = AST.isConcept(node.subject) ? node.subject.name : this.expressionToString(node.subject);
                
                calls.push({
                    type: stimulusType,
                    intensity: intensity,
                    source: `${subjectName} [${relation}] ${emotion}`
                });
            }
        }
        
        return calls;
    }

    /**
     * Shared helper to convert an Intent node to a plain object.
     * Useful for JSON/YAML strategies and intermediate representations.
     */
    protected intentToObject(intent: AST.Intent): Record<string, unknown> {
        const intentObj: Record<string, unknown> = {
            nodeType: 'Intent',
            intentType: intent.intentType,
            scope: intent.scope,
            contextParams: intent.contextParams,
            confidence: intent.confidence,
            coherence: intent.coherence,
            statements: intent.statements.map((node: AST.Statement) => {
                const stmtObj: Record<string, unknown> = {
                    subject: this.expressionToString(node.subject),
                    predicate: node.relation.name,
                    object: this.expressionToString(node.object),
                    ...node.attributes
                };
                if (node.relation.tense) {
                    stmtObj.tense = node.relation.tense;
                }
                return stmtObj;
            })
        };
        
        // Add metadata fields
        if (intent.identifier) intentObj.identifier = intent.identifier;
        if (intent.groupIdentifier) intentObj.groupIdentifier = intent.groupIdentifier;
        if (intent.sequenceNumber !== undefined) intentObj.sequenceNumber = intent.sequenceNumber;
        if (intent.temperature !== undefined) intentObj.temperature = intent.temperature;
        if (intent.entropy !== undefined) intentObj.entropy = intent.entropy;
        if (intent.coherence !== undefined) intentObj.coherence = intent.coherence;
        if (intent.version) intentObj.version = intent.version;
        if (intent.origin) intentObj.origin = intent.origin;
        if (intent.citations && intent.citations.length > 0) intentObj.citations = intent.citations;
        
        // Add security metadata
        if (intent.security) {
            const security = intent.security as AST.SecurityMetadata;
            intentObj.security = {
                signed: security.signed,
                encrypted: security.encrypted,
                signerAgentId: security.signerAgentId,
                recipientAgentId: security.recipientAgentId,
                timestamp: security.timestamp,
            };
            if (security.signature) {
                (intentObj.security as Record<string, unknown>).signature = security.signature;
            }
            if (security.encryptedData) {
                (intentObj.security as Record<string, unknown>).encryptedData = security.encryptedData;
            }
        }
        
        return intentObj;
    }

    protected logicalExpressionToObject(expr: AST.LogicalExpression): Record<string, unknown> {
        const obj: Record<string, unknown> = {
            nodeType: 'LogicalExpression',
            operator: expr.operator
        };

        if (expr.left) {
            obj.left = this.nodeToObject(expr.left);
        }

        if (expr.right) {
            obj.right = this.nodeToObject(expr.right);
        }

        return obj;
    }

    protected quantifiedExpressionToObject(expr: AST.QuantifiedExpression): Record<string, unknown> {
        const obj: Record<string, unknown> = {
            nodeType: 'QuantifiedExpression',
            quantifier: expr.quantifier,
            variable: expr.variable
        };

        if (expr.domain) {
            obj.domain = expr.domain;
        }

        if (expr.body) {
            obj.body = this.nodeToObject(expr.body);
        }

        return obj;
    }

    protected ruleDefinitionToObject(rule: AST.RuleDefinition): Record<string, unknown> {
        return {
            nodeType: 'RuleDefinition',
            ruleId: rule.ruleId,
            domain: rule.domain,
            bidirectional: rule.bidirectional,
            confidence: rule.confidence,
            premises: this.nodeToObject(rule.premises),
            conclusion: this.nodeToObject(rule.conclusion)
        };
    }

    protected relationshipToObject(rel: AST.RelationshipNode): Record<string, unknown> {
        const obj: Record<string, unknown> = {
            nodeType: 'Relationship',
            relationshipType: rel.relationshipType,
            source: rel.source,
            target: rel.target,
            relationName: rel.relationName
        };
        
        if (rel.confidence !== undefined) obj.confidence = rel.confidence;
        if (rel.bidirectional) obj.bidirectional = true;
        
        if (rel.statements && rel.statements.length > 0) {
            obj.statements = rel.statements.map(stmt => ({
                subject: this.expressionToString(stmt.subject),
                predicate: stmt.relation.name,
                object: this.expressionToString(stmt.object),
                ...stmt.attributes
            }));
        }
        
        if (rel.metadata) obj.metadata = rel.metadata;
        
        return obj;
    }

    private nodeToObject(node: AST.LogicalNode): Record<string, unknown> | null {
        if (AST.isIntent(node)) return this.intentToObject(node);
        if (AST.isLogicalExpression(node)) return this.logicalExpressionToObject(node);
        if (AST.isQuantifiedExpression(node)) return this.quantifiedExpressionToObject(node);
        if (AST.isRuleDefinition(node)) return this.ruleDefinitionToObject(node);
        if (AST.isRelationshipNode(node)) return this.relationshipToObject(node);
        return null;
    }

    protected expressionToString(expr: AST.Expression): string {
        if (AST.isConcept(expr)) return expr.name;
        if (AST.isIdentifier(expr)) return expr.name;
        if (AST.isLiteral(expr)) return String(expr.value);
        if (AST.isUnaryExpression(expr)) {
            const op = expr.operator === 'MINUS' ? '-' : '!';
            return `${op}(${this.expressionToString(expr.argument)})`;
        }
        if (AST.isMathExpression(expr)) {
             const left = this.expressionToString(expr.left);
             const right = this.expressionToString(expr.right);
             const opMap: Record<AST.MathOperator, string> = {
                 'PLUS': '+', 'MINUS': '-', 'MULTIPLY': '*', 'DIVIDE': '/', 'POWER': '^', 'MODULO': '%', 'ASSIGN': '='
             };
             return `(${left} ${opMap[expr.operator]} ${right})`;
        }
        if (AST.isComparisonExpression(expr)) {
             const left = this.expressionToString(expr.left);
             const right = this.expressionToString(expr.right);
             const opMap: Record<AST.ComparisonOperator, string> = {
                 'GT': '>', 'LT': '<', 'GTE': '>=', 'LTE': '<=', 'EQ': '==', 'NEQ': '!='
             };
             return `(${left} ${opMap[expr.operator]} ${right})`;
        }
        if (AST.isSetExpression(expr)) {
             const left = this.expressionToString(expr.left);
             const right = this.expressionToString(expr.right);
             return `(${left} ${expr.operator.toLowerCase()} ${right})`;
        }
        if (AST.isFunctionApplication(expr)) {
             const args = expr.arguments.map(arg => this.expressionToString(arg)).join(', ');
             return `${expr.functionName}(${args})`;
        }
        if (AST.isLambdaExpression(expr)) {
             return `lambda ${expr.parameters.join(', ')}: ${this.expressionToString(expr.body)}`;
        }
        return JSON.stringify(expr);
    }
}
