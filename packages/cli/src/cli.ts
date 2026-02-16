#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { Tokenizer, Parser, Transpiler } from '@aiql-org/core';

type TranspilationTarget = 'python' | 'json' | 'yaml' | 'sql' | 'coq' | 'lean';

const program = new Command();

program
  .name('aiql')
  .description('AIQL CLI - Parse and transpile AIQL code to multiple formats')
  .version('2.6.0');

program
  .command('parse')
  .description('Parse AIQL code and display the Abstract Syntax Tree (AST)')
  .argument('<file>', 'AIQL source file to parse')
  .option('-o, --output <file>', 'Output file for AST (JSON format)')
  .option('-p, --pretty', 'Pretty-print JSON output', true)
  .action(async (file: string, options: { output?: string; pretty: boolean }) => {
    try {
      const filePath = resolve(file);
      const code = readFileSync(filePath, 'utf-8');
      
      console.error(chalk.blue(`Parsing ${file}...`));
      
      const tokenizer = new Tokenizer(code);
      const tokens = tokenizer.tokenize();
      
      const parser = new Parser(tokens);
      const ast = parser.parse();
      
      const jsonOutput = options.pretty 
        ? JSON.stringify(ast, null, 2)
        : JSON.stringify(ast);
      
      if (options.output) {
        const outputPath = resolve(options.output);
        writeFileSync(outputPath, jsonOutput);
        console.error(chalk.green(`✓ AST written to ${outputPath}`));
      } else {
        console.log(jsonOutput);
      }
      
      console.error(chalk.green(`✓ Parsed successfully (${tokens.length} tokens)`));
    } catch (error) {
      console.error(chalk.red('✗ Parse error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('transpile')
  .description('Parse AIQL code and transpile to target format')
  .argument('<file>', 'AIQL source file to transpile')
  .requiredOption('-t, --target <format>', 'Target format: python, json, yaml, sql, coq, lean')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .option('--validate', 'Validate syntax before transpiling', false)
  .action(async (file: string, options: { target: string; output?: string; validate: boolean }) => {
    try {
      const filePath = resolve(file);
      const code = readFileSync(filePath, 'utf-8');
      
      const validTargets = ['python', 'json', 'yaml', 'sql', 'coq', 'lean'];
      const target = options.target.toLowerCase();
      
      if (!validTargets.includes(target)) {
        console.error(chalk.red(`✗ Invalid target: ${options.target}`));
        console.error(chalk.yellow(`Valid targets: ${validTargets.join(', ')}`));
        process.exit(1);
      }
      
      console.error(chalk.blue(`Transpiling ${file} to ${target}...`));
      
      if (options.validate) {
        console.error(chalk.blue('Validating syntax...'));
      }
      
      const tokenizer = new Tokenizer(code);
      const tokens = tokenizer.tokenize();
      
      const parser = new Parser(tokens);
      const ast = parser.parse();
      
      const transpiler = new Transpiler();
      const output = transpiler.transpile(ast, target as TranspilationTarget);
      
      if (options.output) {
        const outputPath = resolve(options.output);
        writeFileSync(outputPath, output);
        console.error(chalk.green(`✓ Transpiled to ${outputPath}`));
      } else {
        console.log(output);
      }
      
      console.error(chalk.green(`✓ Transpilation successful`));
    } catch (error) {
      console.error(chalk.red('✗ Transpilation error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('formats')
  .description('List all supported transpilation formats')
  .action(() => {
    console.log(chalk.bold('Supported Transpilation Formats:\n'));
    
    const formats = [
      { name: 'json', description: 'JSON - Complete AST interchange format' },
      { name: 'yaml', description: 'YAML - Human-readable structured format' },
      { name: 'python', description: 'Python - Relation() function calls with metadata' },
      { name: 'sql', description: 'SQL - Storage schema + query examples' },
      { name: 'coq', description: 'Coq - Gallina specification language (ASCII operators)' },
      { name: 'lean', description: 'Lean - Lean 4 theorem prover (Unicode operators)' }
    ];
    
    formats.forEach(format => {
      console.log(chalk.green(`  ${format.name.padEnd(10)}`), format.description);
    });
    
    console.log(chalk.dim('\nExample usage:'));
    console.log(chalk.dim('  aiql transpile example.aiql --target python'));
  });

program
  .command('validate')
  .description('Validate AIQL syntax without transpiling')
  .argument('<file>', 'AIQL source file to validate')
  .action(async (file: string) => {
    try {
      const filePath = resolve(file);
      const code = readFileSync(filePath, 'utf-8');
      
      console.log(chalk.blue(`Validating ${file}...`));
      
      const tokenizer = new Tokenizer(code);
      const tokens = tokenizer.tokenize();
      
      const parser = new Parser(tokens);
      parser.parse();
      
      console.log(chalk.green(`✓ Valid AIQL syntax (${tokens.length} tokens)`));
    } catch (error) {
      console.error(chalk.red('✗ Syntax error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Global error handler
process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('✗ Unhandled error:'), reason);
  process.exit(1);
});

if (require.main === module) {
  program.parse();
}

