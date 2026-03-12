import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { UsersModule } from './users.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(UsersModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'users',
      protoPath: join(process.cwd(), 'protos/users.proto'),
      url: process.env.USERS_GRPC_URL || '0.0.0.0:50052',
    },
  });

  app.useLogger(app.get(Logger));
  await app.startAllMicroservices();
  const port = process.env.USERS_PORT || 5003;
  await app.listen(port);
  console.log(`Users microservice is running. gRPC: ${process.env.USERS_GRPC_URL || '50052'}, HTTP (Health): ${port}`);
}
bootstrap();
