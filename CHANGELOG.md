# Changelog

All notable changes to the AIQL project will be documented in this file.

## [2.7.0] - 2026-02-18

### Added
- **First-Class Attribute Querying**: Support for variables and complex expressions in statement attributes (e.g., `{ year: <?Year> }`).
    - Updated AST, Parser, and Transpiler (Python/SQL/JSON).
    - Enhanced Inference Engine to support attribute unification.
    - Added comprehensive verification tests in `core` and `inference`.
- **Example**: Added `examples/features/attribute-querying.aiql` demonstrating new capabilities.

### Fixed
- Fixed a lint warning in `packages/core/src/parser.ts` (unused variable).

## [2.6.6] - 2026-02-16
- Initial project structure and core packages.
