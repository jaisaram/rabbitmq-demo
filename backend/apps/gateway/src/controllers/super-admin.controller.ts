import { Controller, Get, Post, Body, Param, UseGuards, Headers, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GatewayService } from '../gateway.service';
import { CreateTenantDto } from '../dtos/create-tenant.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class SuperAdminController {
    constructor(private readonly gatewayService: GatewayService) { }

    @Post('tenants')
    async createTenant(@Body() data: CreateTenantDto, @Headers('x-correlation-id') correlationId: string) {
        return this.gatewayService.createTenant(data, correlationId);
    }

    @Get('tenants')
    async listTenants(@Headers('x-correlation-id') correlationId: string) {
        return this.gatewayService.listTenants(correlationId);
    }

    @Patch('tenants/:id')
    async updateTenant(@Param('id') id: string, @Body() data: any, @Headers('x-correlation-id') correlationId: string) {
        return this.gatewayService.updateTenant(id, data, correlationId);
    }
}
