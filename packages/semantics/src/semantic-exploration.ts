/**
 * semantic-exploration.ts - AIQL v2.2.0 Semantic Exploration
 * 
 * Semantic gap detection and query generation for curiosity-driven exploration.
 * All operations preserve knowledge graph semantic coherence and structural integrity.
 * 
 * Design Philosophy:
 * - Gaps detected through graph topology (connectivity, confidence)
 * - Queries generated to maintain semantic coherence
 * - Prioritization based on semantic weight (importance to graph)
 * - Exploration respects existing ontology structure
 */

import { InferenceEngine } from '@aiql-org/inference';
import * as AST from '@aiql-org/core';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Semantic gap in knowledge graph
 */
export interface SemanticGap {
  concept: string;                 // Under-defined concept
  gapType: 'connectivity' | 'confidence' | 'definition' | 'coherence';
  severity: number;                // 0-1, higher = more severe
  context: string[];               // Related concepts
  metrics: {
    statementCount: number;        // How many statements mention it
    averageConfidence: number;     // Average confidence of statements
    inDegree: number;              // How many statements point to it
    outDegree: number;             // How many statements it points from
  };
}

/**
 * Generated semantic query to explore gap
 */
export interface SemanticQuery {
  aiqlCode: string;                // Valid AIQL query code
  targetConcept: string;           // What we're exploring
  queryType: 'existence' | 'property' | 'relation' | 'causal' | 'taxonomic';
  expectedCoherence: number;       // How well it fits existing graph (0-1)
  priority: number;                // Based on semantic weight (0-1)
}

/**
 * Semantic weight: Importance of concept in graph
 */
export interface SemanticWeight {
  concept: string;
  weight: number;                  // 0-1, higher = more important
  factors: {
    centrality: number;            // How connected (betweenness)
    confidence: number;            // Average confidence
    frequency: number;             // How often mentioned
  };
}

// =============================================================================
// Semantic Explorer
// =============================================================================

/**
 * SemanticExplorer - Curiosity-driven graph exploration
 * 
 * Detects semantic gaps through topology analysis and generates
 * coherent queries that preserve graph structure and meaning.
 */
export class SemanticExplorer {
  
  /**
   * Detect semantic gaps in knowledge base
   * 
   * Gap types:
   * - Connectivity: Low-connected nodes (< 2 edges)
   * - Confidence: Low-confidence statements (< 0.5)
   * - Definition: Concepts mentioned but not defined
   * - Coherence: Statements that violate semantic constraints
   * 
   * @param kb - InferenceEngine with knowledge base
   * @returns Array of detected semantic gaps
   */
  public detectSemanticGaps(kb: InferenceEngine): SemanticGap[] {
    const gaps: SemanticGap[] = [];
    const knowledgeBase = (kb as any).knowledgeBase;

    // Build concept statistics
    const conceptStats = this.buildConceptStatistics(knowledgeBase);

    // 1. Connectivity gaps: Under-connected concepts
    for (const [concept, stats] of conceptStats) {
      const totalDegree = stats.inDegree + stats.outDegree;
      
      if (totalDegree < 2 && stats.statementCount > 0) {
        gaps.push({
          concept,
          gapType: 'connectivity',
          severity: 1.0 - (totalDegree / 5),  // Max 5 connections
          context: this.getRelatedConcepts(concept, knowledgeBase),
          metrics: stats
        });
      }
    }

    // 2. Confidence gaps: Low-confidence statements
    for (const [concept, stats] of conceptStats) {
      if (stats.averageConfidence < 0.5 && stats.statementCount > 0) {
        gaps.push({
          concept,
          gapType: 'confidence',
          severity: 1.0 - stats.averageConfidence,
          context: this.getRelatedConcepts(concept, knowledgeBase),
          metrics: stats
        });
      }
    }

    // 3. Definition gaps: Mentioned but not defined
    const definedConcepts = this.getDefinedConcepts(knowledgeBase);
    const mentionedConcepts = this.getMentionedConcepts(knowledgeBase);
    
    for (const concept of mentionedConcepts) {
      if (!definedConcepts.has(concept) && conceptStats.has(concept)) {
        const stats = conceptStats.get(concept)!;
        gaps.push({
          concept,
          gapType: 'definition',
          severity: 0.9,  // High severity
          context: this.getRelatedConcepts(concept, knowledgeBase),
          metrics: stats
        });
      }
    }

    return gaps;
  }

  /**
   * Generate semantic queries to explore gaps
   * Queries are coherent with existing graph structure
   * 
   * @param gap - Semantic gap to explore
   * @param kb - InferenceEngine with knowledge base
   * @returns Array of generated queries
   */
  public generateSemanticQueries(gap: SemanticGap, kb: InferenceEngine): SemanticQuery[] {
    const queries: SemanticQuery[] = [];
    const knowledgeBase = (kb as any).knowledgeBase;

    // Generate different types of queries based on gap type
    switch (gap.gapType) {
      case 'connectivity':
        queries.push(...this.generateConnectivityQueries(gap, knowledgeBase));
        break;
      case 'confidence':
        queries.push(...this.generateConfidenceQueries(gap, knowledgeBase));
        break;
      case 'definition':
        queries.push(...this.generateDefinitionQueries(gap, knowledgeBase));
        break;
      case 'coherence':
        queries.push(...this.generateCoherenceQueries(gap, knowledgeBase));
        break;
    }

    // Calculate coherence and priority for each query
    for (const query of queries) {
      query.expectedCoherence = this.calculateQueryCoherence(query, knowledgeBase);
      query.priority = gap.severity * query.expectedCoherence;
    }

    return queries;
  }

  /**
   * Calculate semantic weight of concept in graph
   * Higher weight = more central/important to graph
   * 
   * @param concept - Concept name
   * @param kb - InferenceEngine with knowledge base
   * @returns Semantic weight with breakdown
   */
  public calculateSemanticWeight(concept: string, kb: InferenceEngine): SemanticWeight {
    const knowledgeBase = (kb as any).knowledgeBase;
    
    // Normalize: strip angle brackets if present
    const normalizedConcept = concept.replace(/^<|>$/g, '');
    const stats = this.buildConceptStatistics(knowledgeBase).get(normalizedConcept);

    if (!stats) {
      return {
        concept: normalizedConcept,
        weight: 0,
        factors: { centrality: 0, confidence: 0, frequency: 0 }
      };
    }

    // Centrality: Based on degree (in + out edges)
    const totalDegree = stats.inDegree + stats.outDegree;
    const centrality = Math.min(totalDegree / 10, 1.0);  // Normalize to max 10

    // Confidence: Average confidence of statements
    const confidence = stats.averageConfidence;

    // Frequency: How often mentioned
    const frequency = Math.min(stats.statementCount / 20, 1.0);  // Normalize to max 20

    // Weighted combination
    const weight = 0.4 * centrality + 0.3 * confidence + 0.3 * frequency;

    return {
      concept: normalizedConcept,
      weight,
      factors: { centrality, confidence, frequency }
    };
  }

  /**
   * Prioritize gaps by semantic weight
   * Higher priority gaps should be explored first
   * 
   * @param gaps - Array of semantic gaps
   * @returns Sorted array (highest priority first)
   */
  public prioritizeGaps(gaps: SemanticGap[]): SemanticGap[] {
    return [...gaps].sort((a, b) => {
      // Sort by severity first, then statement count
      if (Math.abs(a.severity - b.severity) > 0.1) {
        return b.severity - a.severity;
      }
      return b.metrics.statementCount - a.metrics.statementCount;
    });
  }

  // ===========================================================================
  // Private Helper Methods
  // ===========================================================================

  /**
   * Build statistics for all concepts in KB
   */
  private buildConceptStatistics(knowledgeBase: AST.LogicalNode[]): Map<string, SemanticGap['metrics']> {
    const stats = new Map<string, SemanticGap['metrics']>();

    for (const node of knowledgeBase) {
      if (AST.isIntent(node)) {
        // Get confidence from Intent level
        const confidence = node.confidence || 1.0;
        
        for (const stmt of node.statements) {
          // Subject stats
          this.updateConceptStats(stats, stmt.subject.name, confidence, 'subject');
          
          // Object stats
          this.updateConceptStats(stats, stmt.object.name, confidence, 'object');
        }
      }
    }

    return stats;
  }

  /**
   * Update statistics for a concept
   */
  private updateConceptStats(
    stats: Map<string, SemanticGap['metrics']>,
    concept: string,
    confidence: number,
    role: 'subject' | 'object'
  ): void {
    // Normalize: strip angle brackets
    const normalizedConcept = concept.replace(/^<|>$/g, '');
    
    if (!stats.has(normalizedConcept)) {
      stats.set(normalizedConcept, {
        statementCount: 0,
        averageConfidence: 0,
        inDegree: 0,
        outDegree: 0
      });
    }

    const conceptStats = stats.get(normalizedConcept)!;
    conceptStats.statementCount++;
    
    // Update average confidence
    conceptStats.averageConfidence = 
      (conceptStats.averageConfidence * (conceptStats.statementCount - 1) + confidence) /
      conceptStats.statementCount;

    // Update degree
    if (role === 'subject') {
      conceptStats.outDegree++;
    } else {
      conceptStats.inDegree++;
    }
  }

  /**
   * Get concepts related to target concept
   */
  private getRelatedConcepts(concept: string, knowledgeBase: AST.LogicalNode[]): string[] {
    const related = new Set<string>();
    // Normalize: add angle brackets for comparison
    const bracketedConcept = `<${concept}>`;

    for (const node of knowledgeBase) {
      if (AST.isIntent(node)) {
        for (const stmt of node.statements) {
          if (stmt.subject.name === bracketedConcept || stmt.subject.name === concept) {
            const objName = stmt.object.name.replace(/^<|>$/g, '');
            related.add(objName);
          } else if (stmt.object.name === bracketedConcept || stmt.object.name === concept) {
            const subjName = stmt.subject.name.replace(/^<|>$/g, '');
            related.add(subjName);
          }
        }
      }
    }

    return Array.from(related);
  }

  /**
   * Get all defined concepts (appear as subject)
   */
  private getDefinedConcepts(knowledgeBase: AST.LogicalNode[]): Set<string> {
    const defined = new Set<string>();

    for (const node of knowledgeBase) {
      if (AST.isIntent(node)) {
        for (const stmt of node.statements) {
          // Normalize: strip angle brackets
          const subjName = stmt.subject.name.replace(/^<|>$/g, '');
          defined.add(subjName);
        }
      }
    }

    return defined;
  }

  /**
   * Get all mentioned concepts (subject or object)
   */
  private getMentionedConcepts(knowledgeBase: AST.LogicalNode[]): Set<string> {
    const mentioned = new Set<string>();

    for (const node of knowledgeBase) {
      if (AST.isIntent(node)) {
        for (const stmt of node.statements) {
          // Normalize: strip angle brackets
          const subjName = stmt.subject.name.replace(/^<|>$/g, '');
          const objName = stmt.object.name.replace(/^<|>$/g, '');
          mentioned.add(subjName);
          mentioned.add(objName);
        }
      }
    }

    return mentioned;
  }

  /**
   * Generate connectivity-focused queries
   */
  private generateConnectivityQueries(gap: SemanticGap, _kb: AST.LogicalNode[]): SemanticQuery[] {
    return [
      {
        aiqlCode: `!Query { <${gap.concept}> [?relation] <?Object> }`,
        targetConcept: gap.concept,
        queryType: 'relation',
        expectedCoherence: 0.8,
        priority: gap.severity
      }
    ];
  }

  /**
   * Generate confidence-focused queries
   */
  private generateConfidenceQueries(gap: SemanticGap, _kb: AST.LogicalNode[]): SemanticQuery[] {
    return [
      {
        aiqlCode: `!Query { <${gap.concept}> [has_property] <?Property> }`,
        targetConcept: gap.concept,
        queryType: 'property',
        expectedCoherence: 0.7,
        priority: gap.severity
      }
    ];
  }

  /**
   * Generate definition-focused queries
   */
  private generateDefinitionQueries(gap: SemanticGap, _kb: AST.LogicalNode[]): SemanticQuery[] {
    return [
      {
        aiqlCode: `!Query { <${gap.concept}> [is_a] <?Type> }`,
        targetConcept: gap.concept,
        queryType: 'taxonomic',
        expectedCoherence: 0.9,
        priority: gap.severity
      },
      {
        aiqlCode: `!Query { <${gap.concept}> [defined_as] <?Definition> }`,
        targetConcept: gap.concept,
        queryType: 'existence',
        expectedCoherence: 0.85,
        priority: gap.severity
      }
    ];
  }

  /**
   * Generate coherence-focused queries
   */
  private generateCoherenceQueries(gap: SemanticGap, _kb: AST.LogicalNode[]): SemanticQuery[] {
    return [
      {
        aiqlCode: `!Query { <${gap.concept}> [validates_with] <?Context> }`,
        targetConcept: gap.concept,
        queryType: 'property',
        expectedCoherence: 0.75,
        priority: gap.severity
      }
    ];
  }

  /**
   * Calculate how coherent a query is with existing graph
   */
  private calculateQueryCoherence(query: SemanticQuery, kb: AST.LogicalNode[]): number {
    // Check if target concept exists in KB
    const mentioned = this.getMentionedConcepts(kb);
    const exists = mentioned.has(query.targetConcept);

    // Check if query type matches existing patterns
    const hasRelatedQueries = this.hasRelatedQueries(query, kb);

    return exists ? (hasRelatedQueries ? 0.9 : 0.7) : 0.5;
  }

  /**
   * Check if KB has related query patterns
   */
  private hasRelatedQueries(_query: SemanticQuery, kb: AST.LogicalNode[]): boolean {
    // Simplified: check if query type matches existing intent types
    for (const node of kb) {
      if (AST.isIntent(node) && node.intentType === '!Query') {
        return true;
      }
    }
    return false;
  }
}
