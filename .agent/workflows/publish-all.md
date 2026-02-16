---
description: Publish all AIQL packages to npm
---

This workflow automates the version synchronization, build, and publishing process for all AIQL public packages.

It requires you to be logged into npm locally (`npm login`).

1. Sync all packages to the root package.json version
// turbo
2. node scripts/sync-versions.js

3. Clean and build all packages
// turbo
4. npm run clean && npm run build

5. Publish @aiql-org/core (Base dependency)
// turbo
6. npm publish -w packages/core --access public

7. Publish @aiql-org/utils (Utility dependency)
// turbo
8. npm publish -w packages/utils --access public

9. Publish @aiql-org/security (Core logic dependency)
// turbo
10. npm publish -w packages/security --access public

11. Publish @aiql-org/inference (Depends on core, security)
// turbo
12. npm publish -w packages/inference --access public

13. Publish @aiql-org/soul (Depends on core)
// turbo
14. npm publish -w packages/soul --access public

15. Publish @aiql-org/semantics (Depends on inference, soul)
// turbo
16. npm publish -w packages/semantics --access public

17. Publish @aiql-org/cli (Depends on core)
// turbo
18. npm publish -w packages/cli --access public

19. (Optional) Verify success by checking npm
// turbo
20. npm view @aiql-org/core version
