# ==========================================
# Frontend Production Multi-Stage Dockerfile
# ==========================================

# Stage 1: Build static assets with Node.js
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
RUN npm ci

# Copy client source code
COPY . .

# Build production bundle with Vite
RUN npm run build

# Stage 2: Serve optimized assets with Nginx
FROM nginx:alpine AS runner

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built distribution from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
