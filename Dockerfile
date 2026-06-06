# ============================================================================
# Multi-stage build for TaxMate Next.js application
# ============================================================================

# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy production dependencies
RUN cp -R node_modules /prod_node_modules && \
    npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and node_modules from deps stage
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy production dependencies from deps stage
COPY --from=deps /prod_node_modules ./node_modules

# Copy .next build from builder stage
COPY --from=builder /app/.next ./.next

# Copy public files
COPY --from=builder /app/public ./public

# Copy package.json
COPY --from=builder /app/package.json ./

# Set ownership to nextjs user
RUN chown -R nextjs:nodejs /app

# Switch to nextjs user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variable for Next.js
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["node_modules/.bin/next", "start"]

# ============================================================================
# DOCKERFILE OPTIMIZATION NOTES:
# ============================================================================
#
# 1. Multi-stage builds reduce final image size
#   - Stage 1 (deps): Install both production and dev dependencies
#   - Stage 2 (builder): Build Next.js application
#   - Stage 3 (runner): Production image with only production deps
#
# 2. Security improvements:
#   - Run as non-root user (nextjs:1001)
#   - Minimal Alpine Linux base image
#   - No development tools in production image
#
# 3. Performance optimizations:
#   - Leverage Docker layer caching
#   - Copy only necessary files
#   - Health checks for container orchestration
#
# ============================================================================
