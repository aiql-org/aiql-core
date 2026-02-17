/**
 * inference.ts - AIQL v2.5.0 Inference Engine
 * 
 * Implements logical inference, proof construction, and consistency checking
 * for the AIQL Logic & Reasoning system.
 * 
 * Features:
 * - Forward chaining: Apply rules to derive new facts
 * - Backward chaining: Prove goals from existing knowledge
 * - Unification: Pattern matching for quantified variables
 * - Standard inference rules: Modus ponens, modus tollens, hypothetical syllogism, etc.
 * - Consistency checking: Detect contradictions in knowledge base
 * - Proof construction: Build proof trees for valid inferences
 * - Semantic contradiction detection: Ontology-aware conflict detection (v2.5.0)
 * - Lying detection: Trust-weighted credibility analysis (v2.5.0)
 */

import * as AST from '@aiql-org/core';
import { Parser } from '@aiql-org/core';
import { Tokenizer } from '@aiql-org/core';
import { OntologyReasoner } from './ontology-reasoner.js';
import { TrustRegistry } from '@aiql-org/security';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Variable substitution mapping
 * Maps variable names to their bound values
 */
export type Substitution = Map<string, string>;

/**
 * Proof step in a derivation
 */
export interface ProofStep {
  conclusion: AST.LogicalNode;
  rule: string;                    // Name of inference rule applied
  premises: AST.LogicalNode[];     // Premises used
  substitution?: Substitution;     // Variable bindings (if any)
}

/**
 * Complete proof tree
 */
export interface Proof {
  goal: AST.LogicalNode;
  steps: ProofStep[];
  valid: boolean;
  method: 'forward' | 'backward';
}

/**
 * Consistency check result
 */
export interface ConsistencyResult {
  consistent: boolean;
  contradictions: Array<{
    statement1: AST.LogicalNode;
    statement2: AST.LogicalNode;
    reason: string;
  }>;
  // v2.5.0: Semantic contradictions
  semanticContradictions?: SemanticContradiction[];
  // v2.5.0: Potential lies
  potentialLies?: LyingDetectionResult[];
}

/**
 * Semantic contradiction with rich metadata (v2.5.0)
 */
export interface SemanticContradiction {
  statement1: AST.Statement;
  statement2: AST.Statement;
  conflictType: 'taxonomy' | 'property' | 'cardinality' | 'type' | 'disjoint_values';
  reason: string;
  severity: 'critical' | 'major' | 'minor' | 'informational';
  details: Record<string, unknown>;
}

/**
 * Lying detection result (v2.5.0)
 */
export interface LyingDetectionResult {
  potentialLies: Array<{
    statement: AST.Intent;
    contradicts: AST.Intent[];
    trustDelta: number;
    weightedConfidenceDelta: number;
    reason: string;
  }>;
}

/**
 * Proof result with detailed information
 */
export interface ProofResult {
  provable: boolean;
  proof?: Proof;
  reason?: string;
}

// =============================================================================
// Inference Engine
// =============================================================================

export class InferenceEngine {
  private knowledgeBase: AST.LogicalNode[];
  private rules: AST.RuleDefinition[];
  private derivedFacts: Set<string>;  // Cache of derived facts (serialized)
  
  // v2.5.0: Semantic reasoning capabilities
  private ontologyReasoner: OntologyReasoner;
  private trustRegistry: TrustRegistry;

  /**
   * Initialize the Inference Engine with an AIQL Program.
   * 
   * Initialization Process:
   * 1. **Knowledge Base Loading**: Extracts all initial Facts (Intents) and Rules from the program body.
   * 2. **Fact Indexing**: Serializes facts for O(1) existence checks during reasoning.
   * 3. **Semantic Module bootstrapping** (v2.5.0):
   *    - **Ontology Reasoner**: Learns class hierarchies and property definitions from statements.
   *    - **Trust Registry**: Extracts trust scores and credibility metadata.
   * 
   * @param program - The parsed AIQL program containing the initial knowledge state.
   */
  constructor(program: AST.Program) {
    this.knowledgeBase = [...program.body];
    this.rules = program.body.filter(AST.isRuleDefinition);
    this.derivedFacts = new Set();
    
    // v2.5.0: Initialize semantic reasoning modules
    this.ontologyReasoner = new OntologyReasoner();
    this.trustRegistry = new TrustRegistry();
    
    // Index initial facts
    this.indexFacts(program.body);
    
    // v2.5.0: Learn ontology hierarchies and trust scores from KB
    this.initializeSemanticModules(program.body);
  }
  
  /**
   * Initialize semantic reasoning modules from knowledge base (v2.5.0)
   */
  private initializeSemanticModules(nodes: AST.LogicalNode[]): void {
    // Extract statements for ontology learning
    const statements: AST.Statement[] = [];
    for (const node of nodes) {
      if (AST.isIntent(node)) {
        statements.push(...node.statements);
      }
    }
    
    // Learn class hierarchies
    this.ontologyReasoner.learnHierarchy(statements);
    
    // Load trust scores from KB
    this.trustRegistry.loadFromKnowledgeBase(statements);
  }

  /**
   * Index facts for fast lookup
   */
  private indexFacts(nodes: AST.LogicalNode[]): void {
    for (const node of nodes) {
      if (AST.isIntent(node) || AST.isLogicalExpression(node)) {
        this.derivedFacts.add(this.serializeNode(node));
      }
    }
  }

  /**
   * Serialize a node to string for caching/comparison
   */
  private serializeNode(node: AST.LogicalNode): string {
    return JSON.stringify(node);
  }

  /**
   * Check if two nodes are structurally equal
   */
  private nodesEqual(node1: AST.LogicalNode, node2: AST.LogicalNode): boolean {
    return this.serializeNode(node1) === this.serializeNode(node2);
  }

  // ===========================================================================
  // Forward Chaining
  // ===========================================================================

  /**
   * Apply forward chaining to derive new facts
   * 
   * @param maxSteps Maximum number of inference steps (default: 100)
   * @returns Array of newly derived facts
   */
  public forwardChain(maxSteps: number = 100): AST.LogicalNode[] {
    const newFacts: AST.LogicalNode[] = [];
    let step = 0;
    let changed = true;

    while (changed && step < maxSteps) {
      changed = false;
      step++;

      // Try each rule in the knowledge base
      for (const rule of this.rules) {
        // Try to match rule premises against known facts
        const matches = this.matchPremises(rule.premises, this.knowledgeBase);
        
        for (const substitution of matches) {
          // Apply substitution to conclusion
          const conclusion = this.applySubstitution(rule.conclusion, substitution);
          const conclusionStr = this.serializeNode(conclusion);
          
          // Add if not already known
          if (!this.derivedFacts.has(conclusionStr)) {
            this.derivedFacts.add(conclusionStr);
            this.knowledgeBase.push(conclusion);
            newFacts.push(conclusion);
            changed = true;
          }
        }
      }

      // Try standard inference rules
      const inferredFacts = this.applyStandardRules();
      for (const fact of inferredFacts) {
        const factStr = this.serializeNode(fact);
        if (!this.derivedFacts.has(factStr)) {
          this.derivedFacts.add(factStr);
          this.knowledgeBase.push(fact);
          newFacts.push(fact);
          changed = true;
        }
      }
    }

    return newFacts;
  }

  /**
   * Match rule premises against knowledge base
   */
  private matchPremises(premises: AST.LogicalNode, kb: AST.LogicalNode[]): Substitution[] {
    const matches: Substitution[] = [];
    
    // For each fact in knowledge base, try to unify with premises
    for (const fact of kb) {
      const substitution = this.unify(premises, fact);
      if (substitution !== null) {
        matches.push(substitution);
      }
    }
    
    return matches;
  }

  /**
   * Apply standard inference rules (modus ponens, modus tollens, etc.)
   */
  private applyStandardRules(): AST.LogicalNode[] {
    const derived: AST.LogicalNode[] = [];

    // Modus Ponens: A, A → B ⊢ B
    derived.push(...this.applyModusPonens());

    // Modus Tollens: ¬B, A → B ⊢ ¬A
    derived.push(...this.applyModusTollens());

    // Hypothetical Syllogism: A → B, B → C ⊢ A → C
    derived.push(...this.applyHypotheticalSyllogism());

    // Disjunctive Syllogism: A ∨ B, ¬A ⊢ B
    derived.push(...this.applyDisjunctiveSyllogism());

    // Conjunction Introduction: A, B ⊢ A ∧ B
    derived.push(...this.applyConjunctionIntroduction());

    // Conjunction Elimination: A ∧ B ⊢ A, A ∧ B ⊢ B
    derived.push(...this.applyConjunctionElimination());

    // Disjunction Introduction: A ⊢ A ∨ B
    // (Skipped - generates infinite facts)

    return derived;
  }

  /**
   * Modus Ponens: A, A → B ⊢ B
   */
  private applyModusPonens(): AST.LogicalNode[] {
    const derived: AST.LogicalNode[] = [];

    for (const fact of this.knowledgeBase) {
      for (const implication of this.knowledgeBase) {
        if (AST.isLogicalExpression(implication) && implication.operator === 'implies') {
          // Check if fact matches left side of implication
          if (implication.left && this.nodesEqual(fact, implication.left)) {
            // Derive right side
            if (implication.right) {
              derived.push(implication.right);
            }
          }
        }
      }
    }

    return derived;
  }

  /**
   * Modus Tollens: ¬B, A → B ⊢ ¬A
   */
  private applyModusTollens(): AST.LogicalNode[] {
    const derived: AST.LogicalNode[] = [];

    for (const negation of this.knowledgeBase) {
      if (AST.isLogicalExpression(negation) && negation.operator === 'not') {
        for (const implication of this.knowledgeBase) {
          if (AST.isLogicalExpression(implication) && implication.operator === 'implies') {
            // Check if negation matches right side of implication
            if (negation.left && implication.right && this.nodesEqual(negation.left, implication.right)) {
              // Derive negation of left side
              if (implication.left) {
                derived.push({
                  type: 'LogicalExpression',
                  operator: 'not',
                  left: implication.left,
                  right: undefined
                });
              }
            }
          }
        }
      }
    }

    return derived;
  }

  /**
   * Hypothetical Syllogism: A → B, B → C ⊢ A → C
   */
  private applyHypotheticalSyllogism(): AST.LogicalNode[] {
    const derived: AST.LogicalNode[] = [];

    for (const impl1 of this.knowledgeBase) {
      if (AST.isLogicalExpression(impl1) && impl1.operator === 'implies') {
        for (const impl2 of this.knowledgeBase) {
          if (AST.isLogicalExpression(impl2) && impl2.operator === 'implies') {
            // Check if right of impl1 equals left of impl2
            if (impl1.right && impl2.left && this.nodesEqual(impl1.right, impl2.left)) {
              // Derive impl1.left → impl2.right
              if (impl1.left && impl2.right) {
                derived.push({
                  type: 'LogicalExpression',
                  operator: 'implies',
                  left: impl1.left,
                  right: impl2.right
                });
              }
            }
          }
        }
      }
    }

    return derived;
  }

  /**
   * Disjunctive Syllogism: A ∨ B, ¬A ⊢ B
   */
  private applyDisjunctiveSyllogism(): AST.LogicalNode[] {
    const derived: AST.LogicalNode[] = [];

    for (const disjunction of this.knowledgeBase) {
      if (AST.isLogicalExpression(disjunction) && disjunction.operator === 'or') {
        for (const negation of this.knowledgeBase) {
          if (AST.isLogicalExpression(negation) && negation.operator === 'not') {
            // Check if negation matches left side of disjunction
            if (negation.left && disjunction.left && this.nodesEqual(negation.left, disjunction.left)) {
              // Derive right side
              if (disjunction.right) {
                derived.push(disjunction.right);
              }
            }
            // Check if negation matches right side of disjunction
            if (negation.left && disjunction.right && this.nodesEqual(negation.left, disjunction.right)) {
              // Derive left side
              if (disjunction.left) {
                derived.push(disjunction.left);
              }
            }
          }
        }
      }
    }

    return derived;
  }

  /**
   * Conjunction Introduction: A, B ⊢ A ∧ B
   */
  private applyConjunctionIntroduction(): AST.LogicalNode[] {
    const derived: AST.LogicalNode[] = [];
    const facts = this.knowledgeBase.filter(node => AST.isIntent(node));

    // Only combine a limited number to avoid explosion
    const limit = Math.min(facts.length, 10);
    for (let i = 0; i < limit; i++) {
      for (let j = i + 1; j < limit; j++) {
        derived.push({
          type: 'LogicalExpression',
          operator: 'and',
          left: facts[i],
          right: facts[j]
        });
      }
    }

    return derived;
  }

  /**
   * Conjunction Elimination: A ∧ B ⊢ A, A ∧ B ⊢ B
   */
  private applyConjunctionElimination(): AST.LogicalNode[] {
    const derived: AST.LogicalNode[] = [];

    for (const conjunction of this.knowledgeBase) {
      if (AST.isLogicalExpression(conjunction) && conjunction.operator === 'and') {
        if (conjunction.left) {
          derived.push(conjunction.left);
        }
        if (conjunction.right) {
          derived.push(conjunction.right);
        }
      }
    }

    return derived;
  }

  // ===========================================================================
  // Backward Chaining
  // ===========================================================================

  /**
   * Prove a goal using backward chaining
   * 
   * @param goal Goal to prove
   * @returns Proof object if provable, null otherwise
   */
  public backwardChain(goal: AST.LogicalNode): Proof | null {
    const steps: ProofStep[] = [];
    const visited = new Set<string>();

    const prove = (currentGoal: AST.LogicalNode, depth: number = 0): boolean => {
      // Prevent infinite recursion
      if (depth > 20) return false;

      const goalStr = this.serializeNode(currentGoal);
      if (visited.has(goalStr)) return false;
      visited.add(goalStr);

      // Check if goal is already in knowledge base
      for (const fact of this.knowledgeBase) {
        if (this.nodesEqual(fact, currentGoal)) {
          steps.push({
            conclusion: currentGoal,
            rule: 'fact',
            premises: []
          });
          return true;
        }
      }

      // Try to find a rule that concludes the goal
      for (const rule of this.rules) {
        const substitution = this.unify(rule.conclusion, currentGoal);
        if (substitution !== null) {
          // Recursively prove premises
          const premisesToProve = this.applySubstitution(rule.premises, substitution);
          if (prove(premisesToProve, depth + 1)) {
            steps.push({
              conclusion: currentGoal,
              rule: rule.ruleId,
              premises: [premisesToProve],
              substitution
            });
            return true;
          }
        }
      }

      // Try decomposition rules
      if (AST.isLogicalExpression(currentGoal)) {
        if (currentGoal.operator === 'and') {
          // To prove A ∧ B, prove A and B separately
          if (currentGoal.left && currentGoal.right) {
            if (prove(currentGoal.left, depth + 1) && prove(currentGoal.right, depth + 1)) {
              steps.push({
                conclusion: currentGoal,
                rule: 'conjunction-introduction',
                premises: [currentGoal.left, currentGoal.right]
              });
              return true;
            }
          }
        } else if (currentGoal.operator === 'implies') {
          // To prove A → B, assume A and prove B
          if (currentGoal.left && currentGoal.right) {
            this.knowledgeBase.push(currentGoal.left);
            const result = prove(currentGoal.right, depth + 1);
            this.knowledgeBase.pop();
            if (result) {
              steps.push({
                conclusion: currentGoal,
                rule: 'implication-introduction',
                premises: [currentGoal.left, currentGoal.right]
              });
              return true;
            }
          }
        }
      }

      return false;
    };

    const provable = prove(goal);
    if (provable) {
      return {
        goal,
        steps,
        valid: true,
        method: 'backward'
      };
    }

    return null;
  }

  // ===========================================================================
  // Unification
  // ===========================================================================

  /**
   * Unify two logical nodes, finding variable substitutions that make them equal
   * 
   * @param pattern Pattern node (may contain variables)
   * @param target Target node to match against
   * @returns Substitution mapping if unification succeeds, null otherwise
   */
  public unify(pattern: AST.LogicalNode, target: AST.LogicalNode): Substitution | null {
    const substitution = new Map<string, string>();

    const unifyRecursive = (p: AST.LogicalNode, t: AST.LogicalNode): boolean => {
      // If both are intents
      if (AST.isIntent(p) && AST.isIntent(t)) {
        return this.unifyIntents(p, t, substitution);
      }

      // If both are logical expressions
      if (AST.isLogicalExpression(p) && AST.isLogicalExpression(t)) {
        if (p.operator !== t.operator) return false;
        
        if (p.left && t.left) {
          if (!unifyRecursive(p.left, t.left)) return false;
        } else if (p.left || t.left) {
          return false;
        }

        if (p.right && t.right) {
          if (!unifyRecursive(p.right, t.right)) return false;
        } else if (p.right || t.right) {
          return false;
        }

        return true;
      }

      // If both are quantified expressions
      if (AST.isQuantifiedExpression(p) && AST.isQuantifiedExpression(t)) {
        if (p.quantifier !== t.quantifier) return false;
        if (p.variable !== t.variable) return false;
        if (p.domain !== t.domain) return false;
        return unifyRecursive(p.body, t.body);
      }

      // Types don't match
      return false;
    };

    if (unifyRecursive(pattern, target)) {
      return substitution;
    }

    return null;
  }

  /**
   * Unify two Intent nodes
   */
  private unifyIntents(pattern: AST.Intent, target: AST.Intent, substitution: Substitution): boolean {
    if (pattern.intentType !== target.intentType) return false;

    // Unify statements
    if (pattern.statements.length !== target.statements.length) return false;

    for (let i = 0; i < pattern.statements.length; i++) {
      if (!this.unifyStatements(pattern.statements[i], target.statements[i], substitution)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Unify two Statement nodes
   */
  private unifyStatements(pattern: AST.Statement, target: AST.Statement, substitution: Substitution): boolean {
    // Unify subject, relation, object
    if (!this.unifyTerm(pattern.subject.name, target.subject.name, substitution)) return false;
    if (!this.unifyTerm(pattern.relation.name, target.relation.name, substitution)) return false;
    if (!this.unifyTerm(pattern.object.name, target.object.name, substitution)) return false;

    return true;
  }

  /**
   * Unify a term (subject/relation/object)
   * Variables start with lowercase, constants with uppercase or special chars
   */
  private unifyTerm(pattern: string, target: string, substitution: Substitution): boolean {
    // Check if pattern is a variable (lowercase first letter)
    if (this.isVariable(pattern)) {
      // Check if already bound
      const binding = substitution.get(pattern);
      if (binding !== undefined) {
        return binding === target;
      }
      // Create new binding
      substitution.set(pattern, target);
      return true;
    }

    // Both are constants - must match exactly
    return pattern === target;
  }

  /**
   * Check if a term is a variable (heuristic: lowercase first letter, not wrapped in <>)
   */
  private isVariable(term: string): boolean {
    if (term.startsWith('<') && term.endsWith('>')) return false;
    if (term.startsWith('[') && term.endsWith(']')) return false;
    if (term.length > 0 && term[0] >= 'a' && term[0] <= 'z') return true;
    return false;
  }

  /**
   * Apply substitution to a logical node
   */
  private applySubstitution(node: AST.LogicalNode, substitution: Substitution): AST.LogicalNode {
    if (AST.isIntent(node)) {
      return this.applySubstitutionToIntent(node, substitution);
    } else if (AST.isLogicalExpression(node)) {
      const result: AST.LogicalExpression = {
        type: 'LogicalExpression',
        operator: node.operator,
        left: node.left ? this.applySubstitution(node.left, substitution) : node.left,
        right: node.right ? this.applySubstitution(node.right, substitution) : node.right
      };
      return result;
    } else if (AST.isQuantifiedExpression(node)) {
      return {
        type: 'QuantifiedExpression',
        quantifier: node.quantifier,
        variable: node.variable,
        domain: node.domain,
        body: this.applySubstitution(node.body, substitution)
      };
    }
    
    return node;
  }

  /**
   * Apply substitution to an Intent node
   */
  private applySubstitutionToIntent(intent: AST.Intent, substitution: Substitution): AST.Intent {
    return {
      ...intent,
      statements: intent.statements.map(stmt => ({
        ...stmt,
        subject: { 
          type: 'Concept' as const,
          name: substitution.get(stmt.subject.name) || stmt.subject.name 
        },
        relation: { 
          type: 'Relation' as const,
          name: substitution.get(stmt.relation.name) || stmt.relation.name,
          tense: stmt.relation.tense
        },
        object: { 
          type: 'Concept' as const,
          name: substitution.get(stmt.object.name) || stmt.object.name 
        }
      }))
    };
  }

  // ===========================================================================
  // Consistency Checking
  // ===========================================================================

  /**
   * Check knowledge base for contradictions
   */
  public checkConsistency(): ConsistencyResult {
    const contradictions: ConsistencyResult['contradictions'] = [];

    // Check for explicit contradictions: A and ¬A
    for (const fact1 of this.knowledgeBase) {
      for (const fact2 of this.knowledgeBase) {
        if (AST.isLogicalExpression(fact2) && fact2.operator === 'not') {
          if (fact2.left && this.nodesEqual(fact1, fact2.left)) {
            contradictions.push({
              statement1: fact1,
              statement2: fact2,
              reason: 'Direct contradiction: A and ¬A both asserted'
            });
          }
        }
      }
    }

    // Check for contradictory implications: A → B and A → ¬B
    for (const impl1 of this.knowledgeBase) {
      if (AST.isLogicalExpression(impl1) && impl1.operator === 'implies') {
        for (const impl2 of this.knowledgeBase) {
          if (AST.isLogicalExpression(impl2) && impl2.operator === 'implies') {
            if (impl1.left && impl2.left && this.nodesEqual(impl1.left, impl2.left)) {
              if (impl2.right && AST.isLogicalExpression(impl2.right) && impl2.right.operator === 'not') {
                if (impl1.right && impl2.right.left && this.nodesEqual(impl1.right, impl2.right.left)) {
                  contradictions.push({
                    statement1: impl1,
                    statement2: impl2,
                    reason: 'Contradictory implications: A → B and A → ¬B'
                  });
                }
              }
            }
          }
        }
      }
    }

    return {
      consistent: contradictions.length === 0,
      contradictions
    };
  }

  // ===========================================================================
  // Semantic Contradiction Detection (v2.5.0)
  // ===========================================================================

  /**
   * Detect semantic contradictions using ontology reasoning
   * Identifies conflicts beyond structural contradictions (A ∧ ¬A)
   */
  public detectSemanticContradictions(): SemanticContradiction[] {
    const contradictions: SemanticContradiction[] = [];
    
    // Extract all statements from knowledge base
    const statements: AST.Statement[] = [];
    for (const node of this.knowledgeBase) {
      if (AST.isIntent(node)) {
        statements.push(...node.statements);
      }
    }
    
    // Use ontology reasoner to detect conflicts
    const conflicts = this.ontologyReasoner.detectAllConflicts(statements);
    
    for (const conflict of conflicts) {
      if (conflict.hasConflict && conflict.conflictType && conflict.severity && conflict.details) {
        contradictions.push({
          statement1: conflict.details.statement1 as AST.Statement,
          statement2: conflict.details.statement2 as AST.Statement,
          conflictType: conflict.conflictType,
          reason: conflict.reason || 'Semantic conflict detected',
          severity: conflict.severity,
          details: conflict.details
        });
      }
    }
    
    return contradictions;
  }

  /**
   * Detect potential lies based on trust-weighted confidence analysis
   * Flags low-trust sources that contradict high-trust sources
   * 
   * @param threshold Minimum confidence delta to flag as potential lie (default: 0.3)
   */
  public detectLying(threshold: number = 0.3): LyingDetectionResult {
    const potentialLies: LyingDetectionResult['potentialLies'] = [];
    
    // Extract all Intents with provenance information
    const intents: AST.Intent[] = [];
    for (const node of this.knowledgeBase) {
      // intentType format is "!Assert", "!Query", etc. (includes the !)
      if (AST.isIntent(node) && node.intentType === '!Assert') {
        intents.push(node);
      }
    }
    
    // Find contradicting statement pairs
    for (let i = 0; i < intents.length; i++) {
      for (let j = i + 1; j < intents.length; j++) {
        const intent1 = intents[i];
        const intent2 = intents[j];
        
        // Check if statements contradict (structurally or semantically)
        const hasStructuralContradiction = this.checkIntentsContradict(intent1, intent2);
        if (!hasStructuralContradiction) {
          continue;
        }
        
        // Compute weighted confidences
        const weighted1 = this.trustRegistry.computeWeightedConfidence(
          intent1.confidence,
          intent1.origin
        );
        const weighted2 = this.trustRegistry.computeWeightedConfidence(
          intent2.confidence,
          intent2.origin
        );
        
        // Check if trust delta suggests lying
        const lieCheck = this.trustRegistry.isPotentialLie(
          { confidence: intent1.confidence, origin: intent1.origin },
          { confidence: intent2.confidence, origin: intent2.origin },
          threshold
        );
        
        if (lieCheck.isPotentialLie) {
          potentialLies.push({
            statement: weighted1.weightedConfidence < weighted2.weightedConfidence ? intent1 : intent2,
            contradicts: [weighted1.weightedConfidence >= weighted2.weightedConfidence ? intent1 : intent2],
            trustDelta: Math.abs(lieCheck.trustDelta),
            weightedConfidenceDelta: Math.abs(lieCheck.weightedConfidenceDelta),
            reason: lieCheck.reason || 'Low-trust source contradicts high-trust source'
          });
        }
      }
    }
    
    return { potentialLies };
  }

  /**
   * Check if two Intents contain contradicting statements
   * Helper method for lying detection
   */
  private checkIntentsContradict(intent1: AST.Intent, intent2: AST.Intent): boolean {
    // Simplified contradiction check: compare statement structures
    for (const stmt1 of intent1.statements) {
      for (const stmt2 of intent2.statements) {
        // Same subject and relation but different objects suggest contradiction
        if (stmt1.subject.name === stmt2.subject.name &&
            stmt1.relation.name === stmt2.relation.name &&
            stmt1.object.name !== stmt2.object.name) {
          return true;
        }
        
        // Check via ontology reasoner
        const conflict = this.ontologyReasoner.detectSemanticConflict(stmt1, stmt2);
        if (conflict.hasConflict) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Generate contradiction relationship graph
   * Auto-generates !Relationship Intents for detected contradictions
   * 
   * @param includeSemanticConflicts Include semantic contradictions (default: true)
   * @param includeLies Include potential lies (default: true)
   */
  public generateContradictionGraph(
    includeSemanticConflicts: boolean = true,
    includeLies: boolean = true
  ): AST.RelationshipNode[] {
    const relationships: AST.RelationshipNode[] = [];
    let contradictionId = 1;
    
    // Generate relationships for semantic contradictions
    if (includeSemanticConflicts) {
      const semanticContradictions = this.detectSemanticContradictions();
      
      for (const contradiction of semanticContradictions) {
        const relationshipNode: AST.RelationshipNode = {
          type: 'Relationship',
          relationshipType: 'logical',
          source: `statement_${contradictionId}_a`,
          target: `statement_${contradictionId}_b`,
          relationName: 'contradicts',
          metadata: {
            contradiction_type: contradiction.conflictType,
            reason: contradiction.reason,
            severity: contradiction.severity,
            domain_knowledge: contradiction.details.domain || 'general'
          },
          bidirectional: false,
          confidence: 0.92
        };
        
        relationships.push(relationshipNode);
        contradictionId++;
      }
    }
    
    // Generate relationships for potential lies
    if (includeLies) {
      const lyingResult = this.detectLying();
      
      for (const lie of lyingResult.potentialLies) {
        const relationshipNode: AST.RelationshipNode = {
          type: 'Relationship',
          relationshipType: 'logical',
          source: `lie_suspect_${contradictionId}`,
          target: `contradicted_fact_${contradictionId}`,
          relationName: 'contradicts',
          metadata: {
            contradiction_type: 'trust_conflict',
            reason: lie.reason,
            severity: 'major',
            trust_delta: lie.trustDelta,
            weighted_confidence_delta: lie.weightedConfidenceDelta,
            likely_deception: true
          },
          bidirectional: false,
          confidence: 0.88
        };
        
        relationships.push(relationshipNode);
        contradictionId++;
      }
    }
    
    return relationships;
  }

  /**
   * Get access to ontology reasoner (for external use)
   */
  public getOntologyReasoner(): OntologyReasoner {
    return this.ontologyReasoner;
  }

  /**
   * Get access to trust registry (for external use)
   */
  public getTrustRegistry(): TrustRegistry {
    return this.trustRegistry;
  }

  // ===========================================================================
  // Proof Construction
  // ===========================================================================

  /**
   * Attempt to prove a goal and return detailed proof result
   */
  public prove(goal: AST.LogicalNode): ProofResult {
    // Try backward chaining first
    const backwardProof = this.backwardChain(goal);
    if (backwardProof) {
      return {
        provable: true,
        proof: backwardProof
      };
    }

    // Try forward chaining
    this.forwardChain(50);
    
    // Check if goal is now derivable
    for (const fact of this.knowledgeBase) {
      if (this.nodesEqual(fact, goal)) {
        return {
          provable: true,
          proof: {
            goal,
            steps: [{
              conclusion: goal,
              rule: 'forward-chaining',
              premises: []
            }],
            valid: true,
            method: 'forward'
          }
        };
      }
    }

    return {
      provable: false,
      reason: 'Goal not derivable from knowledge base'
    };
  }

  /**
   * Query knowledge base with pattern matching
   */
  public query(pattern: AST.LogicalNode): AST.LogicalNode[] {
    const results: AST.LogicalNode[] = [];
    
    for (const fact of this.knowledgeBase) {
      const substitution = this.unify(pattern, fact);
      if (substitution !== null) {
        results.push(fact);
      }
    }
    
    return results;
  }

  // ===========================================================================
  // Meta-Cognitive Queries (v2.2.0)
  // ===========================================================================

  /**
   * Meta-cognitive query: Query KB about its own epistemic state
   * Enables <Self> queries like: <Self> [has_knowledge_about] <?Topic>
   * 
   * @param metaQuery - Statement with Self as subject and meta-relation
   * @returns Array of statements representing epistemic state
   */
  public queryMeta(metaQuery: AST.Statement): AST.Statement[] {
    const { subject, relation, object } = metaQuery;
    
    // Normalize concept names (strip brackets if present, then add them)
    const normalizeConceptName = (name: string): string => {
      const stripped = name.replace(/^<|>$/g, '');
      return `<${stripped}>`;
    };
    
    const normalizedSubject = normalizeConceptName(subject.name);
    const normalizedObject = normalizeConceptName(object.name);
    
    // <Self> [has_knowledge_about] <?Topic>
    if (normalizedSubject === '<Self>' && relation.name === 'has_knowledge_about') {
      return this.getAllStatementsMentioning(normalizedObject);
    }
    
    // <Self> [lacks_knowledge_about] <?Domain>
    if (normalizedSubject === '<Self>' && relation.name === 'lacks_knowledge_about') {
      const gaps = this.findKnowledgeGaps();
      return gaps.map(gap => ({
        type: 'Statement' as const,
        subject: { type: 'Concept' as const, name: '<Self>' },
        relation: { type: 'Relation' as const, name: 'lacks_knowledge_about' },
        object: { type: 'Concept' as const, name: gap.concept },
        attributes: { confidence: gap.confidence }
      }));
    }
    
    // <Self> [has_capability] <?Skill>
    if (normalizedSubject === '<Self>' && relation.name === 'has_capability') {
      return this.inferCapabilitiesFromKnowledge();
    }
    
    // v2.6.0: Quantum Consciousness Queries
    
    // <Self> [has_consciousness_level] <?Coherence>
    if (normalizedSubject === '<Self>' && relation.name === 'has_consciousness_level') {
      return this.queryConsciousnessLevel();
    }
    
    // <Self> [in_superposition_about] <?Topic>
    if (normalizedSubject === '<Self>' && relation.name === 'in_superposition_about') {
      return this.findSuperpositions();
    }
    
    // <Self> [has_coherence] <?Value>
    if (normalizedSubject === '<Self>' && relation.name === 'has_coherence') {
      return this.queryCoherence();
    }
    
    return [];
  }

  /**
   * Get all statements mentioning a concept (as subject or object)
   * 
   * @param conceptName - Concept to search for
   * @returns Array of statements mentioning the concept
   */
  private getAllStatementsMentioning(conceptName: string): AST.Statement[] {
    const results: AST.Statement[] = [];
    for (const node of this.knowledgeBase) {
      if (AST.isIntent(node)) {
        for (const stmt of node.statements) {
          if (stmt.subject.name === conceptName || stmt.object.name === conceptName) {
            results.push(stmt);
          }
        }
      }
    }
    return results;
  }

  /**
   * Find knowledge gaps - concepts referenced but not well-defined
   * A concept is a "gap" if it appears in fewer than 2 statements.
   * 
   * @returns Array of gaps with concept name and confidence score
   */
  private findKnowledgeGaps(): Array<{concept: string, confidence: number}> {
    const allConcepts = new Set<string>();
    const definedConcepts = new Map<string, number>();
    
    // Collect all concepts and count how many statements define each
    for (const node of this.knowledgeBase) {
      if (AST.isIntent(node)) {
        for (const stmt of node.statements) {
          allConcepts.add(stmt.subject.name);
          allConcepts.add(stmt.object.name);
          
          // Count how many statements define each concept
          const count = definedConcepts.get(stmt.subject.name) || 0;
          definedConcepts.set(stmt.subject.name, count + 1);
        }
      }
    }
    
    // Find gaps: concepts mentioned but with low definition count
    const gaps: Array<{concept: string, confidence: number}> = [];
    for (const concept of Array.from(allConcepts)) {
      const defCount = definedConcepts.get(concept) || 0;
      if (defCount < 2) {  // Threshold: less than 2 statements
        gaps.push({
          concept,
          confidence: 1.0 - Math.min(defCount / 5, 1.0)  // Higher confidence = bigger gap
        });
      }
    }
    
    return gaps;
  }

  /**
   * Infer agent capabilities from KB content structure
   * Analyzes what types of reasoning the KB supports based on:
   * - Presence of rules -> LogicalReasoning
   * - Affective relations -> AffectiveReasoning  
   * - Self-references -> MetaCognition
   * 
   * @returns Array of statements describing inferred capabilities
   */
  private inferCapabilitiesFromKnowledge(): AST.Statement[] {
    const capabilities: AST.Statement[] = [];
    
    // If KB has rules, agent can reason
    if (this.rules.length > 0) {
      capabilities.push({
        type: 'Statement',
        subject: { type: 'Concept', name: '<Self>' },
        relation: { type: 'Relation', name: 'has_capability' },
        object: { type: 'Concept', name: '<LogicalReasoning>' },
        attributes: { confidence: 0.95 }
      });
    }
    
    // If KB has affective relations, agent can model emotions
    const affectiveRelations = ['[feels]', '[desires]', '[experiences]', '[seeks]', 'feels', 'desires', 'experiences', 'seeks'];
    const hasAffective = this.knowledgeBase.some(node => {
      if (AST.isIntent(node)) {
        return node.statements.some(stmt =>
          affectiveRelations.includes(stmt.relation.name)
        );
      }
      return false;
    });
    
    if (hasAffective) {
      capabilities.push({
        type: 'Statement',
        subject: { type: 'Concept', name: '<Self>' },
        relation: { type: 'Relation', name: 'has_capability' },
        object: { type: 'Concept', name: '<AffectiveReasoning>' },
        attributes: { confidence: 0.90 }
      });
    }
    
    return capabilities;
  }

  // =============================================================================
  // Quantum Consciousness Query Methods (v2.6.0)
  // =============================================================================

  /**
   * Query consciousness level - returns quantum coherence metrics
   * Handles: <Self> [has_consciousness_level] <?Coherence>
   * 
   * Returns a statement with coherence attributes indicating consciousness state
   * This is a placeholder that would integrate with SemanticRuntime in production
   * 
   * @returns Array with single statement describing consciousness level
   */
  private queryConsciousnessLevel(): AST.Statement[] {
    // In production, this would query SemanticRuntime.getConsciousnessMetrics()
    // For now, return a template statement showing the pattern
    
    // Calculate simple coherence approximation from KB structure
    const totalStatements = this.knowledgeBase.filter(AST.isIntent)
      .reduce((sum, intent) => sum + intent.statements.length, 0);
    
    // More statements = higher coherence (simple heuristic)
    const approximateCoherence = Math.min(totalStatements / 100, 1.0);
    const conscious = approximateCoherence >= 0.7;
    
    return [{
      type: 'Statement',
      subject: { type: 'Concept', name: '<Self>' },
      relation: { type: 'Relation', name: 'has_consciousness_level' },
      object: { type: 'Concept', name: conscious ? '<HighCoherence>' : '<LowCoherence>' },
      attributes: {
        coherence: approximateCoherence,
        conscious,
        threshold: 0.7,
        statementsCount: totalStatements
      }
    }];
  }

  /**
   * Find concepts in superposition - contradictory beliefs coexisting
   * Handles: <Self> [in_superposition_about] <?Topic>
   * 
   * Identifies concepts where KB contains multiple conflicting statements
   * Example: <Photon> [is] <Wave> and <Photon> [is] <Particle>
   * 
   * @returns Array of statements identifying superposed concepts
   */
  private findSuperpositions(): AST.Statement[] {
    const conceptRelationMap = new Map<string, Map<string, Set<string>>>();
    
    // Build map: concept -> relation -> set of values
    for (const node of this.knowledgeBase) {
      if (AST.isIntent(node)) {
        // Check if this intent has quantum superposition mode
        const hasQuantumMode = node.contextParams?.mode === 'quantum_superposition';
        
        for (const stmt of node.statements) {
          const concept = stmt.subject.name;
          const relation = stmt.relation.name;
          const value = stmt.object.name;
          
          if (!conceptRelationMap.has(concept)) {
            conceptRelationMap.set(concept, new Map());
          }
          
          const relationMap = conceptRelationMap.get(concept)!;
          if (!relationMap.has(relation)) {
            relationMap.set(relation, new Set());
          }
          
          relationMap.get(relation)!.add(value);
          
          // Store quantum mode flag
          if (hasQuantumMode) {
            if (!relationMap.has('__quantum_mode__')) {
              relationMap.set('__quantum_mode__', new Set());
            }
            relationMap.get('__quantum_mode__')!.add('true');
          }
        }
      }
    }
    
    // Find concepts with multiple values for same relation (superposition)
    const superpositions: AST.Statement[] = [];
    for (const [concept, relationMap] of conceptRelationMap) {
      for (const [relation, values] of relationMap) {
        if (relation === '__quantum_mode__') continue;
        
        if (values.size > 1) {
          // Found superposition!
          const isQuantumMarked = relationMap.get('__quantum_mode__')?.has('true') || false;
          
          superpositions.push({
            type: 'Statement',
            subject: { type: 'Concept', name: '<Self>' },
            relation: { type: 'Relation', name: 'in_superposition_about' },
            object: { type: 'Concept', name: concept },
            attributes: {
              relation,
              values: JSON.stringify(Array.from(values)),  // Convert array to JSON string
              stateCount: values.size,
              quantumMarked: isQuantumMarked
            }
          });
        }
      }
    }
    
    return superpositions;
  }

  /**
   * Query current coherence value
   * Handles: <Self> [has_coherence] <?Value>
   * 
   * Returns the current quantum coherence measure (0.0-1.0)
   * In production, this would read from SemanticRuntime
   * 
   * @returns Array with single statement containing coherence value
   */
  private queryCoherence(): AST.Statement[] {
    // Simple approximation: coherence = (stmts with @coherence / total stmts)
    let totalStmts = 0;
    let coherentStmts = 0;
    
    for (const node of this.knowledgeBase) {
      if (AST.isIntent(node)) {
        totalStmts += node.statements.length;
        if (node.coherence !== undefined) {
          coherentStmts += node.statements.length;
        }
      }
    }
    
    const averageCoherence = totalStmts > 0 ? coherentStmts / totalStmts : 1.0;
    
    return [{
      type: 'Statement',
      subject: { type: 'Concept', name: '<Self>' },
      relation: { type: 'Relation', name: 'has_coherence' },
      object: { type: 'Concept', name: '<CoherenceValue>' },
      attributes: {
        value: averageCoherence,
        coherentStatements: coherentStmts,
        totalStatements: totalStmts
      }
    }];
  }

  /**
   * Get current knowledge base
   */
  public getKnowledgeBase(): AST.LogicalNode[] {
    return [...this.knowledgeBase];
  }

  /**
   * Add a fact to the knowledge base
   */
  public addFact(fact: AST.LogicalNode): void {
    const factStr = this.serializeNode(fact);
    if (!this.derivedFacts.has(factStr)) {
      this.derivedFacts.add(factStr);
      this.knowledgeBase.push(fact);
    }
  }

  /**
   * Parse AIQL code and add to knowledge base
   */
  public addFromAIQL(code: string): void {
    const tokenizer = new Tokenizer(code);
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const program = parser.parse();
    
    for (const node of program.body) {
      this.addFact(node);
    }
  }
}
