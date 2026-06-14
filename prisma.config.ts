import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, env } from 'prisma/config'

const root = path.dirname(fileURLToPath(import.meta.url))
const backendRoot = path.join(root, 'backend')

try {
  process.loadEnvFile(path.join(backendRoot, '.env'))
} catch {
  // optional when DATABASE_URL is already in the environment
}

export default defineConfig({
  schema: path.join(backendRoot, 'prisma', 'schema.prisma'),
  migrations: {
    path: path.join(backendRoot, 'prisma', 'migrations'),
    seed: 'tsx backend/prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
    directUrl: env('DIRECT_URL'),
  },
})
