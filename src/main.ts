import {
  BadRequestException,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { EveryExceptionFilter } from './common/filters/every-exception.filter.js';
import { AppConfigType } from './config/app.config.js';
import { TransformInterceptor } from './core/interceptors/transform.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  const configService = app.get(ConfigService<AppConfigType>);
  const port = configService.get('port');

  const httpAdapter = app?.get(HttpAdapterHost);
  app.useGlobalFilters(new EveryExceptionFilter(httpAdapter));

  // app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalPipes(
    new StandardSchemaValidationPipe({
      exceptionFactory: (issues) =>
        new BadRequestException({
          name: 'Bad Request',
          message: 'Validation has failed',
          errors: issues,
        }),
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(port);
  // await app.listen(process.env.PORT ?? 3000);
}

// await bootstrap();
bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  throw error;
});
