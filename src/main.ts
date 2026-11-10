import {
  BadRequestException,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { EveryExceptionFilter } from './common/filters/every-exception.filter.js';
import { TransformInterceptor } from './core/interceptors/transform.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

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

  await app.listen(process.env.PORT ?? 3000);
}

// await bootstrap();
bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  throw error;
});
