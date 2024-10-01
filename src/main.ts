// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session'; // Import express-session
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Konfigurasi CORS
  app.enableCors({
    origin: [
      'http://localhost:3039',
      'http://192.168.100.11:3039',
      'https://9a51-2001-448a-20a0-ad21-8105-710b-ce85-e904.ngrok-free.app', // URL frontend tambahan
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'ngrok-skip-browser-warning', // Add this line
    ],
  });

  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  // Middleware untuk parsing cookie
  app.use(cookieParser());

  // Middleware untuk session
  app.use(
    session({
      secret: '1Qweerw23215EqwesdweFggsw32as',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 604800000 }, // Durasi cookie (1 jam)
    }),
  );

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API Documentation with JWT authentication')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
