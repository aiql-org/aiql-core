/**
 * @aiql-org/security — Test Suite
 * Tests: quantum-proof cryptography, signing, encryption, key management
 */

import * as crypto from './crypto.js';
import * as security from './security.js';
import * as AST from '@aiql-org/core';
import { Tokenizer } from '@aiql-org/core';
import { Parser } from '@aiql-org/core';
import { Transpiler } from '@aiql-org/core';

// Simple test framework
let currentBeforeEach: (() => void) | null = null;
let passed = 0;
let failed = 0;

function describe(name: string, fn: () => void) {
  console.log(`\n${name}`);
  const previousBeforeEach = currentBeforeEach;
  currentBeforeEach = null;
  fn();
  currentBeforeEach = previousBeforeEach;
}

function it(name: string, fn: () => void) {
  try {
    if (currentBeforeEach) currentBeforeEach();
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (error: any) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${error.message || error}`);
    failed++;
  }
}

function expect(actual: any) {
  const matchers = {
    toBe(expected: any) {
      if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`);
    },
    toBeDefined() {
      if (actual === undefined) throw new Error('Expected value to be defined');
    },
    toBeInstanceOf(constructor: any) {
      if (!(actual instanceof constructor)) throw new Error(`Expected instance of ${constructor.name}`);
    },
    toBeGreaterThan(value: any) {
      if (!(actual > value)) throw new Error(`Expected ${actual} to be greater than ${value}`);
    },
    toEqual(expected: any) {
      if (JSON.stringify(actual) !== JSON.stringify(expected))
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toContain(value: any) {
      if (!actual.includes(value)) throw new Error(`Expected array to contain ${value}`);
    },
    toThrow() {
      let didThrow = false;
      try { actual(); } catch (e) { didThrow = true; }
      if (!didThrow) throw new Error('Expected function to throw');
    }
  };
  const notMatchers = {
    toEqual(expected: any) {
      if (JSON.stringify(actual) === JSON.stringify(expected))
        throw new Error(`Expected not to equal ${JSON.stringify(expected)}`);
    }
  };
  return { ...matchers, not: notMatchers };
}

function beforeEach(fn: () => void) {
  currentBeforeEach = fn;
}

console.log('\n=== @aiql-org/security Tests ===');

describe('Quantum-Proof Cryptography', () => {
  describe('  Key Generation', () => {
    it('should generate signature key pair for agent', () => {
      const keyPair = crypto.generateSignatureKeyPair('test-agent-001');
      expect(keyPair).toBeDefined();
      expect(keyPair.algorithm).toBe('DILITHIUM');
      expect(keyPair.agentId).toBe('test-agent-001');
      expect(keyPair.publicKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.privateKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.publicKey.length).toBeGreaterThan(0);
      expect(keyPair.privateKey.length).toBeGreaterThan(0);
    });

    it('should generate encryption key pair for agent', () => {
      const keyPair = crypto.generateEncryptionKeyPair('test-agent-002');
      expect(keyPair).toBeDefined();
      expect(keyPair.algorithm).toBe('KYBER');
      expect(keyPair.agentId).toBe('test-agent-002');
      expect(keyPair.publicKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.privateKey).toBeInstanceOf(Uint8Array);
    });

    it('should generate complete agent identity', () => {
      const identity = crypto.generateAgentIdentity('test-agent-003');
      expect(identity).toBeDefined();
      expect(identity.agentId).toBe('test-agent-003');
      expect(identity.signatureKeyPair).toBeDefined();
      expect(identity.encryptionKeyPair).toBeDefined();
      expect(identity.signatureKeyPair.algorithm).toBe('DILITHIUM');
      expect(identity.encryptionKeyPair.algorithm).toBe('KYBER');
      expect(identity.created).toBeGreaterThan(0);
    });

    it('should generate different keys for different agents', () => {
      const keyPair1 = crypto.generateSignatureKeyPair('agent-1');
      const keyPair2 = crypto.generateSignatureKeyPair('agent-2');
      expect(keyPair1.publicKey).not.toEqual(keyPair2.publicKey);
      expect(keyPair1.privateKey).not.toEqual(keyPair2.privateKey);
    });
  });

  describe('  Digital Signatures', () => {
    it('should sign a message', () => {
      const keyPair = crypto.generateSignatureKeyPair('signer-agent');
      const signature = crypto.sign('This is a test message', keyPair);
      expect(signature).toBeDefined();
      expect(signature.algorithm).toBe('DILITHIUM');
      expect(signature.signature).toBeInstanceOf(Uint8Array);
      expect(signature.publicKey).toEqual(keyPair.publicKey);
      expect(signature.timestamp).toBeGreaterThan(0);
    });

    it('should verify a valid signature', () => {
      const keyPair = crypto.generateSignatureKeyPair('verify-agent');
      const signature = crypto.sign('Message to verify', keyPair);
      const isValid = crypto.verify('Message to verify', signature);
      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const keyPair = crypto.generateSignatureKeyPair('invalid-agent');
      const signature = crypto.sign('Original message', keyPair);
      const isValid = crypto.verify('Tampered message', signature);
      expect(isValid).toBe(false);
    });

    it('should sign binary data', () => {
      const keyPair = crypto.generateSignatureKeyPair('binary-agent');
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const signature = crypto.sign(data, keyPair);
      const isValid = crypto.verify(data, signature);
      expect(isValid).toBe(true);
    });
  });

  describe('  Encryption', () => {
    it('should encrypt and decrypt a message', () => {
      const keyPair = crypto.generateEncryptionKeyPair('crypto-agent');
      const message = 'Secret message';
      const encrypted = crypto.encrypt(message, keyPair.publicKey);
      const decrypted = crypto.decrypt(encrypted, keyPair);
      expect(Buffer.from(decrypted).toString('utf-8')).toBe(message);
    });

    it('should produce different ciphertexts for same message', () => {
      const keyPair = crypto.generateEncryptionKeyPair('random-agent');
      const encrypted1 = crypto.encrypt('Same message', keyPair.publicKey);
      const encrypted2 = crypto.encrypt('Same message', keyPair.publicKey);
      expect(encrypted1.ciphertext).not.toEqual(encrypted2.ciphertext);
      expect(encrypted1.nonce).not.toEqual(encrypted2.nonce);
    });

    it('should encrypt binary data', () => {
      const keyPair = crypto.generateEncryptionKeyPair('binary-crypto-agent');
      const data = new Uint8Array([10, 20, 30, 40, 50]);
      const encrypted = crypto.encrypt(data, keyPair.publicKey);
      const decrypted = crypto.decrypt(encrypted, keyPair);
      expect(decrypted).toEqual(data);
    });

    it('should fail to decrypt with wrong key', () => {
      const keyPair1 = crypto.generateEncryptionKeyPair('agent-1');
      const keyPair2 = crypto.generateEncryptionKeyPair('agent-2');
      const encrypted = crypto.encrypt('Secret', keyPair1.publicKey);
      expect(() => { crypto.decrypt(encrypted, keyPair2); }).toThrow();
    });
  });

  describe('  Key Management', () => {
    beforeEach(() => {
      const agents = crypto.listAgentIds();
      agents.forEach(agentId => crypto.revokeAgentIdentity(agentId));
    });

    it('should store and retrieve agent identity', () => {
      const identity = crypto.generateAgentIdentity('store-agent');
      crypto.storeAgentIdentity(identity);
      const retrieved = crypto.getAgentIdentity('store-agent');
      expect(retrieved).toBeDefined();
      expect(retrieved?.agentId).toBe('store-agent');
    });

    it('should check if agent exists', () => {
      const identity = crypto.generateAgentIdentity('exists-agent');
      crypto.storeAgentIdentity(identity);
      expect(crypto.hasAgentIdentity('exists-agent')).toBe(true);
      expect(crypto.hasAgentIdentity('non-existent')).toBe(false);
    });

    it('should revoke agent identity', () => {
      const identity = crypto.generateAgentIdentity('revoke-agent');
      crypto.storeAgentIdentity(identity);
      expect(crypto.hasAgentIdentity('revoke-agent')).toBe(true);
      crypto.revokeAgentIdentity('revoke-agent');
      expect(crypto.hasAgentIdentity('revoke-agent')).toBe(false);
    });

    it('should list all agent IDs', () => {
      crypto.storeAgentIdentity(crypto.generateAgentIdentity('agent-1'));
      crypto.storeAgentIdentity(crypto.generateAgentIdentity('agent-2'));
      crypto.storeAgentIdentity(crypto.generateAgentIdentity('agent-3'));
      const agents = crypto.listAgentIds();
      expect(agents).toContain('agent-1');
      expect(agents).toContain('agent-2');
      expect(agents).toContain('agent-3');
      expect(agents.length).toBe(3);
    });
  });

  describe('  Serialization', () => {
    it('should serialize and deserialize signature', () => {
      const keyPair = crypto.generateSignatureKeyPair('serialize-agent');
      const signature = crypto.sign('Test message', keyPair);
      const serialized = crypto.signatureToBase64(signature);
      const deserialized = crypto.signatureFromBase64(serialized);
      expect(deserialized.signature).toEqual(signature.signature);
      expect(deserialized.publicKey).toEqual(signature.publicKey);
      expect(deserialized.algorithm).toBe(signature.algorithm);
    });

    it('should serialize and deserialize encrypted message', () => {
      const keyPair = crypto.generateEncryptionKeyPair('serialize-crypto-agent');
      const encrypted = crypto.encrypt('Test', keyPair.publicKey);
      const serialized = crypto.encryptedToBase64(encrypted);
      const deserialized = crypto.encryptedFromBase64(serialized);
      expect(deserialized.ciphertext).toEqual(encrypted.ciphertext);
      expect(deserialized.nonce).toEqual(encrypted.nonce);
      expect(deserialized.tag).toEqual(encrypted.tag);
    });
  });
});

describe('AIQL Security Integration', () => {
  describe('  Command Signing', () => {
    it('should sign an AIQL command', () => {
      const command: AST.Intent = {
        type: 'Intent',
        intentType: '!Assert',
        statements: [{
          type: 'Statement',
          subject: { type: 'Concept', name: 'AI' },
          relation: { type: 'Relation', name: 'proved' },
          object: { type: 'Concept', name: 'Theorem' },
        }],
      };
      const signed = security.signCommand(command, 'test-agent');
      expect(signed.security).toBeDefined();
      expect(signed.security?.signed).toBe(true);
      expect(signed.security?.signerAgentId).toBe('test-agent');
      expect(signed.security?.signature).toBeDefined();
    });

    it('should verify a signed command', () => {
      const command: AST.Intent = {
        type: 'Intent', intentType: '!Query', statements: [],
      };
      const signed = security.signCommand(command, 'verify-agent');
      const isValid = security.verifyCommand(signed);
      expect(isValid).toBe(true);
    });
  });

  describe('  Command Encryption', () => {
    it('should encrypt an AIQL command', () => {
      const command: AST.Intent = {
        type: 'Intent',
        intentType: '!Secret',
        statements: [{
          type: 'Statement',
          subject: { type: 'Concept', name: 'PrivateData' },
          relation: { type: 'Relation', name: 'contains' },
          object: { type: 'Concept', name: 'Sensitive' },
        }],
      };
      const encrypted = security.encryptCommand(command, 'recipient-agent');
      expect(encrypted.security).toBeDefined();
      expect(encrypted.security?.encrypted).toBe(true);
      expect(encrypted.security?.recipientAgentId).toBe('recipient-agent');
      expect(encrypted.security?.encryptedData).toBeDefined();
      expect(encrypted.intentType).toBe('ENCRYPTED');
    });

    it('should decrypt an encrypted command', () => {
      const original: AST.Intent = {
        type: 'Intent', intentType: '!Task', statements: [], confidence: 0.95,
      };
      const agentId = 'decrypt-agent';
      const encrypted = security.encryptCommand(original, agentId);
      const decrypted = security.decryptCommand(encrypted, agentId);
      expect(decrypted.intentType).toBe(original.intentType);
      expect(decrypted.confidence).toBe(original.confidence);
    });
  });

  describe('  Full Security (Sign + Encrypt)', () => {
    it('should sign and encrypt a command', () => {
      const command: AST.Intent = {
        type: 'Intent', intentType: '!TopSecret', statements: [],
      };
      const secured = security.secureCommand(command, 'signer', 'recipient');
      expect(secured.security?.signed).toBe(true);
      expect(secured.security?.encrypted).toBe(true);
      expect(secured.security?.signerAgentId).toBe('signer');
      expect(secured.security?.recipientAgentId).toBe('recipient');
    });

    it('should decrypt and verify a secured command', () => {
      const command: AST.Intent = {
        type: 'Intent', intentType: '!Secure', statements: [], confidence: 0.99,
      };
      const secured = security.secureCommand(command, 'alice', 'bob');
      const { command: unsecured, verified, decrypted } = security.unsecureCommand(secured, 'bob');
      expect(decrypted).toBe(true);
      expect(verified).toBe(true);
      expect(unsecured.intentType).toBe(command.intentType);
      expect(unsecured.confidence).toBe(command.confidence);
    });
  });

  describe('  Security Utilities', () => {
    it('should detect secured commands', () => {
      const plain: AST.Intent = { type: 'Intent', intentType: '!Plain', statements: [] };
      const signed = security.signCommand(plain, 'agent');
      expect(security.isCommandSecured(plain)).toBe(false);
      expect(security.isCommandSecured(signed)).toBe(true);
    });

    it('should determine security level', () => {
      const plain: AST.Intent = { type: 'Intent', intentType: '!Plain', statements: [] };
      const signed = security.signCommand(plain, 'agent-1');
      const encrypted = security.encryptCommand(plain, 'agent-2');
      const secured = security.secureCommand(plain, 'agent-3', 'agent-4');
      expect(security.getSecurityLevel(plain)).toBe('none');
      expect(security.getSecurityLevel(signed)).toBe('signed');
      expect(security.getSecurityLevel(encrypted)).toBe('encrypted');
      expect(security.getSecurityLevel(secured)).toBe('full');
    });
  });

  describe('  Program-Level Security', () => {
    it('should sign an entire program', () => {
      const program: AST.Program = {
        type: 'Program',
        body: [{ type: 'Intent', intentType: '!Assert', statements: [] }],
      };
      const signed = security.signProgram(program, 'program-signer');
      expect(signed.security).toBeDefined();
      expect(signed.security?.signed).toBe(true);
      expect(signed.security?.signerAgentId).toBe('program-signer');
    });

    it('should verify a signed program', () => {
      const program: AST.Program = {
        type: 'Program',
        body: [{ type: 'Intent', intentType: '!Query', statements: [] }],
      };
      const signed = security.signProgram(program, 'program-verifier');
      const isValid = security.verifyProgram(signed);
      expect(isValid).toBe(true);
    });
  });
});

describe('AIQL Security Parser', () => {
  it('should parse sign directive', () => {
    const input = '#sign("agent-001")\n!Assert {\n  <AI> [proved] <Theorem>\n}';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const program = parser.parse();
    expect(program.body.length).toBe(1);
    const command = program.body[0];
    if (command.type !== 'Intent') throw new Error('Expected Intent');
    expect(command.security).toBeDefined();
    expect(command.security?.signed).toBe(true);
    expect(command.security?.signerAgentId).toBe('agent-001');
  });

  it('should parse encrypt directive', () => {
    const input = '#encrypt("recipient-002")\n!Command {\n  <Data> [send_to] <Agent>\n}';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const program = parser.parse();
    const command = program.body[0];
    if (command.type !== 'Intent') throw new Error('Expected Intent');
    expect(command.security?.encrypted).toBe(true);
    expect(command.security?.recipientAgentId).toBe('recipient-002');
  });

  it('should parse secure directive', () => {
    const input = '#secure(signer, recipient)\n!Assert {\n  <Secret> [is] <Safe>\n}';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const program = parser.parse();
    const command = program.body[0];
    if (command.type !== 'Intent') throw new Error('Expected Intent');
    expect(command.security?.signed).toBe(true);
    expect(command.security?.encrypted).toBe(true);
    expect(command.security?.signerAgentId).toBe('signer');
    expect(command.security?.recipientAgentId).toBe('recipient');
  });
});

describe('AIQL Security Transpilation', () => {
  it('should transpile signed command to JSON', () => {
    const command: AST.Intent = {
      type: 'Intent', intentType: '!Assert', statements: [],
      security: { signed: true, signerAgentId: 'agent-001', signature: 'base64-signature', timestamp: Date.now() },
    };
    const program: AST.Program = { type: 'Program', body: [command] };
    const transpiler = new Transpiler();
    const json = transpiler.transpile(program, 'json');
    const parsed = JSON.parse(json);
    // The JSON output could use 'commands', 'intents', or have the structure at root
    const jsonStr = JSON.stringify(parsed);
    expect(jsonStr).toContain('agent-001');
    expect(jsonStr).toContain('signed');
  });

  it('should transpile encrypted command to Python', () => {
    const command: AST.Intent = {
      type: 'Intent', intentType: '!Secret', statements: [],
      security: { encrypted: true, recipientAgentId: 'recipient-001', timestamp: Date.now() },
    };
    const program: AST.Program = { type: 'Program', body: [command] };
    const transpiler = new Transpiler();
    const python = transpiler.transpile(program, 'python');
    expect(python).toContain('Encrypted for recipient-001');
    expect(python).toContain('"encrypted":true');
  });
});

// =============================================================================
// Summary
// =============================================================================
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

if (failed > 0) process.exit(1);
