import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private authService: any;

  constructor(
    @Inject('AUTH_PACKAGE') private client: ClientGrpc,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'super-secret'),
      passReqToCallback: true,
    });
    this.authService = this.client.getService('AuthService');
  }

  async validate(req: any, payload: any) {
    const token = req.headers.authorization?.split(' ')[1];
    const metadata = new Metadata();
    if (req.headers['x-correlation-id']) {
      metadata.set('x-correlation-id', req.headers['x-correlation-id']);
    }

    const result = (await firstValueFrom(this.authService.validateUser({ token }, metadata))) as any;
    if (!result || !result.valid) {
      throw new UnauthorizedException('User or Tenant is inactive');
    }

    return {
      userId: result.userId,
      email: payload.email,
      tenantId: result.isSystemAdmin ? undefined : result.tenantId,
      role: result.role,
      isDefaultAdmin: result.isDefaultAdmin || false,
      isSystemAdmin: result.isSystemAdmin || false
    };
  }
}
