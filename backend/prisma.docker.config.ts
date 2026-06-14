import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'prisma/config'

const root = path.dirname(fileURLToPath(import.meta.url))
const localDatabaseUrl =
  'postgresql://triprora:triprora@localhost:5433/triprora?schema=public'

process.env.DATABASE_URL ??= localDatabaseUrl
process.env.DIRECT_URL ??= localDatabaseUrl

export default defineConfig({
  schema: path.join(root, 'prisma', 'schema.prisma'),
  migrations: {
    path: path.join(root, 'prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: localDatabaseUrl,
    directUrl: localDatabaseUrl,
  },
})
