import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true, // ← Add this line!
      transformOptions: {
        enableImplicitConversion: true, // ← And this!
      },
    }),
  );
  app.setGlobalPrefix('api');
  app.enableCors({
  origin: ['http://localhost:5173', 'https://real-estate-management-system-ivory.vercel.app'],
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true,
});
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
