import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'auth',
        protoPath: join(__dirname, '../../../../protos/auth.proto'),
        url: '0.0.0.0:50051',
      },
    },
  );
  await app.listen();
  console.log('Auth microservice is listening on port 50051');
}
bootstrap();
