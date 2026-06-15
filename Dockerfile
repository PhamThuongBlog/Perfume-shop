# ============================================================
# AURA SIGNATURE - Docker Image
# Multi-stage build: deps → build → production runner
# Uses Debian-based Node (not Alpine) for Prisma OpenSSL compat
# ============================================================

# ---- Stage 1: Builder ----
FROM node:22-slim AS builder
WORKDIR /app

# Install OpenSSL for Prisma engines
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Generate Prisma client
ENV PRISMA_BINARY_TARGETS="linux-musl-openssl-3.0.x,debian-openssl-3.0.x"
RUN npx prisma generate

# Build Next.js (standalone mode)
# DATABASE_URL is not needed at build time because DB pages use force-dynamic
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Stage 2: Runner ----
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Install OpenSSL for Prisma runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy Prisma schema + generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Copy built Next.js standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy entrypoint
COPY scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh
RUN chmod +x ./scripts/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
CMD ["node", "server.js"]
