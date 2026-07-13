#!/bin/sh
set -e

# Client is generated at image build; only regenerate if missing.
if [ ! -d /app/node_modules/.prisma/client ] && [ ! -d node_modules/.prisma/client ]; then
  echo "Prisma client missing — generating..."
  npx prisma generate
else
  echo "Prisma client present — skipping generate."
fi

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
