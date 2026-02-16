# Contributing to AIQL

Thank you for your interest in contributing to the **Artificial Intelligence Quantum Language (AIQL)**!

## 👋 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AI-Memory/aiql.ws.git
   cd aiql.ws
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build all packages:**
   ```bash
   npm run build
   ```

## 🧪 Testing

We follow a generic **Test Driven Development (TDD)** approach.

- **Run all tests:** `npm test`
- **Coverage Target:** 95%+ for core modules.
- **Requirement:** All 93 tests must pass before merging.

## 🏗 Project Structure

- `packages/core`: The compiler (Tokenizer, Parser, AST, Transpiler). start here for syntax changes.
- `packages/inference`: Logic and reasoning engine.
- `packages/semantics`: Runtime and quantum models.
- `examples/`: Add new `.aiql` files here to demonstrate features.

## 📝 Coding Standards

- **TypeScript:** Strict mode enabled.
- **Style:** Use 2 spaces for indentation.
- **Commits:** Use conventional commits (e.g., `feat: add pipeline operator`, `fix: token parsing`).

## 🔄 Workflow

1. Create a feature branch (`git checkout -b feat/my-feature`).
2. Implement your changes.
3. Add tests in `src/test.ts` of the relevant package.
4. Add an example in `examples/`.
5. Run `npm test` and `npm run build`.
6. Submit a Pull Request.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
