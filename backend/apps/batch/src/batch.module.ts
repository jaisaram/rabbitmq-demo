import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { join } from 'path';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'QUEUE_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'],
                    queue: 'batch_queue',
                    queueOptions: {
                        durable: true,
                    },
                },
            },
            {
                name: 'BATCH_PACKAGE',
                transport: Transport.GRPC,
                options: {
                    package: 'batch',
                    protoPath: join(__dirname, '../../../protos/batch.proto'),
                },
            },
        ]),
    ],
    controllers: [BatchController],
    providers: [BatchService],
})
export class BatchModule { }
