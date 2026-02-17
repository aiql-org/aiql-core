---
description: Build all AIQL packages and run the full test suite
---

This workflow installs dependencies, builds the entire AIQL monorepo, and executes all unit tests.

1. Install all dependencies
// turbo
2. npm install

3. Build all packages in dependency order (core -> security -> inference -> soul -> semantics -> utils -> cli -> api -> examples)
// turbo
4. npm run build

5. Run all unit tests across all workspaces
// turbo
6. npm test
