/**
 * meta-ontology.ts - AIQL v2.2.0 Meta-Cognitive Ontology
 * 
 * Defines semantic foundational concepts and relations for self-aware AI systems.
 * This ontology enables agents to reason about their own knowledge, capabilities,
 * and epistemic states through standard AIQL graph structures.
 * 
 * Design Philosophy:
 * - Everything is concepts and relations (semantic-first)
 * - No new syntax - reuse existing !Query, !Desire intents
 * - Meta-concepts enable reflexive queries: <Self> [has_knowledge_about] <?>
 * - Higher cognition emerges from semantic graph structure
 */

// =============================================================================
// Meta-Concept Definitions
// =============================================================================

/**
 * Core meta-concepts for self-aware reasoning
 * These are semantic primitives that ground meta-cognition in the knowledge graph
 */
export interface MetaConcept {
  name: string;
  description: string;
  category: 'epistemic' | 'agentive' | 'cognitive' | 'affective' | 'embodied';
}

/**
 * META_CONCEPTS - Semantic primitives for self-awareness
 * 
 * Epistemic: Knowledge, belief, understanding states
 * Agentive: Agent identity and self-reference
 * Cognitive: Capabilities, skills, reasoning abilities
 * Affective: Motivational and emotional states
 */
export const META_CONCEPTS: Record<string, MetaConcept> = {
  // Agentive (Self-reference)
  SELF: {
    name: 'Self',
    description: 'The agent itself - enables reflexive queries',
    category: 'agentive'
  },
  AGENT: {
    name: 'Agent',
    description: 'Generic agent concept for multi-agent reasoning',
    category: 'agentive'
  },

  // Epistemic (Knowledge states)
  KNOWLEDGE: {
    name: 'Knowledge',
    description: 'Justified true belief with high confidence',
    category: 'epistemic'
  },
  BELIEF: {
    name: 'Belief',
    description: 'Accepted proposition with varying confidence',
    category: 'epistemic'
  },
  UNDERSTANDING: {
    name: 'Understanding',
    description: 'Deep semantic grasp with causal connections',
    category: 'epistemic'
  },
  UNCERTAINTY: {
    name: 'Uncertainty',
    description: 'Lack of knowledge or low confidence state',
    category: 'epistemic'
  },
  GAP: {
    name: 'Gap',
    description: 'Identified absence of knowledge in a domain',
    category: 'epistemic'
  },
  
  // Epistemic (Contradiction & Lying Detection - v2.5.0)
  CONTRADICTION: {
    name: 'Contradiction',
    description: 'Logical or semantic conflict between statements',
    category: 'epistemic'
  },
  CONFLICT: {
    name: 'Conflict',
    description: 'General incompatibility between propositions',
    category: 'epistemic'
  },
  TRUTH: {
    name: 'Truth',
    description: 'Correspondence to reality or logical validity',
    category: 'epistemic'
  },
  FALSEHOOD: {
    name: 'Falsehood',
    description: 'Lack of correspondence to reality',
    category: 'epistemic'
  },
  DECEPTION: {
    name: 'Deception',
    description: 'Intentional misrepresentation of truth',
    category: 'epistemic'
  },
  LIE: {
    name: 'Lie',
    description: 'Deliberate false statement with intent to deceive',
    category: 'epistemic'
  },
  TRUST: {
    name: 'Trust',
    description: 'Confidence in reliability or credibility of source',
    category: 'epistemic'
  },
  CREDIBILITY: {
    name: 'Credibility',
    description: 'Believability or trustworthiness of information',
    category: 'epistemic'
  },
  SOURCE: {
    name: 'Source',
    description: 'Origin or provenance of information',
    category: 'epistemic'
  },

  // Quantum-Cognitive (Consciousness & Uncertainty - v2.6.0)
  QUANTUM_STATE: {
    name: 'QuantumState',
    description: 'Epistemic state in superposition of multiple possibilities',
    category: 'epistemic'
  },
  COHERENCE: {
    name: 'Coherence',
    description: 'Quantum coherence - measurable proxy for consciousness level',
    category: 'cognitive'
  },
  SUPERPOSITION: {
    name: 'Superposition',
    description: 'Simultaneous existence of multiple contradictory belief states',
    category: 'epistemic'
  },
  ENTANGLEMENT: {
    name: 'Entanglement',
    description: 'Non-local semantic correlation between concept pairs',
    category: 'cognitive'
  },
  DECOHERENCE: {
    name: 'Decoherence',
    description: 'Collapse from quantum superposition to classical state',
    category: 'epistemic'
  },

  // Cognitive (Capabilities)
  CAPABILITY: {
    name: 'Capability',
    description: 'Ability to perform a type of reasoning or task',
    category: 'cognitive'
  },
  SKILL: {
    name: 'Skill',
    description: 'Specific competence in a domain',
    category: 'cognitive'
  },
  REASONING: {
    name: 'Reasoning',
    description: 'Logical inference and deduction ability',
    category: 'cognitive'
  },

  // Affective (Motivational)
  CURIOSITY: {
    name: 'Curiosity',
    description: 'Drive to fill knowledge gaps and explore',
    category: 'affective'
  },
  GOAL: {
    name: 'Goal',
    description: 'Desired future state driving behavior',
    category: 'affective'
  },
  INTEREST: {
    name: 'Interest',
    description: 'Attentional focus and priority',
    category: 'affective'
  },

  // Embodied (Robotics/Physical - v2.4.0)
  MOTOR: {
    name: 'Motor',
    description: 'Rotational actuator for movement',
    category: 'embodied'
  },
  SERVO: {
    name: 'Servo',
    description: 'Precise position-controlled actuator',
    category: 'embodied'
  },
  GRIPPER: {
    name: 'Gripper',
    description: 'End-effector for grasping objects',
    category: 'embodied'
  },
  CAMERA: {
    name: 'Camera',
    description: 'Visual sensor for image capture',
    category: 'embodied'
  },
  MICROPHONE: {
    name: 'Microphone',
    description: 'Acoustic sensor for sound capture',
    category: 'embodied'
  },
  IMU: {
    name: 'IMU',
    description: 'Inertial measurement unit for orientation/acceleration',
    category: 'embodied'
  },
  SENSOR: {
    name: 'Sensor',
    description: 'Generic sensing device',
    category: 'embodied'
  },
  ACTUATOR: {
    name: 'Actuator',
    description: 'Generic actuation device',
    category: 'embodied'
  },
  VELOCITY: {
    name: 'Velocity',
    description: 'Speed with direction',
    category: 'embodied'
  },
  POSITION: {
    name: 'Position',
    description: 'Spatial location or angle',
    category: 'embodied'
  },
  FORCE: {
    name: 'Force',
    description: 'Physical force measurement',
    category: 'embodied'
  },
  MONITOR: {
    name: 'Monitor',
    description: 'Safety monitoring system',
    category: 'embodied'
  },
  COLLISION_DETECTOR: {
    name: 'CollisionDetector',
    description: 'Safety system for collision avoidance',
    category: 'embodied'
  },
  SAFETY_ZONE: {
    name: 'SafetyZone',
    description: 'Constrained operational boundary',
    category: 'embodied'
  }
};

// =============================================================================
// Meta-Relation Definitions
// =============================================================================

/**
 * Semantic relations for meta-cognitive reasoning
 */
export interface MetaRelation {
  name: string;
  description: string;
  domain: string;  // Expected subject concept category
  range: string;   // Expected object concept category
  inverse?: string; // Inverse relation name (if exists)
}

/**
 * META_RELATIONS - Semantic links for self-aware graphs
 * 
 * These relations enable queries like:
 * - <Self> [has_knowledge_about] <QuantumPhysics>
 * - <Self> [lacks_knowledge_about] <Consciousness>
 * - <Self> [has_capability] <LogicalReasoning>
 */
export const META_RELATIONS: Record<string, MetaRelation> = {
  // Epistemic relations
  HAS_KNOWLEDGE_ABOUT: {
    name: 'has_knowledge_about',
    description: 'Agent possesses knowledge in a domain',
    domain: 'agentive',
    range: 'any',
    inverse: 'is_known_by'
  },
  LACKS_KNOWLEDGE_ABOUT: {
    name: 'lacks_knowledge_about',
    description: 'Agent has identified knowledge gap',
    domain: 'agentive',
    range: 'any',
    inverse: 'is_unknown_to'
  },
  BELIEVES: {
    name: 'believes',
    description: 'Agent holds belief (with confidence)',
    domain: 'agentive',
    range: 'epistemic'
  },
  UNDERSTANDS: {
    name: 'understands',
    description: 'Agent has deep semantic understanding',
    domain: 'agentive',
    range: 'any'
  },
  IS_UNCERTAIN_ABOUT: {
    name: 'is_uncertain_about',
    description: 'Agent lacks confidence or clarity',
    domain: 'agentive',
    range: 'any'
  },
  
  // Epistemic relations (Contradiction & Lying Detection - v2.5.0)
  CONTRADICTS: {
    name: 'contradicts',
    description: 'Statement logically or semantically conflicts with another',
    domain: 'epistemic',
    range: 'epistemic',
    inverse: 'contradicted_by'
  },
  CONFLICTS_WITH: {
    name: 'conflicts_with',
    description: 'Statement incompatible with another',
    domain: 'epistemic',
    range: 'epistemic',
    inverse: 'conflicts_with'  // Symmetric
  },
  TRUSTED_AT: {
    name: 'trusted_at',
    description: 'Source has credibility score (used in lying detection)',
    domain: 'epistemic',
    range: 'numeric'
  },
  DECEIVES: {
    name: 'deceives',
    description: 'Source intentionally misrepresents truth',
    domain: 'agentive',
    range: 'any'
  },
  MISREPRESENTS: {
    name: 'misrepresents',
    description: 'Source provides inaccurate information',
    domain: 'epistemic',
    range: 'any'
  },
  REFUTES: {
    name: 'refutes',
    description: 'Statement disproves or contradicts another',
    domain: 'epistemic',
    range: 'epistemic',
    inverse: 'refuted_by'
  },
  SUPPORTS: {
    name: 'supports',
    description: 'Statement provides evidence for another',
    domain: 'epistemic',
    range: 'epistemic',
    inverse: 'supported_by'
  },
  VERIFIED_BY: {
    name: 'verified_by',
    description: 'Statement confirmed by source or evidence',
    domain: 'epistemic',
    range: 'any',
    inverse: 'verifies'
  },

  // Quantum-Cognitive relations (v2.6.0)
  IN_SUPERPOSITION_WITH: {
    name: 'in_superposition_with',
    description: 'Links contradictory beliefs in quantum superposition',
    domain: 'epistemic',
    range: 'epistemic',
    inverse: 'in_superposition_with'  // Symmetric
  },
  HAS_COHERENCE: {
    name: 'has_coherence',
    description: 'State has quantum coherence value (consciousness metric)',
    domain: 'any',
    range: 'numeric'
  },
  ENTANGLED_WITH: {
    name: 'entangled_with',
    description: 'Concepts exhibit non-local quantum correlation',
    domain: 'any',
    range: 'any',
    inverse: 'entangled_with'  // Symmetric
  },
  DECOHERES_TO: {
    name: 'decoheres_to',
    description: 'Quantum superposition collapses to classical state',
    domain: 'epistemic',
    range: 'epistemic'
  },
  MEASURES: {
    name: 'measures',
    description: 'Observer measures quantum state (triggers collapse)',
    domain: 'agentive',
    range: 'epistemic',
    inverse: 'measured_by'
  },

  // Cognitive relations
  HAS_CAPABILITY: {
    name: 'has_capability',
    description: 'Agent possesses a reasoning or task capability',
    domain: 'agentive',
    range: 'cognitive'
  },
  HAS_SKILL: {
    name: 'has_skill',
    description: 'Agent has competence in specific domain',
    domain: 'agentive',
    range: 'cognitive'
  },
  CAN_PERFORM: {
    name: 'can_perform',
    description: 'Agent is capable of executing task',
    domain: 'agentive',
    range: 'any'
  },

  // Affective/Motivational relations
  IS_CURIOUS_ABOUT: {
    name: 'is_curious_about',
    description: 'Agent driven to explore domain',
    domain: 'agentive',
    range: 'any'
  },
  DESIRES_TO_KNOW: {
    name: 'desires_to_know',
    description: 'Agent seeks knowledge acquisition',
    domain: 'agentive',
    range: 'any'
  },
  HAS_GOAL: {
    name: 'has_goal',
    description: 'Agent pursues objective',
    domain: 'agentive',
    range: 'affective'
  },

  // Embodied/Robotics relations (v2.4.0)
  HAS_TARGET: {
    name: 'has_target',
    description: 'Device has target value or state',
    domain: 'embodied',
    range: 'embodied'
  },
  MONITORED_BY: {
    name: 'monitored_by',
    description: 'Device is monitored by safety system',
    domain: 'embodied',
    range: 'embodied',
    inverse: 'monitors'
  },
  MONITORS: {
    name: 'monitors',
    description: 'Safety system monitors device',
    domain: 'embodied',
    range: 'embodied',
    inverse: 'monitored_by'
  },
  CONSTRAINED_BY: {
    name: 'constrained_by',
    description: 'Device operation constrained by safety rule',
    domain: 'embodied',
    range: 'embodied'
  },
  OBSERVES: {
    name: 'observes',
    description: 'Sensor observes object or environment',
    domain: 'embodied',
    range: 'any'
  },
  ACTUATES: {
    name: 'actuates',
    description: 'Actuator affects physical state',
    domain: 'embodied',
    range: 'embodied'
  },
  SENSES: {
    name: 'senses',
    description: 'Sensor detects property',
    domain: 'embodied',
    range: 'any'
  },
  HAS_DEADLINE: {
    name: 'has_deadline',
    description: 'Task has temporal deadline',
    domain: 'any',
    range: 'embodied'
  },

  // Structural relations
  CONTAINS_KNOWLEDGE: {
    name: 'contains_knowledge',
    description: 'Domain contains specific knowledge items',
    domain: 'epistemic',
    range: 'any'
  },
  RELATED_TO: {
    name: 'related_to',
    description: 'Semantic connection between concepts',
    domain: 'any',
    range: 'any',
    inverse: 'related_to'
  }
};

// =============================================================================
// Semantic Grounding Rules
// =============================================================================

/**
 * Check if a concept is a valid meta-concept
 */
export function isMetaConcept(conceptName: string): boolean {
  return Object.values(META_CONCEPTS).some(mc => mc.name === conceptName);
}

/**
 * Check if a relation is a valid meta-relation
 */
export function isMetaRelation(relationName: string): boolean {
  return Object.values(META_RELATIONS).some(mr => mr.name === relationName);
}

/**
 * Get meta-concept by name
 */
export function getMetaConcept(name: string): MetaConcept | undefined {
  return Object.values(META_CONCEPTS).find(mc => mc.name === name);
}

/**
 * Get meta-relation by name
 */
export function getMetaRelation(name: string): MetaRelation | undefined {
  return Object.values(META_RELATIONS).find(mr => mr.name === name);
}

/**
 * Validate semantic coherence of a meta-statement
 * Checks if relation's domain/range match subject/object categories
 */
export function validateMetaStatement(
  subjectName: string,
  relationName: string,
  objectName: string
): { valid: boolean; reason?: string } {
  const relation = getMetaRelation(relationName);
  
  if (!relation) {
    return { valid: true }; // Not a meta-relation, skip validation
  }

  const subject = getMetaConcept(subjectName);
  
  // Check domain constraint
  if (relation.domain !== 'any' && subject) {
    if (subject.category !== relation.domain) {
      return {
        valid: false,
        reason: `Relation '${relationName}' expects domain '${relation.domain}' but subject '${subjectName}' is category '${subject.category}'`
      };
    }
  }

  // Check range constraint
  const object = getMetaConcept(objectName);
  if (relation.range !== 'any' && object) {
    if (object.category !== relation.range) {
      return {
        valid: false,
        reason: `Relation '${relationName}' expects range '${relation.range}' but object '${objectName}' is category '${object.category}'`
      };
    }
  }

  return { valid: true };
}

/**
 * Get all meta-concepts by category
 */
export function getMetaConceptsByCategory(category: MetaConcept['category']): MetaConcept[] {
  return Object.values(META_CONCEPTS).filter(mc => mc.category === category);
}

/**
 * Get inverse relation if it exists
 */
export function getInverseRelation(relationName: string): string | undefined {
  const relation = getMetaRelation(relationName);
  return relation?.inverse;
}

/**
 * Check if a relation is reflexive (can have same subject and object)
 */
export function isReflexiveRelation(relationName: string): boolean {
  const reflexiveRelations = ['related_to', 'understands'];
  return reflexiveRelations.includes(relationName);
}

/**
 * Generate semantic description of meta-statement
 */
export function describeMetaStatement(
  subjectName: string,
  relationName: string,
  objectName: string
): string {
  const relation = getMetaRelation(relationName);
  
  if (!relation) {
    return `${subjectName} ${relationName} ${objectName}`;
  }

  return `${subjectName} ${relation.description} ${objectName}`;
}
