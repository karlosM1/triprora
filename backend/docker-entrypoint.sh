#!/bin/sh
set -e

echo "Applying database schema..."
npx prisma db push

echo "Seeding database..."
npx prisma db seed

echo "Starting API server..."
exec npx tsx watch src/index.ts
