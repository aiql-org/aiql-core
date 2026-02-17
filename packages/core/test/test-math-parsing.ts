import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Tokenizer } from '../src/tokenizer.js';
import { Parser } from '../src/parser.js';
import * as AST from '../src/ast.js';

describe('AIQL Math Parsing', () => {
  it('should parse simple arithmetic expressions', () => {
    const code = `
      !Test {
        <A> = 1 + 2
      }
    `;
    const tokens = new Tokenizer(code).tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    const intent = ast.body[0] as AST.Intent;
    const stmt = intent.statements[0];
    assert.strictEqual(stmt.relation.name, '=');
    
    assert.ok(AST.isMathExpression(stmt.object));
    const expr = stmt.object as AST.MathExpression;
    assert.strictEqual(expr.operator, 'PLUS');
    assert.strictEqual((expr.left as AST.Literal).value, 1);
    assert.strictEqual((expr.right as AST.Literal).value, 2);
  });

  it('should parse operator precedence (multiplication before addition)', () => {
    const code = `
      !Test {
        <B> = 1 + 2 * 3
      }
    `;
    const tokens = new Tokenizer(code).tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    const stmt = (ast.body[0] as AST.Intent).statements[0];
    const expr = stmt.object as AST.MathExpression;
    
    // 1 + (2 * 3)
    assert.strictEqual(expr.operator, 'PLUS');
    assert.strictEqual((expr.left as AST.Literal).value, 1);
    
    const right = expr.right as AST.MathExpression;
    assert.strictEqual(right.operator, 'MULTIPLY');
    assert.strictEqual((right.left as AST.Literal).value, 2);
    assert.strictEqual((right.right as AST.Literal).value, 3);
  });

  it('should parse function application', () => {
    const code = `
        !Test {
            <C> = sin(3.14)
        }
    `;
    const tokens = new Tokenizer(code).tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    
    const stmt = (ast.body[0] as AST.Intent).statements[0];
    const expr = stmt.object as AST.FunctionApplication;
    
    assert.ok(AST.isFunctionApplication(expr));
    assert.strictEqual(expr.functionName, 'sin');
    assert.strictEqual(expr.arguments.length, 1);
    assert.strictEqual((expr.arguments[0] as AST.Literal).value, 3.14);
  });

  it('should parse set operations', () => {
      const code = `
        !Test {
            <S> = <A> union <B> intersect <C>
        }
      `;
      // Precedence: union/intersect are equal in parser currently? 
      // check parser implementation: parseSetExpression loops. union/intersect handles left-associatively.
      
      const tokens = new Tokenizer(code).tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      const stmt = (ast.body[0] as AST.Intent).statements[0];
      const expr = stmt.object as AST.SetExpression;
      
      // (<A> union <B>) intersect <C> ? or union and intersect same level?
      // In parser: while (union || intersect) -> left-associative.
      
      assert.ok(AST.isSetExpression(expr));
      // Top level should be the last operation parsed -> left associative
      // ((A union B) intersect C)
      assert.strictEqual(expr.operator, 'INTERSECT');
      assert.strictEqual((expr.right as AST.Concept).name, '<C>');
      
      const left = expr.left as AST.SetExpression;
      assert.strictEqual(left.operator, 'UNION');
      assert.strictEqual((left.left as AST.Concept).name, '<A>');
      assert.strictEqual((left.right as AST.Concept).name, '<B>');
  });

  it('should parse lambda expressions', () => {
      const code = `
        !Test {
            <F> = lambda x, y: x + y
        }
      `;
      const tokens = new Tokenizer(code).tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      const stmt = (ast.body[0] as AST.Intent).statements[0];
      const expr = stmt.object as AST.LambdaExpression;

      assert.ok(AST.isLambdaExpression(expr));
      assert.deepStrictEqual(expr.parameters, ['x', 'y']);
      
      const body = expr.body as AST.MathExpression;
      assert.strictEqual(body.operator, 'PLUS');
  });
  it('should parse nested function applications', () => {
    const code = `
      !Test {
          <Val> = log(sqrt(100) + abs(-50))
      }
    `;
    const tokens = new Tokenizer(code).tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    const stmt = (ast.body[0] as AST.Intent).statements[0];
    const expr = stmt.object as AST.FunctionApplication;

    assert.strictEqual(expr.functionName, 'log');
    assert.strictEqual(expr.arguments.length, 1);
    
    const arg = expr.arguments[0] as AST.MathExpression;
    assert.strictEqual(arg.operator, 'PLUS');
    
    const left = arg.left as AST.FunctionApplication;
    assert.strictEqual(left.functionName, 'sqrt');
    
    const right = arg.right as AST.FunctionApplication;
    assert.strictEqual(right.functionName, 'abs');
  });

  it('should parse complex mixed operators', () => {
    // 1 + 2 * 3 ^ 4 should be 1 + (2 * (3 ^ 4))
    const code = `
      !Test {
          <Val> = 1 + 2 * 3 ^ 4
      }
    `;
    const tokens = new Tokenizer(code).tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    const stmt = (ast.body[0] as AST.Intent).statements[0];
    const expr = stmt.object as AST.MathExpression;

    assert.strictEqual(expr.operator, 'PLUS');
    const right = expr.right as AST.MathExpression;
    assert.strictEqual(right.operator, 'MULTIPLY');
    const power = right.right as AST.MathExpression;
    assert.strictEqual(power.operator, 'POWER');
  });
});
