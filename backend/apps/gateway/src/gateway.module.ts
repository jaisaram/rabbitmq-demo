import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { CommonModule, LoggerModule, CorrelationMiddleware, HealthModule } from '../../../libs/common/src';
import { AuthController } from './gateway.controller';
import { SuperAdminController } from './controllers/super-admin.controller';
import { TenantController } from './controllers/tenant.controller';
import { PublicTenantController } from './controllers/public-tenant.controller';
import { GatewayService } from './gateway.service';
import { JwtStrategy } from './strategies/jwt.strategy';

import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GatewayHealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    LoggerModule,
    TerminusModule,
    HttpModule,
    PassportModule,
    HealthModule,
    ClientsModule.registerAsync([
      {
        name: 'AUTH_PACKAGE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'auth',
            protoPath: join(process.cwd(), 'protos/auth.proto'),
            url: config.get<string>('AUTH_GRPC_URL', '0.0.0.0:50051'),
          },
        }),
      },
      {
        name: 'USERS_PACKAGE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'users',
            protoPath: join(process.cwd(), 'protos/users.proto'),
            url: config.get<string>('USERS_GRPC_URL', '0.0.0.0:50052'),
          },
        }),
      },
      {
        name: 'BATCH_PACKAGE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'batch',
            protoPath: join(process.cwd(), 'protos/batch.proto'),
            url: config.get<string>('BATCH_GRPC_URL', 'localhost:5007'),
          },
        }),
      },
    ]),
  ],
  controllers: [AuthController, SuperAdminController, TenantController, PublicTenantController, GatewayHealthController],
  providers: [GatewayService, JwtStrategy],
})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
