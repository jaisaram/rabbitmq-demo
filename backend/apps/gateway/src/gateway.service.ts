import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import Redis from 'ioredis';

interface UsersService {
  getUser(data: { userId: string; tenantId: string }): any;
  createUser(data: { userId: string; email: string; tenantId: string }): any;
}

interface AuthService {
  createUser(data: { email: string; password: string; tenantId: string }): any;
  createTenant(data: { name: string }): any;
  login(data: { email: string; password: string }): any;
}

@Injectable()
export class GatewayService implements OnModuleInit {
  private usersService: UsersService;
  private authService: AuthService;
  private redis: Redis;

  constructor(
    @Inject('USERS_PACKAGE') private usersClient: ClientGrpc,
    @Inject('AUTH_PACKAGE') private authClient: ClientGrpc,
  ) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: 6379,
    });
  }

  onModuleInit() {
    this.usersService = this.usersClient.getService<UsersService>('UsersService');
    this.authService = this.authClient.getService<AuthService>('AuthService');
  }

  async getUser(userId: string, tenantId: string) {
    const cacheKey = `user:${tenantId}:${userId}`;
    const cachedUser = await this.redis.get(cacheKey);

    if (cachedUser) {
      console.log('Returning user from Redis cache');
      return JSON.parse(cachedUser);
    }

    console.log('Fetching user from Users microservice via gRPC');
    const user = await firstValueFrom(this.usersService.getUser({ userId, tenantId }));

    // Cache for 60 seconds
    await this.redis.set(cacheKey, JSON.stringify(user), 'EX', 60);

    return user;
  }

  async register(data: any) {
    console.log('Gateway registering user:', data.email);
    // 1. Create user in Auth service
    const authUser = await firstValueFrom<{ userId: string; email: string; tenantId: string }>(
        this.authService.createUser(data)
    );
    
    // 2. Create user profile in Users service
    await firstValueFrom(this.usersService.createUser({
        userId: authUser.userId,
        email: authUser.email,
        tenantId: authUser.tenantId,
    }));

    return authUser;
  }

  async createTenant(data: any) {
    console.log('Gateway creating tenant:', data.name);
    return firstValueFrom(this.authService.createTenant(data));
  }

  async login(data: any) {
    console.log('Gateway logging in user:', data.email);
    return firstValueFrom(this.authService.login(data));
  }
}
