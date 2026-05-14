/*import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();*/

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
//import { CustomValidationPipe } from './common/pipes/validation.pipe';

//import { HttpExceptionFilter } from './common/filters/http-exception.filter';
//import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
//import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  /*app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  app.enableCors();*/

  /*// Global pipes
  app.useGlobalPipes(new CustomValidationPipe());*/

  /*// Use global validation pipe with detailed errors
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    disableErrorMessages: false, // Make sure this is false
  }));*/

  /*// Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    disableErrorMessages: false,
    exceptionFactory: (errors) => {
      const messages = errors.map(error => {
        const constraints = error.constraints;
        if (constraints) {
          return Object.values(constraints).join(', ');
        }
        return `${error.property} is invalid`;
      });
      
      return new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        errors: messages,
        timestamp: new Date().toISOString(),
      });
    },
  }));*/

  /*app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));*/

  /*// Simple validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));*/
  
  /*// Global filters - IMPORTANT: Order matters
  // HttpExceptionFilter should come before PrismaExceptionFilter and AllExceptionsFilter
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new PrismaExceptionFilter(),
    new AllExceptionsFilter(),
  );*/
  
  /*// Global filters (order matters - most specific first)
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new PrismaExceptionFilter(),
    new AllExceptionsFilter(),
  );*/

  // That's it - just this one line for validation
  app.useGlobalPipes(new ValidationPipe());
  
  app.enableCors();
  
  await app.listen(3000);
  console.log('Application running on http://localhost:3000');
}
bootstrap();
