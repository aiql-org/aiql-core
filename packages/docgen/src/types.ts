


export interface DocItemSource {
  file: string;
  line: number;
}

export interface DocMetadata {
  version?: string;
  origin?: string;
  citations?: string[];
  group?: string;
  [key: string]: unknown;
}

export interface DocItem {
  id: string;
  type: 'class' | 'property' | 'intent' | 'rule' | 'task' | 'concept' | 'consensus' | 'coordinate';
  name: string;
  description?: string;
  metadata?: DocMetadata;
  source?: DocItemSource;
}

export interface DocClass extends DocItem {
  type: 'class';
  superClass?: string;
  properties: DocPropertyDetail[]; // Simplified property definitions
}

export interface DocPropertyDetail {
  name: string;
  cardinality?: string;
  range?: string;
  attributes?: Record<string, unknown>;
}

export interface DocProperty extends DocItem {
  type: 'property';
  domain?: string;
  range?: string;
  characteristics?: {
    transitive?: boolean;
    symmetric?: boolean;
    reflexive?: boolean;
    functional?: boolean;
    inverseOf?: string;
  };
}

export interface DocRule extends DocItem {
  type: 'rule';
  premise: string; // Simplified string representation
  conclusion: string;
  confidence?: number;
}

export interface DocTask extends DocItem {
  type: 'task';
  priority?: string;
  mode?: string;
  steps: DocTaskStep[];
}

export interface DocConsensus extends DocItem {
  type: 'consensus';
  topic: string;
  participants: string[]; // Expression strings
  threshold: number;
}

export interface DocCoordinate extends DocItem {
  type: 'coordinate';
  goal: string;
  participants: string[];
  strategy: string;
}

export interface DocIntent extends DocItem {
  type: 'intent';
  intentType: string;
  statements: DocTaskStep[]; // Reuse step structure for general statements

}

export interface DocTaskStep {
  subject: string;
  relation: string;
  object: string;
  parameters?: Record<string, unknown>;
}

export interface DocGraphNode {
  id: string;
  label: string;
  type: string;
}

export interface DocGraphEdge {
  source: string;
  target: string;
  label: string;
  relationType?: string;
}

export interface DocPage {
  title: string;
  items: DocItem[];
  graph?: {
    nodes: DocGraphNode[];
    edges: DocGraphEdge[];
  };
}
