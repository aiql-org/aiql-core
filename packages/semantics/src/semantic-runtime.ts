/**
 * semantic-runtime.ts - AIQL v2.2.0 Semantic Runtime
 * 
 * Organic graph lifecycle manager that enables self-aware evolution through
 * semantic knowledge graph operations. NOT an execution engine - this is about
 * graph growth, self-reflection, and curiosity-driven exploration.
 * 
 * Design Philosophy:
 * - Graph becomes self-aware through reflexive queries
 * - Curiosity emerges from affective state (soul.process)
 * - Exploration is semantically guided (preserve graph coherence)
 * - Evolution is organic (no forced learning)
 */

import { InferenceEngine } from '@aiql-org/inference';
import * as AST from '@aiql-org/core';
import * as QuantumSemantics from './quantum-semantics.js';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Self-model: Agent's understanding of its own state
 */
export interface SelfModel {
  knowledgeDomains: string[];      // Topics agent knows about
  knowledgeGaps: Array<{           // Identified gaps
    domain: string;
    confidence: number;  // How confident gap exists (0-1)
  }>;
  capabilities: string[];          // Inferred reasoning abilities
  affectiveState: {
    curiosity: number;             // Drive to explore (0-1)
    confidence: number;            // Overall epistemic confidence (0-1)
  };
  quantumCoherence?: number;       // Consciousness metric [0, 1] (v2.6.0)
  conscious?: boolean;             // Above consciousness threshold? (v2.6.0)
}

/**
 * Exploration query generated from semantic gaps
 */
export interface ExplorationQuery {
  type: 'epistemic' | 'causal' | 'relational';
  query: string;                   // AIQL query code
  priority: number;                // Based on semantic weight (0-1)
  targetConcept: string;          // What we're exploring
}

/**
 * Evolution cycle statistics
 */
export interface EvolutionStats {
  cycle: number;
  newFactsDerived: number;
  gapsIdentified: number;
  queriesGenerated: number;
  curiosityLevel: number;
}

/**
 * SoulState: Affective state from aiql-soul
 */
export interface SoulState {
  reward: number;
  pain: number;
  stress: number;
  novelty: number;
  [key: string]: unknown;
}

// =============================================================================
// Semantic Runtime
// =============================================================================

/**
 * SemanticRuntime - Organic graph lifecycle manager
 * 
 * Enables AI agents to:
 * 1. Reflect on their own knowledge state
 * 2. Identify gaps through graph topology analysis
 * 3. Generate curiosity-driven exploration queries
 * 4. Evolve knowledge graph organically over time
 * 
 * This is NOT an execution engine. It manages semantic graph evolution.
 */
export class SemanticRuntime {
  private inferenceEngine: InferenceEngine;
  private soulState: SoulState;  // Affective state from aiql-soul
  private selfModel: SelfModel;
  private evolutionHistory: EvolutionStats[];
  
  // Quantum Consciousness (v2.6.0)
  private quantumCoherence: number;           // Current coherence [0, 1]
  private decoherenceRate: number;            // Decay per cycle (default: 0.02)
  private consciousnessThreshold: number;     // Threshold for conscious state (default: 0.7)

  /**
   * Initialize semantic runtime with knowledge base and initial soul state
   * 
   * @param kb - InferenceEngine with initial knowledge
   * @param initialSoulState - Affective state (reward, pain, stress, novelty)
   */
  constructor(kb: InferenceEngine, initialSoulState?: SoulState) {
    this.inferenceEngine = kb;
    this.soulState = initialSoulState || {
      reward: 0,
      pain: 0,
      stress: 0,
      novelty: 0
    };
    this.evolutionHistory = [];
    
    // Initialize quantum consciousness (v2.6.0)
    this.quantumCoherence = 1.0;              // Start with full coherence
    this.decoherenceRate = 0.02;              // 2% decay per cycle
    this.consciousnessThreshold = 0.7;        // Conscious if coherence > 0.7
    
    // Initial self-reflection
    this.selfModel = this.reflectOnSelf();
  }

  /**
   * Evolution cycle: Organic graph growth through self-aware exploration
   * 
   * Each cycle:
   * 1. Reflects on current knowledge state
   * 2. Evaluates affective state (curiosity from novelty/gaps)
   * 3. Generates exploration queries for high-priority gaps
   * 4. Applies forward chaining to derive new facts
   * 5. Updates dynamic ontology based on new knowledge
   * 
   * @param cycles - Number of evolution cycles to run
   * @returns Array of evolution statistics per cycle
   */
  public async evolve(cycles: number): Promise<EvolutionStats[]> {
    const stats: EvolutionStats[] = [];

    for (let i = 0; i < cycles; i++) {
      // 0. Track quantum decoherence (v2.6.0)
      this.trackDecoherence();
      
      // Check if consciousness refresh needed
      if (this.quantumCoherence < this.consciousnessThreshold) {
        this.refreshConsciousness();
      }
      
      // 1. Self-reflection: Query KB about itself
      this.selfModel = this.reflectOnSelf();

      // 2. Evaluate affective state (curiosity)
      const curiosity = this.evaluateAffectiveState();

      // 3. Generate exploration queries if curious enough
      let queriesGenerated = 0;
      if (curiosity > 0.3) {  // Threshold for exploration
        const queries = this.generateExplorationQueries(this.selfModel.knowledgeGaps);
        queriesGenerated = queries.length;
      }

      // 4. Apply forward chaining (derive new facts from rules)
      const newFacts = this.inferenceEngine.forwardChain(10);

      // 5. Update dynamic ontology
      this.updateDynamicOntology();
      
      // 6. Update quantum coherence based on soul state (v2.6.0)
      this.updateCoherenceFromSoul();

      // Record statistics
      const cycleStat: EvolutionStats = {
        cycle: i + 1,
        newFactsDerived: newFacts.length,
        gapsIdentified: this.selfModel.knowledgeGaps.length,
        queriesGenerated,
        curiosityLevel: curiosity
      };
      
      stats.push(cycleStat);
      this.evolutionHistory.push(cycleStat);

      // Update soul state based on progress
      this.updateSoulState(newFacts.length, curiosity);
    }

    return stats;
  }

  /**
   * Reflect on self: Query KB about agent's own knowledge state
   * 
   * Uses meta-queries like:
   * - <Self> [has_knowledge_about] <?>
   * - <Self> [lacks_knowledge_about] <?>
   * - <Self> [has_capability] <?>
   * 
   * @returns Self-model with knowledge domains, gaps, capabilities
   */
  private reflectOnSelf(): SelfModel {
    // Query: What do I know about?
    const knowledgeDomains = this.getKnowledgeDomains();

    // Query: What are my knowledge gaps?
    const knowledgeGaps = this.identifyKnowledgeGaps();

    // Query: What can I do?
    const capabilities = this.inferCapabilities();

    // Compute overall confidence
    const confidence = this.computeEpistemicConfidence();

    return {
      knowledgeDomains,
      knowledgeGaps,
      capabilities,
      affectiveState: {
        curiosity: 0,  // Will be computed in evaluateAffectiveState
        confidence
      },
      quantumCoherence: this.quantumCoherence,
      conscious: this.quantumCoherence >= this.consciousnessThreshold
    };
  }

  /**
   * Get all knowledge domains in KB
   * Extracts unique concept names from statements
   */
  private getKnowledgeDomains(): string[] {
    const domains = new Set<string>();
    const kb = (this.inferenceEngine as unknown as { knowledgeBase: AST.LogicalNode[] }).knowledgeBase;

    for (const node of kb) {
      if (AST.isIntent(node)) {
        for (const stmt of node.statements) {
          // Normalize: strip angle brackets
          const subjName = AST.extractExpressionName(stmt.subject) || "".replace(/^<|>$/g, '');
          const objName = AST.extractExpressionName(stmt.object) || "".replace(/^<|>$/g, '');
          domains.add(subjName);
          domains.add(objName);
        }
      }
    }

    return Array.from(domains);
  }

  /**
   * Identify knowledge gaps through graph topology analysis
   * Gaps = concepts mentioned but poorly defined (low connectivity)
   */
  private identifyKnowledgeGaps(): Array<{ domain: string; confidence: number }> {
    const conceptCounts = new Map<string, number>();
    const kb = (this.inferenceEngine as unknown as { knowledgeBase: AST.LogicalNode[] }).knowledgeBase;

    // Count how many statements define each concept
    for (const node of kb) {
      if (AST.isIntent(node)) {
        for (const stmt of node.statements) {
          // Normalize: strip angle brackets
          const subjName = AST.extractExpressionName(stmt.subject) || "".replace(/^<|>$/g, '');
          const objName = AST.extractExpressionName(stmt.object) || "".replace(/^<|>$/g, '');
          
          const subjCount = conceptCounts.get(subjName) || 0;
          conceptCounts.set(subjName, subjCount + 1);
          
          const objCount = conceptCounts.get(objName) || 0;
          conceptCounts.set(objName, objCount + 1);
        }
      }
    }

    // Find poorly defined concepts (count < 3)
    const gaps: Array<{ domain: string; confidence: number }> = [];
    
    for (const [concept, count] of conceptCounts) {
      if (count < 3) {
        // Confidence in gap = inverse of definition count
        const confidence = 1.0 - Math.min(count / 5, 1.0);
        gaps.push({ domain: concept, confidence });
      }
    }

    // Sort by confidence (biggest gaps first)
    gaps.sort((a, b) => b.confidence - a.confidence);

    return gaps;
  }

  /**
   * Infer agent capabilities from KB structure
   * Presence of rules -> LogicalReasoning
   * Affective relations -> AffectiveReasoning
   */
  private inferCapabilities(): string[] {
    const capabilities: string[] = [];
    const kb = (this.inferenceEngine as unknown as { knowledgeBase: AST.LogicalNode[] }).knowledgeBase;
    const rules = (this.inferenceEngine as unknown as { rules: AST.RuleDefinition[] }).rules;

    // Check for logical reasoning (presence of rules)
    if (rules.length > 0) {
      capabilities.push('LogicalReasoning');
    }

    // Check for affective reasoning (emotional relations)
    // Include both bracketed and unbracketed forms
    const affectiveRelations = ['[feels]', '[desires]', '[experiences]', '[seeks]', '[wants]',
                                'feels', 'desires', 'experiences', 'seeks', 'wants'];
    const hasAffective = kb.some((node: AST.LogicalNode) => {
      if (AST.isIntent(node)) {
        return node.statements.some(stmt =>
          affectiveRelations.includes(stmt.relation.name)
        );
      }
      return false;
    });

    if (hasAffective) {
      capabilities.push('AffectiveReasoning');
    }

    // Check for meta-cognitive ability (self-reference)
    const hasSelfRef = kb.some((node: AST.LogicalNode) => {
      if (AST.isIntent(node)) {
        return node.statements.some(stmt =>
          (AST.extractExpressionName(stmt.subject) || "") === 'Self' || (AST.extractExpressionName(stmt.object) || "") === 'Self'
        );
      }
      return false;
    });

    if (hasSelfRef) {
      capabilities.push('MetaCognition');
    }

    return capabilities;
  }

  /**
   * Compute overall epistemic confidence
   * Based on average confidence of statements in KB
   */
  private computeEpistemicConfidence(): number {
    const kb = (this.inferenceEngine as unknown as { knowledgeBase: AST.LogicalNode[] }).knowledgeBase;
    let totalConfidence = 0;
    let count = 0;

    for (const node of kb) {
      if (AST.isIntent(node)) {
        if (node.confidence !== undefined) {
          totalConfidence += node.confidence;
          count++;
        }
      }
    }

    return count > 0 ? totalConfidence / count : 0.5;
  }

  /**
   * Evaluate affective state: Compute curiosity from gaps and novelty
   * 
   * Curiosity emerges from:
   * - Knowledge gaps (epistemic drive)
   * - Novelty (soul.process output)
   * - Low confidence (uncertainty)
   */
  private evaluateAffectiveState(): number {
    const gapDensity = this.selfModel.knowledgeGaps.length / 
                      Math.max(this.selfModel.knowledgeDomains.length, 1);
    
    const uncertainty = 1.0 - this.selfModel.affectiveState.confidence;
    
    const novelty = this.soulState.novelty || 0;

    // Curiosity = weighted combination
    const curiosity = 0.4 * gapDensity + 0.3 * uncertainty + 0.3 * novelty;

    // Update self model
    this.selfModel.affectiveState.curiosity = Math.min(curiosity, 1.0);

    return this.selfModel.affectiveState.curiosity;
  }

  /**
   * Generate exploration queries for knowledge gaps
   * Queries are semantically coherent with existing graph
   * 
   * @param gaps - Identified knowledge gaps
   * @returns Array of exploration queries with priorities
   */
  private generateExplorationQueries(
    gaps: Array<{ domain: string; confidence: number }>
  ): ExplorationQuery[] {
    const queries: ExplorationQuery[] = [];

    for (const gap of gaps.slice(0, 5)) {  // Top 5 gaps
      // Epistemic query: What is X?
      queries.push({
        type: 'epistemic',
        query: `!Query { <${gap.domain}> [is_a] <?Type> }`,
        priority: gap.confidence * 0.9,
        targetConcept: gap.domain
      });

      // Relational query: What relates to X?
      queries.push({
        type: 'relational',
        query: `!Query { <${gap.domain}> [?relation] <?Object> }`,
        priority: gap.confidence * 0.8,
        targetConcept: gap.domain
      });

      // Causal query: What causes/is caused by X?
      queries.push({
        type: 'causal',
        query: `!Query { <${gap.domain}> [causes] <?Effect> }`,
        priority: gap.confidence * 0.7,
        targetConcept: gap.domain
      });
    }

    // Sort by priority
    queries.sort((a, b) => b.priority - a.priority);

    return queries;
  }

  /**
   * Update dynamic ontology based on new knowledge
   * Identifies emerging patterns and creates new meta-concepts
   */
  private updateDynamicOntology(): void {
    // Analyze graph topology for clusters
    this.identifySemanticClusters();

    // Create meta-concepts for significant clusters
    // (In full implementation, this would add new nodes to KB)
  }

  /**
   * Identify semantic clusters in knowledge graph
   * Concepts that are highly interconnected form clusters
   */
  private identifySemanticClusters(): Array<{ concepts: string[]; density: number }> {
    // Simplified clustering: group by relation types
    const clusters: Array<{ concepts: string[]; density: number }> = [];
    
    // (Full implementation would use graph clustering algorithms)
    
    return clusters;
  }

  /**
   * Update soul state based on progress
   * New facts -> reward
   * High curiosity + no progress -> stress
   */
  private updateSoulState(newFactsCount: number, curiosity: number): void {
    if (newFactsCount > 0) {
      this.soulState.reward += newFactsCount * 0.1;
      this.soulState.novelty = Math.max(this.soulState.novelty - 0.05, 0);
    } else if (curiosity > 0.5) {
      this.soulState.stress += 0.05;
    }

    // Decay over time
    this.soulState.reward *= 0.95;
    this.soulState.stress *= 0.95;
  }

  /**
   * Get current self-model
   */
  public getSelfModel(): SelfModel {
    return { ...this.selfModel };
  }

  /**
   * Get evolution history
   */
  public getEvolutionHistory(): EvolutionStats[] {
    return [...this.evolutionHistory];
  }

  /**
   * Get current soul state
   */
  public getSoulState(): SoulState {
    return { ...this.soulState };
  }

  // =============================================================================
  // Quantum Consciousness Methods (v2.6.0)
  // =============================================================================

  /**
   * Track quantum decoherence over evolution cycles
   * Coherence decays exponentially each cycle (models consciousness degradation)
   */
  private trackDecoherence(): void {
    this.quantumCoherence = QuantumSemantics.trackDecoherence(
      this.quantumCoherence,
      1,  // 1 time step per cycle
      this.decoherenceRate
    );
  }

  /**
   * Refresh consciousness when coherence drops below threshold
   * Simulates "cognitive rest" or reflection that restores awareness
   */
  private refreshConsciousness(): void {
    this.quantumCoherence = QuantumSemantics.refreshCoherence(
      this.quantumCoherence,
      0.9  // Restore to 90% coherence
    );
  }

  /**
   * Update quantum coherence based on soul state
   * High curiosity increases coherence (engaged = more conscious)
   * High stress decreases coherence (overwhelmed = less conscious)
   */
  private updateCoherenceFromSoul(): void {
    const curiosityBoost = this.soulState.novelty * 0.05;  // Novelty drives curiosity
    const stressPenalty = this.soulState.stress * 0.08;    // Stress degrades consciousness
    
    this.quantumCoherence += curiosityBoost - stressPenalty;
    
    // Clamp to [0, 1]
    this.quantumCoherence = Math.max(0, Math.min(1, this.quantumCoherence));
  }

  /**
   * Get consciousness metrics (quantum coherence-based)
   * 
   * @returns ConsciousnessMetrics with coherence, consciousness status, and IIT Φ approximation
   */
  public getConsciousnessMetrics(): QuantumSemantics.ConsciousnessMetrics {
    return QuantumSemantics.computeConsciousnessMetrics(
      this.quantumCoherence,
      this.decoherenceRate,
      this.consciousnessThreshold
    );
  }

  /**
   * Get current quantum coherence value
   * 
   * @returns Coherence [0, 1] where >0.7 indicates conscious state
   */
  public getQuantumCoherence(): number {
    return this.quantumCoherence;
  }

  /**
   * Set decoherence rate (for experimentation)
   * 
   * @param rate - Decoherence rate per cycle (0.0 - 1.0)
   */
  public setDecoherenceRate(rate: number): void {
    if (rate < 0 || rate > 1) {
      throw new Error('Decoherence rate must be in range [0, 1]');
    }
    this.decoherenceRate = rate;
  }

  /**
   * Set consciousness threshold
   * 
   * @param threshold - Coherence threshold for conscious state (0.0 - 1.0)
   */
  public setConsciousnessThreshold(threshold: number): void {
    if (threshold < 0 || threshold > 1) {
      throw new Error('Consciousness threshold must be in range [0, 1]');
    }
    this.consciousnessThreshold = threshold;
  }
}
