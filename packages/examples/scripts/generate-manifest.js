import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PKG_FILE = path.resolve(__dirname, '../package.json');
const SRC_DIR = path.resolve(__dirname, '../src');
const OUTPUT_FILE = path.resolve(__dirname, '../dist/examples.json');

// Get version
const pkg = JSON.parse(fs.readFileSync(PKG_FILE, 'utf-8'));
const version = pkg.version;

const CATEGORY_MAP = {
    "getting-started": "🚀 Getting Started",
    "temporal-tenses": "⏰ Temporal Tenses",
    "affective-computing": "💝 Affective Computing",
    "metadata-organization": "📋 Metadata & Organization",
    "security-cryptography": "🔐 Security & Cryptography",
    "data-processing": "📊 Data Processing",
    "logic-reasoning": "🧠 Logic & Reasoning",
    "formal-verification": "✅ Formal Verification",
    "advanced-features": "🎯 Advanced Features",
    "mathematics-physics": "🔬 Mathematics & Physics"
};

const CATEGORY_ORDER = [
    "getting-started",
    "temporal-tenses",
    "affective-computing",
    "metadata-organization",
    "security-cryptography",
    "data-processing",
    "logic-reasoning",
    "formal-verification",
    "mathematics-physics",
    "advanced-features"
];

function generate() {
    console.log('Generating examples manifest...');

    if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
        fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    }

    const categories = [];

    for (const catKey of CATEGORY_ORDER) {
        const catDir = path.join(SRC_DIR, catKey);
        if (!fs.existsSync(catDir)) continue;

        const files = fs.readdirSync(catDir).filter(f => f.endsWith('.aiql'));
        if (files.length === 0) continue;

        const examples = [];
        for (const file of files) {
            const content = fs.readFileSync(path.join(catDir, file), 'utf8');
            
            // Extract Label logic
            const firstLine = content.split('\n')[0];
            let label = '';
            
            if (firstLine.trim().startsWith('//')) {
                label = firstLine.replace(/^\/\/\s*/, '').trim();
            } else {
                 label = file.replace(/-/g, ' ').replace('.aiql', '');
                 label = label.charAt(0).toUpperCase() + label.slice(1);
            }

            label = label.replace(/\(v\d+(\.\d+)*\)/g, '').trim();
            label = label.replace(/^v\d+(?:\.\d+)*\s+/, '');

            examples.push({
                label: label,
                code: content,
                path: `${catKey}/${file}`
            });
        }
        
        // Sort by label
        examples.sort((a,b) => a.label.localeCompare(b.label));

        categories.push({
            category: CATEGORY_MAP[catKey] || catKey,
            examples: examples
        });
    }

    const output = {
        version: version,
        categories: categories
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`Generated dist/examples.json v${version} with ${categories.length} categories.`);
}

generate();
