/**
 * @aiql-org/utils - Shared utilities for the AIQL SDK
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { resolve, extname, basename } from 'path';

/** Read an AIQL source file and return its contents */
export function readAiqlFile(filePath: string): string {
  const resolvedPath = resolve(filePath);
  return readFileSync(resolvedPath, 'utf-8');
}

/** Write transpiled output to a file */
export function writeOutput(filePath: string, content: string): void {
  const resolvedPath = resolve(filePath);
  writeFileSync(resolvedPath, content, 'utf-8');
}

/** Discover all .aiql files in a directory (recursive) */
export function discoverAiqlFiles(dirPath: string): string[] {
  const results: string[] = [];
  const resolvedDir = resolve(dirPath);

  function walk(dir: string): void {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = resolve(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (extname(entry) === '.aiql') {
        results.push(fullPath);
      }
    }
  }

  walk(resolvedDir);
  return results.sort();
}

/** Get the target file extension for a transpilation target */
export function getTargetExtension(target: string): string {
  const extensions: Record<string, string> = {
    python: '.py',
    json: '.json',
    yaml: '.yaml',
    sql: '.sql',
    coq: '.v',
    lean: '.lean',
  };
  return extensions[target.toLowerCase()] || '.txt';
}

/** Format a transpilation target name for display */
export function formatTargetName(target: string): string {
  const names: Record<string, string> = {
    python: 'Python',
    json: 'JSON',
    yaml: 'YAML',
    sql: 'SQL',
    coq: 'Coq (Gallina)',
    lean: 'Lean 4',
  };
  return names[target.toLowerCase()] || target;
}

/** List all supported transpilation targets */
export const SUPPORTED_TARGETS = ['python', 'json', 'yaml', 'sql', 'coq', 'lean'] as const;
export type TranspilationTarget = (typeof SUPPORTED_TARGETS)[number];

/** AIQL SDK version */
export const SDK_VERSION = '2.6.0';

/** Generate output filename from input and target */
export function generateOutputFilename(inputPath: string, target: string): string {
  const base = basename(inputPath, extname(inputPath));
  return `${base}${getTargetExtension(target)}`;
}
