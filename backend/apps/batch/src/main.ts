import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { BatchModule } from './batch.module';

async function bootstrap() {
    const app = await NestFactory.create(BatchModule);

    // gRPC for API calls from Gateway
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
            package: 'batch',
            protoPath: join(__dirname, '../../../protos/batch.proto'),
            url: 'localhost:5007',
        },
    });

    // RabbitMQ for high-scale processing
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'],
            queue: 'batch_queue',
            queueOptions: {
                durable: true,
            },
        },
    });

    await app.startAllMicroservices();
    console.log('Batch microservice (gRPC & RMQ) is running.');
}
bootstrap();
