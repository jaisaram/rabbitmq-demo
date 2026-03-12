import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { GrpcCorrelationInterceptor } from '@common/common/interceptors/correlation.interceptor';

@Controller()
@UseInterceptors(GrpcCorrelationInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @GrpcMethod('AuthService', 'ValidateUser')
  async validateUser(data: { token: string }) {
    const result = await this.authService.validateUser(data);
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

  @GrpcMethod('AuthService', 'SystemAdminLogin')
  systemAdminLogin(data: any) {
    return this.authService.systemAdminLogin(data);
  }

  @GrpcMethod('AuthService', 'TenantLogin')
  tenantLogin(data: any) {
    return this.authService.tenantLogin(data);
  }

  @GrpcMethod('AuthService', 'ValidateTenantSlug')
  validateTenantSlug(data: { slug: string }) {
    return this.authService.validateTenantSlug(data);
  }

  @GrpcMethod('AuthService', 'GetTenantSettings')
  async getTenantSettings(data: { tenantId: string }) {
    const settings = await this.authService.getTenantSettings(data.tenantId);
    return { settingsJson: JSON.stringify(settings) };
  }

  @GrpcMethod('AuthService', 'UpdateTenantSettings')
  async updateTenantSettings(data: { tenantId: string, settingsJson: string }) {
    const settings = JSON.parse(data.settingsJson);
    const updatedSettings = await this.authService.updateTenantSettings(data.tenantId, settings);
    return { success: true, settingsJson: JSON.stringify(updatedSettings) };
  }

  @GrpcMethod('AuthService', 'ListTenants')
  async listTenants() {
    const tenants = await this.authService.listTenants();
    return { tenants };
  }

  @GrpcMethod('AuthService', 'UpdateTenant')
  async updateTenant(data: any) {
    const { id, ...updateData } = data;
    const tenant = await this.authService.updateTenant(id, updateData);
    return { success: !!tenant, tenant };
  }

  @GrpcMethod('AuthService', 'DeleteUser')
  async deleteUser(data: { userId: string }) {
    return this.authService.deleteUser(data.userId);
  }

  @GrpcMethod('AuthService', 'ListUsersByTenant')
  async listUsersByTenant(data: { tenantId: string }) {
    const users = await this.authService.listUsersByTenant(data.tenantId);
    return { users };
  }

  @GrpcMethod('AuthService', 'Logout')
  async logout(data: { userId: string }) {
    return this.authService.logout(data);
  }
}
