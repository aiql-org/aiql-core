# @aiql-org/examples

This package contains 65 comprehensive AIQL code examples demonstrating all language features from v1.0 through v2.6.0.

## Directory Structure

```
examples/
├── getting-started/          # 49 examples - Core AIQL features (v1.0-v2.1)
├── meta-cognition/           # 5 examples - Self-awareness & introspection (v2.2.0)
├── robotics/                 # 3 examples - Organic robotics control (v2.4.0)
├── semantic-contradiction/   # 5 examples - Lying & conflict detection (v2.5.0)
└── quantum-consciousness/    # 3 examples - Quantum semantics (v2.6.0)
```

## Usage

### As a Node.js Dependency

```javascript
import examples from '@aiql-org/examples';

console.log(examples.manifest); 
// Output: List of categories and files

// Load specific example content (if provided by the API, otherwise verify dist/ usage)
```

(Note: The package exports a `dist/examples.json` manifest and raw `.aiql` files in `dist/` or `src/`)

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

## License

MIT - See LICENSE file in repository root.

## Resources

- **Playground**: https://aiql.org/playground
- **NPM Package**: [@aiql-org/core](https://www.npmjs.com/package/@aiql-org/core)
