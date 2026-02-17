
import * as AST from '../ast.js';

export class PythonTranspiler {
    public transpile(program: AST.Program): string {
        const lines: string[] = [];
        
        // Add program-level metadata as module comments
        if (program.version || program.origin || (program.citations && program.citations.length > 0)) {
            lines.push("# AIQL Program Metadata");
            if (program.version) lines.push(`# Version: ${program.version}`);
            if (program.origin) lines.push(`# Origin: ${program.origin}`);
            if (program.citations && program.citations.length > 0) {
                lines.push(`# Citations: ${JSON.stringify(program.citations)}`);
            }
            lines.push("");
        }
        
        // Transpile all node types (v2.0.0 full logic support, v2.1.0 relationships)
        for (const node of program.body) {
            if (AST.isIntent(node)) {
                lines.push(this.transpileIntent(node));
                lines.push("");
            } else if (AST.isLogicalExpression(node)) {
                lines.push(this.transpileLogicalExpressionPython(node));
                lines.push("");
            } else if (AST.isQuantifiedExpression(node)) {
                lines.push(this.transpileQuantifiedExpressionPython(node));
                lines.push("");
            } else if (AST.isRuleDefinition(node)) {
                lines.push(this.transpileRuleDefinitionPython(node));
                lines.push("");
            } else if (AST.isRelationshipNode(node)) {
                lines.push(this.relationshipToPython(node));
                lines.push("");
            }
        }
        return lines.join('\n');
    }

    // Helper to transpile LogicalExpression to Python (recursive)
    private transpileLogicalExpressionPython(expr: AST.LogicalExpression, indent: string = ""): string {
        const op = expr.operator.toUpperCase();
        const lines: string[] = [];
        lines.push(`${indent}# Logical Expression: ${op}`);
        
        if (expr.operator === 'not') {
            // Unary NOT
            lines.push(`${indent}logical_expr = Not(`);
            if (expr.left) {
                if (AST.isIntent(expr.left)) {
                    lines.push(`${indent}    Intent(${JSON.stringify(expr.left.intentType)})`);
                } else if (AST.isLogicalExpression(expr.left)) {
                    lines.push(this.transpileLogicalExpressionPython(expr.left, indent + "    "));
                } else if (AST.isQuantifiedExpression(expr.left)) {
                    lines.push(this.transpileQuantifiedExpressionPython(expr.left, indent + "    "));
                }
            }
            lines.push(`${indent})`);
        } else {
            // Binary operators: and, or, implies, iff
            const pythonOp = {
                'and': 'And',
                'or': 'Or',
                'implies': 'Implies',
                'iff': 'Iff',
                'then': 'Implies'  // synonym
            }[expr.operator] || 'Unknown';

            lines.push(`${indent}logical_expr = ${pythonOp}(`);
            
            // Left operand
            if (expr.left) {
                if (AST.isIntent(expr.left)) {
                    lines.push(`${indent}    Intent(${JSON.stringify(expr.left.intentType)}),`);
                } else if (AST.isLogicalExpression(expr.left)) {
                    lines.push(this.transpileLogicalExpressionPython(expr.left, indent + "    "));
                } else if (AST.isQuantifiedExpression(expr.left)) {
                    lines.push(this.transpileQuantifiedExpressionPython(expr.left, indent + "    "));
                }
            }
            
            // Right operand
            if (expr.right) {
                if (AST.isIntent(expr.right)) {
                    lines.push(`${indent}    Intent(${JSON.stringify(expr.right.intentType)})`);
                } else if (AST.isLogicalExpression(expr.right)) {
                    lines.push(this.transpileLogicalExpressionPython(expr.right, indent + "    "));
                } else if (AST.isQuantifiedExpression(expr.right)) {
                    lines.push(this.transpileQuantifiedExpressionPython(expr.right, indent + "    "));
                }
            }
            
            lines.push(`${indent})`);
        }
        
        return lines.join('\n');
    }

    // Helper to transpile QuantifiedExpression to Python
    private transpileQuantifiedExpressionPython(expr: AST.QuantifiedExpression, indent: string = ""): string {
        const quantifier = expr.quantifier === 'forall' ? 'ForAll' : 'Exists';
        const lines: string[] = [];
        lines.push(`${indent}# Quantified Expression: ${quantifier}`);
        lines.push(`${indent}quantified_expr = ${quantifier}(`);
        lines.push(`${indent}    variable="${expr.variable}",`);
        
        if (expr.domain) {
            lines.push(`${indent}    domain="${expr.domain}",`);
        }
        
        lines.push(`${indent}    body=`);
        
        // Recursively transpile body
        if (AST.isIntent(expr.body)) {
            lines.push(`${indent}        Intent(${JSON.stringify(expr.body.intentType)})`);
        } else if (AST.isLogicalExpression(expr.body)) {
            lines.push(this.transpileLogicalExpressionPython(expr.body, indent + "        "));
        } else if (AST.isQuantifiedExpression(expr.body)) {
            lines.push(this.transpileQuantifiedExpressionPython(expr.body, indent + "        "));
        }
        
        lines.push(`${indent})`);
        return lines.join('\n');
    }

    // Helper to transpile RuleDefinition to Python
    private transpileRuleDefinitionPython(rule: AST.RuleDefinition, indent: string = ""): string {
        const lines: string[] = [];
        lines.push(`${indent}# Rule Definition: ${rule.ruleId}`);
        if (rule.domain) {
            lines.push(`${indent}# Domain: ${rule.domain}`);
        }
        lines.push(`${indent}rule = RuleDefinition(`);
        lines.push(`${indent}    ruleId="${rule.ruleId}",`);
        if (rule.domain) {
            lines.push(`${indent}    domain="${rule.domain}",`);
        }
        if (rule.bidirectional) {
            lines.push(`${indent}    bidirectional=${rule.bidirectional},`);
        }
        if (rule.confidence !== undefined) {
            lines.push(`${indent}    confidence=${rule.confidence},`);
        }
        lines.push(`${indent}    premises=`);
        
        // Transpile premises (single LogicalNode)
        if (AST.isIntent(rule.premises)) {
            lines.push(`${indent}        Intent(${JSON.stringify(rule.premises.intentType)}),`);
        } else if (AST.isLogicalExpression(rule.premises)) {
            lines.push(this.transpileLogicalExpressionPython(rule.premises, indent + "        "));
        } else if (AST.isQuantifiedExpression(rule.premises)) {
            lines.push(this.transpileQuantifiedExpressionPython(rule.premises, indent + "        "));
        }
        
        lines.push(`${indent}    conclusion=`);
        
        // Transpile conclusion
        if (AST.isIntent(rule.conclusion)) {
            lines.push(`${indent}        Intent(${JSON.stringify(rule.conclusion.intentType)})`);
        } else if (AST.isLogicalExpression(rule.conclusion)) {
            lines.push(this.transpileLogicalExpressionPython(rule.conclusion, indent + "        "));
        } else if (AST.isQuantifiedExpression(rule.conclusion)) {
            lines.push(this.transpileQuantifiedExpressionPython(rule.conclusion, indent + "        "));
        }
        
        lines.push(`${indent})`);
        return lines.join('\n');
    }

    /**
     * Convert RelationshipNode to Python (v2.1.0)
     */
    private relationshipToPython(rel: AST.RelationshipNode): string {
        const sourceId = rel.source.replace('$id:', '');
        const targetId = rel.target.replace('$id:', '');
        
        let code = `# ${rel.relationshipType.charAt(0).toUpperCase() + rel.relationshipType.slice(1)} Relationship: '${sourceId}' ${rel.relationName} '${targetId}'\n`;
        
        const confStr = rel.confidence !== undefined ? `, confidence=${rel.confidence}` : '';
        const biStr = rel.bidirectional ? ', bidirectional=True' : '';
        
        code += `Relationship(type='${rel.relationshipType}', source='${sourceId}', target='${targetId}', relation='${rel.relationName}'${confStr}${biStr})`;
        
        return code;
    }

    private transpileIntent(intent: AST.Intent): string {
        const graphRep = intent.statements.map((node: AST.Statement) => {
            const attrs = node.attributes ? `, attributes=${JSON.stringify(node.attributes)}` : "";
            const tense = node.relation.tense ? `, tense="${node.relation.tense}"` : "";
            return `Relation(subject="${node.subject.name}", predicate="${node.relation.name}", object="${node.object.name}"${attrs}${tense})`;
        }).join(",\n    ");
        
        const lines: string[] = [];
        const confStr = intent.confidence ? `Confidence: ${intent.confidence}` : 'Confidence: N/A';
        const cohStr = intent.coherence !== undefined ? `, Coherence: ${intent.coherence}` : '';
        lines.push(`# AIQL Intent: ${intent.intentType} (${confStr}${cohStr})`);
        
        // Detect affective relations and add placeholder comments
        const affectiveInfo = this.detectAffectiveRelations(intent);
        if (affectiveInfo.length > 0) {
            lines.push(`# Affective Relations Detected:`);
            affectiveInfo.forEach(info => {
                lines.push(`#   - ${info}`);
            });
            lines.push(`# NOTE: Automatic soul.process() integration planned for v0.7.0`);
        }
        
        // Add metadata information
        if (intent.identifier) {
            lines.push(`# Identifier: ${intent.identifier}`);
        }
        if (intent.groupIdentifier) {
            lines.push(`# Group: ${intent.groupIdentifier}`);
        }
        if (intent.sequenceNumber !== undefined) {
            lines.push(`# Sequence: ${intent.sequenceNumber}`);
        }
        if (intent.temperature !== undefined) {
            lines.push(`# Temperature: ${intent.temperature}`);
        }
        if (intent.entropy !== undefined) {
            lines.push(`# Entropy: ${intent.entropy}`);
        }
        if (intent.version) {
            lines.push(`# Version: ${intent.version}`);
        }
        if (intent.origin) {
            lines.push(`# Origin: ${intent.origin}`);
        }
        if (intent.citations && intent.citations.length > 0) {
            lines.push(`# Citations: ${JSON.stringify(intent.citations)}`);
        }
        
        // Add security information
        if (intent.security) {
            const secInfo = [];
            if (intent.security.signed) {
                secInfo.push(`Signed by ${intent.security.signerAgentId || 'unknown'}`);
            }
            if (intent.security.encrypted) {
                secInfo.push(`Encrypted for ${intent.security.recipientAgentId || 'unknown'}`);
            }
            lines.push(`# Security: ${secInfo.join(', ')}`);
        }
        
        // Build context dictionary
        const contextEntries: string[] = [];
        contextEntries.push(`"scope": "${intent.scope || 'global'}"`);
        
        // Add context parameters if present
        if (intent.contextParams) {
            for (const [key, value] of Object.entries(intent.contextParams)) {
                contextEntries.push(`"${key}": "${value}"`);
            }
        }
        
        // Add new metadata to context
        if (intent.identifier) contextEntries.push(`"identifier": "${intent.identifier}"`);
        if (intent.groupIdentifier) contextEntries.push(`"groupIdentifier": "${intent.groupIdentifier}"`);
        if (intent.sequenceNumber !== undefined) contextEntries.push(`"sequenceNumber": ${intent.sequenceNumber}`);
        if (intent.temperature !== undefined) contextEntries.push(`"temperature": ${intent.temperature}`);
        if (intent.entropy !== undefined) contextEntries.push(`"entropy": ${intent.entropy}`);
        if (intent.version) contextEntries.push(`"version": "${intent.version}"`);
        if (intent.origin) contextEntries.push(`"origin": "${intent.origin}"`);
        if (intent.citations && intent.citations.length > 0) {
            contextEntries.push(`"citations": ${JSON.stringify(intent.citations)}`);
        }
        
        // Add security context
        if (intent.security) {
            const securityObj: Record<string, unknown> = {};
            if (intent.security.signed !== undefined) securityObj.signed = intent.security.signed;
            if (intent.security.encrypted !== undefined) securityObj.encrypted = intent.security.encrypted;
            if (intent.security.signerAgentId) securityObj.signerAgentId = intent.security.signerAgentId;
            if (intent.security.recipientAgentId) securityObj.recipientAgentId = intent.security.recipientAgentId;
            contextEntries.push(`"security": ${JSON.stringify(securityObj, null, 0)}`);
        }
        
        lines.push(`context = {${contextEntries.join(', ')}}`);
        
        // Handle empty statements
        if (intent.statements.length === 0) {
            lines.push(`graph_data = []`);
        } else {
            lines.push(`graph_data = [\n    ${graphRep}\n]`);
        }
        
        return lines.join('\n');
    }

    private detectAffectiveRelations(intent: AST.Intent): string[] {
        const affectiveRelations = ['feels', 'desires', 'experiences', 'seeks', 'wants', 'avoids'];
        const affectiveEmotions = [
            'Joy', 'Happiness', 'Delight', // Positive emotions → Reward
            'Suffering', 'Pain', 'Sadness', // Negative emotions → Pain
            'Stress', 'Anxiety', 'Tension', // Stress emotions → Stress
            'Curiosity', 'Interest', 'Wonder', // Curiosity emotions → Novelty
            'Fear', 'Hope', 'Surprise', 'Empathy', 'Compassion'
        ];
        
        const detected: string[] = [];
        
        for (const node of intent.statements) {
            const relation = node.relation.name.toLowerCase();
            
            // Check for affective relations
            if (affectiveRelations.includes(relation)) {
                const emotion = node.object.name;
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
                
                const intensity = node.attributes?.intensity || 'unspecified';
                detected.push(`${node.subject.name} [${relation}] ${emotion} → soul.process({type: "${stimulusType}", intensity: ${intensity}})`);
            }
            
            // Check for affective objects even without affective relations
            if (affectiveEmotions.includes(node.object.name)) {
                detected.push(`Emotion concept: ${node.object.name}`);
            }
        }
        
        return detected;
    }
}
