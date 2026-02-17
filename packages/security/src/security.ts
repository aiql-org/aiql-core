/**
 * AIQL Security Module
 * 
 * Provides high-level security operations for AIQL messages:
 * - Signing and verification
 * - Encryption and decryption
 * - Agent identity management
 * - Secure message wrapping
 */

import * as crypto from './crypto.js';
import * as AST from '@aiql-org/core';

// ============================================================================
// AIQL Message Security Operations
// ============================================================================

/**
 * Sign an AIQL command ensuring integrity
 */
export function signCommand(
  command: AST.Intent,
  agentId: string
): AST.SecureIntent {
  // Ensure agent has identity
  let identity = crypto.getAgentIdentity(agentId);
  if (!identity) {
    identity = crypto.generateAgentIdentity(agentId);
    crypto.storeAgentIdentity(identity);
  }
  
  // Serialize command for signing
  const commandString = JSON.stringify({
    intentType: command.intentType,
    scope: command.scope,
    statements: command.statements,
    confidence: command.confidence,
  });
  
  // Sign the command
  const signature = crypto.sign(commandString, identity.signatureKeyPair);
  
  // Create secure command with signature
  const secureCommand: AST.SecureIntent = {
    ...command,
    security: {
      signed: true,
      signature: crypto.signatureToBase64(signature),
      signerAgentId: agentId,
      timestamp: Date.now(),
    },
  };
  
  return secureCommand;
}

/**
 * Verify a signed AIQL command
 */
export function verifyCommand(command: AST.SecureIntent): boolean {
  if (!command.security?.signed || !command.security.signature) {
    throw new Error('Command is not signed');
  }
  
  // Reconstruct the original command
  const commandString = JSON.stringify({
    intentType: command.intentType,
    scope: command.scope,
    statements: command.statements,
    confidence: command.confidence,
  });
  
  // Parse signature
  const signature = crypto.signatureFromBase64(command.security.signature);
  
  // Verify the signature
  return crypto.verify(commandString, signature);
}

/**
 * Encrypt an AIQL command for confidentiality
 */
export function encryptCommand(
  command: AST.Intent,
  recipientAgentId: string
): AST.SecureIntent {
  // Get recipient's public key
  let recipientIdentity = crypto.getAgentIdentity(recipientAgentId);
  if (!recipientIdentity) {
    // If recipient doesn't exist yet, create identity
    recipientIdentity = crypto.generateAgentIdentity(recipientAgentId);
    crypto.storeAgentIdentity(recipientIdentity);
  }
  
  // Serialize command for encryption
  // Include security metadata if present (e.g., for sign+encrypt)
  const commandToEncrypt: Record<string, unknown> = {
    intentType: command.intentType,
    scope: command.scope,
    statements: command.statements,
    confidence: command.confidence,
  };
  
  // Preserve security metadata (like signatures) in the encrypted payload
  if (command.security) {
    commandToEncrypt.security = command.security;
  }
  
  const commandString = JSON.stringify(commandToEncrypt);
  
  // Encrypt the command
  const encrypted = crypto.encrypt(
    commandString,
    recipientIdentity.encryptionKeyPair.publicKey
  );
  
  // Create secure command with encrypted data
  const secureCommand: AST.SecureIntent = {
    type: 'Intent',
    intentType: 'ENCRYPTED',
    statements: [],
    security: {
      encrypted: true,
      encryptedData: crypto.encryptedToBase64(encrypted),
      recipientAgentId,
      timestamp: Date.now(),
    },
  };
  
  return secureCommand;
}

/**
 * Decrypt an encrypted AIQL command
 */
export function decryptCommand(
  encryptedCommand: AST.SecureIntent,
  agentId: string
): AST.Intent {
  if (!encryptedCommand.security?.encrypted || !encryptedCommand.security.encryptedData) {
    throw new Error('Command is not encrypted');
  }
  
  // Get agent's identity
  const identity = crypto.getAgentIdentity(agentId);
  if (!identity) {
    throw new Error(`Agent ${agentId} has no identity/keys`);
  }
  
  // Parse encrypted data
  const encrypted = crypto.encryptedFromBase64(encryptedCommand.security.encryptedData);
  
  // Decrypt
  const decrypted = crypto.decrypt(encrypted, identity.encryptionKeyPair);
  const commandString = Buffer.from(decrypted).toString('utf-8');
  
  // Parse the original command
  const command = JSON.parse(commandString) as AST.Intent;
  command.type = 'Intent';
  
  return command;
}

/**
 * Sign and encrypt an AIQL command (full security)
 */
export function secureCommand(
  command: AST.Intent,
  signerAgentId: string,
  recipientAgentId: string
): AST.SecureIntent {
  // First sign the command
  const signed = signCommand(command, signerAgentId);
  
  // Then encrypt the signed command
  const encrypted = encryptCommand(signed, recipientAgentId);
  
  // Update security metadata to indicate both operations
  encrypted.security!.signed = true;
  encrypted.security!.signerAgentId = signerAgentId;
  
  return encrypted;
}

/**
 * Decrypt and verify an AIQL command (full security check)
 */
export function unsecureCommand(
  securedCommand: AST.SecureIntent,
  recipientAgentId: string
): { command: AST.Intent; verified: boolean; decrypted: boolean } {
  let decrypted = false;
  let verified = false;
  let command: AST.Intent = securedCommand;
  
  // First decrypt if encrypted
  if (securedCommand.security?.encrypted) {
    command = decryptCommand(securedCommand, recipientAgentId);
    decrypted = true;
  }
  
  // Then verify signature if signed
  if (command.security?.signed && command.security?.signature) {
    try {
      verified = verifyCommand(command as AST.SecureIntent);
    } catch {
      verified = false;
    }
  }
  
  return { command, verified, decrypted };
}

// ============================================================================
// Program-Level Security
// ============================================================================

/**
 * Sign an entire AIQL program
 */
export function signProgram(
  program: AST.Program,
  agentId: string
): AST.Program {
  // Ensure agent has identity
  let identity = crypto.getAgentIdentity(agentId);
  if (!identity) {
    identity = crypto.generateAgentIdentity(agentId);
    crypto.storeAgentIdentity(identity);
  }
  
  // Serialize program for signing
  const programString = JSON.stringify(program.body);
  
  // Sign the program
  const signature = crypto.sign(programString, identity.signatureKeyPair);
  
  return {
    ...program,
    security: {
      signed: true,
      signature: crypto.signatureToBase64(signature),
      signerAgentId: agentId,
      timestamp: Date.now(),
    },
  };
}

/**
 * Verify a signed AIQL program
 */
export function verifyProgram(program: AST.Program): boolean {
  if (!program.security?.signed || !program.security.signature) {
    throw new Error('Program is not signed');
  }
  
  // Reconstruct the original program
  const programString = JSON.stringify(program.body);
  
  // Parse signature
  const signature = crypto.signatureFromBase64(program.security.signature);
  
  // Verify the signature
  return crypto.verify(programString, signature);
}

// ============================================================================
// Agent Identity Management
// ============================================================================

/**
 * Initialize a new AI agent with quantum-resistant keys
 */
export function initializeAgent(agentId: string): crypto.AgentIdentity {
  // Check if agent already exists
  if (crypto.hasAgentIdentity(agentId)) {
    throw new Error(`Agent ${agentId} already initialized`);
  }
  
  // Generate new identity
  const identity = crypto.generateAgentIdentity(agentId);
  
  // Store in memory
  crypto.storeAgentIdentity(identity);
  
  return identity;
}

/**
 * Get agent's public keys for sharing
 */
export function getAgentPublicKeys(agentId: string): {
  signaturePublicKey: Uint8Array;
  encryptionPublicKey: Uint8Array;
} | null {
  const identity = crypto.getAgentIdentity(agentId);
  if (!identity) {
    return null;
  }
  
  return {
    signaturePublicKey: identity.signatureKeyPair.publicKey,
    encryptionPublicKey: identity.encryptionKeyPair.publicKey,
  };
}

/**
 * Export agent identity as base64 (for backup/transfer)
 */
export function exportAgentIdentity(agentId: string): string {
  const identity = crypto.getAgentIdentity(agentId);
  if (!identity) {
    throw new Error(`Agent ${agentId} not found`);
  }
  
  return JSON.stringify({
    agentId: identity.agentId,
    signatureKeyPair: {
      publicKey: Buffer.from(identity.signatureKeyPair.publicKey).toString('base64'),
      privateKey: Buffer.from(identity.signatureKeyPair.privateKey).toString('base64'),
      algorithm: identity.signatureKeyPair.algorithm,
      timestamp: identity.signatureKeyPair.timestamp,
    },
    encryptionKeyPair: {
      publicKey: Buffer.from(identity.encryptionKeyPair.publicKey).toString('base64'),
      privateKey: Buffer.from(identity.encryptionKeyPair.privateKey).toString('base64'),
      algorithm: identity.encryptionKeyPair.algorithm,
      timestamp: identity.encryptionKeyPair.timestamp,
    },
    created: identity.created,
  });
}

/**
 * Import agent identity from base64
 */
export function importAgentIdentity(encoded: string): void {
  const obj = JSON.parse(encoded);
  
  const identity: crypto.AgentIdentity = {
    agentId: obj.agentId,
    signatureKeyPair: {
      publicKey: Buffer.from(obj.signatureKeyPair.publicKey, 'base64'),
      privateKey: Buffer.from(obj.signatureKeyPair.privateKey, 'base64'),
      algorithm: obj.signatureKeyPair.algorithm,
      agentId: obj.agentId,
      timestamp: obj.signatureKeyPair.timestamp,
    },
    encryptionKeyPair: {
      publicKey: Buffer.from(obj.encryptionKeyPair.publicKey, 'base64'),
      privateKey: Buffer.from(obj.encryptionKeyPair.privateKey, 'base64'),
      algorithm: obj.encryptionKeyPair.algorithm,
      agentId: obj.agentId,
      timestamp: obj.encryptionKeyPair.timestamp,
    },
    created: obj.created,
  };
  
  crypto.storeAgentIdentity(identity);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a command is secured (signed and/or encrypted)
 */
export function isCommandSecured(command: AST.Intent): boolean {
  return !!(command.security?.signed || command.security?.encrypted);
}

/**
 * Get security level of a command
 */
export function getSecurityLevel(command: AST.Intent): 'none' | 'signed' | 'encrypted' | 'full' {
  if (!command.security) return 'none';
  
  const signed = command.security.signed;
  const encrypted = command.security.encrypted;
  
  if (signed && encrypted) return 'full';
  if (encrypted) return 'encrypted';
  if (signed) return 'signed';
  return 'none';
}

/**
 * List all registered agents
 */
export function listAgents(): string[] {
  return crypto.listAgentIds();
}

/**
 * Revoke an agent's credentials
 */
export function revokeAgent(agentId: string): boolean {
  return crypto.revokeAgentIdentity(agentId);
}
