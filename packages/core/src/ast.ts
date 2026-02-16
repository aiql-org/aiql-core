
export interface Node {
  type: string;
}

// Tense Values for Temporal Annotations on Relations
export type TenseValue = 
  | 'past' 
  | 'present' 
  | 'future'
  | 'present_perfect'
  | 'past_perfect'
  | 'future_perfect'
  | 'present_progressive'
  | 'past_progressive'
  | 'future_progressive'
  | 'present_perfect_progressive'
  | 'past_perfect_progressive'
  | 'future_perfect_progressive';

// Security Metadata
export interface SecurityMetadata {
  signed?: boolean;
  signature?: string; // Base64-encoded signature
  signerAgentId?: string;
  encrypted?: boolean;
  encryptedData?: string; // Base64-encoded encrypted message
  recipientAgentId?: string;
  timestamp?: number;
}

export interface Program extends Node {
  type: 'Program';
  body: LogicalNode[];            // v2.0.0: Can contain Intent | LogicalExpression | QuantifiedExpression | RuleDefinition
  axioms?: RuleDefinition[];      // Foundational truths (v2.0.0)
  theorems?: RuleDefinition[];    // Derived truths with proofs (v2.0.0)
  security?: SecurityMetadata;
  version?: string;          // AIQL version (e.g., "1.0.0")
  origin?: string;           // Source of translation (e.g., "doi:10.1234")
  citations?: string[];      // Supporting references
}

// Level 2: Intent (goal-oriented container with intentional marker)
export interface Intent extends Node {
  type: 'Intent';
  intentType: string;  // Intent marker: !Query, !Assert, !Task, !Feel, etc.
  scope?: string;             // Deprecated: use contextParams instead
  contextParams?: Record<string, string>; // Context parameters (time:future, mode:possibility, etc.)
  statements: Statement[];  // Array of statements (Level 1: atomic triples)
  confidence?: number;
  coherence?: number;         // Quantum coherence [0, 1] - consciousness metric (v2.6.0)
  security?: SecurityMetadata;
  identifier?: string;        // Unique identifier for referencing
  groupIdentifier?: string;   // Group identifier for referencing
  sequenceNumber?: number;    // Order in group or article
  temperature?: number;       // AI temperature (0.0 to 2.0)
  entropy?: number;           // Entropy level indicator
  version?: string;           // AIQL version for this statement
  origin?: string;            // Source of this specific statement
  citations?: string[];       // References specific to this statement
}

// Level 1: Statement (atomic semantic triple)
export interface Statement extends Node {
  type: 'Statement';
  subject: Concept;
  relation: Relation;
  object: Concept;
  attributes?: Record<string, string | number | boolean>;
  examples?: InlineExample[];    // v2.2.0: Inline examples with #example: marker
}

export interface Concept extends Node {
  type: 'Concept';
  name: string;
}

export interface Relation extends Node {
  type: 'Relation';
  name: string;
  tense?: TenseValue;  // Optional temporal annotation for relations
}

// Logical Operators (v2.0.0) - Keyword-based syntax
export type LogicalOperator = 'and' | 'or' | 'not' | 'implies' | 'iff' | 'then';

// Logical statement types (v2.0.0, v2.1.0 adds RelationshipNode, v2.2.0 adds ExampleNode)
export type LogicalNode = Intent | LogicalExpression | QuantifiedExpression | RuleDefinition | RelationshipNode | ExampleNode;

// Logical Expression connecting statements or intents (v2.0.0)
export interface LogicalExpression extends Node {
  type: 'LogicalExpression';
  operator: LogicalOperator;
  left: LogicalNode;
  right?: LogicalNode; // Optional for 'not' (unary)
}

// Quantifiers (v2.0.0) - Universal and existential
export type Quantifier = 'forall' | 'exists';

// Quantified Expression (v2.0.0) - First-order logic quantification
export interface QuantifiedExpression extends Node {
  type: 'QuantifiedExpression';
  quantifier: Quantifier;
  variable: string;                  // Bound variable name (e.g., "x", "person")
  domain?: string;                   // Domain constraint (after 'in' keyword, e.g., "Human", "Planet")
  body: LogicalNode;                 // Nested quantifiers allowed
}

// Rule Definition (v2.0.0) - For logical inference rules
export interface RuleDefinition extends Node {
  type: 'RuleDefinition';
  intentType: '!Rule';           // Special intent type
  ruleId: string;                // Unique identifier for the rule
  domain?: string;               // Domain of application (e.g., 'kinship', 'mathematics')
  premises: LogicalNode;         // Antecedent (can be single or AND of multiple)
  conclusion: LogicalNode;       // Consequent (can be single or AND of multiple)
  bidirectional?: boolean;       // If true, conclusion implies premises too
  confidence?: number;           // How confident in this rule
}

// ===================================================================
// Relationship Node (v2.1.0)
// Purpose: Inter-statement/inter-intent relationships
// Supports temporal, causal, and logical relationships between statements
// ===================================================================

export interface RelationshipNode extends Node {
  type: 'Relationship';
  relationshipType: 'temporal' | 'causal' | 'logical';  // Category of relationship
  source: string;                // $id reference to source intent/statement
  target: string;                // $id reference to target intent/statement
  relationName: string;          // before, after, causes, enables, supports, etc.
  statements?: Statement[];      // Optional explicit relationship expression
  confidence?: number;           // Confidence in the relationship (0.0-1.0)
  bidirectional?: boolean;       // Whether relationship is symmetric
  metadata?: Record<string, any>; // Additional metadata
}

// ===================================================================
// Example Node (v2.2.0)
// Purpose: Native syntax for embedding examples to clarify semantics
// Supports concept examples, relation examples, pattern examples
// ===================================================================

export interface ExampleNode extends Node {
  type: 'Example';
  exampleType: 'concept' | 'relation' | 'pattern' | 'positive' | 'negative';  // Category of example
  targetConcept?: string;        // <Concept> being exemplified
  targetRelation?: string;       // [relation] being exemplified
  targetPattern?: string;        // $id reference to pattern being exemplified
  contextType?: string;          // Context category (linguistic, cultural, domain, etc.)
  statements: Statement[];       // Example instances
  confidence?: number;           // Confidence in examples (0.0-1.0)
  metadata?: Record<string, any>; // Additional metadata (domain, usage, etc.)
}

// Inline Example Instance (for #example: marker within statements)
export interface InlineExample {
  subject: string;
  predicate: string;
  object: string;
  attributes?: Record<string, string | number | boolean>;
}

// Security-specific intent types
export interface SecureIntent extends Intent {
  security: SecurityMetadata;
}

export interface KeyGenerationIntent extends Node {
  type: 'KeyGeneration';
  agentId: string;
  algorithm: 'DILITHIUM' | 'KYBER' | 'BOTH';
}

export interface EncryptionIntent extends Node {
  type: 'Encryption';
  message: string;
  recipientAgentId: string;
}

export interface SignatureIntent extends Node {
  type: 'Signature';
  message: string;
  signerAgentId: string;
}

// Type guard utilities for v2.0.0 AST (helps with TypeScript narrowing)
export function isIntent(node: LogicalNode): node is Intent {
  return node.type === 'Intent';
}

export function isLogicalExpression(node: LogicalNode): node is LogicalExpression {
  return node.type === 'LogicalExpression';
}

export function isQuantifiedExpression(node: LogicalNode): node is QuantifiedExpression {
  return node.type === 'QuantifiedExpression';
}

export function isRuleDefinition(node: LogicalNode): node is RuleDefinition {
  return node.type === 'RuleDefinition';
}

// Type guard for v2.1.0 Relationship Node
export function isRelationshipNode(node: LogicalNode): node is RelationshipNode {
  return node.type === 'Relationship';
}

// Type guard for v2.2.0 Example Node
export function isExampleNode(node: LogicalNode): node is ExampleNode {
  return node.type === 'Example';
}

// Helper to filter Program body to get only Intents
export function getIntents(program: Program): Intent[] {
  return program.body.filter(isIntent);
}
