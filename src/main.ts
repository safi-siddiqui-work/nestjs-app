import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      instrument: ObserveInstrument,
    });
    await app.listen(process.env.PORT ?? 3000);
  } catch (error) {
    console.error('Application failed to start:', error);
    throw error;
  }
}

await bootstrap();
