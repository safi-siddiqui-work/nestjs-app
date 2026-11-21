import { z } from 'zod';

export const appConfigSchema = z.object({
  PORT: z.coerce.number().default(3001),
  OBSERVE_APP_KEY: z.string(),
  OBSERVE_APP_SECRET: z.string(),
  DATABASE_NEON_URL: z.string(),
  // NODE_ENV: z
  //   .enum(['development', 'production', 'test', 'provision'])
  //   .default('development'),
});

export type AppConfigType = z.infer<typeof appConfigSchema>;

export const AppConfig: () => AppConfigType = (): AppConfigType => ({
  PORT: parseInt(process?.env?.PORT ?? '', 10) || 3001,
  OBSERVE_APP_KEY: process?.env?.OBSERVE_APP_KEY ?? '',
  OBSERVE_APP_SECRET: process?.env?.OBSERVE_APP_SECRET ?? '',
  DATABASE_NEON_URL: process?.env?.DATABASE_NEON_URL ?? '',
});
