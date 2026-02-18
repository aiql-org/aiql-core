# 🧠 AIQL SDK

> **Artificial Intelligence Quantum Language** — A semantic programming language for knowledge representation, inference, and multi-target transpilation.

[![npm](https://img.shields.io/npm/v/@aiql-org/core?label=@aiql-org/core)](https://www.npmjs.com/package/@aiql-org/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/docker/v/aiql/cli?label=Docker)](https://hub.docker.com/r/aiql/cli)
[![Build Status](https://img.shields.io/github/actions/workflow/status/aiql-org/aiql-core/ci.yml?branch=main)](https://github.com/aiql-org/aiql-core/actions)

---

## 🔍 What is AIQL?

AIQL bridges the gap between **semantic understanding** and **computational execution**. It expresses AI knowledge as graph-structured **semantic triples** wrapped in **intent blocks**.

The transpiler converts AIQL code to **6 target formats**:
- **Python** (Executable classes)
- **SQL** (Knowledge graph schema)
- **JSON / YAML** (Data interchange)
- **Coq / Lean** (Formal verification)

### Example

```aiql
// Define a Quantum-probabilistic assertion
@coherence:0.95
!Assert(scope:global) {
  <AI_Agent> [learns_from] <Interaction_History> {
    method: "reinforcement_learning",
    rate: 0.05
  }
} @0.99
```

---

## 📦 System Packages

The SDK is organized as a high-performance monorepo:

| Package | Version | Description |
|---------|---------|-------------|
| **[`@aiql-org/core`](packages/core)** | [![v](https://img.shields.io/npm/v/@aiql-org/core)](https://npm.im/@aiql-org/core) | **Compiler** — Tokenizer, Parser, AST, Transpiler (6 targets) |
| **[`@aiql-org/inference`](packages/inference)** | [![v](https://img.shields.io/npm/v/@aiql-org/inference)](https://npm.im/@aiql-org/inference) | **Reasoning** — Ontology engine, forward/backward chaining |
| **[`@aiql-org/security`](packages/security)** | [![v](https://img.shields.io/npm/v/@aiql-org/security)](https://npm.im/@aiql-org/security) | **Crypto** — Quantum-proof signatures (Dilithium) & encryption (Kyber) |
| **[`@aiql-org/semantics`](packages/semantics)** | [![v](https://img.shields.io/npm/v/@aiql-org/semantics)](https://npm.im/@aiql-org/semantics) | **Runtime** — Quantum semantics & Symbolic-Neural bridge |
| **[`@aiql-org/soul`](packages/soul)** | [![v](https://img.shields.io/npm/v/@aiql-org/soul)](https://npm.im/@aiql-org/soul) | **Affect** — Emotional modeling (Reward/Pain/Stress/Novelty) |
| **[`@aiql-org/cli`](packages/cli)** | [![v](https://img.shields.io/npm/v/@aiql-org/cli)](https://npm.im/@aiql-org/cli) | **CLI** — Command-line tools for parsing and transpilation |
| **[`@aiql-org/utils`](packages/utils)** | [![v](https://img.shields.io/npm/v/@aiql-org/utils)](https://npm.im/@aiql-org/utils) | **Utils** — Shared helpers and I/O utilities |
| **[`@aiql-org/api`](packages/api)** | — | **API** — Dockerized REST API for transpilation services |

---

## 🚀 Quick Start

### 1. Installation

```bash
# Install core library
npm install @aiql-org/core

# Install CLI globally
npm install -g @aiql-org/cli
```

### 2. Using the CLI

```bash
# Transpile to Python
aiql transpile packages/examples/src/getting-started/query-python-for-data-science.aiql --target python

# Generate SQL schema
aiql transpile packages/examples/src/getting-started/query-python-for-data-science.aiql --target sql --output schema.sql

# Validate syntax
aiql validate packages/examples/src/getting-started/query-python-for-data-science.aiql
```

### 3. Programmatic Usage

```typescript
import { Tokenizer, Parser, Transpiler } from '@aiql-org/core';
import { readFileSync } from 'fs';

// Read example file
const code = readFileSync('packages/examples/src/getting-started/query-python-for-data-science.aiql', 'utf-8');

// 1. Tokenize
const tokenizer = new Tokenizer(code);
const tokens = tokenizer.tokenize();

// 2. Parse into AST
const parser = new Parser(tokens);
const ast = parser.parse();

// 3. Transpile to Target
const transpiler = new Transpiler();
const pythonCode = transpiler.transpile(ast, 'python');

console.log(pythonCode);
```

### 4. Running with Docker

Pre-built images are available for immediate use without Node.js installation.

```bash
# Run the Interactive Playground
docker run -it --rm aiql/playground

# Run CLI via Docker
docker run -v $(pwd):/data aiql/cli transpile /data/example.aiql -t json
```

---

## 🌟 Key Features (v2.7.0)

- **Attribute Querying**: Query and unify statements based on complex attribute matching (`{ year: <?Year> }`).
- **Quantum Semantics**: Model epistemic uncertainty with `@coherence` metrics and superposition states.
- **Affective Computing**: Built-in emotional modeling via `@aiql-org/soul` (Stress/Novelty/Reward).
- **Security First**: Native support for **Dilithium** signatures and **Kyber** encryption.
- **Formal Verification**: Transpile directly to **Coq** and **Lean** for mathematical proofs.
- **Meta-Cognition**: First-class support for self-referential queries (`!Query { <Self> [has_knowledge_about] ... }`).
- **Graph Evolution**: Organic knowledge graph growth using the Semantic Runtime.

---

## 📚 Documentation

- [**Language Design**](AIQL_Design.md) — Comprehensive system prompt and spec.
- [**Examples**](packages/examples/src/README.md) — 65+ examples covering Robotics, Logic, and more.
- [**Contributing**](CONTRIBUTING.md) — Guide for contributors.

---

## 📄 License

MIT © [AIQL Contributors](https://aiql.org)
