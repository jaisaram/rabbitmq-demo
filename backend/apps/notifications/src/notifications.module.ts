import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule, HealthModule } from '../../../libs/common/src';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), LoggerModule, HealthModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule { }
