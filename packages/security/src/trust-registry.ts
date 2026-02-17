/**
 * Trust Registry for AIQL v2.5.0
 * Manages source credibility scoring and weighted confidence calculation
 * 
 * Features:
 * - Source trust scoring (0.0 - 1.0)
 * - Domain-specific expertise tracking
 * - Weighted confidence calculation (confidence × trust_score)
 * - Learning trust scores from knowledge base
 * - Lying detection via trust delta analysis
 */

import * as AST from '@aiql-org/core';

// Trust score for a source
export interface TrustScore {
  origin: string;           // Source identifier (DOI, URL, etc.)
  score: number;            // Trust score (0.0 - 1.0)
  domain?: string;          // Optional domain expertise (e.g., "physics", "biology")
  confidence?: number;      // Confidence in the trust score itself
  updated: Date;            // Last update timestamp
  rationale?: string;       // Why this trust score (optional)
}

// Result of weighted confidence calculation
export interface WeightedConfidence {
  originalConfidence: number;
  trustScore: number;
  weightedConfidence: number;  // originalConfidence × trustScore
  source: string;
}

// Default trust scores for common source types
const DEFAULT_TRUST_SCORES: Record<string, number> = {
  // High trust: Peer-reviewed scientific sources
  'doi': 0.95,
  'arxiv': 0.85,
  'pubmed': 0.90,
  
  // Medium-high trust: Reputable institutions
  'wikipedia': 0.70,
  'edu': 0.75,
  'gov': 0.80,
  
  // Medium trust: General web sources
  'url': 0.50,
  'http': 0.50,
  'https': 0.50,
  
  // Low trust: User-generated content
  'blog': 0.30,
  'forum': 0.25,
  'social': 0.20,
  
  // Unknown sources default to 0.5
  'unknown': 0.50
};

/**
 * TrustRegistry: Manages source credibility and trust-based reasoning
 */
export class TrustRegistry {
  // Source trust scores: origin -> TrustScore
  private registry: Map<string, TrustScore> = new Map();
  
  // Default trust score for unknown sources
  private defaultTrustScore: number = 0.50;
  
  constructor(defaultTrust: number = 0.50) {
    this.defaultTrustScore = defaultTrust;
  }
  
  /**
   * Get trust score for a source
   */
  public getTrustScore(origin: string | undefined): number {
    if (!origin) {
      return this.defaultTrustScore;
    }
    
    // Check exact match first
    const exactMatch = this.registry.get(origin);
    if (exactMatch) {
      return exactMatch.score;
    }
    
    // Check prefix matches (e.g., "doi:" prefix)
    for (const [prefix, defaultScore] of Object.entries(DEFAULT_TRUST_SCORES)) {
      if (origin.startsWith(prefix)) {
        return defaultScore;
      }
    }
    
    return this.defaultTrustScore;
  }
  
  /**
   * Set trust score for a source
   */
  public setTrustScore(
    origin: string, 
    score: number, 
    domain?: string,
    rationale?: string
  ): void {
    if (score < 0.0 || score > 1.0) {
      throw new Error(`Trust score must be between 0.0 and 1.0, got ${score}`);
    }
    
    this.registry.set(origin, {
      origin,
      score,
      domain,
      updated: new Date(),
      rationale
    });
  }
  
  /**
   * Compute weighted confidence: statement confidence × source trust
   */
  public computeWeightedConfidence(
    confidence: number | undefined,
    origin: string | undefined
  ): WeightedConfidence {
    const originalConfidence = confidence ?? 1.0;
    const trustScore = this.getTrustScore(origin);
    const weightedConfidence = originalConfidence * trustScore;
    
    return {
      originalConfidence,
      trustScore,
      weightedConfidence,
      source: origin || 'unknown'
    };
  }
  
  /**
   * Load trust scores from knowledge base statements
   * Looks for patterns like: <Source> [trusted_at] <Level> { value: 0.95 }
   */
  public loadFromKnowledgeBase(statements: AST.Statement[]): number {
    let loadedCount = 0;
    
    for (const stmt of statements) {
      // Strip brackets from relation name
      const relation = stmt.relation.name.replace(/^\[/, '').replace(/\]$/, '');
      
      if (relation === 'trusted_at') {
        // Extract source from subject using type guard
        let source = '';
        if (AST.isConcept(stmt.subject)) {
            source = stmt.subject.name.replace(/^</, '').replace(/>$/, '');
        } else {
            // If subject is not a concept, we cannot extract a source name in the expected format
            continue; 
        }
        
        // Extract trust score from attributes
        if (stmt.attributes && 'value' in stmt.attributes) {
          const value = stmt.attributes.value;
          const score = typeof value === 'number' ? value : parseFloat(String(value));
          
          if (!isNaN(score) && score >= 0.0 && score <= 1.0) {
            // Extract domain if present
            const domain = stmt.attributes.domain as string | undefined;
            const rationale = stmt.attributes.reason as string | undefined;
            
            this.setTrustScore(source, score, domain, rationale);
            loadedCount++;
          }
        }
      }
    }
    
    return loadedCount;
  }
  
  /**
   * Get all registered trust scores
   */
  public getAllTrustScores(): TrustScore[] {
    return Array.from(this.registry.values());
  }
  
  /**
   * Check if a source is registered
   */
  public hasSource(origin: string): boolean {
    return this.registry.has(origin);
  }
  
  /**
   * Calculate trust delta between two sources
   * Returns positive number if source1 is more trusted, negative if source2 is more trusted
   */
  public calculateTrustDelta(origin1: string | undefined, origin2: string | undefined): number {
    const trust1 = this.getTrustScore(origin1);
    const trust2 = this.getTrustScore(origin2);
    return trust1 - trust2;
  }
  
  /**
   * Determine if a statement is potentially a lie based on trust/confidence deltas
   * 
   * Logic: If a low-trust source contradicts a high-trust source,
   * and the weighted confidence difference exceeds threshold, flag as potential lie
   */
  public isPotentialLie(
    highTrustStatement: {
      confidence?: number;
      origin?: string;
    },
    lowTrustStatement: {
      confidence?: number;
      origin?: string;
    },
    threshold: number = 0.3
  ): {
    isPotentialLie: boolean;
    trustDelta: number;
    weightedConfidenceDelta: number;
    reason?: string;
  } {
    const highWeighted = this.computeWeightedConfidence(
      highTrustStatement.confidence,
      highTrustStatement.origin
    );
    
    const lowWeighted = this.computeWeightedConfidence(
      lowTrustStatement.confidence,
      lowTrustStatement.origin
    );
    
    const trustDelta = highWeighted.trustScore - lowWeighted.trustScore;
    const weightedConfidenceDelta = highWeighted.weightedConfidence - lowWeighted.weightedConfidence;
    
    // Potential lie if:
    // 1. High-trust source has higher weighted confidence
    // 2. The difference exceeds threshold
    const isPotentialLie = weightedConfidenceDelta > threshold;
    
    let reason: string | undefined;
    if (isPotentialLie) {
      reason = `Low-trust source (${lowWeighted.source}, trust=${lowWeighted.trustScore.toFixed(2)}) ` +
               `contradicts high-trust source (${highWeighted.source}, trust=${highWeighted.trustScore.toFixed(2)}). ` +
               `Weighted confidence delta: ${weightedConfidenceDelta.toFixed(3)} > threshold ${threshold}`;
    }
    
    return {
      isPotentialLie,
      trustDelta,
      weightedConfidenceDelta,
      reason
    };
  }
  
  /**
   * Get trust statistics (for debugging/monitoring)
   */
  public getStatistics(): {
    registeredSources: number;
    averageTrust: number;
    highTrustCount: number;   // > 0.75
    mediumTrustCount: number; // 0.40 - 0.75
    lowTrustCount: number;    // < 0.40
  } {
    const scores = Array.from(this.registry.values());
    const count = scores.length;
    
    if (count === 0) {
      return {
        registeredSources: 0,
        averageTrust: this.defaultTrustScore,
        highTrustCount: 0,
        mediumTrustCount: 0,
        lowTrustCount: 0
      };
    }
    
    const sum = scores.reduce((acc, ts) => acc + ts.score, 0);
    const average = sum / count;
    
    const highTrustCount = scores.filter(ts => ts.score > 0.75).length;
    const lowTrustCount = scores.filter(ts => ts.score < 0.40).length;
    const mediumTrustCount = count - highTrustCount - lowTrustCount;
    
    return {
      registeredSources: count,
      averageTrust: average,
      highTrustCount,
      mediumTrustCount,
      lowTrustCount
    };
  }
  
  /**
   * Clear all registered trust scores
   */
  public clear(): void {
    this.registry.clear();
  }
  
  /**
   * Export trust registry to JSON
   */
  public toJSON(): Record<string, unknown> {
    const entries: Array<Record<string, unknown>> = [];
    for (const ts of this.registry.values()) {
      entries.push({
        origin: ts.origin,
        score: ts.score,
        domain: ts.domain,
        rationale: ts.rationale,
        updated: ts.updated.toISOString()
      });
    }
    
    return {
      defaultTrustScore: this.defaultTrustScore,
      sources: entries
    };
  }
  
  /**
   * Import trust registry from JSON
   */
  public static fromJSON(data: Record<string, unknown>): TrustRegistry {
    const registry = new TrustRegistry((data.defaultTrustScore as number) || 0.50);
    
    if (data.sources && Array.isArray(data.sources)) {
      for (const entry of data.sources as Array<Record<string, unknown>>) {
        registry.setTrustScore(
          entry.origin as string,
          entry.score as number,
          entry.domain as string | undefined,
          entry.rationale as string | undefined
        );
      }
    }
    
    return registry;
  }
}
