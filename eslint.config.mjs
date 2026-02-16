const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**']
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  },
  {
    files: ['scripts/**/*.js', 'eslint.config.mjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off'
    }
  }
);
