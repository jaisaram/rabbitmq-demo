import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UsersModule } from './users.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'users',
        protoPath: join(__dirname, '../../../../protos/users.proto'),
        url: '0.0.0.0:50052',
      },
    },
  );
  await app.listen();
  console.log('Users microservice is listening on port 50052');
}
bootstrap();
