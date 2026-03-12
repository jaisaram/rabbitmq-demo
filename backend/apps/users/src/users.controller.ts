import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { GrpcCorrelationInterceptor } from '@common/common/interceptors/correlation.interceptor';

@Controller()
@UseInterceptors(GrpcCorrelationInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @GrpcMethod('UsersService', 'GetUser')
  async getUser(data: any, metadata: any) {
    try {
      console.log('Users microservice GetUser starting for:', data.userId);
      const correlationId = metadata.get('x-correlation-id')?.[0];
      const user = await this.usersService.getUser(data.userId, data.tenantId);

      console.log('Users microservice GetUser result:', user ? 'User Found' : 'User Not Found');

      // Publish event
      this.usersService.publishUserFetched(data.userId, correlationId);

      return user || {};
    } catch (e) {
      console.error('CRASH in UsersController.getUser:', e.message, e.stack);
      throw e;
    }
  }

  @GrpcMethod('UsersService', 'CreateUser')
  async createUser(data: any, metadata: any) {
    const correlationId = metadata.get('x-correlation-id')?.[0];
    const user = await this.usersService.createUser(data);

    this.usersService.publishUserFetched(user.id, correlationId);

    return {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
    };
  }

  @GrpcMethod('UsersService', 'UpdateProfile')
  async updateProfile(data: any) {
    const { userId, tenantId, ...updateData } = data;
    return this.usersService.updateProfile(userId, tenantId, updateData);
  }

  @GrpcMethod('UsersService', 'ListUsers')
  async listUsers(data: { tenantId: string }) {
    const users = await this.usersService.listUsers(data.tenantId);
    return { users };
  }
}
