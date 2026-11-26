import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/common/databases/drizzle.database.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_NEON_URL ?? 'NONE',
  },
});
