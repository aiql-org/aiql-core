---
name: aiql-development-protocol
description: Standard operating procedure for bug fixing, feature addition, optimization, and refactoring in aiql-core.
---

# AIQL Development Protocol (v1.0.0)

This skill mandates a strict protocol for all development activities within the `aiql-core` repository.
You **MUST** follow these steps in order when performing bug fixes, adding new features, optimizing code, or refactoring.

## 1. Initial Verification
**Before making any changes**, establish a baseline.

1.  **Build All Packages**: Ensure the current codebase compiles without errors.
    ```bash
    npm run build
    ```
    *Check for and resolve any build warnings.*

2.  **Lint Code**:
    ```bash
    npm run lint
    ```

3.  **Run All Tests**:
    ```bash
    npm test
    ```

4.  **Verify Examples**:
    ```bash
    node scripts/verify-examples.js
    ```

## 2. Test Coverage Expansion
**When changing code**, you must ensure high test coverage.

1.  **Identify Changed Components**: pinpoint the files you have modified.
2.  **Add/Update Unit Tests**:
    - For new features: Create new test files (e.g., `test/test-feature-name.ts`).
    - For bug fixes: Add regression tests that replicate the bug.
    - For refactoring: Ensure existing tests cover all paths.
3.  **Target Coverage**: Aim for **95%+ code coverage** on the changed modules.
    - If coverage tools are not configured, approximate by ensuring every logic branch has a corresponding test case.

## 3. Example Creation (New Features Only)
**If adding a new feature**, you must demonstrate it.

1.  **Create 4+ Examples**:
    - Create at least **4 unique examples** showcasing different aspects/edge cases of the new feature.
    - File extension: `.aiql`
    - Location: `packages/examples/src/<category>/`

2.  **Categorization via `packages/examples/src`**:
    - Place examples in an appropriate existing subdirectory (e.g., `packages/examples/src/advanced-features/`).
    - **If no suitable category exists**: Create a new subdirectory in `packages/examples/src/` (e.g., `packages/examples/src/new-category-name/`).

## 4. Full Regression Verification
**After implementing changes and tests**, verify everything again.

1.  **Rerun Build**:
    ```bash
    npm run build
    ```
    *Ensure 0 errors and 0 warnings.*

2.  **Rerun Lint**:
    ```bash
    npm run lint
    ```
    *Ensure 0 errors.*

3.  **Rerun All Tests**:
    ```bash
    npm test
    ```
    *Ensure 100% pass rate.*

4.  **Verify All Examples**:
    ```bash
    node scripts/verify-examples.js
    ```
    *Ensure all examples (including new ones) parse and transpile correctly.*

## 5. Docker Verification
**Ensure containerization works correctly.**

1.  **Build Docker Images**:
    - CLI: `docker build -f docker/cli.Dockerfile -t aiql/cli:latest .`
    - API: `docker build -f docker/api.Dockerfile -t aiql/api:latest .`
    - Playground: `docker build -f docker/playground.Dockerfile -t aiql/playground:latest .`
2.  **Verify CLI Image**:
    - Run help command: `docker run --rm aiql/cli:latest --help`
    - Ensure it outputs version and help text without errors.

## 6. Documentation Update
**Keep documentation synchronized.**

1.  **Update `README.md`**:
    - Reflect any changes in installation, configuration, or usage instructions.
    - Update feature lists if new features were added.
    - Verify that directory structure descriptions match the current state.
2.  **Update Specification Docs**:
    - If language syntax changed, update `AIQL_Design.md` or relevant specs.

## 7. Web Project Synchronization
**Propagate changes to the `aiql-org-web` project.**

1.  **Trigger Example Generation** (if examples changed):
    - Run the example generation script in the web project to pull in new `.aiql` files.
    ```bash
    cd ../aiql-org-web
    npm run generate-examples
    ```

2.  **Verify Web Build**:
    - Ensure the web project still builds with the updated core/examples.
    ```bash
    cd ../aiql-org-web
    npm run build
    ```

---
**Usage**: When asked to "fix bug X" or "add feature Y", implicitly follow this protocol unless instructed otherwise.
