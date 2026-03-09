# Build args
ARG BUN_VERSION=1.3.5
# Base stage  
FROM oven/bun:${BUN_VERSION}-slim as base
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Dependencies
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/*/package.json ./packages/*/
RUN bun install
# Build stage
FROM base AS builder
COPY . .
# Build da aplicação NestJS
RUN cd apps/api && bun run build
# Production stage
FROM oven/bun:${BUN_VERSION} AS production
WORKDIR /app

# Copy package files for dependency installation
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/*/package.json ./packages/*/

# Install production dependencies
RUN bun install

# Copy built application
COPY --from=builder --chown=1001:1001 /app/apps/api/dist ./apps/api/dist
# Health check
COPY --from=builder /app/infra/docker/api/health-check.js ./health-check.js
RUN groupadd -r -g 1001 nodejs && useradd -r -u 1001 -g nodejs api
USER api
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node health-check.js
EXPOSE 3333
# Usar runtime em vez de compile  
CMD ["bun", "run", "apps/api/dist/src/main.js"]
