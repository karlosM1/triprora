#!/bin/sh
set -e

echo "Generating Prisma client..."
npx prisma generate

echo "Applying database schema..."
npx prisma db push

if [ "$SEED_RESET" = "true" ]; then
  echo "Seeding database (SEED_RESET=true)..."
  npx prisma db seed
else
  echo "Skipping seed (set SEED_RESET=true to run)."
fi

echo "Starting API server..."
exec npx tsx watch src/index.ts
