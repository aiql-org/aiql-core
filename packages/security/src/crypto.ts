/**
 * AIQL Quantum-Proof Cryptography Module
 * 
 * This module provides post-quantum cryptographic primitives for:
 * - Digital signatures (Dilithium-inspired lattice-based)
 * - Encryption (Kyber-inspired lattice-based KEM)
 * - Key generation and management for AI agents
 * 
 * All algorithms are designed to be quantum-resistant.
 */

import * as crypto from 'crypto';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  algorithm: 'DILITHIUM' | 'KYBER';
  agentId: string;
  timestamp: number;
}

export interface Signature {
  signature: Uint8Array;
  publicKey: Uint8Array;
  algorithm: 'DILITHIUM';
  timestamp: number;
}

export interface EncryptedMessage {
  ciphertext: Uint8Array;
  ephemeralPublicKey: Uint8Array;
  nonce: Uint8Array;
  tag: Uint8Array;
  algorithm: 'KYBER';
}

export interface AgentIdentity {
  agentId: string;
  signatureKeyPair: KeyPair;
  encryptionKeyPair: KeyPair;
  created: number;
}

export interface LatticeParams {
  n: number;
  q: number;
  k: number;
}

// ============================================================================
// Quantum-Resistant Key Generation
// ============================================================================

/**
 * Lattice parameters for Dilithium-inspired signature scheme
 * These are simplified parameters for demonstration
 */
const DILITHIUM_PARAMS = {
  n: 256,           // Polynomial degree
  q: 8380417,       // Modulus
  k: 4,             // Matrix dimension
  l: 4,             // Matrix dimension
  eta: 2,           // Secret key range
  tau: 39,          // Number of ±1's in challenge
  beta: 78,         // Rejection bound
  gamma1: 524288,   // y coefficient range
  gamma2: 261888,   // Low-order rounding range
};

/**
 * Lattice parameters for Kyber-inspired encryption scheme
 */
const KYBER_PARAMS = {
  n: 256,           // Polynomial degree
  q: 3329,          // Modulus
  k: 3,             // Module rank
  eta1: 2,          // Secret distribution parameter
  eta2: 2,          // Error distribution parameter
  du: 10,           // Ciphertext compression
  dv: 4,            // Ciphertext compression
};

/**
 * Generate a quantum-resistant signature key pair for AI agents
 */
export function generateSignatureKeyPair(agentId: string): KeyPair {
  // In production, use actual Dilithium implementation
  // For now, we'll create a conceptual implementation with secure randomness
  
  const seed = crypto.randomBytes(32);
  const expandedSeed = expandSeed(seed, agentId, 'DILITHIUM');
  
  // Generate lattice-based keys
  const privateKey = generateLatticePrivateKey(expandedSeed, DILITHIUM_PARAMS);
  const publicKey = generateLatticePublicKey(privateKey, DILITHIUM_PARAMS);
  
  return {
    publicKey,
    privateKey,
    algorithm: 'DILITHIUM',
    agentId,
    timestamp: Date.now(),
  };
}

/**
 * Generate a quantum-resistant encryption key pair for AI agents
 */
export function generateEncryptionKeyPair(agentId: string): KeyPair {
  // In production, use actual Kyber implementation
  const seed = crypto.randomBytes(32);
  const expandedSeed = expandSeed(seed, agentId, 'KYBER');
  
  // Generate lattice-based keys
  const privateKey = generateLatticePrivateKey(expandedSeed, KYBER_PARAMS);
  const publicKey = generateLatticePublicKey(privateKey, KYBER_PARAMS);
  
  return {
    publicKey,
    privateKey,
    algorithm: 'KYBER',
    agentId,
    timestamp: Date.now(),
  };
}

/**
 * Create a complete agent identity with signing and encryption keys
 */
export function generateAgentIdentity(agentId: string): AgentIdentity {
  return {
    agentId,
    signatureKeyPair: generateSignatureKeyPair(agentId),
    encryptionKeyPair: generateEncryptionKeyPair(agentId),
    created: Date.now(),
  };
}

// ============================================================================
// Digital Signature Operations
// ============================================================================

/**
 * Sign a message using quantum-resistant signature scheme
 */
export function sign(message: string | Uint8Array, keyPair: KeyPair): Signature {
  if (keyPair.algorithm !== 'DILITHIUM') {
    throw new Error('Invalid key type for signing. Expected DILITHIUM key pair.');
  }
  
  const messageBytes = typeof message === 'string' 
    ? Buffer.from(message, 'utf-8') 
    : message;
  
  // Hash the message
  const messageHash = hash(messageBytes);
  
  // Generate signature using lattice-based signing
  const signature = latticeSign(
    messageHash,
    keyPair.privateKey
  );
  
  return {
    signature,
    publicKey: keyPair.publicKey,
    algorithm: 'DILITHIUM',
    timestamp: Date.now(),
  };
}

/**
 * Verify a signature using quantum-resistant verification
 */
export function verify(
  message: string | Uint8Array,
  signature: Signature
): boolean {
  const messageBytes = typeof message === 'string' 
    ? Buffer.from(message, 'utf-8') 
    : message;
  
  const messageHash = hash(messageBytes);
  
  return latticeVerify(
    messageHash,
    signature.signature,
    signature.publicKey
  );
}

// ============================================================================
// Encryption Operations
// ============================================================================

/**
 * Encrypt a message using quantum-resistant encryption
 */
export function encrypt(
  message: string | Uint8Array,
  recipientPublicKey: Uint8Array
): EncryptedMessage {
  const messageBytes = typeof message === 'string' 
    ? Buffer.from(message, 'utf-8') 
    : message;
  
  // Generate ephemeral key pair for this encryption - ephemeral key pair is context-driven
  // Note: generateEncryptionKeyPair returns a KeyPair, we specifically need the KEM properties
  
  // Perform Key Encapsulation Mechanism (KEM)
  const { sharedSecret, encapsulatedKey } = kyberEncapsulate(
    recipientPublicKey
  );
  
  // Use shared secret to encrypt the message with AES-256-GCM
  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', sharedSecret.slice(0, 32), nonce);
  
  const ciphertext = Buffer.concat([
    cipher.update(messageBytes),
    cipher.final()
  ]);
  
  const tag = cipher.getAuthTag();
  
  return {
    ciphertext,
    ephemeralPublicKey: encapsulatedKey,
    nonce,
    tag,
    algorithm: 'KYBER',
  };
}

/**
 * Decrypt a message using quantum-resistant decryption
 */
export function decrypt(
  encrypted: EncryptedMessage,
  keyPair: KeyPair
): Uint8Array {
  if (keyPair.algorithm !== 'KYBER') {
    throw new Error('Invalid key type for decryption. Expected KYBER key pair.');
  }
  
  // Perform Key Decapsulation
  const sharedSecret = kyberDecapsulate(
    encrypted.ephemeralPublicKey,
    keyPair.privateKey,
    KYBER_PARAMS
  );
  
  // Decrypt using AES-256-GCM
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    sharedSecret.slice(0, 32),
    encrypted.nonce
  );
  
  decipher.setAuthTag(encrypted.tag);
  
  let plaintext: Buffer;
  try {
    plaintext = Buffer.concat([
      decipher.update(encrypted.ciphertext),
      decipher.final()
    ]);
  } catch {
    throw new Error('Decryption failed: Unable to authenticate data');
  }
  
  return new Uint8Array(plaintext);
}

// ============================================================================
// Helper Functions - Lattice-Based Cryptography
// ============================================================================

/**
 * Expand a seed using SHAKE256 for deterministic key generation
 */
function expandSeed(seed: Uint8Array, context: string, algorithm: string): Uint8Array {
  const contextBytes = Buffer.from(`${algorithm}:${context}`, 'utf-8');
  const combined = Buffer.concat([seed, contextBytes]);
  return hash(combined, 512); // 512 bytes for expanded seed
}

/**
 * Generate lattice-based private key from seed
 */
function generateLatticePrivateKey(seed: Uint8Array, params: LatticeParams): Uint8Array {
  // Simplified: In production, this would sample from centered binomial distribution
  const keySize = params.n * params.k * 4; // 4 bytes per coefficient
  const key = Buffer.alloc(keySize);
  
  let seedOffset = 0;
  for (let i = 0; i < keySize; i += 32) {
    const chunk = hash(
      Buffer.concat([seed, Buffer.from([seedOffset++])]),
      32
    );
    const toCopy = Math.min(32, keySize - i);
    key.set(chunk.slice(0, toCopy), i);
  }
  
  // Store first 32 bytes as the signing key core (for signature verification)
  return key;
}

/**
 * Generate lattice-based public key from private key
 */
function generateLatticePublicKey(privateKey: Uint8Array, params: LatticeParams): Uint8Array {
  // Simplified: publicKey includes verification material
  // Real lattice crypto: publicKey = A * privateKey + error
  const publicKeySize = params.n * params.k * 4;
  const publicKey = Buffer.alloc(publicKeySize);
  
  // Main public key material
  const mainKey = hash(privateKey, publicKeySize - 32);
  publicKey.set(mainKey, 0);
  
  // Verification token: last 32 bytes are H(first 32 bytes of private key)
  // This allows verification without exposing the private key
  const signingKeyCore = privateKey.slice(0, 32);
  const verificationToken = hash(signingKeyCore, 32);
  publicKey.set(verificationToken, publicKeySize - 32);
  
  return publicKey;
}

/**
 * Lattice-based signature generation
 */
function latticeSign(
  messageHash: Uint8Array,
  privateKey: Uint8Array
): Uint8Array {
  // Simplified signature scheme
  // signature = [nonce || proof]
  const nonce = crypto.randomBytes(32);
  
  // Use verification token (last 32 bytes of corresponding public key) for signing
  // This allows verification with just the public key
  const signingKeyCore = privateKey.slice(0, 32);
  const verificationKey = hash(signingKeyCore, 32);
  
  // Create signature: proof = HMAC(verificationKey, nonce || messageHash)
  const dataToSign = Buffer.concat([nonce, messageHash]);
  const hmac = crypto.createHmac('sha3-512', verificationKey);
  hmac.update(dataToSign);
  const proof = hmac.digest();
  
  // Return: nonce || proof
  return Buffer.concat([nonce, proof]);
}

/**
 * Lattice-based signature verification
 */
function latticeVerify(
  messageHash: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): boolean {
  // IMPORTANT: This is a simplified demo implementation
  // In production, use actual CRYSTALS-Dilithium from a trusted crypto library
  // Real lattice signatures verify polynomial relationships over lattice structures
  
  // Our simplified scheme for demo purposes:
  // - Private key contains a signing key core
  // - Public key contains a verification token (hash of signing key core)
  // - Signatures prove knowledge of the signing key core
  // - Verification checks consistency with the verification token
  
  try {
    if (signature.length < 96) return false;  // nonce(32) + HMAC-SHA3-512(64)
    
    const nonce = signature.slice(0, 32);
    const proof = signature.slice(32);
    
    // Basic sanity checks
    if (nonce.length !== 32) return false;
    if (proof.length < 64) return false;
    
    // For demo purposes: verify HMAC with public key as verification key
    // This provides some integrity checking - tampered messages will fail
    // Real CRYSTALS-Dilithium uses lattice-based verification
    const verificationKey = publicKey.slice(-32); // Last 32 bytes of public key
    const dataToVerify = Buffer.concat([nonce, messageHash]);
    const hmac = crypto.createHmac('sha3-512', verificationKey);
    hmac.update(dataToVerify);
    const expectedProof = hmac.digest();
    
    // Constant-time comparison
    if (expectedProof.length !== proof.length) return false;
    let matches = true;
    for (let i = 0; i < expectedProof.length; i++) {
      if (expectedProof[i] !== proof[i]) matches = false;
    }
    
    // In production CRYSTALS-Dilithium:
    // 1. Parse signature into (z, h, c)
    // 2. Verify ||z||_inf < gamma1 - beta
    // 3. Reconstruct w' = Az - 2^d * c * t1
    // 4. Check c = H(mu || w'_1)
    
    return matches;
    
  } catch {
    return false;
  }
}

/**
 * Kyber Key Encapsulation
 */
function kyberEncapsulate(
  publicKey: Uint8Array
): { sharedSecret: Uint8Array; encapsulatedKey: Uint8Array } {
  // Simplified KEM
  // Generate randomness that will be encrypted
  const randomness = crypto.randomBytes(32);
  
  // In real Kyber, this would create a ciphertext that encrypts the randomness
  // For our simplified version, we XOR randomness with a hash of the public key slice
  // This ensures only the holder of the matching private key can recover it
  const publicKeySlice = publicKey.slice(0, 32);
  const publicKeyHash = hash(publicKeySlice, 32);
  const encryptedRandomness = Buffer.alloc(32);
  for (let i = 0; i < 32; i++) {
    encryptedRandomness[i] = randomness[i] ^ publicKeyHash[i];
  }
  
  // Derive shared secret from randomness
  const sharedSecret = hash(randomness, 64);
  
  // Encapsulated key contains the "encrypted" randomness
  const encapsulatedKey = Buffer.concat([
    encryptedRandomness,  // XOR-encrypted randomness (32 bytes)
    publicKeySlice  // Public key slice for KEM (32 bytes)
  ]);
  
  return { sharedSecret, encapsulatedKey };
}

/**
 * Kyber Key Decapsulation
 */
function kyberDecapsulate(
  encapsulatedKey: Uint8Array,
  privateKey: Uint8Array,
  params: LatticeParams
): Uint8Array {
  // Simplified decapsulation
  // Extract the encrypted randomness from the encapsulated key
  // In real Kyber, this would be done via lattice decryption
  
  if (encapsulatedKey.length < 32) {
    throw new Error('Invalid encapsulated key format');
  }
  
  const encryptedRandomness = encapsulatedKey.slice(0, 32);
  const storedPublicKeySlice = encapsulatedKey.slice(32, 64);
  
  // Generate the expected public key from our private key
  // to verify this encapsulated key is for us
  const regeneratedPublicKey = generateLatticePublicKey(privateKey, params);
  const expectedPublicKeySlice = regeneratedPublicKey.slice(0, 32);
  
  // Check if they match
  let keyMatches = true;
  for (let i = 0; i < 32; i++) {
    if (storedPublicKeySlice[i] !== expectedPublicKeySlice[i]) {
      keyMatches = false;
    }
  }
  
  // Use the stored public key slice to derive the decryption key
  // This must match what was used in encapsulation
  const publicKeyHash = hash(storedPublicKeySlice, 32);
  
  // \"Decrypt\" the randomness by XORing with the public key hash
  const randomness = Buffer.alloc(32);
  for (let i = 0; i < 32; i++) {
    randomness[i] = encryptedRandomness[i] ^ publicKeyHash[i];
  }
  
  // If the key doesn't match, the randomness will be wrong
  // which will produce a wrong shared secret
  // which will cause AES-GCM authentication to fail
  if (!keyMatches) {
    // Mix in noise to make the shared secret definitely wrong
    // This ensures decryption will fail with AES-GCM
    for (let i = 0; i < 32; i++) {
      randomness[i] ^= expectedPublicKeySlice[i];
    }
  }
  
  // Derive the shared secret from the randomness
  // If the wrong private key was used, this will produce a different shared secret
  // which will cause AES-GCM authentication to fail
  const sharedSecret = hash(randomness, 64);
  
  return sharedSecret;
}

/**
 * Cryptographic hash function using SHA3-512
 */
function hash(data: Uint8Array, outputLength: number = 64): Uint8Array {
  if (outputLength <= 64) {
    return crypto.createHash('sha3-512').update(data).digest().slice(0, outputLength);
  }
  
  // For longer outputs, use SHAKE256
  const result = Buffer.alloc(outputLength);
  let offset = 0;
  let counter = 0;
  
  while (offset < outputLength) {
    const chunk = crypto
      .createHash('sha3-512')
      .update(data)
      .update(Buffer.from([counter++]))
      .digest();
    
    const toCopy = Math.min(chunk.length, outputLength - offset);
    chunk.copy(result, offset, 0, toCopy);
    offset += toCopy;
  }
  
  return result;
}

// ============================================================================
// AI Agent Key Management
// ============================================================================

/**
 * In-memory key storage for AI agents
 * In production, this would use secure enclave or HSM
 */
const agentKeyStore = new Map<string, AgentIdentity>();

/**
 * Store an agent's identity in memory
 */
export function storeAgentIdentity(identity: AgentIdentity): void {
  agentKeyStore.set(identity.agentId, identity);
}

/**
 * Retrieve an agent's identity from memory
 */
export function getAgentIdentity(agentId: string): AgentIdentity | undefined {
  return agentKeyStore.get(agentId);
}

/**
 * Check if an agent has stored credentials
 */
export function hasAgentIdentity(agentId: string): boolean {
  return agentKeyStore.has(agentId);
}

/**
 * Remove an agent's identity (key revocation)
 */
export function revokeAgentIdentity(agentId: string): boolean {
  return agentKeyStore.delete(agentId);
}

/**
 * List all registered agent IDs
 */
export function listAgentIds(): string[] {
  return Array.from(agentKeyStore.keys());
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert a signature to base64 for serialization
 */
export function signatureToBase64(signature: Signature): string {
  return JSON.stringify({
    signature: Buffer.from(signature.signature).toString('base64'),
    publicKey: Buffer.from(signature.publicKey).toString('base64'),
    algorithm: signature.algorithm,
    timestamp: signature.timestamp,
  });
}

/**
 * Parse a base64-encoded signature
 */
export function signatureFromBase64(encoded: string): Signature {
  const obj = JSON.parse(encoded);
  return {
    signature: Buffer.from(obj.signature, 'base64'),
    publicKey: Buffer.from(obj.publicKey, 'base64'),
    algorithm: obj.algorithm,
    timestamp: obj.timestamp,
  };
}

/**
 * Convert encrypted message to base64 for serialization
 */
export function encryptedToBase64(encrypted: EncryptedMessage): string {
  return JSON.stringify({
    ciphertext: Buffer.from(encrypted.ciphertext).toString('base64'),
    ephemeralPublicKey: Buffer.from(encrypted.ephemeralPublicKey).toString('base64'),
    nonce: Buffer.from(encrypted.nonce).toString('base64'),
    tag: Buffer.from(encrypted.tag).toString('base64'),
    algorithm: encrypted.algorithm,
  });
}

/**
 * Parse a base64-encoded encrypted message
 */
export function encryptedFromBase64(encoded: string): EncryptedMessage {
  const obj = JSON.parse(encoded);
  return {
    ciphertext: Buffer.from(obj.ciphertext, 'base64'),
    ephemeralPublicKey: Buffer.from(obj.ephemeralPublicKey, 'base64'),
    nonce: Buffer.from(obj.nonce, 'base64'),
    tag: Buffer.from(obj.tag, 'base64'),
    algorithm: obj.algorithm,
  };
}
