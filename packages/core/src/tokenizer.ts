
/**
 * AIQL Token Categories (v2.5.0)
 * 
 * Tokens are organized into semantic categories for maintainability and extensibility.
 * Total: 34 token types across 7 categories.
 */
export enum TokenType {
  // ===================================================================
  // Category 1: Core Syntax Tokens (5 types)
  // Purpose: Fundamental AIQL language constructs
  // ===================================================================
  INTENT = "INTENT",           // !Query, !Assert, !Task - Goal-oriented statements
  CONCEPT = "CONCEPT",         // <Entity> - Semantic nodes
  RELATION = "RELATION",       // [relation_name] - Semantic edges
  CONFIDENCE = "CONFIDENCE",   // @0.95 - Probability scores (0.0-1.0)
  DIRECTIVE = "DIRECTIVE",     // #sign, #encrypt, #secure - Security directives
  
  // ===================================================================
  // Category 2: Statement Metadata Markers (5 types)
  // Purpose: Statement-level annotations for tracking and execution
  // ===================================================================
  ID_MARKER = "ID_MARKER",         // $id:identifier - Statement identifiers
  GROUP_ID = "GROUP_ID",           // $$group:group_id - Group identifiers
  SEQ_NUM = "SEQ_NUM",             // ##seq:1 - Sequence numbers
  TEMPERATURE = "TEMPERATURE",     // ~temp:0.7 - AI temperature (0.0-2.0)
  ENTROPY = "ENTROPY",             // ~~entropy:0.5 - Entropy level (0.0-1.0)
  
  // ===================================================================
  // Category 2.5: Quantum Consciousness Markers (1 type) - v2.6.0
  // Purpose: Quantum coherence as consciousness metric
  // ===================================================================
  COHERENCE = "COHERENCE",         // @coherence:0.95 - Quantum coherence (0.0-1.0)
  
  // ===================================================================
  // Category 3: Provenance Metadata (3 types)
  // Purpose: Source tracking and citation management (v0.4.0)
  // ===================================================================
  VERSION_MARKER = "VERSION_MARKER",  // @version:"x.y.z" - AIQL version
  ORIGIN_MARKER = "ORIGIN_MARKER",    // @origin:"doi:10.1234/xyz" - Document source
  CITE_MARKER = "CITE_MARKER",        // @cite:"ref" or @cite:["refs"] - Citations
  
  // ===================================================================
  // Category 3.5: Example Markers (2 types) - v2.2.0
  // Purpose: Native syntax for embedding examples to clarify semantics
  // ===================================================================
  EXAMPLE_MARKER = "EXAMPLE_MARKER",       // #example: - Inline example marker
  EXAMPLE_PATTERN = "EXAMPLE_PATTERN",     // #example_pattern: - Pattern example marker
  
  // ===================================================================
  // Category 4: Logic & Reasoning Tokens (13 types) - v2.0.0
  // Purpose: Propositional logic, quantifiers, and inference rules
  // ===================================================================
  // Propositional logic operators
  AND = "AND",                 // and - Conjunction (A ∧ B)
  OR = "OR",                   // or - Disjunction (A ∨ B)
  NOT = "NOT",                 // not - Negation (¬A)
  IMPLIES = "IMPLIES",         // implies - Implication (A → B)
  IFF = "IFF",                 // iff - Bi-implication (A ↔ B)
  
  // Quantifiers
  FORALL = "FORALL",           // forall - Universal quantification (∀x)
  EXISTS = "EXISTS",           // exists - Existential quantification (∃x)
  
  // Proof operators
  PROVES = "PROVES",           // proves - Entailment (⊢)
  ENTAILS = "ENTAILS",         // entails - Alternative to proves
  
  // Logic keywords
  IN = "IN",                   // in - Domain specification (forall x in Domain)
  THEN = "THEN",               // then - Alternative to implies
  TRUE = "TRUE",               // true - Boolean literal
  FALSE = "FALSE",             // false - Boolean literal

  // Comparison operators (v2.7.0)
  GT = "GT",                   // >
  LT = "LT",                   // <
  GTE = "GTE",                 // >=
  LTE = "LTE",                 // <=
  EQ = "EQ",                   // ==
  NEQ = "NEQ",                 // !=
  
  // ===================================================================
  // Category 5: Primitive Types (4 types)
  // Purpose: Basic data types for values and literals
  // ===================================================================
  STRING = "STRING",           // "text" - String literals
  NUMBER = "NUMBER",           // 123, 0.99 - Numeric literals
  IDENTIFIER = "IDENTIFIER",   // scope, global - Variable names
  SYMBOL = "SYMBOL",           // { } ( ) : | [ ] - Structural symbols
  
  // ===================================================================
  // Category 6: Mathematical Tokens (v2.1.0)
  // Purpose: Math operators, set theory, and constants
  // ===================================================================
  PLUS = "PLUS",               // +
  MINUS = "MINUS",             // -
  MULTIPLY = "MULTIPLY",       // * (when not in comments)
  DIVIDE = "DIVIDE",           // / (when not in comments)
  POWER = "POWER",             // ^
  MODULO = "MODULO",           // %
  ASSIGN = "ASSIGN",           // =
  
  // Set Theory & Functional
  UNION = "UNION",             // union
  INTERSECT = "INTERSECT",     // intersect
  LAMBDA = "LAMBDA",           // lambda
  SUMMATION = "SUMMATION",     // sum
  INTEGRAL = "INTEGRAL",       // integral
  
  // Constants
  PI = "PI",                   // pi
  INFINITY = "INFINITY",       // infinity, inf
  EULER = "EULER",             // e
  
  // ===================================================================
  // ===================================================================
  // Category 8: Syntax Highlighting Tokens (v2.7.0)
  // Purpose: Preserving whitespace and comments for high-fidelity processing
  // ===================================================================
  COMMENT = "COMMENT",         // // or /* ... */
  WHITESPACE = "WHITESPACE",   // spaces, tabs, newlines

  EOF = "EOF"                  // End of file
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export interface TokenizerOptions {
  includeWhitespace?: boolean;
}

export class Tokenizer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private options: TokenizerOptions;

  constructor(input: string, options: TokenizerOptions = {}) {
    this.input = input;
    this.options = options;
  }

  tokenize(): Token[] {
    // Prevent DoS attacks with excessively large inputs
    const MAX_INPUT_SIZE = 10 * 1024 * 1024; // 10MB
    if (this.input.length > MAX_INPUT_SIZE) {
      throw new Error(`Input exceeds maximum size of ${MAX_INPUT_SIZE} bytes (${Math.round(this.input.length / 1024 / 1024)}MB provided)`);
    }

    const tokens: Token[] = [];
    while (this.position < this.input.length) {
      const char = this.peek();

      if (/\s/.test(char)) {
        if (this.options.includeWhitespace) {
            tokens.push(this.scanWhitespace());
        } else {
            this.advance();
        }
        continue;
      }

      // Handle comments
      if (char === '/') {
        if (this.peek(1) === '/') {
          // Single-line comment
          if (this.options.includeWhitespace) {
              tokens.push(this.scanSingleLineComment());
              continue;
          }
          this.advance(); // consume first '/'
          this.advance(); // consume second '/'
          while (this.peek() !== '\n' && !this.isAtEnd()) {
            this.advance();
          }
          continue;
        } else if (this.peek(1) === '*') {
          // Block comment
          if (this.options.includeWhitespace) {
              tokens.push(this.scanBlockComment());
              continue;
          }
           const startLine = this.line;
           const startColumn = this.column;
           this.advance(); // consume '/'
           this.advance(); // consume '*'
           let terminated = false;
           while (!this.isAtEnd()) {
             if (this.peek() === '*' && this.peek(1) === '/') {
               this.advance(); // consume '*'
               this.advance(); // consume '/'
               terminated = true;
               break;
             }
             if (this.peek() === '\n') {
               this.line++;
               this.column = 0;
             }
             this.advance();
           }
           if (!terminated) {
             throw new Error(`Unterminated block comment starting at line ${startLine}, column ${startColumn}`);
           }
           continue;
        } else {
            // Division operator or just slash?
            // Fall through to default handling if not a comment start
            // But wait, / is also DIVIDE. The original code threw error here?
            // Original code: } else { throw new Error(...) }
            // Let's check Category 6: DIVIDE tokens.
            // Wait, looking at original code line 191: throw new Error(`Unexpected character: ${char} ...`)
            // Ah, DIVIDE is handled? No, only comment logic was in that block.
            // Wait, down below line 298 there is no '/' handling.
            // Wait, looking at original file...
            // line 99: DIVIDE = "DIVIDE",
            // The logic for DIVIDE seems missing in the original big `if/else if` chain I saw?
            // Re-reading original file...
            // It seems the original code treated `/` ONLY as start of comment or error!
            // Wait, line 99 defines DIVIDE.
            // But the tokenizer loop at line 157 handles `/`.
            // If it's not `//` or `/*`, it throws "Unexpected character".
            // So DIVIDE `/` token was NOT implemented/reachable in the previous tokenizer??
            // That's a bug in existing tokenizer if true.
            // Example: `10 / 2` -> `char` is `/`, `peek(1)` is ` ` -> throws error!
            // I should fix this while I am here.
            // If it's not a comment, push DIVIDE token.
             tokens.push(this.createToken(TokenType.DIVIDE, "/"));
             this.advance();
             continue;
        }
      }

      if (char === '>') {
        if (this.peek(1) === '=') {
          tokens.push(this.createToken(TokenType.GTE, ">="));
          this.advance(); this.advance();
        } else {
          tokens.push(this.createToken(TokenType.GT, ">"));
          this.advance();
        }
    } else if (char === '<') {
        // Disambiguate <Concept> vs < (LT) vs <= (LTE)
        if (this.peek(1) === '=') {
            tokens.push(this.createToken(TokenType.LTE, "<="));
            this.advance(); this.advance();
        } else if (/\s/.test(this.peek(1))) {
            // Space after < means operator: < 10
            tokens.push(this.createToken(TokenType.LT, "<"));
            this.advance();
        } else {
             // Ambiguous: <10, <Concept>, <variable
             // Look ahead for CLOSING > without intervening whitespace to detect Concept
             let isConcept = false;
             let p = 1;
             // Bound lookahead to prevent perf issues
             while (p < 256) { 
                 const c = this.peek(p);
                 if (c === '>') { isConcept = true; break; }
                 if (c === '' || c === '\n' || /\s/.test(c)) break;
                 // Concepts shouldn't contain other structural chars
                 if (['[', '{', '(', ')', ']', '='].includes(c)) break;
                 p++;
             }
             
             if (isConcept) {
                 tokens.push(this.scanConcept());
             } else {
                 tokens.push(this.createToken(TokenType.LT, "<"));
                 this.advance();
             }
        }
      } else if (char === '=') {
        if (this.peek(1) === '=') {
             tokens.push(this.createToken(TokenType.EQ, "=="));
             this.advance(); this.advance();
        } else {
             tokens.push(this.createToken(TokenType.ASSIGN, "="));
             this.advance();
        }
      } else if (char === '#') {
        if (this.peek(1) === '#') {
           tokens.push(this.scanSequenceNumber());
        } else {
           tokens.push(this.scanDirective()); 
        }

      } else if (char === '!') {
        if (this.peek(1) === '=') {
             tokens.push(this.createToken(TokenType.NEQ, "!="));
             this.advance(); this.advance();
        } else {
             tokens.push(this.scanIntent());
        }
      } else if (char === '[') {
        // Disambiguate List vs Relation
        // Heuristic: Lists contain separators (,) or complex types (<, {, ", $, [, etc.)
        let isList = false;
        let p = this.position + 1;
        while (p < this.input.length) {
            const c = this.input[p];
            if (c === ']') break; // End of bracket
            if (c === '\n') break; // Newline - probably error or end
            if (c === ',' || c === '<' || c === '{' || c === '(' || c === '$' || c === '"' || c === '[') {
                isList = true;
                break; // Definitive list indicator
            }
            p++;
        }
        
        if (isList) {
             tokens.push(this.createToken(TokenType.SYMBOL, "["));
             this.advance();
        } else {
             tokens.push(this.scanRelation());
        }
      } else if (char === '-') {
        // Hyphen or arrow symbol
        if (this.peek(1) === '>') {
          tokens.push(this.createToken(TokenType.SYMBOL, "->"));
          this.advance(); this.advance();
        } else {
          tokens.push(this.createToken(TokenType.MINUS, "-"));
          this.advance();
        }
      } else if (char === '+') {
        tokens.push(this.createToken(TokenType.PLUS, "+"));
        this.advance();
      } else if (char === '*') {
        tokens.push(this.createToken(TokenType.MULTIPLY, "*"));
        this.advance();
      } else if (char === '%') {
        tokens.push(this.createToken(TokenType.MODULO, "%"));
        this.advance();
      } else if (char === '^') {
        tokens.push(this.createToken(TokenType.POWER, "^"));
        this.advance();
      } else if (char === '$') {
        // Check for $$ (group identifier) or $ (identifier)
        if (this.peek(1) === '$') {
          tokens.push(this.scanGroupIdentifier());
        } else {
          tokens.push(this.scanIdMarker());
        }
      } else if (char === '~') {
        // Check for ~~ (entropy) or ~ (temperature)
        if (this.peek(1) === '~') {
          tokens.push(this.scanEntropy());
        } else {
          tokens.push(this.scanTemperature());
        }
      } else if (char === '@') {
        // Check for @coherence:, @version:, @origin:, @cite: before @confidence
        const nextChars = this.input.substring(this.position, this.position + 12);
        if (nextChars.startsWith('@coherence:')) {
          tokens.push(this.scanCoherenceMarker());
        } else if (nextChars.startsWith('@version:')) {
          tokens.push(this.scanVersionMarker());
        } else if (nextChars.startsWith('@origin:')) {
          tokens.push(this.scanOriginMarker());
        } else if (nextChars.startsWith('@cite:')) {
          tokens.push(this.scanCiteMarker());
        } else {
          tokens.push(this.scanConfidence());
        }
      } else if (char === '"') {
        tokens.push(this.scanString());
      } else if (/[0-9]/.test(char)) {
        tokens.push(this.scanNumber());
      } else if (/[a-zA-Z_]/.test(char)) {
        tokens.push(this.scanIdentifier());
      } else {
        // Symbols
        if (['{', '}', '(', ')', ':', '|', ',', '&', ']'].includes(char)) {
            tokens.push(this.createToken(TokenType.SYMBOL, char));
            this.advance();
        } else {
            throw new Error(`Unexpected character: ${char} at line ${this.line}, column ${this.column}`);
        }
      }
    }
    tokens.push(this.createToken(TokenType.EOF, ""));
    return tokens;
  }

  private scanIntent(): Token {
    const startLine = this.line;
    const startCol = this.column;
    let value = this.advance(); // consume '!'
    while (/[a-zA-Z0-9_]/.test(this.peek())) {
      value += this.advance();
    }
    
    return { type: TokenType.INTENT, value, line: startLine, column: startCol };
  }

  private scanDirective(): Token {
    const startLine = this.line;
    const startCol = this.column;
    let value = this.advance(); // consume '#'
    
    // Check for #example: and #example_pattern: markers (v2.2.0)
    const nextChars = '#' + this.input.slice(this.position, this.position + 20);
    if (nextChars.startsWith('#example_pattern:')) {
      while (this.peek() !== ':' && !this.isAtEnd()) {
        value += this.advance();
      }
      if (this.peek() === ':') {
        value += this.advance(); // consume ':'
      }
      return { type: TokenType.EXAMPLE_PATTERN, value, line: startLine, column: startCol };
    } else if (nextChars.startsWith('#example:')) {
      while (this.peek() !== ':' && !this.isAtEnd()) {
        value += this.advance();
      }
      if (this.peek() === ':') {
        value += this.advance(); // consume ':'
      }
      return { type: TokenType.EXAMPLE_MARKER, value, line: startLine, column: startCol };
    }
    
    while (/[a-zA-Z0-9_]/.test(this.peek())) {
      value += this.advance();
    }
    
    return { type: TokenType.DIRECTIVE, value, line: startLine, column: startCol };
  }

  private scanIdMarker(): Token {
    // $id:xyz or $identifier
    const startLine = this.line;
    const startCol = this.column;
    let value = this.advance(); // consume '$'
    while (/[a-zA-Z0-9_:]/.test(this.peek())) {
      value += this.advance();
    }
    return { type: TokenType.ID_MARKER, value, line: startLine, column: startCol };
  }

  private scanGroupIdentifier(): Token {
    // $$group:xyz or $$groupId
    const startLine = this.line;
    const startCol = this.column;
    let value = this.advance(); // consume '$'
    value += this.advance(); // consume second '$'
    while (/[a-zA-Z0-9_:]/.test(this.peek())) {
      value += this.advance();
    }
    return { type: TokenType.GROUP_ID, value, line: startLine, column: startCol };
  }

  private scanSequenceNumber(): Token {
    // ##seq:1 or ##1
    const startLine = this.line;
    const startCol = this.column;
    let value = this.advance(); // consume '#'
    value += this.advance(); // consume second '#'
    while (/[a-zA-Z0-9_:]/.test(this.peek())) {
      value += this.advance();
    }
    return { type: TokenType.SEQ_NUM, value, line: startLine, column: startCol };
  }

  private scanTemperature(): Token {
    // ~temp:0.7 or ~0.7
    const startLine = this.line;
    const startCol = this.column;
    let value = this.advance(); // consume '~'
    while (/[a-zA-Z0-9_:.]/.test(this.peek())) {
      value += this.advance();
    }
    return { type: TokenType.TEMPERATURE, value, line: startLine, column: startCol };
  }

  private scanEntropy(): Token {
    // ~~entropy:0.5 or ~~0.5
    const startLine = this.line;
    const startCol = this.column;
    let value = this.advance(); // consume '~'
    value += this.advance(); // consume second '~'
    while (/[a-zA-Z0-9_:.]/.test(this.peek())) {
      value += this.advance();
    }
    return { type: TokenType.ENTROPY, value, line: startLine, column: startCol };
  }

  private scanConcept(): Token {
    const startLine = this.line;
    const startCol = this.column;
    let value = this.advance(); // consume '<'
    while (this.peek() !== '>' && this.peek() !== '') {
      value += this.advance();
    }
    if (this.peek() === '>') {
      value += this.advance(); // consume '>'
    } else {
        throw new Error("Unterminated concept");
    }
    return { type: TokenType.CONCEPT, value, line: startLine, column: startCol };
  }

  private scanRelation(): Token {
    // New syntax: [is_suited_for]
    const startLine = this.line;
    const startCol = this.column;
    let value = this.advance(); // consume '['
    
    while (this.peek() !== ']' && this.peek() !== '') {
        value += this.advance();
    }
    
    if (this.peek() === ']') {
        value += this.advance(); // consume ']'
    } else {
         throw new Error("Unterminated relation bracket");
    }
    
    return { type: TokenType.RELATION, value, line: startLine, column: startCol };
  }

  private scanConfidence(): Token {
      const startLine = this.line;
      const startCol = this.column;
      let value = this.advance(); // consume '@'
      while (/[0-9.]/.test(this.peek())) {
          value += this.advance();
      }
      return { type: TokenType.CONFIDENCE, value, line: startLine, column: startCol };
  }

  private scanCoherenceMarker(): Token {
    // @coherence:0.95
    const startLine = this.line;
    const startCol = this.column;
    let value = '';
    // Consume "@coherence:"
    while (this.peek() !== ':' && !this.isAtEnd()) {
      value += this.advance();
    }
    if (this.peek() === ':') {
      value += this.advance(); // consume ':'
    }
    // Now read the numeric value
    while (!this.isAtEnd() && /[0-9.]/.test(this.peek())) {
      value += this.advance();
    }
    return { type: TokenType.COHERENCE, value, line: startLine, column: startCol };
  }

  private scanVersionMarker(): Token {
    // @version:"0.3.0" or @version:"x.y.z"
    const startLine = this.line;
    const startCol = this.column;
    let value = '';
    // Consume "@version:"
    while (this.peek() !== ':' && !this.isAtEnd()) {
      value += this.advance();
    }
    if (this.peek() === ':') {
      value += this.advance(); // consume ':'
    }
    // Now read the value - if it starts with quote, read until matching quote
    if (this.peek() === '"') {
      value += this.advance(); // consume opening quote
      while (this.peek() !== '"' && !this.isAtEnd()) {
        if (this.peek() === '\\') {
          value += this.advance(); // escape character
        }
        value += this.advance();
      }
      if (this.peek() === '"') {
        value += this.advance(); // consume closing quote
      }
    } else {
      // Read identifier without quotes
      while (!this.isAtEnd() && !(/\s/.test(this.peek())) && this.peek() !== '!' && this.peek() !== '@' && this.peek() !== '$' && this.peek() !== '#' && this.peek() !== '~' && this.peek() !== '<' && this.peek() !== '{') {
        value += this.advance();
      }
    }
    return { type: TokenType.VERSION_MARKER, value, line: startLine, column: startCol };
  }

  private scanOriginMarker(): Token {
    // @origin:"doi:10.1234" or @origin:"url"
    const startLine = this.line;
    const startCol = this.column;
    let value = '';
    // Consume "@origin:"
    while (this.peek() !== ':' && !this.isAtEnd()) {
      value += this.advance();
    }
    if (this.peek() === ':') {
      value += this.advance(); // consume ':'
    }
    // Now read the value - if it starts with quote, read until matching quote
    if (this.peek() === '"') {
      value += this.advance(); // consume opening quote
      while (this.peek() !== '"' && !this.isAtEnd()) {
        if (this.peek() === '\\') {
          value += this.advance(); // escape character
        }
        value += this.advance();
      }
      if (this.peek() === '"') {
        value += this.advance(); // consume closing quote
      }
    } else {
      // Read identifier without quotes
      while (!this.isAtEnd() && !(/\s/.test(this.peek())) && this.peek() !== '!' && this.peek() !== '@' && this.peek() !== '$' && this.peek() !== '#' && this.peek() !== '~' && this.peek() !== '<' && this.peek() !== '{') {
        value += this.advance();
      }
    }
    return { type: TokenType.ORIGIN_MARKER, value, line: startLine, column: startCol };
  }

  private scanCiteMarker(): Token {
    // @cite:"ref" or @cite:["a","b","c"]
    const startLine = this.line;
    const startCol = this.column;
    let value = '';
    // Consume "@cite:"
    while (this.peek() !== ':' && !this.isAtEnd()) {
      value += this.advance();
    }
    if (this.peek() === ':') {
      value += this.advance(); // consume ':'
    }
    // Now read the value - could be a string or array
    // Handle arrays: @cite:["a","b"]
    if (this.peek() === '[') {
      let bracketDepth = 0;
      do {
        const char = this.peek();
        if (char === '[') bracketDepth++;
        if (char === ']') bracketDepth--;
        value += this.advance();
      } while (bracketDepth > 0 && !this.isAtEnd());
    } else {
      // Single value (string or identifier)
      while (!this.isAtEnd() && !(/\s/.test(this.peek())) && this.peek() !== '!' && this.peek() !== '@' && this.peek() !== '$' && this.peek() !== '#' && this.peek() !== '~' && this.peek() !== '<' && this.peek() !== '{') {
        value += this.advance();
      }
    }
    return { type: TokenType.CITE_MARKER, value, line: startLine, column: startCol };
  }

  private scanString(): Token {
    const startLine = this.line;
    const startCol = this.column;
    let value = this.advance(); // consume '"'
    while (this.peek() !== '"' && this.peek() !== '') {
      if (this.peek() === '\\') {
          value += this.advance(); // escape
      }
      value += this.advance();
    }
    if (this.peek() === '"') {
      value += this.advance();
    } else {
        throw new Error("Unterminated string");
    }
    return { type: TokenType.STRING, value, line: startLine, column: startCol };
  }

  private scanNumber(): Token {
      const startLine = this.line;
      const startCol = this.column;
      let value = "";
      while (/[0-9.]/.test(this.peek())) {
          value += this.advance();
      }
      
      // Check for scientific notation (v2.6.5 fix)
      if (this.peek().toLowerCase() === 'e') {
          // Verify it's actually separate from next token (check if 'e' is followed by digit/sign)
          const next = this.peek(1);
          if (/[0-9+-]/.test(next)) {
             value += this.advance(); // consume 'e'
             if (this.peek() === '+' || this.peek() === '-') {
                value += this.advance(); // consume sign
             }
             while (/[0-9]/.test(this.peek())) {
                value += this.advance();
             }
          }
      }

      return { type: TokenType.NUMBER, value, line: startLine, column: startCol };
  }

  private scanIdentifier(): Token {
      const startLine = this.line;
      const startCol = this.column;
      let value = "";
      while (/[a-zA-Z0-9_]/.test(this.peek())) {
          value += this.advance();
      }
      
      // Check for logical keywords (v2.0.0)
      const keywords: Record<string, TokenType> = {
        'and': TokenType.AND,
        'or': TokenType.OR,
        'not': TokenType.NOT,
        'implies': TokenType.IMPLIES,
        'iff': TokenType.IFF,
        'forall': TokenType.FORALL,
        'exists': TokenType.EXISTS,
        'proves': TokenType.PROVES,
        'entails': TokenType.ENTAILS,
        'in': TokenType.IN,
        'then': TokenType.THEN,
        'true': TokenType.TRUE,
        'false': TokenType.FALSE,
        // Math keywords (v2.1.0)

        'union': TokenType.UNION,
        'intersect': TokenType.INTERSECT,
        'lambda': TokenType.LAMBDA,
        'sum': TokenType.SUMMATION,
        'integral': TokenType.INTEGRAL,
        'pi': TokenType.PI,
        'infinity': TokenType.INFINITY,
        'inf': TokenType.INFINITY,
        'e': TokenType.EULER
      };
      
      const lowerValue = value.toLowerCase();
      if (keywords[lowerValue]) {
        return { type: keywords[lowerValue], value: lowerValue, line: startLine, column: startCol };
      }
      
      return { type: TokenType.IDENTIFIER, value, line: startLine, column: startCol };
  }

  private scanWhitespace(): Token {
    const startLine = this.line;
    const startCol = this.column;
    let value = "";
    while (/\s/.test(this.peek()) && !this.isAtEnd()) {
        value += this.advance();
    }
    return { type: TokenType.WHITESPACE, value, line: startLine, column: startCol };
  }

  private scanSingleLineComment(): Token {
    const startLine = this.line;
    const startCol = this.column;
    let value = this.advance(); // consume first '/'
    value += this.advance(); // consume second '/'
    
    while (this.peek() !== '\n' && !this.isAtEnd()) {
        value += this.advance();
    }
    return { type: TokenType.COMMENT, value, line: startLine, column: startCol };
  }

  private scanBlockComment(): Token {
    const startLine = this.line;
    const startCol = this.column;
    let value = this.advance(); // consume '/'
    value += this.advance(); // consume '*'
    
    let terminated = false;
    while (!this.isAtEnd()) {
        if (this.peek() === '*' && this.peek(1) === '/') {
            value += this.advance(); // consume '*'
            value += this.advance(); // consume '/'
            terminated = true;
            break;
        }
        if (this.peek() === '\n') {
           // line/col tracking is handled by advance()
        }
        value += this.advance();
    }
    
    if (!terminated) {
         throw new Error(`Unterminated block comment starting at line ${startLine}, column ${startCol}`);
    }
    
    return { type: TokenType.COMMENT, value, line: startLine, column: startCol };
  }

  private peek(offset: number = 0): string {
    if (this.position + offset >= this.input.length) return '';
    return this.input[this.position + offset];
  }

  private advance(): string {
    const char = this.input[this.position++];
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  private createToken(type: TokenType, value: string): Token {
    return { type, value, line: this.line, column: this.column - value.length };
  }

  private isAtEnd(): boolean {
    return this.position >= this.input.length;
  }
}

/**
 * Token Category Utilities (v2.0.1)
 * 
 * Helper functions for checking token categories. Useful for parser validation,
 * error messages, and semantic analysis.
 */

// Category 1: Core Syntax Tokens
export function isCoreSyntaxToken(type: TokenType): boolean {
  return [
    TokenType.INTENT,
    TokenType.CONCEPT,
    TokenType.RELATION,
    TokenType.CONFIDENCE,
    TokenType.DIRECTIVE
  ].includes(type);
}

// Category 2: Statement Metadata Markers
export function isStatementMetadata(type: TokenType): boolean {
  return [
    TokenType.ID_MARKER,
    TokenType.GROUP_ID,
    TokenType.SEQ_NUM,
    TokenType.TEMPERATURE,
    TokenType.ENTROPY
  ].includes(type);
}

// Category 3: Provenance Metadata
export function isProvenanceMetadata(type: TokenType): boolean {
  return [
    TokenType.VERSION_MARKER,
    TokenType.ORIGIN_MARKER,
    TokenType.CITE_MARKER
  ].includes(type);
}

// Category 4: Logic & Reasoning Tokens
export function isLogicOperator(type: TokenType): boolean {
  return [
    TokenType.AND,
    TokenType.OR,
    TokenType.NOT,
    TokenType.IMPLIES,
    TokenType.IFF
  ].includes(type);
}

export function isQuantifier(type: TokenType): boolean {
  return [
    TokenType.FORALL,
    TokenType.EXISTS
  ].includes(type);
}

export function isProofOperator(type: TokenType): boolean {
  return [
    TokenType.PROVES,
    TokenType.ENTAILS
  ].includes(type);
}

export function isLogicKeyword(type: TokenType): boolean {
  return [
    TokenType.IN,
    TokenType.THEN,
    TokenType.TRUE,
    TokenType.FALSE
  ].includes(type);
}

export function isLogicToken(type: TokenType): boolean {
  return isLogicOperator(type) || isQuantifier(type) || isProofOperator(type) || isLogicKeyword(type);
}

// Category 5: Primitive Types
export function isPrimitiveType(type: TokenType): boolean {
  return [
    TokenType.STRING,
    TokenType.NUMBER,
    TokenType.IDENTIFIER,
    TokenType.SYMBOL
  ].includes(type);
}

// Category 6: Mathematical Tokens
export function isMathToken(type: TokenType): boolean {
  return [
    TokenType.PLUS, TokenType.MINUS, TokenType.MULTIPLY, TokenType.DIVIDE,
    TokenType.POWER, TokenType.MODULO, TokenType.ASSIGN,
    TokenType.UNION, TokenType.INTERSECT, TokenType.LAMBDA, 
    TokenType.SUMMATION, TokenType.INTEGRAL,
    TokenType.PI, TokenType.INFINITY, TokenType.EULER
  ].includes(type);
}

// Composite category checkers
export function isMetadataToken(type: TokenType): boolean {
  return isStatementMetadata(type) || isProvenanceMetadata(type);
}

export function isKeyword(type: TokenType): boolean {
  return isLogicToken(type) || 
         [TokenType.UNION, TokenType.INTERSECT, TokenType.LAMBDA, TokenType.SUMMATION, TokenType.INTEGRAL].includes(type);
}

/**
 * Get human-readable category name for a token type.
 * Useful for error messages and debugging.
 */
export function getTokenCategory(type: TokenType): string {
  if (isCoreSyntaxToken(type)) return "Core Syntax";
  if (isStatementMetadata(type)) return "Statement Metadata";
  if (isProvenanceMetadata(type)) return "Provenance Metadata";
  if (isLogicOperator(type)) return "Logic Operator";
  if (isQuantifier(type)) return "Quantifier";
  if (isProofOperator(type)) return "Proof Operator";
  if (isLogicKeyword(type)) return "Logic Keyword";
  if (isMathToken(type)) return "Math Token";
  if (isPrimitiveType(type)) return "Primitive Type";
  if (type === TokenType.EOF) return "Control Token";
  return "Unknown";
}
