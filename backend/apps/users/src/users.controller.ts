import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @GrpcMethod('UsersService', 'GetUser')
  async getUser(data: any) {
    console.log('Users service received GetUser request:', data);
    // Publish an event to RabbitMQ when a user is fetched (just for demo)
    this.usersService.publishUserFetched(data.userId);

    return {
      id: data.userId,
      email: 'user@example.com',
      tenantId: (data as any).tenantId || 'unknown',
    };
  }

  @GrpcMethod('UsersService', 'CreateUser')
  async createUser(data: any) {
    console.log('Users service creating user record:', data);
    // In real app, save to users DB. For now return data.
    return {
      userId: data.userId,
      email: data.email,
      tenantId: data.tenantId,
    };
  }
}
