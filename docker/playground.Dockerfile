# AIQL Playground — Interactive Docker container
#
# A pre-configured environment with CLI, examples, and AIQL tools
# for developers to explore and experiment with AIQL transpilation.
#
# Usage:
#   docker build -f docker/playground.Dockerfile -t aiql/playground:latest .
#   docker run -it --rm aiql/playground
#   docker run -it --rm -v $(pwd)/my-examples:/workspace aiql/playground

# ============================================================================
# Stage 1: Builder
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /build

COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY eslint.config.mjs ./
COPY packages/ ./packages/

RUN npm ci
RUN npm run build

# ============================================================================
# Stage 2: Playground Runtime
# ============================================================================
FROM node:20-alpine AS runtime

LABEL maintainer="AIQL Contributors"
LABEL description="AIQL Playground - Interactive environment for AIQL transpilation"
LABEL version="2.6.0"
LABEL org.opencontainers.image.source="https://github.com/aiql-org/aiql-core"

WORKDIR /playground

# Copy package manifests
COPY --from=builder /build/package.json ./
COPY --from=builder /build/packages/core/package.json ./packages/core/
COPY --from=builder /build/packages/soul/package.json ./packages/soul/
COPY --from=builder /build/packages/utils/package.json ./packages/utils/
COPY --from=builder /build/packages/cli/package.json ./packages/cli/

# Install production dependencies
RUN npm ci --omit=dev --workspaces 2>/dev/null || npm install --omit=dev

# Copy built artifacts
COPY --from=builder /build/packages/core/dist/ ./packages/core/dist/
COPY --from=builder /build/packages/soul/dist/ ./packages/soul/dist/
COPY --from=builder /build/packages/utils/dist/ ./packages/utils/dist/
COPY --from=builder /build/packages/cli/dist/ ./packages/cli/dist/

# Copy all examples
# Copy all examples
COPY packages/examples/src/ ./examples/

# Create CLI symlink
RUN ln -s /playground/packages/cli/dist/cli.js /usr/local/bin/aiql && \
    chmod +x /playground/packages/cli/dist/cli.js

# Create workspace for user files
RUN mkdir -p /workspace

# Add welcome script
RUN echo '#!/bin/sh' > /usr/local/bin/welcome && \
    echo 'echo ""' >> /usr/local/bin/welcome && \
    echo 'echo "╔══════════════════════════════════════════════════════════╗"' >> /usr/local/bin/welcome && \
    echo 'echo "║  🧠 AIQL Playground v2.6.0                              ║"' >> /usr/local/bin/welcome && \
    echo 'echo "║                                                          ║"' >> /usr/local/bin/welcome && \
    echo 'echo "║  Transpile AIQL to: Python, JSON, YAML, SQL, Coq, Lean  ║"' >> /usr/local/bin/welcome && \
    echo 'echo "║                                                          ║"' >> /usr/local/bin/welcome && \
    echo 'echo "║  Quick Start:                                            ║"' >> /usr/local/bin/welcome && \
    echo 'echo "║    aiql formats                    # list targets        ║"' >> /usr/local/bin/welcome && \
    echo 'echo "║    aiql parse examples/getting-started/query*.aiql       ║"' >> /usr/local/bin/welcome && \
    echo 'echo "║    aiql transpile FILE -t python   # transpile           ║"' >> /usr/local/bin/welcome && \
    echo 'echo "║    ls examples/                    # browse examples     ║"' >> /usr/local/bin/welcome && \
    echo 'echo "║                                                          ║"' >> /usr/local/bin/welcome && \
    echo 'echo "║  Docs: https://aiql.org | GitHub: aiql-org/aiql-core      ║"' >> /usr/local/bin/welcome && \
    echo 'echo "╚══════════════════════════════════════════════════════════╝"' >> /usr/local/bin/welcome && \
    echo 'echo ""' >> /usr/local/bin/welcome && \
    echo 'exec /bin/sh' >> /usr/local/bin/welcome && \
    chmod +x /usr/local/bin/welcome

WORKDIR /workspace

ENTRYPOINT []
CMD ["welcome"]
