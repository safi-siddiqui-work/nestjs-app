import {
  BadRequestException,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { AppConfigType } from './config/app.config.js';
import { EveryExceptionFilter } from './filters/every-exception.filter.js';
import { TransformInterceptor } from './interceptors/transform.interceptor.js';
import { ErrorType } from './types/api-response.type.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  const configService = app.get(ConfigService<AppConfigType>);
  const port = configService.get('PORT');

  const httpAdapter = app?.get(HttpAdapterHost);
  app.useGlobalFilters(new EveryExceptionFilter(httpAdapter));

  // app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalPipes(
    new StandardSchemaValidationPipe({
      exceptionFactory: (issues) =>
        new BadRequestException({
          message: 'Bad Request',
          issues: issues as [],
        } satisfies ErrorType),
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(port);
  // await app.listen(process.env.PORT ?? 3000);
}

// await bootstrap();
bootstrap().catch((error) => {
  throw error;
});
