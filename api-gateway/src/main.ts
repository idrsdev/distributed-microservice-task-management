import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.enableCors();

  await app.listen(process.env.PORT || 7000);
  Logger.warn(`API Gateway is running on port:`);
  Logger.warn(`${process.env.PORT || 7000}`);
}
bootstrap();
