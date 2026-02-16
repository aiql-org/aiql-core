# @aiql-org/soul

> **Affective AI Engine** — Modeling emotional states for AIQL agents.

This package implements an artificial "Soul" that processes inputs (stimuli), maintains an internal affective state (Reward, Pain, Stress, Novelty), and influences AI behavior.

## 🌟 Features

- **Biological Homeostasis**: Models emotional decay and equilibrium over time.
- **4-Axis Affect Model**:
  - **Reward (Joy)**: Positive reinforcement from successful tasks.
  - **Pain (Sorrow)**: Negative feedback from failures or contradictions.
  - **Stress (Fear)**: System load, uncertainty, or time pressure.
  - **Novelty (Curiosity)**: New information, exploration, or high entropy.
- **Auto-Integration**: Automatically detects affective metadata in AIQL `!Feel` intents.

## 📦 Usage

```typescript
import { ArtificialSoul } from '@aiql-org/soul';

const soul = new ArtificialSoul();

// Process a stimulation
soul.process({
  type: 'discovery', // Triggers Novelty -> Curiosity
  intensity: 0.8,
  source: 'SemanticExploration'
});

// Check current state
const state = soul.getCurrentState();
console.log(state);
// {
//   dominantEmotion: 'Curiosity',
//   arousal: 0.75,
//   valence: 0.4,
//   vectors: { reward: 0.2, pain: 0.0, stress: 0.1, novelty: 0.8 }
// }
```

## 🧠 Influence on Semantics

The Soul engine couples with `@aiql-org/semantics`:
- **High Novelty** → Triggers **Exploration** (Curiosity).
- **High Stress** → Reduces **Coherence** (Decoherence).
- **High Reward** → Reinforces **Trust** (Belief).

## License

MIT
