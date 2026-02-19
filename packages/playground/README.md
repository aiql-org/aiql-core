# @aiql-org/playground

Currently under development. The AIQL Playground is a React component that provides an interactive editor and visualizer for AIQL.

## Features

- **Interactive Editor**: Real-time syntax highlighting for AIQL code.
- **Inspect Mode**: Toggle "Inspect Mode" (`👁️`) to explore token types and their meanings via animated tooltips.
- **Token Hints**: Hover over tokens in Inspect Mode to see detailed descriptions (e.g., "!Intent: Goal-oriented statement").
- **Multi-Format Transpilation**: view transpiled output in real-time for:
  - Python
  - JSON
  - YAML
  - SQL
  - Coq
  - Lean
  - Markdown
- **Output Highlighting**: Syntax highlighting for all output tabs using `prism-react-renderer`.
- **Graph Visualization**: Visualizes the AIQL intent graph.

## Usage

```tsx
import { Playground } from '@aiql-org/playground';

function App() {
  return <Playground />;
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```
