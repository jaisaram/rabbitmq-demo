import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { ModuleRef } from '@nestjs/core';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private moduleRef: ModuleRef,
  ) { }

  @Get()
  @HealthCheck()
  async check() {
    const checks = [];

    // Check DB if TypeOrmHealthIndicator is available
    try {
      const db = this.moduleRef.get(TypeOrmHealthIndicator, { strict: false });
      if (db) {
        checks.push(() => db.pingCheck('database'));
      }
    } catch (e) {
      // TypeORM not used in this service
    }

    return this.health.check(checks);
  }
}
