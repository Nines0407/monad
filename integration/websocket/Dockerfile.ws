# WebSocket API Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
# Copy shared dependency
COPY shared ../shared

# Install dependencies
RUN npm config set registry https://registry.npmmirror.com && npm install

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Copy shared dependencies
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/@agent-pay/shared ./node_modules/@agent-pay/shared

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const WebSocket = require('ws'); const ws = new WebSocket('ws://localhost:3002'); ws.on('open', () => {ws.close(); process.exit(0)}); ws.on('error', () => process.exit(1)); setTimeout(() => process.exit(1), 2000);"

# Expose port
EXPOSE 3002

# Start command
CMD ["node", "dist/index.js"]