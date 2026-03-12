import { Injectable, Inject } from '@nestjs/common';
import { RpcException, ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @Inject('LOGS_SERVICE')
    private readonly logsClient: ClientProxy,
  ) { }

  async getUser(userId: string, tenantId: string) {
    return this.userRepository.findOne({ where: { id: userId, tenantId } });
  }

  async createUser(data: any): Promise<User> {
    const userId = data.userId;
    const existingUser = await this.userRepository.findOne({ where: { id: userId, tenantId: data.tenantId } });
    if (existingUser) {
      throw new RpcException({
        code: 6, // ALREADY_EXISTS
        message: 'User profile already exists',
      });
    }
    const user = new User();
    Object.assign(user, data);
    user.id = userId;
    return await this.userRepository.save(user);
  }

  async updateProfile(userId: string, tenantId: string, data: any) {
    console.log('Users microservice updateProfile for:', userId);
    let user = await this.userRepository.findOne({ where: { id: userId, tenantId } });
    if (!user) {
      user = new User();
      user.id = userId;
      user.tenantId = tenantId;
      // We don't have email here from the request, but we can set it to blank or fetch it if needed.
      // For now, let's just populate what we have.
    }
    Object.assign(user, data);
    await this.userRepository.save(user);
    return { success: true, userId };
  }

  publishUserFetched(userId: string, correlationId?: string) {
    this.logsClient.emit('log_event', {
      data: { userId, event: 'user_fetched', timestamp: new Date() },
      headers: { 'x-correlation-id': correlationId }
    });
    console.log(`Event 'log_event' emitted for user ${userId} to logs_queue with correlation ${correlationId}`);

    // Also notify via notification service
    this.notificationClient.emit('user_fetched', { userId, timestamp: new Date() });
  }

  async listUsers(tenantId: string) {
    return this.userRepository.find({ where: { tenantId } });
  }
}
