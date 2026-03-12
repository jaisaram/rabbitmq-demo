import { Controller, Post, Body, Param, Headers, UseInterceptors } from '@nestjs/common';
import { GatewayService } from '../gateway.service';
import { TenantInterceptor } from '../../../../libs/common/src';

@Controller(':slug/users')
export class PublicTenantController {
    constructor(private readonly gatewayService: GatewayService) { }

    @Post('public/register')
    @UseInterceptors(TenantInterceptor)
    async register(
        @Param('slug') slug: string,
        @Body() data: any,
        @Headers('x-correlation-id') correlationId: string
    ) {
        // Resolve tenantId from slug if necessary, but register expects data.email, data.password, etc.
        // The register logic in GatewayService currently uses 'this.authService.createUser(data, metadata)'

        // We need to resolve the tenantId from slug first because register might not have it in Body
        const tenantInfo: any = await this.gatewayService.validateTenantSlug(slug, correlationId);
        if (!tenantInfo || !tenantInfo.valid) {
            throw new Error('Invalid tenant slug');
        }

        const registrationData = {
            ...data,
            tenantId: tenantInfo.tenantId
        };

        return this.gatewayService.register(registrationData, correlationId);
    }
}
