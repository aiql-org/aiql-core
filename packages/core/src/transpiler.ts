
import * as AST from './ast.js';
import * as yaml from 'js-yaml';

export class Transpiler {
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
        } catch (e: any) {
            return `Error: ${e.message}`;
        }
    }

    private toInterchangeFormat(program: AST.Program): any {
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
            const intentObj: any = {
                intentType: intent.intentType,
                scope: intent.scope,
                contextParams: intent.contextParams,
                confidence: intent.confidence,
                coherence: intent.coherence,  // v2.6.0: Quantum coherence
                statements: intent.statements.map((node: AST.Statement) => {
                    const stmtObj: any = {
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
                intentObj.security = {
                    signed: intent.security.signed,
                    encrypted: intent.security.encrypted,
                    signerAgentId: intent.security.signerAgentId,
                    recipientAgentId: intent.security.recipientAgentId,
                    timestamp: intent.security.timestamp,
                };
                
                // Only include signature/encrypted data if they exist
                if (intent.security.signature) {
                    intentObj.security.signature = intent.security.signature;
                }
                if (intent.security.encryptedData) {
                    intentObj.security.encryptedData = intent.security.encryptedData;
                }
            }
            
            return intentObj;
        });
        
        const result: any = { 
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
    private intentToObject(intent: AST.Intent): any {
        const intentObj: any = {
            nodeType: 'Intent',
            intentType: intent.intentType,
            scope: intent.scope,
            contextParams: intent.contextParams,
            confidence: intent.confidence,
            coherence: intent.coherence,  // v2.6.0
            statements: intent.statements.map((node: AST.Statement) => {
                const stmtObj: any = {
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
            intentObj.security = {
                signed: intent.security.signed,
                encrypted: intent.security.encrypted,
                signerAgentId: intent.security.signerAgentId,
                recipientAgentId: intent.security.recipientAgentId,
                timestamp: intent.security.timestamp,
            };
            
            // Only include signature/encrypted data if they exist
            if (intent.security.signature) {
                intentObj.security.signature = intent.security.signature;
            }
            if (intent.security.encryptedData) {
                intentObj.security.encryptedData = intent.security.encryptedData;
            }
        }
        
        return intentObj;
    }

    // Helper method to convert LogicalExpression to object (recursive)
    private logicalExpressionToObject(expr: AST.LogicalExpression): any {
        const obj: any = {
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
    private quantifiedExpressionToObject(expr: AST.QuantifiedExpression): any {
        const obj: any = {
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
    private ruleDefinitionToObject(rule: AST.RuleDefinition): any {
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
    private relationshipToObject(rel: AST.RelationshipNode): any {
        const obj: any = {
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
            const securityObj: any = {};
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

    // =============================================================================
    // SQL TRANSPILATION
    // =============================================================================

    private toSQL(program: AST.Program): string {
        let output = "-- AIQL to SQL Transpilation\n";
        output += "-- Generated: " + new Date().toISOString() + "\n\n";

        // Add program-level metadata as comments
        if (program.version || program.origin || (program.citations && program.citations.length > 0)) {
            output += "-- Program Metadata\n";
            if (program.version) output += `-- Version: ${program.version}\n`;
            if (program.origin) output += `-- Origin: ${program.origin}\n`;
            if (program.citations && program.citations.length > 0) {
                output += `-- Citations: ${program.citations.join(', ')}\n`;
            }
            output += "\n";
        }

        // ========== SECTION 1: STORAGE SQL (Schema + Data) ==========
        output += "-- ============================================================\n";
        output += "-- SECTION 1: STORAGE SQL (Schema Definition & Data Insertion)\n";
        output += "-- ============================================================\n\n";
        output += this.generateStorageSQL(program);

        output += "\n\n";

        // ========== SECTION 2: QUERY SQL (Retrieval) ==========
        output += "-- ============================================================\n";
        output += "-- SECTION 2: QUERY SQL (Knowledge Retrieval)\n";
        output += "-- ============================================================\n\n";
        output += this.generateQuerySQL(program);

        return output;
    }

    private generateStorageSQL(program: AST.Program): string {
        let output = "";

        /**
         * Escape SQL string values to prevent SQL injection
         * Handles: single quotes, backslashes, newlines, carriage returns, NULL bytes
         */
        const escapeSQLValue = (value: string): string => {
            return value
                .replace(/\\/g, '\\\\')    // Escape backslashes first
                .replace(/'/g, "''")       // Escape single quotes (SQL standard)
                .replace(/\n/g, '\\n')     // Escape newlines
                .replace(/\r/g, '\\r')     // Escape carriage returns
                .replace(/\0/g, '');       // Remove NULL bytes
        };

        // Schema definitions
        output += "-- Create tables for AIQL knowledge representation\n\n";
        
        output += "-- Intents table: stores goal-oriented queries/assertions\n";
        output += "CREATE TABLE IF NOT EXISTS aiql_intents (\n";
        output += "  intent_id INTEGER PRIMARY KEY AUTOINCREMENT,\n";
        output += "  intent_type VARCHAR(50) NOT NULL,\n";
        output += "  scope VARCHAR(50),\n";
        output += "  confidence REAL,\n";
        output += "  coherence REAL,\n";  // v2.6.0: Quantum coherence
        output += "  identifier VARCHAR(100),\n";
        output += "  group_identifier VARCHAR(100),\n";
        output += "  sequence_number INTEGER,\n";
        output += "  temperature REAL,\n";
        output += "  entropy REAL,\n";
        output += "  version VARCHAR(20),\n";
        output += "  origin TEXT,\n";
        output += "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n";
        output += ");\n\n";

        output += "-- Statements table: atomic knowledge triples (subject-relation-object)\n";
        output += "CREATE TABLE IF NOT EXISTS aiql_statements (\n";
        output += "  statement_id INTEGER PRIMARY KEY AUTOINCREMENT,\n";
        output += "  intent_id INTEGER NOT NULL,\n";
        output += "  subject VARCHAR(255) NOT NULL,\n";
        output += "  relation VARCHAR(255) NOT NULL,\n";
        output += "  object VARCHAR(255) NOT NULL,\n";
        output += "  tense VARCHAR(50),\n";
        output += "  attributes TEXT,\n";
        output += "  FOREIGN KEY (intent_id) REFERENCES aiql_intents(intent_id)\n";
        output += ");\n\n";

        output += "-- Citations table: provenance tracking\n";
        output += "CREATE TABLE IF NOT EXISTS aiql_citations (\n";
        output += "  citation_id INTEGER PRIMARY KEY AUTOINCREMENT,\n";
        output += "  intent_id INTEGER NOT NULL,\n";
        output += "  citation VARCHAR(500) NOT NULL,\n";
        output += "  FOREIGN KEY (intent_id) REFERENCES aiql_intents(intent_id)\n";
        output += ");\n\n";

        output += "-- Context parameters table: flexible key-value storage\n";
        output += "CREATE TABLE IF NOT EXISTS aiql_context_params (\n";
        output += "  param_id INTEGER PRIMARY KEY AUTOINCREMENT,\n";
        output += "  intent_id INTEGER NOT NULL,\n";
        output += "  param_key VARCHAR(100) NOT NULL,\n";
        output += "  param_value VARCHAR(500) NOT NULL,\n";
        output += "  FOREIGN KEY (intent_id) REFERENCES aiql_intents(intent_id)\n";
        output += ");\n\n";

        output += "-- Relationships table: inter-statement/inter-intent relationships (v2.1.0)\n";
        output += "CREATE TABLE IF NOT EXISTS aiql_relationships (\n";
        output += "  rel_id INTEGER PRIMARY KEY AUTOINCREMENT,\n";
        output += "  source_id VARCHAR(100) NOT NULL,  -- References aiql_intents.identifier\n";
        output += "  target_id VARCHAR(100) NOT NULL,  -- References aiql_intents.identifier\n";
        output += "  relationship_type VARCHAR(20) NOT NULL,  -- 'temporal', 'causal', 'logical'\n";
        output += "  relation_name VARCHAR(50) NOT NULL,  -- 'before', 'after', 'causes', etc.\n";
        output += "  confidence REAL DEFAULT 1.0,\n";
        output += "  bidirectional BOOLEAN DEFAULT 0,\n";
        output += "  metadata TEXT,  -- JSON-encoded metadata\n";
        output += "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n";
        output += ");\n\n";

        output += "-- Indexes for performance\n";
        output += "CREATE INDEX IF NOT EXISTS idx_statements_subject ON aiql_statements(subject);\n";
        output += "CREATE INDEX IF NOT EXISTS idx_statements_relation ON aiql_statements(relation);\n";
        output += "CREATE INDEX IF NOT EXISTS idx_statements_object ON aiql_statements(object);\n";
        output += "CREATE INDEX IF NOT EXISTS idx_intents_type ON aiql_intents(intent_type);\n";
        output += "CREATE INDEX IF NOT EXISTS idx_rel_source ON aiql_relationships(source_id);\n";
        output += "CREATE INDEX IF NOT EXISTS idx_rel_target ON aiql_relationships(target_id);\n";
        output += "CREATE INDEX IF NOT EXISTS idx_rel_type ON aiql_relationships(relationship_type);\n\n";

        // Data insertion
        output += "-- Insert data from AIQL program\n\n";
        
        let intentIdCounter = 1;
        // For now, only transpile Intent nodes; skip logical expressions until fully implemented
        for (const node of program.body) {
            if (!AST.isIntent(node)) continue;
            const intent = node;
            
            output += `-- Intent ${intentIdCounter}: ${intent.intentType}\n`;
            
            // Use intent-level provenance if exists, otherwise fall back to program-level
            const intentVersion = intent.version || program.version;
            const intentOrigin = intent.origin || program.origin;
            const intentCitations = intent.citations || program.citations;
            
            // Insert intent
            const intentValues = [
                `'${escapeSQLValue(intent.intentType)}'`,
                intent.scope ? `'${escapeSQLValue(intent.scope)}'` : 'NULL',
                intent.confidence !== undefined ? intent.confidence.toString() : 'NULL',
                intent.coherence !== undefined ? intent.coherence.toString() : 'NULL',  // v2.6.0
                intent.identifier ? `'${escapeSQLValue(intent.identifier)}'` : 'NULL',
                intent.groupIdentifier ? `'${escapeSQLValue(intent.groupIdentifier)}'` : 'NULL',
                intent.sequenceNumber !== undefined ? intent.sequenceNumber.toString() : 'NULL',
                intent.temperature !== undefined ? intent.temperature.toString() : 'NULL',
                intent.entropy !== undefined ? intent.entropy.toString() : 'NULL',
                intentVersion ? `'${escapeSQLValue(intentVersion)}'` : 'NULL',
                intentOrigin ? `'${escapeSQLValue(intentOrigin)}'` : 'NULL'
            ];

            output += `INSERT INTO aiql_intents (intent_type, scope, confidence, coherence, identifier, group_identifier, sequence_number, temperature, entropy, version, origin)\n`;
            output += `VALUES (${intentValues.join(', ')});\n`;

            // Insert statements for this intent
            if (intent.statements && intent.statements.length > 0) {
                for (const stmt of intent.statements) {
                    const subject = escapeSQLValue(stmt.subject.name);
                    const relation = escapeSQLValue(stmt.relation.name);
                    const object = escapeSQLValue(stmt.object.name);
                    const tense = stmt.relation.tense ? `'${escapeSQLValue(stmt.relation.tense)}'` : 'NULL';
                    const attributes = stmt.attributes ? escapeSQLValue(JSON.stringify(stmt.attributes)) : null;

                    output += `INSERT INTO aiql_statements (intent_id, subject, relation, object, tense, attributes)\n`;
                    output += `VALUES (${intentIdCounter}, '${subject}', '${relation}', '${object}', ${tense}, ${attributes ? `'${attributes}'` : 'NULL'});\n`;
                }
            }

            // Insert context parameters
            if (intent.contextParams) {
                for (const [key, value] of Object.entries(intent.contextParams)) {
                    output += `INSERT INTO aiql_context_params (intent_id, param_key, param_value)\n`;
                    output += `VALUES (${intentIdCounter}, '${escapeSQLValue(key)}', '${escapeSQLValue(value)}');\n`;
                }
            }

            // Insert citations
            if (intentCitations && intentCitations.length > 0) {
                for (const citation of intentCitations) {
                    output += `INSERT INTO aiql_citations (intent_id, citation)\n`;
                    output += `VALUES (${intentIdCounter}, '${escapeSQLValue(citation)}');\n`;
                }
            }

            output += "\n";
            intentIdCounter++;
        }

        // Insert relationships (v2.1.0)
        const relationships = program.body.filter(AST.isRelationshipNode);
        if (relationships.length > 0) {
            output += "-- Relationships between intents\n";
            for (const rel of relationships) {
                const sourceId = escapeSQLValue(rel.source.replace('$id:', ''));
                const targetId = escapeSQLValue(rel.target.replace('$id:', ''));
                const confidence = rel.confidence !== undefined ? rel.confidence : 1.0;
                const bidirectional = rel.bidirectional ? 1 : 0;
                const metadata = rel.metadata ? `'${escapeSQLValue(JSON.stringify(rel.metadata))}'` : 'NULL';
                
                output += `INSERT INTO aiql_relationships (source_id, target_id, relationship_type, relation_name, confidence, bidirectional, metadata)\n`;
                output += `VALUES ('${sourceId}', '${targetId}', '${rel.relationshipType}', '${rel.relationName}', ${confidence}, ${bidirectional}, ${metadata});\n`;
            }
            output += "\n";
        }

        return output;
    }

    private generateQuerySQL(_program: AST.Program): string {
        let output = "";

        output += "-- Example queries for retrieving AIQL knowledge\n\n";

        // Query 1: Basic triple pattern matching
        output += "-- Query 1: Find all statements with a specific relation\n";
        output += "SELECT s.subject, s.relation, s.object, i.intent_type, i.confidence\n";
        output += "FROM aiql_statements s\n";
        output += "JOIN aiql_intents i ON s.intent_id = i.intent_id\n";
        output += "WHERE s.relation = 'your_relation_here';\n\n";

        // Query 2: Join with context
        output += "-- Query 2: Find statements with specific context parameters\n";
        output += "SELECT s.subject, s.relation, s.object, cp.param_key, cp.param_value\n";
        output += "FROM aiql_statements s\n";
        output += "JOIN aiql_intents i ON s.intent_id = i.intent_id\n";
        output += "JOIN aiql_context_params cp ON i.intent_id = cp.intent_id\n";
        output += "WHERE cp.param_key = 'scope' AND cp.param_value = 'global';\n\n";

        // Query 3: Path queries (graph traversal)
        output += "-- Query 3: Graph traversal (2-hop path: A -> B -> C)\n";
        output += "SELECT s1.subject AS start_node, s1.relation AS first_relation,\n";
        output += "       s1.object AS intermediate_node, s2.relation AS second_relation,\n";
        output += "       s2.object AS end_node\n";
        output += "FROM aiql_statements s1\n";
        output += "JOIN aiql_statements s2 ON s1.object = s2.subject;\n\n";

        // Query 4: Aggregation with confidence
        output += "-- Query 4: High-confidence assertions\n";
        output += "SELECT i.intent_type, COUNT(*) AS statement_count, AVG(i.confidence) AS avg_confidence\n";
        output += "FROM aiql_intents i\n";
        output += "JOIN aiql_statements s ON i.intent_id = s.intent_id\n";
        output += "WHERE i.confidence > 0.8\n";
        output += "GROUP BY i.intent_type\n";
        output += "ORDER BY avg_confidence DESC;\n\n";

        // Query 5: Provenance tracking
        output += "-- Query 5: Statements with citations (provenance)\n";
        output += "SELECT s.subject, s.relation, s.object, c.citation, i.origin\n";
        output += "FROM aiql_statements s\n";
        output += "JOIN aiql_intents i ON s.intent_id = i.intent_id\n";
        output += "LEFT JOIN aiql_citations c ON i.intent_id = c.intent_id\n";
        output += "WHERE i.origin IS NOT NULL OR c.citation IS NOT NULL;\n\n";

        // Query 6: Metadata-based filtering
        output += "-- Query 6: Temperature and entropy analysis\n";
        output += "SELECT i.intent_type, i.temperature, i.entropy, COUNT(s.statement_id) AS statements\n";
        output += "FROM aiql_intents i\n";
        output += "LEFT JOIN aiql_statements s ON i.intent_id = s.intent_id\n";
        output += "WHERE i.temperature IS NOT NULL AND i.entropy IS NOT NULL\n";
        output += "GROUP BY i.intent_type, i.temperature, i.entropy;\n\n";

        // Query 7: Specific data from this program
        output += "-- Query 7: Retrieve all knowledge from this program\n";
        output += "SELECT i.intent_type, i.scope, s.subject, s.relation, s.object\n";
        output += "FROM aiql_intents i\n";
        output += "LEFT JOIN aiql_statements s ON i.intent_id = s.intent_id\n";
        output += "ORDER BY i.intent_id, s.statement_id;\n\n";

        // Query 8: Find all events that occurred before a specific event (v2.1.0)
        output += "-- Query 8: Find all events before a specific event (temporal relationships)\n";
        output += "SELECT r.source_id, r.target_id, r.relation_name\n";
        output += "FROM aiql_relationships r\n";
        output += "WHERE r.target_id = 'your_event_id' AND r.relation_name = 'before';\n\n";

        // Query 9: Find causal chains (v2.1.0)
        output += "-- Query 9: Find causal chains starting from a specific cause (recursive)\n";
        output += "WITH RECURSIVE causal_chain AS (\n";
        output += "  SELECT source_id, target_id, relation_name, 1 AS depth\n";
        output += "  FROM aiql_relationships\n";
        output += "  WHERE source_id = 'your_cause_id' AND relationship_type = 'causal'\n";
        output += "  UNION ALL\n";
        output += "  SELECT r.source_id, r.target_id, r.relation_name, c.depth + 1\n";
        output += "  FROM aiql_relationships r\n";
        output += "  JOIN causal_chain c ON r.source_id = c.target_id\n";
        output += "  WHERE r.relationship_type = 'causal' AND c.depth < 10\n";
        output += ")\n";
        output += "SELECT * FROM causal_chain;\n\n";

        // Query 10: Find all temporal relationships in chronological order (v2.1.0)
        output += "-- Query 10: All temporal relationships ordered\n";
        output += "SELECT source_id, relation_name, target_id, confidence\n";
        output += "FROM aiql_relationships\n";
        output += "WHERE relationship_type = 'temporal'\n";
        output += "ORDER BY source_id;\n\n";

        return output;
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
