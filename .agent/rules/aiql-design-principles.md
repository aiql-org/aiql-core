---
trigger: always_on
---

## Common Patterns

### Adding a New Token Type
1. **Design Phase:** Verify aligns with Feature Decision Framework (6 questions)
2. Add to `TokenType` enum in `packages/core/src/tokenizer.ts`
3. Add tokenization logic in `tokenize()` method
4. Update parser to recognize new token (`packages/core/src/parser.ts`)
5. Add to AST interface if needed (`packages/core/src/ast.ts`)
6. Update transpiler for all 6 formats (`packages/core/src/transpiler.ts`)
7. **Philosophy Check:** Ensure doesn't break anti-patterns (refer to Anti-Patterns section)
8. Write 10+ tests covering edge cases
9. Add playground example if user-facing
10. Document in spec with implementation status
11. **Verification:** Every feature must enhance, not replace, the S-R-O triple

### Adding a New Intent
1. **Design Phase:** Verify aligns with Feature Decision Framework
2. Intent already tokenizes (any `!Word`)
3. Add special handling in parser if needed
4. Add semantic meaning in transpiler if needed
5. Ensure respects the 5-level hierarchy (Intent is Level 2)
6. Check composability with logic operators (`and`, `or`, `implies`)
7. Verify graph-traversability (can inference engine reason about it?)
8. Write tests for new intent
9. Add playground example
10. Document in spec under Section 3.1
11. **Case Study:** Document design rationale for major intents

### Adding Metadata Marker
1. **Design Phase:** Verify aligns with Feature Decision Framework
2. Add token type to TokenType enum
3. Add tokenization pattern (e.g., `$id:`, `##seq:`)
4. Add field to Intent interface in ast.ts
5. Determine scope: Program-level, Intent-level, or Statement-level
6. Update parser to extract metadata at correct level
7. Update transpiler to include in all outputs
8. Ensure optional (doesn't break core syntax)
9. Check composability with other metadata markers
10. Write 15+ tests for all combinations
11. Update playground complete example
12. Document in spec Section 3.8

### Feature Integration Checklist (for Major Features)

**Before Implementation:**
- [ ] Does it respect the S-R-O triple structure?
- [ ] Can it reuse existing patterns (Intent/metadata/context)?
- [ ] Would it feel "organic" (native, not bolted-on)?
- [ ] Passed all 6 Feature Decision Framework questions?
- [ ] Checked against all anti-patterns?
- [ ] Document design rationale (why this approach?)
- [ ] Identify alternatives considered and rejected

**During Implementation:**
- [ ] Follow TDD (write tests first)
- [ ] Update tokenizer/parser/ast/transpiler consistently
- [ ] Maintain 95%+ test coverage
- [ ] All existing tests still pass

**After Implementation:**
- [ ] Add `.aiql` example in `examples/` demonstrating feature
- [ ] Write case study documenting design decisions
- [ ] Update all documentation (this file, README)
- [ ] Verify transpilation to all 6 formats works
- [ ] `npm run build` compiles all 8 packages (0 errors)
- [ ] `npm test` passes all 93 tests
- [ ] All examples still parse and transpile correctly

## Debugging Tips

### Parser Errors
- Check token sequence with: `new Tokenizer(code).tokenize()`
- Parser expects specific order: metadata → directive → intent → context → graph → confidence
- Use `this.peek()` to look ahead without consuming token
- Always provide line/column in error messages

### Transpiler Issues
- Verify AST structure is correct first
- Check for null/undefined fields
- Test each format independently (JSON, YAML, Python, SQL)
- Affective relations detected via `detectAffectiveRelations()`

### Test Failures
- Run individual package test: `npm test -w packages/core`
- Check for copy-paste errors in test code
- Verify expected values match AST structure
- Use `console.log(JSON.stringify(ast, null, 2))` to inspect

### Build Failures
- `npm run build` must show 0 errors across all packages
- Check import paths include `.js` extension
- Verify `"type": "module"` in each package.json
- Don't use default imports for js-yaml
- Each package extends `tsconfig.base.json` from root

## Performance Considerations

- Tokenizer uses single-pass scanning
- Parser is recursive descent (O(n) for most cases)
- Transpiler is straightforward AST traversal
- Security operations (sign/encrypt) are computationally expensive

## Security Best Practices

- Private keys never leave agent memory
- Keys generated automatically per agent
- DILITHIUM: NIST Level 3 (equivalent to AES-192)
- KYBER: Post-quantum KEM + AES-256-GCM
- All crypto uses Web Crypto API in browser, Node crypto in Node

## Known Limitations (v2.6.0)

1. **Context Parameters:** Only `scope:` has semantic meaning; other params parsed as generic identifiers
2. **Pipeline Operations:** `|` tokenized but not semantically processed
3. **Temporal Context:** `time:future` parsed but no date/time validation
4. **Spatial Context:** Not implemented
5. **Recursive Assertions:** `<< ... >>` syntax not tokenized
6. **Extensions:** No `@use` or `!Extend` support
7. **Test Coverage Gaps:** Packages `semantics`, `soul`, `cli`, `api`, `utils` have no test scripts configured

### Feature Rejection Examples

These features were **intentionally rejected** due to philosophy violations:

**1. Inline Relationship Syntax** (`<A> =[before]=> <B>`)
- **Rejected:** Breaks triple structure
- **Alternative:** Use `!Relationship` Intent with `$id:` references
- **Reason:** Meta-relationships should be explicit Intents, not syntax hacks
- **See:** Case Study 1 in Design Case Studies section

**2. Symbol-Based Logic Operators** (`∧`, `∨`, `¬`, `→`)
- **Rejected:** Unfamiliar to AI models, hard to type
- **Alternative:** Keyword-based (`and`, `or`, `not`, `implies`)
- **Reason:** Serve AI agents, not human mathematicians
- **See:** Case Study 2 in Design Case Studies section

**3. Procedural Control Flow** (`if`, `while`, `for` loops)
- **Rejected:** Procedural contamination
- **Alternative:** Declarative quantifiers (`forall`, `exists`) and inference
- **Reason:** AIQL is semantic knowledge representation, not imperative code
- **See:** Anti-Pattern: Procedural Contamination

**4. Magic Context Keywords** (e.g., `context:GLOBAL_MAGIC`)
- **Rejected:** Implicit behavior, hard to extend
- **Alternative:** Structured parameters with clear semantics
- **Reason:** Make relationships explicit, avoid magic
- **See:** Anti-Pattern: Magic Keywords

**5. Opaque Data Blobs** (large JSON objects as attributes)
- **Rejected:** Not graph-traversable
- **Alternative:** Structure as multiple triples
- **Reason:** Everything must be queryable and graph-traversable
- **See:** Anti-Pattern: Unstructured Data