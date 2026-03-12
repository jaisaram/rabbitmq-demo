import { Controller, Get, Post, Body, Param, UseInterceptors, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GatewayService } from './gateway.service';
import { TenantInterceptor, TenantId } from '../../../libs/common/src';
import { CreateUserDto } from './dtos/create-user.dto';
import { CreateTenantDto } from './dtos/create-tenant.dto';

@Controller('users')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) { }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TenantInterceptor)
  async getUser(@Param('id') id: string, @TenantId() tenantId: string) {
    console.log(`Gateway received request for user ${id} and tenant ${tenantId}`);
    return this.gatewayService.getUser(id, tenantId);
  }

  @Post('register')
  async register(@Body() data: CreateUserDto) {
    return this.gatewayService.register(data);
  }

  @Post('tenants')
  async createTenant(@Body() data: CreateTenantDto) {
    return this.gatewayService.createTenant(data);
  }

  @Post('login')
  async login(@Body() data: any) {
    return this.gatewayService.login(data);
  }
}
