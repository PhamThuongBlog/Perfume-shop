#!/bin/sh
set -e

echo "========================================="
echo "  AURA SIGNATURE - Docker Entrypoint"
echo "========================================="

# Wait for MongoDB to be ready (including replica set init)
echo "[1/4] Waiting for MongoDB replica set..."
MAX_RETRIES=40
RETRY=0
until node -e "
  var PrismaClient = require('@prisma/client').PrismaClient;
  var p = new PrismaClient();
  p.\$connect().then(function() { console.log('DB OK'); process.exit(0); }).catch(function() { process.exit(1); });
" 2>/dev/null; do
  RETRY=$((RETRY + 1))
  if [ $RETRY -ge $MAX_RETRIES ]; then
    echo "  WARNING: MongoDB not ready, starting anyway..."
    break
  fi
  echo "  MongoDB not ready yet ($RETRY/$MAX_RETRIES)..."
  sleep 3
done

# Regenerate Prisma client with current DATABASE_URL
echo "[2/4] Regenerating Prisma client..."
npx prisma generate 2>/dev/null || echo "  (client already generated)"

# Run database seed only if FIRST_RUN is true
if [ "$FIRST_RUN" = "true" ]; then
  echo "[3/4] Seeding database (first run)..."
  npx tsx prisma/seed-full.ts 2>&1 || echo "  Full seed had issues, continuing..."
  npx tsx prisma/seed-categories.ts 2>&1 || echo "  Categories seed had issues, continuing..."
  echo "  Database seeded!"
else
  echo "[3/4] Skipping seed (FIRST_RUN is not 'true' = $FIRST_RUN)"
fi

echo "[4/4] Starting AURA Signature..."
echo "  http://localhost:3000"
echo "========================================="

exec "$@"
