---
description: Build Docker images for API, CLI, and Playground
---

This workflow builds the Docker containers for the AIQL ecosystem.

1. Build the API service image
// turbo
2. docker build -t aiql/api -f docker/api.Dockerfile .

3. Build the CLI tool image
// turbo
4. docker build -t aiql/cli -f docker/cli.Dockerfile .

5. Build the Playground image
// turbo
6. docker build -t aiql/playground -f docker/playground.Dockerfile .

7. Verify images were created
// turbo
8. docker images | grep aiql
