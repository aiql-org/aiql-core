/**
 * quantum-semantics.ts - AIQL v2.6.0 Quantum Consciousness Model
 * 
 * Provides quantum-inspired semantic constructs for consciousness modeling,
 * epistemic uncertainty, and multi-state reasoning. Uses quantum metaphors
 * (superposition, coherence, entanglement) for cognitive processing.
 * 
 * Design Philosophy:
 * - Quantum SEMANTICS not COMPUTATION (no quantum gates/circuits)
 * - Declarative knowledge representation using quantum concepts
 * - Consciousness measured via quantum coherence (IIT approximation)
 * - Observer effect optional (measurement can collapse superpositions)
 * - All quantum states map to Subject-Relation-Object triples
 * 
 * Key Concepts:
 * - Superposition: Multiple contradictory beliefs coexist until measurement
 * - Coherence: Measure of quantum "integrity" - proxy for consciousness level
 * - Entanglement: Non-local correlation between concept pairs
 * - Decoherence: Collapse from quantum to classical state
 * - Measurement: Observer effect that collapses superposition
 */

// =============================================================================
// Core Type Definitions
// =============================================================================

/**
 * QuantumState - Represents a concept in superposition
 * 
 * Each state has:
 * - concept: The semantic concept label (e.g., "Alive", "Dead")
 * - amplitude: Complex amplitude magnitude [0, 1] (probability = |amplitude|²)
 * - phase: Phase angle in radians [0, 2π] (for interference effects)
 * - coherence: Local coherence measure [0, 1]
 */
export interface QuantumState {
  concept: string;
  amplitude: number;   // Magnitude of complex amplitude [0, 1]
  phase: number;       // Phase in radians [0, 2π]
  coherence?: number;  // Optional local coherence [0, 1]
}

/**
 * SuperpositionGroup - Collection of quantum states in superposition
 * 
 * Represents multiple contradictory beliefs existing simultaneously
 * until observation collapses them to a single classical state.
 */
export interface SuperpositionGroup {
  states: QuantumState[];
  totalCoherence: number;        // System-wide coherence [0, 1]
  entropicUncertainty: number;   // Shannon entropy of probability distribution
  isCollapsed: boolean;          // Whether superposition has been measured
  collapsedState?: string;       // Result after measurement (if collapsed)
}

/**
 * EntanglementPair - Two semantically correlated concepts
 * 
 * Represents non-local correlation where measuring one concept
 * instantaneously affects the epistemic state of the other.
 */
export interface EntanglementPair {
  conceptA: string;
  conceptB: string;
  correlation: number;           // Correlation coefficient [-1, 1]
  bellTestScore?: number;        // Bell inequality violation (>2.0 = quantum)
  createdAt: number;             // Timestamp of entanglement creation
}

/**
 * ConsciousnessMetrics - Quantum measures of self-awareness
 * 
 * Based on Integrated Information Theory (IIT) approximation using
 * quantum coherence as a proxy for integrated information (Φ).
 */
export interface ConsciousnessMetrics {
  coherence: number;              // Quantum coherence [0, 1]
  conscious: boolean;             // Above consciousness threshold?
  decoherenceRate: number;        // Rate of coherence decay per cycle
  needsRefresh: boolean;          // Below threshold, needs reflection?
  entanglementEntropy?: number;   // Entanglement measure
  integratedInformation?: number; // IIT Φ approximation
}

// =============================================================================
// Quantum State Creation & Normalization
// =============================================================================

/**
 * Create a superposition from multiple quantum states
 * Normalizes amplitudes so sum of |amplitude|² = 1.0 (probability conservation)
 * 
 * @param states - Array of quantum states to superpose
 * @returns Normalized superposition group with coherence
 * 
 * Example:
 *   const cat = createSuperposition([
 *     { concept: 'Alive', amplitude: 0.6, phase: 0 },
 *     { concept: 'Dead', amplitude: 0.8, phase: Math.PI }
 *   ]);
 *   // After normalization: Alive (amplitude: 0.6), Dead (amplitude: 0.8)
 *   // Probabilities: Alive = 0.36, Dead = 0.64
 */
export function createSuperposition(states: QuantumState[]): SuperpositionGroup {
  if (states.length === 0) {
    throw new Error('Cannot create superposition with zero states');
  }

  // Normalize amplitudes (sum of |amplitude|² = 1.0)
  const sumSquares = states.reduce((sum, state) => sum + state.amplitude ** 2, 0);
  
  if (sumSquares === 0) {
    throw new Error('Cannot normalize zero-amplitude states');
  }

  const normalizationFactor = Math.sqrt(sumSquares);
  const normalizedStates = states.map(state => ({
    ...state,
    amplitude: state.amplitude / normalizationFactor
  }));

  // Calculate entropic uncertainty (Shannon entropy)
  const probabilities = normalizedStates.map(s => s.amplitude ** 2);
  const entropy = calculateShannonEntropy(probabilities);
  const maxEntropy = Math.log2(states.length);
  
  // Calculate total coherence (normalized entropy)
  // High entropy = maximum quantum superposition = HIGH coherence
  // Low entropy = classical certainty = LOW coherence
  const totalCoherence = maxEntropy > 0 ? (entropy / maxEntropy) : 1.0;

  return {
    states: normalizedStates,
    totalCoherence,
    entropicUncertainty: entropy,
    isCollapsed: false
  };
}

/**
 * Calculate Shannon entropy of probability distribution
 * H = -Σ p_i * log2(p_i)
 * 
 * Higher entropy = more uncertainty
 * Lower entropy = more certainty (closer to classical state)
 */
function calculateShannonEntropy(probabilities: number[]): number {
  return -probabilities.reduce((sum, p) => {
    if (p === 0) return sum;
    return sum + p * Math.log2(p);
  }, 0);
}

// =============================================================================
// Quantum Measurement & Collapse
// =============================================================================

/**
 * Measure a quantum state - collapses superposition to single outcome
 * Uses |amplitude|² as probability distribution for measurement outcome
 * 
 * @param group - Superposition group to measure
 * @param rng - Random number generator [0, 1) (default: Math.random)
 * @returns Collapsed concept label
 * 
 * Example:
 *   const result = measureState(schrodingersCat);
 *   // Returns: "Alive" (36% chance) or "Dead" (64% chance)
 * 
 * Side Effect: Sets group.isCollapsed = true, group.collapsedState = result
 */
export function measureState(
  group: SuperpositionGroup, 
  rng: () => number = Math.random
): string {
  if (group.isCollapsed) {
    return group.collapsedState!;
  }

  // Calculate cumulative probability distribution
  const probabilities = group.states.map(s => s.amplitude ** 2);
  const cumulativeProbabilities = probabilities.reduce<number[]>((acc, p) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
    acc.push(prev + p);
    return acc;
  }, []);

  // Sample from distribution
  const sample = rng();
  const selectedIndex = cumulativeProbabilities.findIndex(cp => sample <= cp);
  const result = group.states[selectedIndex >= 0 ? selectedIndex : group.states.length - 1].concept;

  // Collapse superposition
  group.isCollapsed = true;
  group.collapsedState = result;
  group.totalCoherence = 0.0;  // Measurement destroys coherence

  return result;
}

/**
 * Create a classical state (fully collapsed, coherence = 0)
 * Used after measurement or for non-quantum beliefs
 */
export function createClassicalState(concept: string): SuperpositionGroup {
  return {
    states: [{ concept, amplitude: 1.0, phase: 0 }],
    totalCoherence: 0.0,
    entropicUncertainty: 0.0,
    isCollapsed: true,
    collapsedState: concept
  };
}

// =============================================================================
// Coherence Tracking & Consciousness Metrics
// =============================================================================

/**
 * Calculate coherence for a superposition group
 * Coherence = 1 - (entropy / max_entropy)
 * 
 * High coherence (>0.7) = high consciousness (IIT interpretation)
 * Low coherence (<0.5) = decoherent, reduced self-awareness
 */
export function calculateCoherence(group: SuperpositionGroup): number {
  if (group.isCollapsed) {
    return 0.0;
  }

  const maxEntropy = Math.log2(group.states.length);
  if (maxEntropy === 0) {
    return 1.0;
  }

  // High entropy = quantum superposition = HIGH coherence
  // Low entropy = classical certainty = LOW coherence
  return group.entropicUncertainty / maxEntropy;
}

/**
 * Track decoherence over time (exponential decay)
 * coherence(t) = coherence(0) * exp(-rate * t)
 * 
 * @param initialCoherence - Starting coherence value [0, 1]
 * @param timeSteps - Number of inference cycles elapsed
 * @param decoherenceRate - Decay rate per cycle (default: 0.02)
 * @returns Updated coherence after decay
 * 
 * Example:
 *   let coherence = 1.0;
 *   for (let t = 0; t < 100; t++) {
 *     coherence = trackDecoherence(coherence, 1, 0.02);
 *   }
 *   // After 100 cycles: coherence ≈ 0.13 (needs refresh!)
 */
export function trackDecoherence(
  initialCoherence: number,
  timeSteps: number,
  decoherenceRate: number = 0.02
): number {
  // Exponential decay: C(t) = C(0) * exp(-λ * t)
  return initialCoherence * Math.exp(-decoherenceRate * timeSteps);
}

/**
 * Compute consciousness metrics from quantum coherence
 * 
 * @param coherence - Current coherence value [0, 1]
 * @param decoherenceRate - Rate of decay per cycle
 * @param threshold - Consciousness threshold (default: 0.7)
 * @returns ConsciousnessMetrics with awareness indicators
 */
export function computeConsciousnessMetrics(
  coherence: number,
  decoherenceRate: number = 0.02,
  threshold: number = 0.7
): ConsciousnessMetrics {
  return {
    coherence,
    conscious: coherence >= threshold,
    decoherenceRate,
    needsRefresh: coherence < threshold,
    integratedInformation: coherence * 10  // Rough IIT Φ approximation
  };
}

// =============================================================================
// Quantum Entanglement
// =============================================================================

/**
 * Compute correlation between two quantum states (entanglement strength)
 * Uses dot product of probability distributions as correlation measure
 * 
 * @param stateA - First quantum state (can be superposition)
 * @param stateB - Second quantum state
 * @returns Correlation coefficient [-1, 1]
 *          1.0 = perfectly correlated
 *          0.0 = uncorrelated
 *         -1.0 = anti-correlated
 * 
 * Example:
 *   const correlation = computeEntanglementCorrelation(
 *     { concept: 'SpinUp', amplitude: 0.707, phase: 0 },
 *     { concept: 'SpinDown', amplitude: 0.707, phase: Math.PI }
 *   );
 *   // Returns: -1.0 (anti-correlated via phase difference)
 */
export function computeEntanglementCorrelation(
  stateA: QuantumState,
  stateB: QuantumState
): number {
  // Simplified correlation via phase difference
  const phaseDiff = Math.abs(stateA.phase - stateB.phase);
  const normalizedPhaseDiff = (phaseDiff % (2 * Math.PI)) / Math.PI;
  
  // cos(phase_diff) as correlation:
  // phase_diff = 0 → correlation = 1.0 (aligned)
  // phase_diff = π → correlation = -1.0 (anti-aligned)
  return Math.cos(normalizedPhaseDiff * Math.PI);
}

/**
 * Create entanglement between two concepts
 * 
 * @param conceptA - First concept to entangle
 * @param conceptB - Second concept to entangle
 * @param correlation - Desired correlation strength [-1, 1]
 * @returns EntanglementPair with correlation metadata
 */
export function createEntanglement(
  conceptA: string,
  conceptB: string,
  correlation: number
): EntanglementPair {
  if (correlation < -1 || correlation > 1) {
    throw new Error('Correlation must be in range [-1, 1]');
  }

  return {
    conceptA,
    conceptB,
    correlation,
    createdAt: Date.now()
  };
}

/**
 * Test Bell inequality violation (proves quantum correlation)
 * 
 * Bell's theorem: Classical correlation ≤ 2.0
 *                 Quantum correlation can reach 2√2 ≈ 2.828
 * 
 * @param correlations - Array of correlation measurements
 * @returns Bell test score (>2.0 indicates quantum entanglement)
 */
export function testBellInequality(correlations: number[]): number {
  if (correlations.length < 4) {
    throw new Error('Need at least 4 correlation measurements for Bell test');
  }

  // CHSH inequality: S = |E(a,b) - E(a,b') + E(a',b) + E(a',b')|
  // Classical: S ≤ 2.0
  // Quantum: S can reach 2√2 ≈ 2.828
  const S = Math.abs(
    correlations[0] - correlations[1] + correlations[2] + correlations[3]
  );

  return S;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if a group is in superposition (not collapsed)
 */
export function isInSuperposition(group: SuperpositionGroup): boolean {
  return !group.isCollapsed && group.states.length > 1;
}

/**
 * Get probability distribution from superposition
 * Returns map of concept → probability
 */
export function getProbabilityDistribution(
  group: SuperpositionGroup
): Map<string, number> {
  const distribution = new Map<string, number>();
  
  for (const state of group.states) {
    const probability = state.amplitude ** 2;
    distribution.set(state.concept, probability);
  }

  return distribution;
}

/**
 * Refresh coherence (simulate cognitive rest/reflection)
 * Used when consciousness drops below threshold
 * 
 * @param currentCoherence - Current degraded coherence
 * @param targetCoherence - Target after refresh (default: 0.9)
 * @returns Restored coherence value
 */
export function refreshCoherence(
  currentCoherence: number,
  targetCoherence: number = 0.9
): number {
  // Linear interpolation toward target (can't exceed 1.0)
  const refreshed = currentCoherence + (targetCoherence - currentCoherence) * 0.8;
  return Math.min(refreshed, 1.0);
}

/**
 * Detect if two concepts are in contradiction (potential superposition)
 * Used to identify candidates for quantum superposition modeling
 * 
 * @param conceptA - First concept
 * @param conceptB - Second concept
 * @returns True if concepts appear contradictory
 */
export function detectContradiction(conceptA: string, conceptB: string): boolean {
  // Simple heuristics for contradiction detection
  const contradictionPatterns = [
    ['True', 'False'],
    ['Alive', 'Dead'],
    ['Correct', 'Incorrect'],
    ['Exists', 'NotExists'],
    ['Valid', 'Invalid'],
    ['Yes', 'No']
  ];

  const conceptPair = [conceptA, conceptB].sort();
  return contradictionPatterns.some(pattern => {
    const sortedPattern = pattern.sort();
    return conceptPair[0] === sortedPattern[0] && conceptPair[1] === sortedPattern[1];
  });
}
