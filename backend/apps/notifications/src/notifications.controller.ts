import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @EventPattern('user_fetched')
  async handleUserFetched(@Payload() data: any) {
    const correlationId = data.headers?.['x-correlation-id'];
    console.log(`Notification service received user_fetched event for user ${data.data?.userId} with correlation: ${correlationId}`);
    this.notificationsService.processNotification(data.data || data);
  }
}
