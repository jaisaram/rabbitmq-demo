import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { NotificationsModule } from './notifications.module';

import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')],
      queue: 'notifications_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  app.useLogger(app.get(Logger));
  await app.startAllMicroservices();
  const port = process.env.NOTIFICATIONS_PORT || 5004;
  await app.listen(port);
  console.log(`Notifications microservice is running. RMQ Consumer active, HTTP (Health): ${port}`);
}
bootstrap();
