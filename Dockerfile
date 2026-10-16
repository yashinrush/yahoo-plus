# ==========================================
# Multi-Stage Production Dockerfile: Yahoo Pulse
# ==========================================

# 1. Base Node environment
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

# 2. Build Frontend (Client)
FROM base AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# 3. Build Backend (Server)
FROM base AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
COPY server/prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY server/ ./
RUN npm run build

# 4. Production Runner
FROM base AS runner
WORKDIR /app/server
ENV NODE_ENV=production
ENV PORT=5000

# Copy server production dependencies and built artifacts
COPY server/package*.json ./
COPY server/prisma ./prisma/
RUN npm ci --omit=dev
RUN npx prisma generate

COPY --from=server-builder /app/server/dist ./dist
COPY --from=client-builder /app/client/dist /app/client/dist

# Expose port
EXPOSE 5000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "dist/server.js"]
