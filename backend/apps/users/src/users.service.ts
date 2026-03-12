import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UsersService {
  constructor(
    @Inject('NOTIFICATION_SERVICE')
    private readonly client: ClientProxy,
  ) { }

  publishUserFetched(userId: string) {
    this.client.emit('user_fetched', { userId, timestamp: new Date() });
    console.log(`Event 'user_fetched' emitted for user ${userId}`);
  }
}
