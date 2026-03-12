import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @GrpcMethod('AuthService', 'ValidateUser')
  async validateUser(data: { token: string }) {
    const result = await this.authService.validateUser(data.token);
    return result;
  }

  @GrpcMethod('AuthService', 'CreateUser')
  async createUser(data: any) {
    const user: any = await this.authService.createUser(data);
    return {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
    };
  }

  @GrpcMethod('AuthService', 'CreateTenant')
  async createTenant(data: any) {
    const tenant: any = await this.authService.createTenant(data);
    return {
      id: tenant.id,
      name: tenant.name,
    };
  }

  @GrpcMethod('AuthService', 'Login')
  async login(data: any) {
    return this.authService.login(data);
  }
}
