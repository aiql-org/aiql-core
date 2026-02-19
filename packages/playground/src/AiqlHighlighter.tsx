import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tokenizer, TokenType, Token } from '@aiql-org/core';

interface AiqlHighlighterProps {
  code: string;
  className?: string;
}

const TOKEN_STYLES: Partial<Record<TokenType, string>> = {
  [TokenType.INTENT]: 'text-purple-400 font-bold',
  [TokenType.CONCEPT]: 'text-blue-400 font-bold',
  [TokenType.RELATION]: 'text-green-400 italic',
  [TokenType.CONFIDENCE]: 'text-teal-300 font-bold',
  [TokenType.DIRECTIVE]: 'text-pink-400 font-bold',
  [TokenType.STRING]: 'text-yellow-300',
  [TokenType.NUMBER]: 'text-orange-300',
  [TokenType.IDENTIFIER]: 'text-gray-300',
  [TokenType.SYMBOL]: 'text-gray-500',
  [TokenType.COMMENT]: 'text-gray-500 italic',
  [TokenType.WHITESPACE]: '',
  [TokenType.AND]: 'text-red-400 font-bold',
  [TokenType.OR]: 'text-red-400 font-bold',
  [TokenType.NOT]: 'text-red-400 font-bold',
  [TokenType.IMPLIES]: 'text-red-400 font-bold',
  [TokenType.IFF]: 'text-red-400 font-bold',
  [TokenType.FORALL]: 'text-red-400 font-bold',
  [TokenType.EXISTS]: 'text-red-400 font-bold',
  [TokenType.PROVES]: 'text-red-400 font-bold',
  [TokenType.ENTAILS]: 'text-red-400 font-bold',
  [TokenType.IN]: 'text-red-400 font-bold',
  [TokenType.THEN]: 'text-red-400 font-bold',
  [TokenType.TRUE]: 'text-orange-400 font-bold',
  [TokenType.FALSE]: 'text-orange-400 font-bold',
  [TokenType.EOF]: '',
};

const TOKEN_HINTS: Partial<Record<TokenType, string>> = {
  [TokenType.INTENT]: 'Goal-oriented statement (!Query, !Assert, !Task)',
  [TokenType.CONCEPT]: 'Semantic entity (<Entity>)',
  [TokenType.RELATION]: 'Relationship edge ([relation])',
  [TokenType.CONFIDENCE]: 'Probability score (@0.0-1.0)',
  [TokenType.DIRECTIVE]: 'Instruction (#sign, #encrypt)',
  [TokenType.STRING]: 'Text literal',
  [TokenType.NUMBER]: 'Numeric value',
  [TokenType.IDENTIFIER]: 'Variable or name',
  [TokenType.SYMBOL]: 'Syntax delimiter',
  [TokenType.COMMENT]: 'Comment',
  [TokenType.AND]: 'Logical AND',
  [TokenType.OR]: 'Logical OR',
  [TokenType.NOT]: 'Logical NOT',
  [TokenType.IMPLIES]: 'Logical Implication',
  [TokenType.IFF]: 'Logical Equivalence',
  [TokenType.FORALL]: 'Universal Quantifier',
  [TokenType.EXISTS]: 'Existential Quantifier',
  [TokenType.PROVES]: 'Proves Relationship',
  [TokenType.ENTAILS]: 'Entails Relationship',
  [TokenType.IN]: 'Set Membership',
  [TokenType.THEN]: 'Consequence',
  [TokenType.FALSE]: 'Boolean False',
};

const Tooltip = ({ text }: { text: string }) => (
  // Portal could be used here for better positioning, but simple absolute is okay for now
  // provided the parent has relative positioning context and enough space.
  // Actually, let's use fixed positioning based on mouse/element coordinates if possible,
  // or just simple absolute relative to the token.
  // For simplicity and robustness within the scrollable area, let's try absolute relative to the token first.
  // BUT the token is an inline span.
  // Let's us a simple strategy: Tooltip is a sibling or child.
  // Child is easiest for positioning relative to token.
  <motion.div
    initial={{ opacity: 0, y: 5, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 5, scale: 0.9 }}
    transition={{ duration: 0.1 }}
    className="absolute z-50 bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 border border-purple-500/30 text-xs text-purple-200 rounded shadow-xl whitespace-nowrap pointer-events-none"
  >
    {text}
    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
  </motion.div>
);

export const AiqlHighlighter: React.FC<AiqlHighlighterProps> = ({ code, className }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const tokens = useMemo(() => {
    try {
      const tokenizer = new Tokenizer(code, { includeWhitespace: true });
      return tokenizer.tokenize();
    } catch {
      // Fallback for tokenizer errors (incomplete input)
      // We try to tokenize up to the error, or just return the text as IDENTIFIER
      // A robust highlighter would try to recover, but for now simple fallback is safer
      // to avoid crashing the view.
      // However, if we just return text, we lose formatting if whitespace is gone?
      // No, we can just return a single token with the full text.
      return [{ type: TokenType.IDENTIFIER, value: code, line: 0, column: 0 }] as Token[];
    }
  }, [code]);

  return (
    <div className={`font-mono text-sm leading-relaxed whitespace-pre-wrap break-all ${className}`} aria-hidden="true">
      {tokens.map((token, i) => {
         const hint = TOKEN_HINTS[token.type];
         const isHovered = hoveredIndex === i;
         
         return (
            <span 
              key={i} 
              className={`${TOKEN_STYLES[token.type] || 'text-gray-300'} relative inline`}
              onMouseEnter={() => hint && setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {token.value}
              <AnimatePresence>
                {isHovered && hint && (
                    <Tooltip text={hint} />
                )}
              </AnimatePresence>
            </span>
         );
      })}
      <br />
    </div>
  );
};
