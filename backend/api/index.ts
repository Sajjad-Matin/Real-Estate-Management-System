import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

let app: any;

async function bootstrap() {
  const nestApp = await NestFactory.create(AppModule);

  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  nestApp.setGlobalPrefix('api');

  nestApp.enableCors({
    origin: true,
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  await nestApp.init();

  return nestApp;
}

export default async function handler(
  req: any,
  res: any,
) {
  if (!app) {
    app = await bootstrap();
  }

  const instance = app.getHttpAdapter().getInstance();

  return instance(req, res);
}
