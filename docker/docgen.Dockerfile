# Dockerfile for AIQL DocGen
#
# Usage:
#   docker build -f docker/docgen.Dockerfile -t aiql/docgen:latest .
#

# ============================================================================
# Stage 1: Builder & Tester
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /build

# Copy root workspace files
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY eslint.config.mjs ./

# Copy all package directories (source + configs)
COPY packages/ ./packages/

# Install all dependencies
RUN npm ci

# Build all packages 
RUN npm run build

# Run DocGen tests to verify
RUN npm test -w packages/docgen

# ============================================================================
# Stage 2: Runtime (Optional - for isolated usage)
# ============================================================================
FROM node:20-alpine AS runtime

LABEL maintainer="AIQL Contributors"
LABEL description="AIQL DocGen - Documentation Generator"

WORKDIR /app

# Copy package manifests
COPY --from=builder /build/package.json ./
COPY --from=builder /build/packages/core/package.json ./packages/core/
COPY --from=builder /build/packages/docgen/package.json ./packages/docgen/

# Install production dependencies
RUN npm ci --omit=dev --workspaces 2>/dev/null || npm install --omit=dev

# Copy built artifacts
COPY --from=builder /build/packages/core/dist/ ./packages/core/dist/
COPY --from=builder /build/packages/docgen/dist/ ./packages/docgen/dist/

# Use a simple entrypoint if needed, or just sleep (this image is mostly for verification)
CMD ["node", "-e", "console.log('AIQL DocGen verify complete')"]
