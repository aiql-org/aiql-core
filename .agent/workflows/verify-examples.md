---
description: Verify all AIQL examples parse and transpile correctly
---

This workflow runs a script to validate all 65+ AIQL examples in the `examples/` directory against the core parser and transpiler.

1. Ensure the core package is built
// turbo
2. npm run build -w packages/core

3. Run the verification script
// turbo
4. node scripts/verify-examples.js
