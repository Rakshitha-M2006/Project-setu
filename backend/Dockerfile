# ==============================================================================
# PROJECT SETU - Backend API Production Multi-Stage Dockerfile
# Node.js 20 Alpine Linux
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Dependencies
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools needed for native dependencies if any
RUN apk add --no-cache python3 make g++

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy source code and Prisma schema
COPY tsconfig.json ./
COPY src ./src/

# Generate Prisma Client & Compile TypeScript to JavaScript
RUN npm run prisma:generate
RUN npm run build

# Prune devDependencies to keep image lean
RUN npm prune --production

# ------------------------------------------------------------------------------
# Stage 2: Minimal Production Runtime
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install OpenSSL for Prisma engine binary compatibility
RUN apk add --no-cache openssl dumb-init curl

# Create non-root system user for security
RUN addgroup -g 1001 -S setugroup && \
    adduser -S setuuser -u 1001 -G setugroup

# Copy built application & production dependencies from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Create upload directory with proper ownership
RUN mkdir -p /app/uploads && chown -R setuuser:setugroup /app

USER setuuser

EXPOSE 5000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/server.js"]
