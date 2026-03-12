import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { LogsModule } from './logs.module';

import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(LogsModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')],
      queue: 'logs_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  app.useLogger(app.get(Logger));
  await app.startAllMicroservices();
  const port = process.env.LOGS_PORT || 5005;
  await app.listen(port);
  console.log(`Logs microservice is running. RMQ Consumer active, HTTP (Health): ${port}`);
}
bootstrap();
