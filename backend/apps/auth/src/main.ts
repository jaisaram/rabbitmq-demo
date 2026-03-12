import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { AuthModule } from './auth.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(process.cwd(), 'protos/auth.proto'),
      url: process.env.AUTH_GRPC_URL || '0.0.0.0:50051',
    },
  });

  app.useLogger(app.get(Logger));
  await app.startAllMicroservices();
  const port = process.env.AUTH_PORT || 5002;
  await app.listen(port);
  console.log(`Auth microservice is running. gRPC: ${process.env.AUTH_GRPC_URL || '50051'}, HTTP (Health): ${port}`);
}
bootstrap();
