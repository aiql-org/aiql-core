---
name: aiql-transpiler-debugging
description: Debugging skill for the AIQL transpiler, including AST inspection and token stream analysis.
---

# AIQL Transpiler Debugging Skill

This skill provides a set of workflows and commands to help developers debug issues with the AIQL parser and transpiler. Use this skill when:
- Parsing fails unexpectedly or produces incorrect ASTs.
- Transpiled output (Python/SQL/etc.) is malformed.
- You need to visualize the intermediate representation (Tokens/AST).

## Prerequisites

- Ensure `@aiql-org/cli` is built: `npm run build -w packages/cli`
- Docker is running (for API debug mode if needed).

## Tools & Commands

### 1. Inspect Token Stream
Visualize how the tokenizer breaks down your code.

```bash
# Create a temporary file with the failing code
echo '!Assert { <AI> [learns] <Knowledge> }' > debug.aiql

# Run the CLI in parse mode
# (Note: Current CLI outputs only AST, we might need a custom script for raw tokens if deep debugging is needed)
node packages/cli/dist/cli.js parse debug.aiql
```

### 2. Verify AST Structure
Check the JSON AST output for missing nodes or incorrect nesting.

```bash
# Parse and pipe to jq for readable JSON
node packages/cli/dist/cli.js parse debug.aiql | jq .
```

**Common AST Issues to Look For:**
- `intentType` mismatch (e.g. `!Query` vs `!Assert`)
- `statements` array empty when body exists
- `metadata` fields missing (e.g. `@confidence`, `$id`)
- `contextParams` not capturing all arguments

### 3. Debug Transpilation Output
Isolate the transpilation step for a specific target.

```bash
# Transpile to Python and check output
node packages/cli/dist/cli.js transpile debug.aiql --target python

# Transpile to SQL and checks schema generation
node packages/cli/dist/cli.js transpile debug.aiql --target sql
```

### 4. Running the Verification Script
Use the existing `verify-examples.js` script to test against all known valid examples. This helps detect regressions.

```bash
node scripts/verify-examples.js
```

## Debugging Workflow

1.  **Isolate**: Create a minimal reproduction file (`debug.aiql`).
2.  **Tokenize**: (Mental check) Does the tokenizer support all symbols used?
3.  **Parse**: Run `aiql parse` and inspect the JSON AST.
    - If AST is wrong -> Issue is in `packages/core/src/parser.ts`
4.  **Transpile**: Run `aiql transpile` and inspect code.
    - If AST is right but Code is wrong -> Issue is in `packages/core/src/transpiler.ts`

## Helper Script: `debug-parser.js`

Create this script in `scripts/debug-parser.js` if you need deep inspection:

```javascript
/* scripts/debug-parser.js */
const { Tokenizer, Parser } = require('../packages/core/dist/index.js');
const fs = require('fs');

const code = fs.readFileSync(process.argv[2], 'utf8');
console.log('--- TOKENS ---');
const tokens = new Tokenizer(code).tokenize();
tokens.forEach(t => console.log(`[${t.type}] ${t.literal}`));

console.log('\n--- AST ---');
const ast = new Parser(tokens).parse();
console.log(JSON.stringify(ast, null, 2));
```

Usage: `node scripts/debug-parser.js debug.aiql`
