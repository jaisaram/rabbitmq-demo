import { Controller, Post, Body, Headers, Get, Param } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly gatewayService: GatewayService) { }

  @Post('register')
  async register(@Body() data: CreateUserDto, @Headers('x-correlation-id') correlationId: string) {
    return this.gatewayService.register(data, correlationId);
  }

  @Post('system-admin/login')
  async systemAdminLogin(@Body() data: any, @Headers('x-correlation-id') correlationId: string) {
    return this.gatewayService.systemAdminLogin(data, correlationId);
  }

  @Post('tenant/login')
  async tenantLogin(@Body() data: any, @Headers('x-correlation-id') correlationId: string) {
    return this.gatewayService.tenantLogin(data, correlationId);
  }

  @Get('validate-slug/:slug')
  async validateSlug(@Param('slug') slug: string, @Headers('x-correlation-id') correlationId: string) {
    return this.gatewayService.validateTenantSlug(slug, correlationId);
  }
}
