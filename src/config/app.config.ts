import { z } from 'zod';

const nodeEnvSchema = z
  .enum(['development', 'production', 'test', 'provision'])
  .default('development');
type nodeEnvType = z.infer<typeof nodeEnvSchema>;

export const appConfigSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: nodeEnvSchema,
  OBSERVE_APP_KEY: z.string(),
  OBSERVE_APP_SECRET: z.string(),
  DATABASE_NEON_URL: z.string(),
  OUTBOX_RELAY: z.string(),
  RESEND_API_KEY: z.string(),
  RESEND_EMAIL_FROM: z.string(),
});

export type AppConfigType = z.infer<typeof appConfigSchema>;

export const AppConfig: () => AppConfigType = (): AppConfigType => ({
  PORT: parseInt(process?.env?.PORT ?? '', 10) || 3001,
  NODE_ENV: (process?.env?.NODE_ENV as nodeEnvType) ?? 'development',
  OBSERVE_APP_KEY: process?.env?.OBSERVE_APP_KEY ?? '',
  OBSERVE_APP_SECRET: process?.env?.OBSERVE_APP_SECRET ?? '',
  DATABASE_NEON_URL: process?.env?.DATABASE_NEON_URL ?? '',
  OUTBOX_RELAY: process?.env?.OUTBOX_RELAY ?? '',
  RESEND_API_KEY: process?.env?.RESEND_API_KEY ?? '',
  RESEND_EMAIL_FROM: process?.env?.RESEND_EMAIL_FROM ?? '',
});
