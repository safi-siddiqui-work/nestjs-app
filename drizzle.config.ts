import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/databases/drizzle.database.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_NEON_URL ?? 'NONE',
  },
});
