const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const examplesDir = path.join(process.cwd(), 'examples');
const cliPath = path.join(process.cwd(), 'packages/cli/dist/cli.js');

let totalFiles = 0;
let passedFiles = 0;
let failedFiles = 0;

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
       if (file !== 'transpiler-output') {
         walk(filePath);
       }
    } else if (path.extname(file) === '.aiql') {
      totalFiles++;
      try {
        // Run CLI transpilation (using json target as it's the most basic AST check)
        execSync(`node "${cliPath}" transpile "${filePath}" --target json`, { stdio: 'ignore' });
        passedFiles++;
        process.stdout.write('.');
      } catch {
        failedFiles++;
        console.error(`\n❌ Failed: ${filePath}`);
      }
    }
  }
}

console.log('Verifying AIQL examples...');
walk(examplesDir);
console.log(`\n\nVerified ${totalFiles} examples.`);
console.log(`✅ Passed: ${passedFiles}`);
console.log(`❌ Failed: ${failedFiles}`);

if (failedFiles > 0) {
  process.exit(1);
}
