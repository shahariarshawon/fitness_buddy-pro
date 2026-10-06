# ==========================================
# Backend Production Dockerfile
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install dependencies first for Docker layer caching
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source code
COPY . .

# Use non-root user for security
USER node

EXPOSE 5000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/api/v1/health || exit 1

CMD ["npm", "start"]
