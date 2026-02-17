import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Tokenizer } from '../src/tokenizer.js';
import { Parser } from '../src/parser.js';
import { Transpiler } from '../src/transpiler.js';

describe('AIQL Math Transpilation', () => {
    
  it('should transpile math to Python', () => {
    const code = `
      !Calculate {
        <Result> = 10 * 5 + 2
      }
    `;
    const tokens = new Tokenizer(code).tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const transpiler = new Transpiler();
    
    // Python transpilation
    const pythonCode = transpiler.transpile(ast, 'python') as string;
    
    // Expect: Relation(subject="<Result>", predicate="=", object=((10 * 5) + 2))
    assert.ok(pythonCode.includes('Relation(subject="<Result>", predicate="=", object=((10 * 5) + 2)'));
  });

  it('should transpile math function to Python', () => {
    const code = `
      !Calculate {
        <Val> = sin(0.5)
      }
    `;
    const tokens = new Tokenizer(code).tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const transpiler = new Transpiler();
    
    const pythonCode = transpiler.transpile(ast, 'python') as string;
    assert.ok(pythonCode.includes('math.sin(0.5)'));
  });

  it('should transpile math to SQL (as string representation)', () => {
    const code = `
      !Calculate {
        <Result> = 10 + 20
      }
    `;
    const tokens = new Tokenizer(code).tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const transpiler = new Transpiler();
    
    const sqlCode = transpiler.transpile(ast, 'sql') as string;
    
    // Check INSERT statement contains the string representation "(10 + 20)"
    // It calls expressionToString from TranspilerBase
    // 10 + 20 -> (10 + 20)
    assert.ok(sqlCode.includes("'(10 + 20)'"));
  });
  it('should transpile set operations to Python', () => {
    const code = `
      !Sets {
        <S> = <A> union <B>
      }
    `;
    const tokens = new Tokenizer(code).tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const transpiler = new Transpiler();
    
    const pythonCode = transpiler.transpile(ast, 'python') as string;
    // Basic check: Ensure it produces a Relation and contains the set operation concepts
    assert.ok(pythonCode.includes('Relation(subject="<S>", predicate="=", object='));
    assert.ok(pythonCode.includes('<A>'));
    assert.ok(pythonCode.includes('<B>'));
  });

  it('should transpile complex formula to SQL string', () => {
    const code = `
      !Calc {
        <Res> = 10 * (5 + 2) ^ 3
      }
    `;
    const tokens = new Tokenizer(code).tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const transpiler = new Transpiler();
    
    const sqlCode = transpiler.transpile(ast, 'sql') as string;
    // 10 * (5 + 2) ^ 3 -> (10 * ((5 + 2) ^ 3)) or similar
    // The expressionToString helper adds parens around every binary op
    assert.ok(sqlCode.includes("'(10 * ((5 + 2) ^ 3))'"));
  });
});
