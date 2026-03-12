import { Controller, Get, Post, Body, Param, UseInterceptors, UseGuards, Headers, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GatewayService } from '../gateway.service';
import { TenantInterceptor, TenantId } from '../../../../libs/common/src';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';

@Controller(':slug')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantController {
    constructor(private readonly gatewayService: GatewayService) { }

    private async getTenantId(slug: string, correlationId: string): Promise<string> {
        const tenantInfo: any = await this.gatewayService.validateTenantSlug(slug, correlationId);
        if (!tenantInfo || !tenantInfo.valid) {
            throw new NotFoundException(`Organization with identifier '${slug}' not found`);
        }
        return tenantInfo.tenantId;
    }

    @Get('settings')
    @Roles('SUPER_ADMIN', 'USER', 'ADMIN')
    @UseInterceptors(TenantInterceptor)
    async getSettings(@Param('slug') slug: string, @Headers('x-correlation-id') correlationId: string) {
        const tenantId = await this.getTenantId(slug, correlationId);
        return this.gatewayService.getTenantSettings(tenantId, correlationId);
    }

    @Post('settings')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @UseInterceptors(TenantInterceptor)
    async updateSettings(@Param('slug') slug: string, @Body() settings: any, @Headers('x-correlation-id') correlationId: string) {
        const tenantId = await this.getTenantId(slug, correlationId);
        return this.gatewayService.updateTenantSettings(tenantId, settings, correlationId);
    }

    @Post('profile')
    @Roles('USER', 'ADMIN', 'SUPER_ADMIN')
    @UseInterceptors(TenantInterceptor)
    async updateProfile(@Param('slug') slug: string, @Body() data: any, @Headers('x-correlation-id') correlationId: string) {
        const tenantId = await this.getTenantId(slug, correlationId);
        const userId = data.userId;
        return this.gatewayService.updateProfile(userId, tenantId, data, correlationId);
    }

    @Get('user/:id')
    @Roles('USER', 'SUPER_ADMIN', 'ADMIN')
    @UseInterceptors(TenantInterceptor)
    async getUser(@Param('slug') slug: string, @Param('id') id: string, @Headers('x-correlation-id') correlationId: string) {
        const tenantId = await this.getTenantId(slug, correlationId);
        return this.gatewayService.getUser(id, tenantId, correlationId);
    }

    @Post('users/create')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @UseInterceptors(TenantInterceptor)
    async createUser(@Param('slug') slug: string, @Body() data: any, @Headers('x-correlation-id') correlationId: string) {
        const tenantId = await this.getTenantId(slug, correlationId);
        return this.gatewayService.register({ ...data, tenantId }, correlationId);
    }

    @Post('batch/process')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @UseInterceptors(TenantInterceptor)
    async processBatch(@Param('slug') slug: string, @Body('count') count: number, @Headers('x-correlation-id') correlationId: string) {
        const tenantId = await this.getTenantId(slug, correlationId);
        return this.gatewayService.processBulkData(tenantId, count, correlationId);
    }

    @Post('batch/upload')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @UseInterceptors(TenantInterceptor)
    async uploadBatch(@Param('slug') slug: string, @Body() data: any, @Headers('x-correlation-id') correlationId: string) {
        const tenantId = await this.getTenantId(slug, correlationId);
        return this.gatewayService.processBulkData(tenantId, data.count || 1000000, correlationId);
    }

    @Get('batch/status/:jobId')
    @Roles('ADMIN', 'SUPER_ADMIN')
    async getBatchStatus(@Param('jobId') jobId: string, @Headers('x-correlation-id') correlationId: string) {
        return this.gatewayService.getJobStatus(jobId, correlationId);
    }

    @Get('users')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @UseInterceptors(TenantInterceptor)
    async listUsers(@Param('slug') slug: string, @Headers('x-correlation-id') correlationId: string) {
        const tenantId = await this.getTenantId(slug, correlationId);
        return this.gatewayService.listTenantUsers(tenantId, correlationId);
    }

    @Post('users/delete')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @UseInterceptors(TenantInterceptor)
    async deleteUser(@Body('userId') userId: string, @Headers('x-correlation-id') correlationId: string) {
        return this.gatewayService.deleteUser(userId, correlationId);
    }

    @Post('logout')
    @Roles('USER', 'ADMIN', 'SUPER_ADMIN')
    async logout(@Body('userId') userId: string, @Headers('x-correlation-id') correlationId: string) {
        return this.gatewayService.logout(userId, correlationId);
    }
}
