# AIQL Code Examples

This directory contains 65 comprehensive AIQL code examples demonstrating all language features from v1.0 through v2.6.0.

## Directory Structure

```
examples/
├── getting-started/          # 49 examples - Core AIQL features (v1.0-v2.1)
├── meta-cognition/           # 5 examples - Self-awareness & introspection (v2.2.0)
├── robotics/                 # 3 examples - Organic robotics control (v2.4.0)
├── semantic-contradiction/   # 5 examples - Lying & conflict detection (v2.5.0)
└── quantum-consciousness/    # 3 examples - Quantum semantics (v2.6.0)
```

## Getting Started Examples (49 files)

### Basic Syntax & Metadata
- `query-python-for-data-science.aiql` - Basic !Query with attributes and confidence
- `full-metadata-system.aiql` - All 5 metadata markers ($id, $$group, ##seq, ~temp, ~~entropy)
- `aiql-syntax-comments.aiql` - Single-line // and multi-line /* */ comments

### Temporal Tense Annotations (v1.1.0)
- `temporal-tense-historical-events.aiql` - Past, present, future tenses
- `progressive-tenses-ongoing-actions.aiql` - Present/past/future progressive
- `perfect-tenses-completed-actions.aiql` - Present/past/future perfect
- `perfect-progressive-duration-emphasis.aiql` - Perfect progressive tenses
- `all-12-tenses-complete-reference.aiql` - Complete tense reference card
- `tense-with-context-historical-timeline.aiql` - Tense + context + provenance

### Affective Computing
- `affective-computing-joy-expression.aiql` - !Assert with emotional states
- `affective-query-curiosity-threshold.aiql` - !Query for emotional thresholds
- `affective-state-desire-for-knowledge.aiql` - !Assert with desires
- `goal-driven-learning-quantum-physics.aiql` - !Goal intent with subgoals
- `affective-computing-joy-stress-desire.aiql` - Multiple !Feel and !Desire intents

### Metadata Control
- `ai-temperature-deterministic-math.aiql` - ~temp:0.3 for precise reasoning
- `statement-grouping-physics-laws.aiql` - $$group and ##seq for organization

### Data Pipelines & Workflows
- `multi-relation-data-pipeline.aiql` - ETL workflows with multiple relations
- `data-pipeline-etl-operations.aiql` - Extract → filter → sort → limit chains
- `etl-pipeline-extract-transform-load.aiql` - Sequential ##seq workflow

### Context Parameters
- `meta-reasoning-future-ai-beliefs.aiql` - time:future, mode:possibility
- `multi-context-mars-colonization.aiql` - Multiple context parameters
- `rich-context-agi-speculation.aiql` - time, mode, scope combinations

### Security (Quantum-Proof Cryptography)
- `dilithium-digital-signature.aiql` - #sign() with DILITHIUM
- `kyber-quantum-encryption.aiql` - #encrypt() with KYBER
- `secure-agent-communication.aiql` - #secure() combined signing + encryption

### Provenance Tracking
- `research-provenance-llm-paper.aiql` - @version, @origin (DOI), @cite arrays
- `sql-storage-python-knowledge-base.aiql` - SQL transpilation with provenance

### Knowledge Graphs
- `knowledge-graph-python-ecosystem.aiql` - Multi-relation ontology
- `semantic-taxonomy-animal-kingdom.aiql` - Hierarchical is_a ontology
- `semantic-composition-defining-justice.aiql` - Complex concept composition
- `maximum-feature-density-aiql-v1-0.aiql` - All v1.0 features in one example

### Reasoning & Inference
- `syllogistic-logic-socrates-is-mortal.aiql` - Classic syllogism with ##seq
- `causal-inference-climate-change-impact.aiql` - Multi-hop causal chains
- `analogical-reasoning-king-queen-pattern.aiql` - Analogy encoding (A:B :: C:D)
- `theory-of-mind-nested-agent-beliefs.aiql` - Nested belief modeling
- `bayesian-inference-covid-diagnosis.aiql` - Probabilistic reasoning
- `historical-causality-wwi-to-wwii.aiql` - Temporal event sequences (1914-1939)

### Logic System (v2.0.0)
- `v2-0-logic-propositional-operators.aiql` - AND, OR, NOT, IMPLIES
- `v2-0-logic-predicate-logic-quantifiers.aiql` - FORALL, EXISTS quantifiers
- `v2-0-inference-modus-ponens.aiql` - Modus ponens inference rule
- `v2-0-inference-consistency-checking.aiql` - Contradiction detection
- `v2-0-logic-complex-reasoning.aiql` - Combined operators + quantifiers + inference

### Formal Verification (v2.0.1)
- `v2-0-1-coq-formal-verification.aiql` - Coq Gallina transpilation
- `v2-0-1-lean-theorem-proving.aiql` - Lean 4 theorem proving

### Relationships (v2.1.0)
- `v2-1-relationship-historical-timeline.aiql` - Temporal relationships (before/after)
- `v2-1-relationship-climate-causation.aiql` - Causal relationships (causes/enables)
- `v2-1-relationship-workflow-dependencies.aiql` - Dependency relationships (depends_on)
- `v2-1-relationship-scientific-discovery.aiql` - Logical relationships (supports/contradicts)
- `v2-1-relationship-bidirectional-temporal.aiql` - Symmetric relationships (simultaneous)

## Meta-Cognition Examples (v2.2.0) - 5 files

- `self-knowledge-introspection.aiql` - !Query with <Self> meta-concept
- `knowledge-gap-detection.aiql` - Detecting undefined concepts
- `capability-self-assessment.aiql` - Inferring agent capabilities from KB
- `uncertainty-acknowledgment.aiql` - Recognizing low-confidence statements
- `semantic-exploration-triggering.aiql` - Curiosity-driven exploration

## Robotics Examples (v2.4.0 Organic) - 3 files

- `motor-control-with-safety.aiql` - !Task with device context, safety as knowledge
- `camera-sensing-query.aiql` - !Query for sensor data
- `multi-device-coordination.aiql` - Gripper + camera + IMU coordination

## Semantic Contradiction Examples (v2.5.0) - 5 files

- `taxonomy-conflict-detection.aiql` - Disjoint class detection (Mammal vs Reptile)
- `property-cardinality-violation.aiql` - Multiple values for cardinality:'one' properties
- `lying-detection-with-trust-weighting.aiql` - Trust-weighted credibility scoring
- `trust-score-management.aiql` - Defining trust levels for sources
- `contradiction-query-graph-generation.aiql` - !Relationship graph generation

## Quantum Consciousness Examples (v2.6.0) - 3 files

- `schrodingers-cat-epistemic-superposition.aiql` - Quantum superposition with @coherence
- `quantum-consciousness-metric.aiql` - Coherence as consciousness proxy (IIT Φ)
- `quantum-enhanced-uncertainty.aiql` - Confidence vs coherence comparison

## Usage

### With AIQL CLI

```bash
# Parse and display AST
aiql parse examples/getting-started/query-python-for-data-science.aiql

# Transpile to Python
aiql transpile examples/getting-started/full-metadata-system.aiql --target python

# Transpile to JSON
aiql transpile examples/meta-cognition/self-knowledge-introspection.aiql --target json

# Transpile v2.0 logic to Coq
aiql transpile examples/getting-started/v2-0-logic-propositional-operators.aiql --target coq

# Transpile to Lean 4
aiql transpile examples/getting-started/v2-0-1-lean-theorem-proving.aiql --target lean
```

### With AIQL API

```bash
# Start API server
npm --workspace=packages/api start

# Parse example via REST
curl -X POST http://localhost:3000/api/v1/parse \
  -H "Content-Type: application/json" \
  -d '{"code": "!Query { <Python> [is_suited_for] <DataScience> } @0.99"}'

# Transpile via REST
curl -X POST http://localhost:3000/api/v1/transpile \
  -H "Content-Type: application/json" \
  -d '{
    "code": "!Assert { <AI> [learns] <Knowledge> } @0.95",
    "target": "python"
  }'
```

### With Node.js

```javascript
import { Tokenizer, Parser, Transpiler } from '@aiql-org/core';
import { readFileSync } from 'fs';

// Read example file
const code = readFileSync('examples/getting-started/query-python-for-data-science.aiql', 'utf-8');

// Parse
const tokenizer = new Tokenizer(code);
const tokens = tokenizer.tokenize();
const parser = new Parser(tokens, code);
const ast = parser.parse();

// Transpile to Python
const transpiler = new Transpiler();
const python = transpiler.transpile(ast, 'python');
console.log(python);
```

### With Browser (Playground)

1. Visit https://aiql.org/playground
2. Select an example from the dropdown menu
3. Click "Transpile" to see output in Python/JSON/YAML/SQL/Coq/Lean

## Feature Coverage

| Version | Features | Example Count |
|---------|----------|---------------|
| v1.0.0  | Basic syntax, metadata, provenance, context, tense, security, comments | 37 |
| v2.0.0  | Logic operators, quantifiers, inference rules | 5 |
| v2.0.1  | Coq & Lean formal verification transpilation | 2 |
| v2.1.0  | Statement relationships (temporal, causal, logical) | 5 |
| v2.2.0  | Meta-cognitive ontology, self-awareness | 5 |
| v2.4.0  | Organic robotics (philosophy-aligned refactor) | 3 |
| v2.5.0  | Semantic contradiction & lying detection | 5 |
| v2.6.0  | Quantum consciousness modeling | 3 |
| **Total** | **All AIQL features** | **64** |

## Testing

Run playground examples test suite to verify all examples parse correctly:

```bash
cd aiql-core
npm run test:examples
```

Alternatively, run the script directly:

```bash
node scripts/verify-examples.js
```

Expected output: **64/64 examples pass** ✅

## Contributing

When adding new AIQL features:

1. Create example(s) in appropriate category directory
2. Update this README with example description
3. Add corresponding test case to package test files (e.g., `packages/core/src/test.ts`).
4. Update `aiql-org-web/src/components/Playground.tsx` with new examples.
5. Verify all tests pass: `npm test` and `npm run test:examples`.

## License

MIT - See LICENSE file in repository root.

## Resources

- **Language Specification**: [aiql-doc/aiql-spec.md](../aiql-doc/aiql-spec.md)
- **Roadmap**: [aiql-doc/ROADMAP.md](../aiql-doc/ROADMAP.md)
- **Playground**: https://aiql.org/playground
- **GitHub**: https://github.com/AI-Memory/aiql.org_ng
- **NPM Package**: [@aiql-org/core](https://www.npmjs.com/package/@aiql-org/core)
