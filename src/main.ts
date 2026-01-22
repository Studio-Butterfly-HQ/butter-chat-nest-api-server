import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS if needed
  app.enableCors();
  app.use(cookieParser())
  //exception filter for error handling
  app.useGlobalFilters(new HttpExceptionFilter());
  // // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  //Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('ButterChat API')
    .setDescription('ButterChat SaaS API Documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('companies', 'Company management')
    .addTag('users', 'User management')
    .addTag('departments', 'Department management')
    .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 5599);
  
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 5599}`);
  console.log(`Swagger documentation available at: http://localhost:${process.env.PORT ?? 5599}/api`);
}
bootstrap();
