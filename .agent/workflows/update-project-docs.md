---
description: Update all project documentation (Spec, READMEs, Web) for a new release.
---

This workflow guides you through updating all documentation artifacts across the AIQL monorepo and website for a new release.

## 1. Version Synchronization (If applicable)

If this is a new version release, first update the version across all packages.

```bash
# Example: Update to v2.7.0
node scripts/sync-versions.js <NEW_VERSION>
```

## 2. Update Language Specification

Update the canonical spec file first.

- **File**: `../aiql-doc/aiql-spec.md`
- **Action**: Add release notes, update version number, and add new sections for features.

## 3. Update Package Documentation

Update READMEs to reflect the new version and features.

- **Root**: `README.md` (Update "Key Features" section)
- **Packages**:
    - `packages/inference/README.md`
    - `packages/core/README.md`
    - `packages/security/README.md`
    - (And any other modified packages)

## 4. Sync to Website Data

The website uses copies of markdown files in `../aiql-org-web/src/data`. Copy the latest versions.

```bash
# From aiql-core root
cp ../aiql-doc/aiql-spec.md ../aiql-org-web/src/data/aiql-spec.md
cp AIQL_Design.md ../aiql-org-web/src/data/system-prompt.md
cp .agent/skills/aiql-development-protocol/SKILL.md ../aiql-org-web/src/data/aiql-development-protocol.md
```

## 5. Update Website Content

Manually update the React components to reflect the changes.

- **File**: `../aiql-org-web/src/pages/DeveloperGuide.tsx`
    - Add new examples (e.g., Attribute Querying).
    - Ensure new sections (Skills, System Prompt) are present.
- **File**: `../aiql-org-web/README.md`
    - Update features list.

## 6. Verification

Verify that the website builds with the new content.

```bash
cd ../aiql-org-web
npm run build
```

Verify that the core project builds and tests pass.

```bash
cd ../aiql-core
npm run build
npm test
```
