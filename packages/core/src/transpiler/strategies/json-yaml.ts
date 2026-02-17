import * as AST from '../../ast.js';
import * as yaml from 'js-yaml';
import { TranspilerBase } from '../base.js';

export class JSONTranspiler extends TranspilerBase {
    public transpile(program: AST.Program): string {
        return JSON.stringify(this.toInterchangeFormat(program), null, 2);
    }

    protected toInterchangeFormat(program: AST.Program): Record<string, unknown> {
        // Simplify AST for clean JSON/YAML
        const body = program.body.map(node => {
            if (AST.isIntent(node)) return this.intentToObject(node);
            if (AST.isLogicalExpression(node)) return this.logicalExpressionToObject(node);
            if (AST.isQuantifiedExpression(node)) return this.quantifiedExpressionToObject(node);
            if (AST.isRuleDefinition(node)) return this.ruleDefinitionToObject(node);
            if (AST.isRelationshipNode(node)) return this.relationshipToObject(node);
            return null;
        }).filter(n => n !== null);

        const intents = program.body.filter(AST.isIntent).map(intent => this.intentToObject(intent));
        
        const result: Record<string, unknown> = { 
            body,
            intents  // Legacy field support
        };
        
        if (program.version) result.version = program.version;
        if (program.origin) result.origin = program.origin;
        if (program.citations && program.citations.length > 0) result.citations = program.citations;
        
        if (program.security) {
            result.security = program.security;
        }
        
        return result;
    }
}

export class YAMLTranspiler extends JSONTranspiler {
    public transpile(program: AST.Program): string {
        return yaml.dump(this.toInterchangeFormat(program));
    }
}
