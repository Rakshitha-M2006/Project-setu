# ==============================================================================
# PROJECT SETU - Frontend Production Multi-Stage Dockerfile
# Node.js 20 Alpine Linux (Build) -> NGINX 1.25 Alpine Linux (Serve)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build React SPA
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for Vite environment variables
ARG VITE_API_BASE_URL="/api/v1"
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Serve Static Assets with NGINX
# ------------------------------------------------------------------------------
FROM nginx:1.25-alpine AS runner

# Remove default NGINX configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom production NGINX config
COPY nginx.conf /etc/nginx/conf.d/setu.conf

# Copy static build output from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
