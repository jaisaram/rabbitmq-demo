import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule, HealthModule } from '../../../libs/common/src';
import { LogsController } from './logs.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    HealthModule,
  ],
  controllers: [LogsController],
})
export class LogsModule { }
