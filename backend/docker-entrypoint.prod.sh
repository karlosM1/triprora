#!/bin/sh
set -e

echo "Applying database schema..."
# db push matches this project's schema workflow. Switch to
# `npx prisma migrate deploy` once you adopt Prisma migrations.
npx prisma db push --skip-generate

echo "Starting API server..."
exec node dist/index.js
