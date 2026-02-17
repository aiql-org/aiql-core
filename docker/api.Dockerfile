# Multi-stage Dockerfile for AIQL REST API
#
# Usage:
#   docker build -f docker/api.Dockerfile -t aiql/api:latest .
#   docker run -p 3000:3000 aiql/api
#
# Multi-platform:
#   docker buildx build --platform linux/amd64,linux/arm64 -f docker/api.Dockerfile -t aiql/api:latest .

# ============================================================================
# Stage 1: Builder
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /build

COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY packages/ ./packages/

RUN npm ci
RUN npm run build

# Verify
RUN ls -la packages/core/dist/ && \
    ls -la packages/soul/dist/ && \
    ls -la packages/api/dist/

# ============================================================================
# Stage 2: Runtime — API server
# ============================================================================
FROM node:20-alpine AS runtime

LABEL maintainer="AIQL Contributors"
LABEL description="AIQL REST API - HTTP transpilation service"
LABEL version="2.6.0"
LABEL org.opencontainers.image.source="https://github.com/aiql-org/aiql-core"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Copy package manifests
COPY --from=builder /build/package.json ./
COPY --from=builder /build/packages/core/package.json ./packages/core/
COPY --from=builder /build/packages/soul/package.json ./packages/soul/
COPY --from=builder /build/packages/api/package.json ./packages/api/

# Install production dependencies
RUN npm ci --omit=dev --workspaces 2>/dev/null || npm install --omit=dev

# Copy built artifacts
COPY --from=builder /build/packages/core/dist/ ./packages/core/dist/
COPY --from=builder /build/packages/soul/dist/ ./packages/soul/dist/
COPY --from=builder /build/packages/api/dist/ ./packages/api/dist/

# Expose API port
EXPOSE 3000

# Non-root for security
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Start server
CMD ["node", "packages/api/dist/server.js"]
