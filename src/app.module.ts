import { AuthenticationModule } from '@nestjs/authentication';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DrizzleModule, getDrizzleToken } from '@nestjs/drizzle';
import { FileTemplateEngine, MailModule, ResendTransport } from '@nestjs/mail';
import { createObserveModule } from '@nestjs/observe';
import { OutboxModule, OutboxStorage } from '@nestjs/outbox';
import { fromDrizzle, PostgresOutboxStore } from '@nestjs/outbox/postgres';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { join } from 'node:path';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import {
  AppConfig,
  appConfigSchema,
  AppConfigType,
} from './config/app.config.js';
import { DatabaseType, relations } from './databases/drizzle.database.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { TodosModule } from './modules/todos/todos.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [AppConfig],
      validationSchema: appConfigSchema,
    }),
    // ObserveModule.forRoot({
    //   appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
    //   appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
    //   serviceId: 'nestjs-app',
    // }),
    DrizzleModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfigType>) => ({
        drizzle,
        connection: configService?.getOrThrow('DATABASE_NEON_URL'),
        relations,
      }),
    }),
    OutboxModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfigType>) => ({
        relay: {
          enabled: configService?.getOrThrow('OUTBOX_RELAY') !== 'off',
          // pollInterval: '1s',
          // lease: '30s',
          // publishTimeout: '10s',
        },
        retry: {
          attempts: 10,
          backoff: {
            delay: '10s',
            maxDelay: '10m',
          },
        },
      }),
    }),
    MailModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfigType>) => ({
        transport: new ResendTransport({
          apiKey: configService?.getOrThrow('RESEND_API_KEY'),
        }),
        // Development
        // transport: new FileMailTransport({
        //   directory: 'var/email',
        // }),
        templates: new FileTemplateEngine({
          dir: join(import.meta.dirname, 'mail/templates'),
          layout: 'layout',
          cache: configService?.getOrThrow('NODE_ENV') === 'production',
        }),
        from: configService?.getOrThrow('RESEND_EMAIL_FROM'),
      }),
    }),
    AuthenticationModule.forRoot({
      session: {
        absoluteTtl: 10000, // 10 seconds
        // absoluteTtl: '14d', // signed out after 14 days, however active
        // idleTtl: '3d', // or after 3 days without a request
      },
    }),
    NotificationsModule,
    AuthModule,
    TodosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Register Outbox
    {
      provide: PostgresOutboxStore,
      inject: [getDrizzleToken(), OutboxStorage],
      useFactory: (db: DatabaseType, outboxStorage: OutboxStorage) =>
        new PostgresOutboxStore(
          {
            executor: fromDrizzle(db),
          },
          outboxStorage,
        ),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
