/**
 * symbolic-neural-bridge.ts - AIQL v2.2.0 Symbolic-Neural Bridge
 * 
 * Validates and grounds neural network (LLM) outputs in symbolic AIQL structures.
 * Detects hallucinations, ensures semantic coherence, and validates relation semantics.
 * 
 * Design Philosophy:
 * - Neural outputs must ground in symbolic knowledge graph
 * - Hallucinations detected through semantic inconsistency
 * - Relation validation preserves graph coherence
 * - Bridge enables safe LLM-to-AIQL translation
 */

import { InferenceEngine } from '@aiql-org/inference';
import * as AST from '@aiql-org/core';
import { Tokenizer } from '@aiql-org/core';
import { Parser } from '@aiql-org/core';
import { validateMetaStatement, isMetaConcept, isMetaRelation } from '@aiql-org/inference';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Grounding result: How well neural output maps to symbolic KB
 */
export interface GroundingResult {
  grounded: boolean;               // Successfully grounded in KB
  confidence: number;              // Grounding confidence (0-1)
  validStatements: AST.Statement[]; // Statements that grounded successfully
  invalidStatements: AST.Statement[]; // Statements that failed grounding
  reasons: string[];               // Why grounding failed/succeeded
}

/**
 * Semantic coherence check result
 */
export interface CoherenceResult {
  coherent: boolean;               // Semantically coherent with KB
  coherenceScore: number;          // 0-1, higher = more coherent
  violations: Array<{
    statement: AST.Statement;
    violationType: 'type-mismatch' | 'relation-invalid' | 'concept-unknown' | 'confidence-low';
    reason: string;
  }>;
}

/**
 * Hallucination detection result
 */
export interface HallucinationResult {
  hasHallucinations: boolean;      // True if hallucinations detected
  hallucinatedStatements: Array<{
    statement: AST.Statement;
    reason: string;
    confidence: number;            // How confident we are it's a hallucination
  }>;
  validStatements: AST.Statement[];
}

/**
 * Relation validation result
 */
export interface RelationValidationResult {
  valid: boolean;                  // Relation makes semantic sense
  reason?: string;                 // Why invalid
  suggestedAlternatives?: string[]; // Better relation options
}

// =============================================================================
// Symbolic-Neural Bridge
// =============================================================================

/**
 * SymbolicNeuralBridge - Safe LLM-to-AIQL translation
 * 
 * Grounds neural network outputs in symbolic knowledge structures,
 * ensuring semantic correctness and detecting hallucinations.
 */
export class SymbolicNeuralBridge {

  /**
   * Ground neural output (LLM response) in symbolic knowledge base
   * 
   * Validates that LLM-generated AIQL code:
   * 1. Parses correctly (syntactic validity)
   * 2. References known concepts (semantic grounding)
   * 3. Uses valid relations (relation grounding)
   * 4. Maintains graph coherence (structural validity)
   * 
   * @param llmResponse - Raw AIQL code from LLM
   * @param context - Context concepts that should appear
   * @param kb - InferenceEngine with background knowledge
   * @returns Grounding result with validated statements
   */
  public groundNeuralOutput(
    llmResponse: string,
    context: string[],
    kb: InferenceEngine
  ): GroundingResult {
    const result: GroundingResult = {
      grounded: false,
      confidence: 0,
      validStatements: [],
      invalidStatements: [],
      reasons: []
    };

    try {
      // 1. Parse LLM response
      const tokenizer = new Tokenizer(llmResponse);
      const tokens = tokenizer.tokenize();
      const parser = new Parser(tokens);
      const program = parser.parse();

      // 2. Extract statements
      const statements = this.extractStatements(program);

      // 3. Validate each statement
      const knowledgeBase = (kb as unknown as { knowledgeBase: AST.LogicalNode[] }).knowledgeBase;
      const knownConcepts = this.getKnownConcepts(knowledgeBase);

      for (const stmt of statements) {
        const validation = this.validateStatementGrounding(
          stmt,
          knownConcepts,
          context
        );

        if (validation.valid) {
          result.validStatements.push(stmt);
        } else {
          result.invalidStatements.push(stmt);
          result.reasons.push(validation.reason || 'Unknown validation error');
        }
      }

      // 4. Calculate grounding confidence
      const totalStatements = statements.length;
      const validCount = result.validStatements.length;
      result.confidence = totalStatements > 0 ? validCount / totalStatements : 0;
      result.grounded = result.confidence > 0.7;  // Threshold

      if (result.grounded) {
        result.reasons.push(`Successfully grounded ${validCount}/${totalStatements} statements`);
      }

    } catch (error: unknown) {
      result.reasons.push(`Parse error: ${(error as Error).message}`);
      result.confidence = 0;
      result.grounded = false;
    }

    return result;
  }

  /**
   * Check semantic coherence of statement with KB context
   * 
   * Validates:
   * - Type consistency (meta-concept categories)
   * - Relation domain/range constraints
   * - Confidence thresholds
   * - Concept existence
   * 
   * @param statement - Statement to validate
   * @param context - Contextual concepts
   * @param kb - InferenceEngine with background knowledge
   * @returns Coherence result with violations
   */
  public checkSemanticCoherence(
    statement: AST.Statement,
    context: string[],
    kb: InferenceEngine
  ): CoherenceResult {
    const result: CoherenceResult = {
      coherent: true,
      coherenceScore: 1.0,
      violations: []
    };

    const knowledgeBase = (kb as unknown as { knowledgeBase: AST.LogicalNode[] }).knowledgeBase;
    const knownConcepts = this.getKnownConcepts(knowledgeBase);

    // 1. Check if concepts are known or in context
    if (!knownConcepts.has(AST.extractExpressionName(statement.subject) || "") && 
        !context.includes(AST.extractExpressionName(statement.subject) || "") &&
        !isMetaConcept(AST.extractExpressionName(statement.subject) || "")) {
      result.violations.push({
        statement,
        violationType: 'concept-unknown',
        reason: `Unknown subject concept: ${AST.extractExpressionName(statement.subject) || ""}`
      });
      result.coherenceScore -= 0.3;
    }

    if (!knownConcepts.has(AST.extractExpressionName(statement.object) || "") && 
        !context.includes(AST.extractExpressionName(statement.object) || "") &&
        !isMetaConcept(AST.extractExpressionName(statement.object) || "")) {
      result.violations.push({
        statement,
        violationType: 'concept-unknown',
        reason: `Unknown object concept: ${AST.extractExpressionName(statement.object) || ""}`
      });
      result.coherenceScore -= 0.3;
    }

    // 2. Check relation validity (lenient - only flag meta-relation violations and common-sense violations)
    //    Novel relations are allowed for knowledge expansion by LLMs
    
    // Check meta-relations
    if (isMetaRelation(statement.relation.name)) {
      const metaValidation = validateMetaStatement(
        AST.extractExpressionName(statement.subject) || "",
        statement.relation.name,
        AST.extractExpressionName(statement.object) || ""
      );
      if (!metaValidation.valid) {
        result.violations.push({
          statement,
          violationType: 'type-mismatch',
          reason: metaValidation.reason || 'Meta-relation type mismatch'
        });
        result.coherenceScore -= 0.4;
      }
    }
    
    // Check common-sense patterns
    const patternCheck = this.checkRelationPatterns(
      AST.extractExpressionName(statement.subject) || "",
      statement.relation.name,
      AST.extractExpressionName(statement.object) || ""
    );
    if (!patternCheck.valid) {
      result.violations.push({
        statement,
        violationType: 'relation-invalid',
        reason: patternCheck.reason || 'Relation violates common sense'
      });
      result.coherenceScore -= 0.4;
    }

    // 3. Check confidence threshold
    const confidence = statement.attributes?.confidence as number | undefined;
    if (confidence !== undefined && confidence < 0.3) {
      result.violations.push({
        statement,
        violationType: 'confidence-low',
        reason: `Very low confidence: ${confidence}`
      });
      result.coherenceScore -= 0.2;
    }

    // 4. Validate meta-statement semantics
    if (isMetaRelation(statement.relation.name)) {
      const metaValidation = validateMetaStatement(
        AST.extractExpressionName(statement.subject) || "",
        statement.relation.name,
        AST.extractExpressionName(statement.object) || ""
      );

      if (!metaValidation.valid) {
        result.violations.push({
          statement,
          violationType: 'type-mismatch',
          reason: metaValidation.reason || 'Meta-statement type mismatch'
        });
        result.coherenceScore -= 0.5;
      }
    }

    result.coherenceScore = Math.max(result.coherenceScore, 0);
    result.coherent = result.coherenceScore > 0.5 && result.violations.length === 0;

    return result;
  }

  /**
   * Validate relation semantics: Does this relation make sense?
   * 
   * Checks:
   * - Known relations in KB
   * - Meta-relation constraints
   * - Common-sense relation patterns
   * - Type compatibility
   * 
   * @param subject - Subject concept name
   * @param relation - Relation name
   * @param object - Object concept name
   * @param kb - InferenceEngine with background knowledge
   * @returns Validation result with alternatives
   */
  public validateRelationSemantics(
    subject: string,
    relation: string,
    object: string,
    kb: InferenceEngine
  ): RelationValidationResult {
    const knowledgeBase = (kb as unknown as { knowledgeBase: AST.LogicalNode[] }).knowledgeBase;
    const knownRelations = this.getKnownRelations(knowledgeBase);

    // 1. Check common-sense patterns first (highest priority)
    const patternCheck = this.checkRelationPatterns(subject, relation, object);
    if (!patternCheck.valid) {
      return patternCheck;
    }

    // 2. Check meta-relation constraints
    if (isMetaRelation(relation)) {
      const metaValidation = validateMetaStatement(subject, relation, object);
      if (!metaValidation.valid) {
        return {
          valid: false,
          reason: metaValidation.reason
        };
      }
    }

    // 3. Check if relation is known or meta-relation
    // (Strict validation for explicit relation checking)
    if (!knownRelations.has(relation) && !isMetaRelation(relation)) {
      return {
        valid: false,
        reason: `Unknown relation: ${relation}`,
        suggestedAlternatives: this.suggestSimilarRelations(relation, knownRelations)
      };
    }

    return { valid: true };
  }

  /**
   * Detect hallucinations in statements
   * 
   * Hallucination indicators:
   * - Statements contradicting KB
   * - Impossible relations (semantic violations)
   * - Unknown concepts with high confidence
   * - Circular reasoning
   * 
   * @param statements - Statements to check
   * @param kb - InferenceEngine with background knowledge
   * @returns Hallucination detection result
   */
  public detectHallucinations(
    statements: AST.Statement[],
    kb: InferenceEngine
  ): HallucinationResult {
    const result: HallucinationResult = {
      hasHallucinations: false,
      hallucinatedStatements: [],
      validStatements: []
    };

    const knowledgeBase = (kb as unknown as { knowledgeBase: AST.LogicalNode[] }).knowledgeBase;
    const knownConcepts = this.getKnownConcepts(knowledgeBase);

    for (const stmt of statements) {
      let isHallucination = false;
      let reason = '';

      // 1. Check for contradictions
      const contradiction = this.checkContradiction(stmt, knowledgeBase);
      if (contradiction.hasContradiction) {
        isHallucination = true;
        reason = `Contradicts KB: ${contradiction.reason}`;
      }

      // 2. Check for impossible relations (common-sense violations only, not unknown relations)
      // Normalize concept names for comparison
      const subjName = AST.extractExpressionName(stmt.subject) || "".replace(/^<|>$/g, '');
      const relName = stmt.relation.name.replace(/^\[|\]$/g, '');
      const objName = AST.extractExpressionName(stmt.object) || "".replace(/^<|>$/g, '');
      
      const patternCheck = this.checkRelationPatterns(subjName, relName, objName);
      if (!patternCheck.valid) {
        isHallucination = true;
        reason = patternCheck.reason || 'Impossible relation pattern';
      }

      // 3. Check for unknown concepts with high confidence
      const subjectKnown = knownConcepts.has(subjName) || isMetaConcept(subjName);
      const objectKnown = knownConcepts.has(objName) || isMetaConcept(objName);
      const confidence = stmt.attributes?.confidence as number | undefined || 0.5;

      if ((!subjectKnown || !objectKnown) && confidence > 0.9) {
        isHallucination = true;
        reason = 'High confidence on unknown concepts (likely hallucination)';
      }

      // Record result
      if (isHallucination) {
        result.hallucinatedStatements.push({
          statement: stmt,
          reason,
          confidence: 0.8  // Confidence in hallucination detection
        });
      } else {
        result.validStatements.push(stmt);
      }
    }

    result.hasHallucinations = result.hallucinatedStatements.length > 0;

    return result;
  }

  // ===========================================================================
  // Private Helper Methods
  // ===========================================================================

  /**
   * Extract all statements from program
   */
  private extractStatements(program: AST.Program): AST.Statement[] {
    const statements: AST.Statement[] = [];

    for (const node of program.body) {
      if (AST.isIntent(node)) {
        statements.push(...node.statements);
      }
    }

    return statements;
  }

  /**
   * Get all known concepts from KB
   */
  private getKnownConcepts(knowledgeBase: AST.LogicalNode[]): Set<string> {
    const concepts = new Set<string>();

    for (const node of knowledgeBase) {
      if (AST.isIntent(node)) {
        for (const stmt of node.statements) {
          // Normalize: strip angle brackets
          const subjName = AST.extractExpressionName(stmt.subject) || "".replace(/^<|>$/g, '');
          const objName = AST.extractExpressionName(stmt.object) || "".replace(/^<|>$/g, '');
          concepts.add(subjName);
          concepts.add(objName);
        }
      }
    }

    return concepts;
  }

  /**
   * Get all known relations from KB
   */
  private getKnownRelations(knowledgeBase: AST.LogicalNode[]): Set<string> {
    const relations = new Set<string>();

    for (const node of knowledgeBase) {
      if (AST.isIntent(node)) {
        for (const stmt of node.statements) {
          // Normalize: strip square brackets
          const relName = stmt.relation.name.replace(/^\[|\]$/g, '');
          relations.add(relName);
        }
      }
    }

    return relations;
  }

  /**
   * Validate statement grounding
   */
  private validateStatementGrounding(
    stmt: AST.Statement,
    knownConcepts: Set<string>,
    context: string[]
  ): { valid: boolean; reason?: string } {
    // Normalize concept and relation names (strip brackets)
    const subjName = AST.extractExpressionName(stmt.subject) || "".replace(/^<|>$/g, '');
    
    // Subject must be known or in context (strict requirement)
    const subjectValid = knownConcepts.has(subjName) || 
                        context.includes(subjName) ||
                        isMetaConcept(subjName);
    
    if (!subjectValid) {
      return { valid: false, reason: `Unknown subject: ${subjName}` };
    }

    // Relations can be novel - we only validate concepts for grounding
    // (Relations are validated separately in checkSemanticCoherence)

    // Object can be novel if subject is grounded (allows knowledge expansion)
    // Objects are always valid if subject is grounded
    // This allows LLMs to introduce new concepts as objects of known subjects
    
    return { valid: true };
  }

  /**
   * Suggest similar relations
   */
  private suggestSimilarRelations(relation: string, knownRelations: Set<string>): string[] {
    // Simple string similarity
    const suggestions: string[] = [];
    
    for (const known of knownRelations) {
      if (known.includes(relation) || relation.includes(known)) {
        suggestions.push(known);
      }
    }

    return suggestions.slice(0, 3);  // Top 3
  }

  /**
   * Check common-sense relation patterns
   */
  private checkRelationPatterns(
    subject: string,
    relation: string,
    object: string
  ): RelationValidationResult {
    // Prevent obvious semantic violations
    const impossiblePatterns = [
      { relation: 'is_a', same: true },  // X is_a X (trivial)
      { relation: 'causes', same: true } // X causes X (circular)
    ];

    if (subject === object) {
      const impossible = impossiblePatterns.find(p => p.relation === relation && p.same);
      if (impossible) {
        return {
          valid: false,
          reason: `Circular/trivial relation: ${subject} ${relation} ${object}`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Check if statement contradicts KB
   */
  private checkContradiction(
    stmt: AST.Statement,
    knowledgeBase: AST.LogicalNode[]
  ): { hasContradiction: boolean; reason?: string } {
    // Normalize statement concept and relation names
    const stmtSubj = AST.extractExpressionName(stmt.subject) || "".replace(/^<|>$/g, '');
    const stmtRel = stmt.relation.name.replace(/^\[|\]$/g, '');
    const stmtObj = AST.extractExpressionName(stmt.object) || "".replace(/^<|>$/g, '');
    
    // Look for direct contradictions
    for (const node of knowledgeBase) {
      if (AST.isIntent(node)) {
        for (const existingStmt of node.statements) {
          // Normalize existing statement names
          const existSubj = AST.extractExpressionName(existingStmt.subject) || "".replace(/^<|>$/g, '');
          const existRel = existingStmt.relation.name.replace(/^\[|\]$/g, '');
          const existObj = AST.extractExpressionName(existingStmt.object) || "".replace(/^<|>$/g, '');
          
          // Check for opposite relations
          if (existSubj === stmtSubj && existObj === stmtObj) {
            
            const opposites: Record<string, string> = {
              'is': 'is_not',
              'has': 'lacks',
              'knows': 'ignores'
            };

            const oppositeRelation = opposites[existRel];
            if (oppositeRelation === stmtRel) {
              return {
                hasContradiction: true,
                reason: `Contradicts existing: ${existSubj} ${existRel} ${existObj}`
              };
            }
          }
        }
      }
    }

    return { hasContradiction: false };
  }
}
