import * as AST from './ast.js';
import { PythonTranspiler } from './transpiler/strategies/python.js';
import { SQLTranspiler } from './transpiler/strategies/sql.js';
import { JSONTranspiler, YAMLTranspiler } from './transpiler/strategies/json-yaml.js';
import { CoqTranspiler } from './transpiler/strategies/coq.js';
import { LeanTranspiler } from './transpiler/strategies/lean.js';

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
                    return new JSONTranspiler().transpile(program);
                case 'yaml':
                    return new YAMLTranspiler().transpile(program);
                case 'sql':
                    return new SQLTranspiler().transpile(program);
                case 'coq':
                    return new CoqTranspiler().transpile(program);
                case 'lean':
                    return new LeanTranspiler().transpile(program);
                case 'python':
                default:
                    return new PythonTranspiler().transpile(program);
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            return `Error: ${message}`;
        }
    }
}
