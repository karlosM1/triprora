import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, env } from 'prisma/config'

const root = path.dirname(fileURLToPath(import.meta.url))

try {
  process.loadEnvFile(path.join(root, '.env'))
} catch {
  // .env is optional when DATABASE_URL is set (e.g. Docker Compose)
}

export default defineConfig({
  schema: path.join(root, 'prisma', 'schema.prisma'),
  migrations: {
    path: path.join(root, 'prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
    directUrl: env('DIRECT_URL'),
  },
})
