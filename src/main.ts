import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

import { serverAdapter, createBoard } from './bull-board';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // That's it - just this one line for validation
  app.useGlobalPipes(new ValidationPipe(
    {
      whitelist: true,
      transform: true,  // This is important - converts strings to numbers
      forbidNonWhitelisted: true,
    }
  ));
  
  app.enableCors();

  // All for queues monitoring/dashboard
  const emailQueue = app.get<Queue>(getQueueToken('email')); // use your queue name
  createBoard([emailQueue]);
  app.use('/admin/queues', serverAdapter.getRouter());
  // End of all for queues monitoring/dashboard
  
  await app.listen(3000);
  console.log('Application running on http://localhost:3000');
}
bootstrap();
