# @aiql-org/semantics

> **Semantic Runtime & Quantum Consciousness Engine** for AIQL.

This package provides the runtime environment for executing AIQL's semantic logic, including organic graph evolution, quantum-probabilistic modeling, and neural-symbolic validation.

## 🌟 Features

### 1. **Semantic Runtime** (Organic Graph Evolution)
Manages the lifecycle of the knowledge graph:
- **Reflection**: Self-analysis of existing knowledge.
- **Gap Detection**: Identifies missing links or definitions.
- **Exploration**: Triggers curiosity-driven queries.
- **Integration**: Merges new knowledge while maintaining coherence.

### 2. **Quantum Semantics** (Epistemic Modeling)
Models knowledge uncertainty using quantum mechanical metaphors:
- **Superposition**: Holding multiple contradictory beliefs simultaneously until "measurement" (query).
- **Coherence**: Measuring the integration level of knowledge (`@coherence:0.95`).
- **Entanglement**: Linking related concepts so updates to one affect the other.
- **Collapse**: Resolving superposition upon definitive assertion.

### 3. **Symbolic-Neural Bridge**
Grounds LLM outputs in symbolic logic:
- **Hallucination Detection**: Validates neural generation against the semantic ontology.
- **Coherence Checking**: Ensures new statements do not contradict established facts.
- **Type Safety**: Enforces ontological constraints on neural outputs.

## 📦 Usage

```typescript
import { SemanticRuntime, QuantumSemantics } from '@aiql-org/semantics';

// Initialize Runtime
const runtime = new SemanticRuntime();

// Create a Quantum State for a Concept
const superposition = new QuantumSemantics.SuperpositionState({
  concept: 'SchrodingersCat',
  states: [
    { value: 'Alive', amplitude: 0.707 },
    { value: 'Dead', amplitude: 0.707 }
  ]
});

// Check Coherence
const coherence = runtime.measureCoherence(superposition);
console.log(`System Coherence: ${coherence}`); // ~1.0
```

## 🔗 Integrating with Core

The semantics package typically consumes ASTs produced by `@aiql-org/core`:

```typescript
import { Parser } from '@aiql-org/core';
import { SemanticRuntime } from '@aiql-org/semantics';

const ast = new Parser(tokens).parse();
runtime.process(ast); // Evolves the graph based on intents
```

## License

MIT
