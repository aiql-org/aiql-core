# @aiql-org/inference

Ontology reasoning, meta-ontology, and logical inference engine for AIQL.

## Features

- **Inference Engine** — Forward/backward chaining over AIQL rules
- **Ontology Reasoner** — OWL-style reasoning over semantic triples
- **Meta-Ontology** — Self-referential ontology reasoning
- **Attribute Unification** — Match and extract data from statement attributes

## Usage

```typescript
import { InferenceEngine, OntologyReasoner } from '@aiql-org/inference';

// Initialize engine
const engine = new InferenceEngine();

// Add facts
engine.addFact({
  subject: { name: 'Paper1', type: 'Concept' },
  relation: { name: 'published_in', type: 'Identifier' },
  object: { name: 'Nature', type: 'Concept' },
  attributes: { year: 2024 }
});

// Query with attributes
const query = {
  subject: { name: 'Paper1', type: 'Concept' },
  relation: { name: 'published_in', type: 'Identifier' },
  object: { name: 'Nature', type: 'Concept' },
  attributes: { year: { name: 'Year', type: 'Variable' } } // Extract year
};

const results = engine.query(query);
console.log(results); // [{ substitutions: { Year: 2024 } }]
```

## License

MIT
