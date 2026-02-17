import * as AST from '../../ast.js';
import { TranspilerBase } from '../base.js';

export class SQLTranspiler extends TranspilerBase {
    public transpile(program: AST.Program): string {
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
        
        for (const node of program.body) {
            if (!AST.isIntent(node)) continue;
            const intent = node;
            
            output += `-- Intent: ${intent.intentType}\n`;
            
            // Use intent-level provenance if exists, otherwise fall back to program-level
            const intentVersion = intent.version || program.version;
            const intentOrigin = intent.origin || program.origin;
            
            // Insert intent
            const intentValues = [
                `'${escapeSQLValue(intent.intentType)}'`,
                intent.scope ? `'${escapeSQLValue(intent.scope)}'` : 'NULL',
                intent.confidence !== undefined ? intent.confidence.toString() : 'NULL',
                intent.coherence !== undefined ? intent.coherence.toString() : 'NULL',
                intent.identifier ? `'${escapeSQLValue(intent.identifier)}'` : 'NULL',
                intent.groupIdentifier ? `'${escapeSQLValue(intent.groupIdentifier)}'` : 'NULL',
                intent.sequenceNumber !== undefined ? intent.sequenceNumber.toString() : 'NULL',
                intent.temperature !== undefined ? intent.temperature.toString() : 'NULL',
                intent.entropy !== undefined ? intent.entropy.toString() : 'NULL',
                intentVersion ? `'${escapeSQLValue(intentVersion)}'` : 'NULL',
                intentOrigin ? `'${escapeSQLValue(intentOrigin)}'` : 'NULL'
            ];

            // Start transaction for atomicity per intent
            output += "BEGIN TRANSACTION;\n";

            output += `INSERT INTO aiql_intents (intent_type, scope, confidence, coherence, identifier, group_identifier, sequence_number, temperature, entropy, version, origin)\n`;
            output += `VALUES (${intentValues.join(', ')});\n`;

            output += `INSERT INTO aiql_statements (intent_id, subject, relation, object, tense, attributes)\n`;
            
            if (intent.statements.length > 0) {
                // Bulk insert or multiple inserts
                intent.statements.forEach(stmt => {
                    const attrs = stmt.attributes ? `'${escapeSQLValue(JSON.stringify(stmt.attributes))}'` : 'NULL';
                    const tense = stmt.relation.tense ? `'${escapeSQLValue(stmt.relation.tense)}'` : 'NULL';
                    
                    output += `SELECT last_insert_rowid(), '${escapeSQLValue(this.expressionToString(stmt.subject))}', '${escapeSQLValue(stmt.relation.name)}', '${escapeSQLValue(this.expressionToString(stmt.object))}', ${tense}, ${attrs} UNION ALL \n`;
                });
                // Remove last UNION ALL and add semicolon
                output = output.slice(0, -11) + ";\n";
            } else {
                 // No statements to insert, just close the statement
                 output += `SELECT last_insert_rowid(), 'NULL', 'NULL', 'NULL', NULL, NULL WHERE 0;\n`;
            }
            
            // Insert Context Params
            if (intent.contextParams) {
                for (const [key, value] of Object.entries(intent.contextParams)) {
                    output += `INSERT INTO aiql_context_params (intent_id, param_key, param_value) VALUES (last_insert_rowid(), '${escapeSQLValue(key)}', '${escapeSQLValue(value)}');\n`;
                }
            }

            // Insert Citations
            if (intent.citations && intent.citations.length > 0) {
                for (const citation of intent.citations) {
                    output += `INSERT INTO aiql_citations (intent_id, citation) VALUES (last_insert_rowid(), '${escapeSQLValue(citation)}');\n`;
                }
            }
            
            output += "COMMIT;\n\n";
        }
        
        // Relationships insertion (v2.1.0)
        const relationships = program.body.filter(AST.isRelationshipNode);
        if (relationships.length > 0) {
            output += "-- Insert inter-intent relationships\n";
            output += "BEGIN TRANSACTION;\n";
            for (const rel of relationships) {
                const source = rel.source.replace('$id:', ''); // Strip marker if present
                const target = rel.target.replace('$id:', '');
                const meta = rel.metadata ? `'${escapeSQLValue(JSON.stringify(rel.metadata))}'` : 'NULL';
                const conf = rel.confidence !== undefined ? rel.confidence : 1.0;
                const bi = rel.bidirectional ? 1 : 0;
                
                output += `INSERT INTO aiql_relationships (source_id, target_id, relationship_type, relation_name, confidence, bidirectional, metadata)\n`;
                output += `VALUES ('${escapeSQLValue(source)}', '${escapeSQLValue(target)}', '${escapeSQLValue(rel.relationshipType)}', '${escapeSQLValue(rel.relationName)}', ${conf}, ${bi}, ${meta});\n`;
            }
            output += "COMMIT;\n\n";
        }

        return output;
    }

    private generateQuerySQL(program: AST.Program): string {
        let output = "";
        
        // Filter for valid Query intents
        const queries = program.body.filter(node => AST.isIntent(node) && node.intentType === '!Query');
        
        if (queries.length === 0) {
            output += "-- No '!Query' intents found in program.\n";
            return output;
        }

        for (const query of queries as AST.Intent[]) {
             output += `-- Query: ${JSON.stringify(query.statements.map(s => `${this.expressionToString(s.subject)} ${s.relation.name} ${this.expressionToString(s.object)}`))}\n`;
             
             // Simple pattern matching for SQL generation
             
             for (const stmt of query.statements) {
                 const subject = this.expressionToString(stmt.subject);
                 const relation = stmt.relation.name;
                 const object = this.expressionToString(stmt.object);
                 
                 const isSubjectVar = subject.startsWith('?');
                 const isRelationVar = relation.startsWith('?');
                 const isObjectVar = object.startsWith('?');
                 
                 output += "SELECT i.intent_type, s.subject, s.relation, s.object, i.confidence\n";
                 output += "FROM aiql_statements s\n";
                 output += "JOIN aiql_intents i ON s.intent_id = i.intent_id\n";
                 output += "WHERE 1=1\n";
                 
                 if (!isSubjectVar) {
                     output += `  AND s.subject = '${subject.replace(/'/g, "''")}'\n`;
                 }
                 if (!isRelationVar) {
                     output += `  AND s.relation = '${relation.replace(/'/g, "''")}'\n`;
                 }
                 if (!isObjectVar) {
                     output += `  AND s.object = '${object.replace(/'/g, "''")}'\n`;
                 }
                 
                 // Add threshold filters from attributes if present
                 if (stmt.attributes && stmt.attributes.confidence_threshold) {
                     output += `  AND i.confidence >= ${stmt.attributes.confidence_threshold}\n`;
                 }
                 
                 output += "ORDER BY i.confidence DESC;\n\n";
             }
        }
        
        return output;
    }
}
