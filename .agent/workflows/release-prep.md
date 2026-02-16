---
description: Prepare the project for a new release
---

This workflow synchronizes version numbers across all packages and verifies the build before a release.

1. Synchronize version numbers across all package.json files
// turbo
2. npm run sync-versions

3. Clean previous build artifacts
// turbo
4. npm run clean

5. comprehensive build and test
// turbo
6. npm run build && npm test

7. Verify examples
// turbo
8. node scripts/verify-examples.js

9. Check git status for changes
// turbo
10. git status
