# @aiql-org/api

> **AIQL REST API Service** — Dockerized microservice for parsing and transpilation.

This package provides a production-ready Express server that exposes AIQL compiler functionality via HTTP endpoints. It is designed to be run as a containerized service.

## 🚀 Quick Start (Docker)

```bash
docker run -p 3000:3000 aiql/api
```

## 📡 API Endpoints

### `POST /api/v1/transpile`

Transpile AIQL source code to a target format.

**Request Body:**
```json
{
  "code": "!Assert { <AI> [learns] <Math> }",
  "target": "python",
  "validate": true
}
```

**Response:**
```json
{
  "output": "class AI:\n    def learns(self, target):\n        ...",
  "metadata": {
    "tokenCount": 7,
    "statementCount": 1,
    "target": "python"
  }
}
```

### `POST /api/v1/parse`

Parse AIQL source code and return the raw AST.

**Request Body:**
```json
{
  "code": "!Query { <Subject> [relation] <Object> }"
}
```

**Response:**
```json
{
  "type": "Program",
  "body": [ ... ]
}
```

### `GET /api/v1/health`

Health check endpoint for container orchestration.

**Response:**
```json
{
  "status": "healthy",
  "version": "2.6.0",
  "uptime": 123.45
}
```

## 🛠 Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
npm start
```

## License

MIT
