---
description: Build and Verify Docker Images for AIQL
---

This workflow builds and tests the Docker containers for the AIQL ecosystem (API, CLI, Playground).

## Prerequisites
- Docker Desktop or Engine installed and running
- Current directory is the repository root (`aiql-core`)

## Build Steps

### 1. Build API Service
// turbo
docker build -t aiql/api:latest -f docker/api.Dockerfile .

### 2. Build CLI Tool
// turbo
docker build -t aiql/cli:latest -f docker/cli.Dockerfile .

### 3. Build Playground Environment
// turbo
docker build -t aiql/playground:latest -f docker/playground.Dockerfile .

## Verification

### 4. Verify Images Existence
// turbo
docker images | grep aiql

### 5. Test CLI Image (Help)
// turbo
docker run --rm aiql/cli:latest --help

### 6. Test API Image (Health Check)
# Note: This runs in background, you might need to stop it manually
# docker run -d -p 3000:3000 --name aiql-api-test aiql/api:latest
# curl http://localhost:3000/api/v1/health
# docker stop aiql-api-test && docker rm aiql-api-test
