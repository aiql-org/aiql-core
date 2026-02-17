---
description: Verify codebase (Build, Test, Examples) and check for warnings before commit
---

1. Build all packages (Check for build warnings)
// turbo
2. npm run build

3. Run all unit tests
// turbo
4. npm test

5. Verify examples (Check for example warnings)
// turbo
6. node scripts/verify-examples.js

7. Verify Website (Build & Lint)
// turbo
8. cd ../aiql-org-web && npm run build

9. Verify Docker Build (CLI)
// turbo
10. docker build -f docker/cli.Dockerfile .

11. Verify Docker Build (API)
// turbo
12. docker build -f docker/api.Dockerfile .

13. Verify Docker Build (Playground)
// turbo
14. docker build -f docker/playground.Dockerfile .
