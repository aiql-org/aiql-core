import * as AST from '../../ast.js';
import { TranspilerBase } from '../base.js';

export class PythonTranspiler extends TranspilerBase {
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
        
        // Transpile all node types
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
            } else if (AST.isConsensusNode(node)) {
                lines.push(this.transpileConsensus(node));
                lines.push("");
            } else if (AST.isCoordinateNode(node)) {
                lines.push(this.transpileCoordinate(node));
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

    private transpileConsensus(node: AST.ConsensusNode): string {
        const lines: string[] = [];
        lines.push(`# Consensus: ${this.expressionToPython(node.topic)}`);
        
        const participants = node.participants.map(p => this.expressionToPython(p)).join(', ');
        const timeoutStr = node.timeout ? `, timeout=${node.timeout}` : '';
        
        lines.push(`consensus = Consensus(`);
        lines.push(`    topic=${this.expressionToPython(node.topic)},`);
        lines.push(`    participants=[${participants}],`);
        lines.push(`    threshold=${node.threshold}${timeoutStr}`);
        lines.push(`)`);
        lines.push(`result = consensus.resolve()`);
        
        return lines.join('\n');
    }

    private transpileCoordinate(node: AST.CoordinateNode): string {
        const lines: string[] = [];
        lines.push(`# Coordinate: ${this.expressionToPython(node.goal)}`);
        
        const participants = node.participants.map(p => this.expressionToPython(p)).join(', ');
        
        lines.push(`coordination = Coordinate(`);
        lines.push(`    goal=${this.expressionToPython(node.goal)},`);
        lines.push(`    participants=[${participants}],`);
        lines.push(`    strategy="${node.strategy}"`);
        lines.push(`)`);
        lines.push(`plan = coordination.execute()`);
        
        return lines.join('\n');
    }

    private attributesToPython(attributes: Record<string, AST.Expression | string | number | boolean>): string {
        const parts: string[] = [];
        for (const [key, value] of Object.entries(attributes)) {
            let pyValue = "";
            if (typeof value === 'string') {
                pyValue = `"${value}"`;
            } else if (typeof value === 'number') {
                pyValue = value.toString();
            } else if (typeof value === 'boolean') {
                pyValue = value ? "True" : "False";
            } else {
                pyValue = this.expressionToPython(value);
            }
            parts.push(`"${key}": ${pyValue}`);
        }
        return `{${parts.join(', ')}}`;
    }

    private transpileIntent(intent: AST.Intent): string {
        const graphRep = intent.statements.map((node: AST.Statement) => {
            const attrs = node.attributes ? `, attributes=${this.attributesToPython(node.attributes)}` : "";
            const tense = node.relation.tense ? `, tense="${node.relation.tense}"` : "";
            return `Relation(subject=${this.expressionToPython(node.subject)}, predicate="${node.relation.name}", object=${this.expressionToPython(node.object)}${attrs}${tense})`;
        }).join(",\n    ");
        
        const lines: string[] = [];
        const confStr = intent.confidence ? `Confidence: ${intent.confidence}` : 'Confidence: N/A';
        const cohStr = intent.coherence !== undefined ? `, Coherence: ${intent.coherence}` : '';
        lines.push(`# AIQL Intent: ${intent.intentType} (${confStr}${cohStr})`);
        
        // Detect affective relations and generate soul.process() calls
        const soulCalls = this.getSoulProcessCalls(intent);
        if (soulCalls.length > 0) {
            lines.push(`# Affective Relations: Generating soul.process() calls`);
            soulCalls.forEach(call => {
                lines.push(`# Source: ${call.source}`);
                // Ensure intensity is handled correctly (string vs number)
                const intensityVal = typeof call.intensity === 'string' ? `"${call.intensity}"` : call.intensity;
                lines.push(`soul.process({"type": "${call.type}", "intensity": ${intensityVal}, "source": "${call.source}"})`);
            });
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


    private expressionToPython(expr: AST.Expression): string {
        if (AST.isSpatialExpression(expr)) {
            if (expr.source === 'literal' && expr.literal) {
                const { lat, lon, region } = expr.literal;
                const regionStr = region ? `, region="${region}"` : "";
                return `Location(lat=${lat}, lon=${lon}${regionStr})`;
            } else if (expr.source === 'variable' && expr.variableName) {
                return `Location(ref="${expr.variableName}")`;
            }
        }
        if (AST.isConcept(expr)) return `"${expr.name}"`;
        if (AST.isIdentifier(expr)) return expr.name;
        if (AST.isLiteral(expr)) return JSON.stringify(expr.value);
        
        if (AST.isUnaryExpression(expr)) {
            const op = expr.operator === 'MINUS' ? '-' : 'not ';
            return `${op}(${this.expressionToPython(expr.argument)})`;
        }
        
        if (AST.isMathExpression(expr)) {
            const left = this.expressionToPython(expr.left);
            const right = this.expressionToPython(expr.right);
             const opMap: Record<AST.MathOperator, string> = {
                 'PLUS': '+', 'MINUS': '-', 'MULTIPLY': '*', 'DIVIDE': '/', 'POWER': '**', 'MODULO': '%', 'ASSIGN': '=='
             };
            return `(${left} ${opMap[expr.operator]} ${right})`;
        }

        if (AST.isComparisonExpression(expr)) {
             const left = this.expressionToPython(expr.left);
             const right = this.expressionToPython(expr.right);
             const opMap: Record<AST.ComparisonOperator, string> = {
                 'GT': '>', 'LT': '<', 'GTE': '>=', 'LTE': '<=', 'EQ': '==', 'NEQ': '!='
             };
             return `(${left} ${opMap[expr.operator]} ${right})`;
        }
        
        if (AST.isSetExpression(expr)) {
             const left = this.expressionToPython(expr.left);
             const right = this.expressionToPython(expr.right);
             if (expr.operator === 'UNION') return `(${left} | ${right})`;
             if (expr.operator === 'INTERSECT') return `(${left} & ${right})`;
        }
        
        if (AST.isFunctionApplication(expr)) {
             const args = expr.arguments.map(arg => this.expressionToPython(arg)).join(', ');
             if (expr.functionName === 'sin') return `math.sin(${args})`;
             if (expr.functionName === 'cos') return `math.cos(${args})`;
             if (expr.functionName === 'tan') return `math.tan(${args})`;
             if (expr.functionName === 'log') return `math.log(${args})`;
             if (expr.functionName === 'sqrt') return `math.sqrt(${args})`;
             return `${expr.functionName}(${args})`;
        }
        
        if (AST.isLambdaExpression(expr)) {
            return `lambda ${expr.parameters.join(', ')}: ${this.expressionToPython(expr.body)}`;
        }

        return JSON.stringify(expr);
    }
}
