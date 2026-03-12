import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, HttpHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class GatewayHealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) { }

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      () => this.http.pingCheck('auth-service', process.env.AUTH_HEALTH_URL || 'http://localhost:5002/health'),
      () => this.http.pingCheck('users-service', process.env.USERS_HEALTH_URL || 'http://localhost:5003/health'),
      () => this.http.pingCheck('notifications-service', process.env.NOTIFICATIONS_HEALTH_URL || 'http://localhost:5004/health'),
      () => this.http.pingCheck('logs-service', process.env.LOGS_HEALTH_URL || 'http://localhost:5005/health'),
    ]);
  }
}
