import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @EventPattern('user_fetched')
  async handleUserFetched(@Payload() data: any) {
    console.log('Notification received for user_fetched event:', data);
    this.notificationsService.processNotification(data);
  }
}
