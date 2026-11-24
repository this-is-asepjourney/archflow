import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { join } from 'path';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());

  const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
  mkdirSync(uploadDir, { recursive: true });

  app.useStaticAssets(uploadDir, {
    prefix: '/uploads/',
  });

  const rawOrigins = process.env.CORS_ORIGINS?.trim();
  const corsOrigin =
    !rawOrigins || rawOrigins === '*'
      ? true
      : rawOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number(process.env.API_PORT || process.env.PORT || 4000);
  await app.listen(port, '0.0.0.0');
  console.log(`ArchFlow API running on http://0.0.0.0:${port}/api`);
}
bootstrap().catch(console.error);
