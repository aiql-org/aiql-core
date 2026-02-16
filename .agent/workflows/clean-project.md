---
description: Clean all build artifacts and node_modules
---

This workflow removes `dist`, `node_modules`, and other temporary files to reset the project state.

1. Run the project clean script
// turbo
2. npm run clean

3. Remove top-level node_modules
// turbo
4. rm -rf node_modules

5. Remove package-level node_modules
// turbo
6. find packages -name "node_modules" -type d -exec rm -rf {} +

7. Remove package-lock.json
// turbo
8. rm -f package-lock.json
