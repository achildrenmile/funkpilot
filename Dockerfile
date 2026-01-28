# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/tsconfig.json ./server/

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build frontend
RUN npm run build

# Build server
RUN npx tsc -p server/tsconfig.json

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

# Create non-root user and set permissions
RUN addgroup -g 1001 -S funkpilot && \
    adduser -S funkpilot -u 1001 -G funkpilot && \
    chmod +x /app/docker-entrypoint.sh && \
    chown -R funkpilot:funkpilot /app
USER funkpilot

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "dist-server/index.js"]
