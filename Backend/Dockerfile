# Backend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with npm
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production --legacy-peer-deps

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8017

# Health check - use wget for simpler and more reliable check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
    CMD wget --spider -q http://localhost:8017/api/v1/health || exit 1

# Start application
CMD ["node", "dist/server.js"]
