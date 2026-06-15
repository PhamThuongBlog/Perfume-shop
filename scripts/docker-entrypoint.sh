#!/bin/sh
set -e

echo "========================================="
echo "  AURA SIGNATURE - Docker Entrypoint"
echo "========================================="

# Wait for MongoDB to be ready
echo "[1/4] Waiting for MongoDB..."
MAX_RETRIES=30
RETRY=0
until node -e "
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient();
  p.\$connect().then(() => { console.log('DB OK'); process.exit(0); }).catch(() => { process.exit(1); });
" 2>/dev/null; do
  RETRY=$((RETRY + 1))
  if [ $RETRY -ge $MAX_RETRIES ]; then
    echo "  WARNING: MongoDB not available after ${MAX_RETRIES} retries, starting anyway..."
    break
  fi
  echo "  MongoDB not ready yet (attempt $RETRY/$MAX_RETRIES)..."
  sleep 3
done

# Generate Prisma client
echo "[2/4] Generating Prisma client..."
npx prisma generate --no-engine 2>/dev/null || echo "  (client already generated)"

# Run database seed only if FIRST_RUN is set
if [ "$FIRST_RUN" = "true" ]; then
  echo "[3/4] Seeding database (first run)..."
  npx tsx prisma/seed-full.ts 2>/dev/null || echo "  Seed skipped (DB may already have data)"
  npx tsx prisma/seed-categories.ts 2>/dev/null || echo "  Category seed skipped"
  echo "  Database seeded!"
else
  echo "[3/4] Skipping seed (FIRST_RUN not set)"
fi

echo "[4/4] Starting AURA Signature..."
echo "  http://localhost:3000"
echo "========================================="

exec "$@"
