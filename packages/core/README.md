# @aiql-org/core

Core language processing for AIQL — tokenizer, parser, AST types, and multi-target transpiler.

## Transpilation Targets

| Target | Extension | Description |
|--------|-----------|-------------|
| Python | `.py` | Executable Python classes |
| JSON | `.json` | Structured interchange |
| YAML | `.yaml` | Human-readable config |
| SQL | `.sql` | Database schema + queries |
| Coq | `.v` | Formal verification proofs |
| Lean | `.lean` | Lean 4 theorem prover |

## Usage

```typescript
import { Tokenizer, Parser, Transpiler } from '@aiql-org/core';

const code = `!Assert { <AI> [learns] <Knowledge> } @0.95`;

const tokens = new Tokenizer(code).tokenize();
const ast = new Parser(tokens).parse();
const output = new Transpiler().transpile(ast, 'python');
```

## Attribute Comparisons (v2.7.0)

Attributes now support comparison operators for validation rules:

```aiql
!Query {
  <Event> [occurred_in] <Year> {
    year: > 2000
    confidence: >= 0.8
  }
}
```

Supported operators: `>`, `<`, `>=`, `<=`, `!=`.


## API

- **`Tokenizer`** — Converts source code to token stream
- **`Parser`** — Converts tokens to AST
- **`Transpiler`** — Converts AST to target format
- **`AST`** — TypeScript type definitions for all AST nodes

## License

MIT
