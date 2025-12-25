# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Accept build arguments
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage - Nginx
FROM nginx:alpine

# Copy built files from builder - outDir is configured as 'build' in vite.config.js
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001

# Expose port
EXPOSE 80

# Health check - check if nginx can serve index.html
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=5 \
    CMD wget --spider -q http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
