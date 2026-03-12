import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST') || 'localhost',
  port: parseInt(configService.get<string>('DB_PORT') || '5432'),
  username: configService.get<string>('DB_USER') || 'postgres',
  password: configService.get<string>('DB_PASSWORD') || 'postgres',
  database: configService.get<string>('DB_NAME') || 'rabbitmq-demo',
  entities: [join(__dirname, 'apps/*/src/**/*.entity.ts'), join(__dirname, 'libs/*/src/**/*.entity.ts')],
  migrations: [join(__dirname, 'migrations/*.ts')],
  synchronize: false,
});
