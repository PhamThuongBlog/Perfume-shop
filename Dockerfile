# ============================================================
# AURA SIGNATURE - Docker Image
# Multi-stage build: deps → build → production runner
# ============================================================

# ---- Stage 1: Builder ----
FROM node:22-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV PRISMA_BINARY_TARGETS="linux-musl-openssl-3.0.x,debian-openssl-3.0.x"
ENV DATABASE_URL="mongodb://placeholder:27017/perfume-shop?replicaSet=rs0"
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Clear build-time DATABASE_URL so runtime env var takes effect
ENV DATABASE_URL=""

# ---- Stage 2: Runner ----
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy FULL node_modules from builder (needed for bcryptjs, tsx during seed)
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Copy built Next.js standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy package.json so npx tsx can find dependencies
COPY --from=builder /app/package.json ./

# Entrypoint
COPY scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh
RUN chmod +x ./scripts/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
CMD ["node", "server.js"]
