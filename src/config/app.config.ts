export type AppConfigType = {
  port?: number;
  observeAppKey?: string;
  observeAppSecret?: string;
  databaseNeonUrl?: string;
};

export const AppConfig: () => AppConfigType = (): AppConfigType => ({
  port: parseInt(process?.env?.PORT ?? '', 10) || 3001,
  observeAppKey: process?.env?.OBSERVE_APP_KEY,
  observeAppSecret: process?.env?.OBSERVE_APP_SECRET,
  databaseNeonUrl: process?.env?.DATABASE_NEON_URL ?? '',
});
