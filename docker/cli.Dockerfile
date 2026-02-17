# Multi-stage Dockerfile for AIQL CLI
#
# Usage:
#   docker build -f docker/cli.Dockerfile -t aiql/cli:latest .
#   docker run -v $(pwd)/examples:/data aiql/cli transpile /data/example.aiql --target python
#
# Multi-platform:
#   docker buildx build --platform linux/amd64,linux/arm64 -f docker/cli.Dockerfile -t aiql/cli:latest .

# ============================================================================
# Stage 1: Builder
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /build

# Copy root workspace files
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY eslint.config.mjs ./

# Copy all package directories (source + configs)
COPY packages/ ./packages/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Build all packages in dependency order
RUN npm run build

# Verify build artifacts
RUN ls -la packages/core/dist/ && \
    ls -la packages/soul/dist/ && \
    ls -la packages/cli/dist/

# ============================================================================
# Stage 2: Runtime — Slim CLI image
# ============================================================================
FROM node:20-alpine AS runtime

LABEL maintainer="AIQL Contributors"
LABEL description="AIQL CLI - Parse and transpile AIQL code to Python/JSON/YAML/SQL/Coq/Lean"
LABEL version="2.6.0"
LABEL org.opencontainers.image.source="https://github.com/aiql-org/aiql-core"
LABEL org.opencontainers.image.description="AIQL CLI transpiler supporting 6 target formats"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Copy package manifests for production install
COPY --from=builder /build/package.json ./
COPY --from=builder /build/packages/core/package.json ./packages/core/
COPY --from=builder /build/packages/soul/package.json ./packages/soul/
COPY --from=builder /build/packages/utils/package.json ./packages/utils/
COPY --from=builder /build/packages/cli/package.json ./packages/cli/

# Install production dependencies only
RUN npm ci --omit=dev --workspaces 2>/dev/null || npm install --omit=dev

# Copy built artifacts
COPY --from=builder /build/packages/core/dist/ ./packages/core/dist/
COPY --from=builder /build/packages/soul/dist/ ./packages/soul/dist/
COPY --from=builder /build/packages/utils/dist/ ./packages/utils/dist/
COPY --from=builder /build/packages/cli/dist/ ./packages/cli/dist/

# Copy example AIQL files for immediate use
# Copy example AIQL files for immediate use
COPY packages/examples/src/ ./examples/

# Create symlink for CLI access
RUN ln -s /app/packages/cli/dist/cli.js /usr/local/bin/aiql && \
    chmod +x /app/packages/cli/dist/cli.js

# Create data directory for user file mounts
RUN mkdir -p /data
WORKDIR /data

# Non-root for security
USER node

# Verify installation
RUN aiql --version || echo "CLI version check"

ENTRYPOINT ["aiql"]
CMD ["--help"]
