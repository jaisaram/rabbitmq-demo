import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  processNotification(data: any) {
    console.log(`Processing notification for user ${data.userId}...`);
    // Here you would send an email, push notification, etc.
  }
}
