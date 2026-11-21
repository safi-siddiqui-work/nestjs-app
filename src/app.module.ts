import { AuthenticationModule } from '@nestjs/authentication';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DrizzleModule } from '@nestjs/drizzle';
import { createObserveModule } from '@nestjs/observe';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import {
  AppConfig,
  appConfigSchema,
  AppConfigType,
} from './config/app.config.js';
import { relations } from './database/schema.js';
import { AuthModule } from './modules/auth/auth.module.js';
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
      useFactory: (configService: ConfigService<AppConfigType>) => ({
        drizzle,
        connection: configService?.getOrThrow('DATABASE_NEON_URL'),
        relations,
      }),
      inject: [ConfigService],
    }),
    AuthenticationModule.forRoot({
      session: {
        absoluteTtl: 10000, // 10 seconds
        // absoluteTtl: '14d', // signed out after 14 days, however active
        // idleTtl: '3d', // or after 3 days without a request
      },
    }),
    AuthModule,
    TodosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
