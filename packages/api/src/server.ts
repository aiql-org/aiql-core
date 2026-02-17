import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Tokenizer, Parser, Transpiler } from '@aiql-org/core';

type TranspilationTarget = 'python' | 'json' | 'yaml' | 'sql' | 'coq' | 'lean';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '2.6.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// List supported formats endpoint
app.get('/api/v1/formats', (req, res) => {
  res.json({
    formats: [
      {
        name: 'json',
        description: 'JSON - Complete AST interchange format',
        mimeType: 'application/json'
      },
      {
        name: 'yaml',
        description: 'YAML - Human-readable structured format',
        mimeType: 'application/x-yaml'
      },
      {
        name: 'python',
        description: 'Python - Relation() function calls with metadata',
        mimeType: 'text/x-python'
      },
      {
        name: 'sql',
        description: 'SQL - Storage schema + query examples',
        mimeType: 'application/sql'
      },
      {
        name: 'coq',
        description: 'Coq - Gallina specification language (ASCII operators)',
        mimeType: 'text/x-coq'
      },
      {
        name: 'lean',
        description: 'Lean - Lean 4 theorem prover (Unicode operators)',
        mimeType: 'text/x-lean'
      }
    ]
  });
});

// Parse endpoint
app.post('/api/v1/parse', (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Field "code" is required and must be a string'
      });
    }
    
    if (code.length > 100000) {
      return res.status(413).json({
        error: 'Payload Too Large',
        message: 'Code must be less than 100KB'
      });
    }
    
    const tokenizer = new Tokenizer(code);
    const tokens = tokenizer.tokenize();
    
    const parser = new Parser(tokens);
    const ast = parser.parse();
    
    res.json({
      ast,
      metadata: {
        tokenCount: tokens.length,
        statementCount: ast.body.length,
        version: ast.version
      }
    });
  } catch (error) {
    console.error('Parse error:', error);
    res.status(400).json({
      error: 'Parse Error',
      message: error instanceof Error ? error.message : 'Unknown parsing error'
    });
  }
});

// Transpile endpoint
app.post('/api/v1/transpile', (req, res) => {
  try {
    const { code, target } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Field "code" is required and must be a string'
      });
    }
    
    if (!target || typeof target !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Field "target" is required and must be a string'
      });
    }
    
    const validTargets = ['python', 'json', 'yaml', 'sql', 'coq', 'lean'];
    const normalizedTarget = target.toLowerCase();
    
    if (!validTargets.includes(normalizedTarget)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Invalid target "${target}". Valid targets: ${validTargets.join(', ')}`
      });
    }
    
    if (code.length > 100000) {
      return res.status(413).json({
        error: 'Payload Too Large',
        message: 'Code must be less than 100KB'
      });
    }
    
    const tokenizer = new Tokenizer(code);
    const tokens = tokenizer.tokenize();
    
    const parser = new Parser(tokens);
    const ast = parser.parse();
    
    const transpiler = new Transpiler();
    const output = transpiler.transpile(ast, normalizedTarget as TranspilationTarget);
    
    res.json({
      output,
      metadata: {
        target: normalizedTarget,
        tokenCount: tokens.length,
        statementCount: ast.body.length,
        outputSize: output.length
      }
    });
  } catch (error) {
    console.error('Transpilation error:', error);
    res.status(400).json({
      error: 'Transpilation Error',
      message: error instanceof Error ? error.message : 'Unknown transpilation error'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AIQL API server running on http://localhost:${PORT}`);
  console.log(`📚 API documentation: http://localhost:${PORT}/api/v1/formats`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/v1/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
