import { createConnection } from 'typeorm';
import { SystemAdmin } from './entities/system-admin.entity';
import { User } from './entities/user.entity';
import { Tenant } from './entities/tenant.entity';
import * as dotenv from 'dotenv';
import { join } from 'path';

async function debug() {
    dotenv.config({ path: join(__dirname, '../.env') });
    const connection = await createConnection({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5433', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'rabbitmq-demo',
        entities: [SystemAdmin, User, Tenant],
    });

    try {
        const authUserRepo = connection.getRepository(User);
        const allAuthUsers = await authUserRepo.find();
        console.log('Total Auth Users:', allAuthUsers.length);
        allAuthUsers.forEach(u => console.log(`- Auth User: ${u.email}, TenantID: ${u.tenantId}`));

        const tenantRepo = connection.getRepository(Tenant);
        // ...

        const systemAdminRepo = connection.getRepository(SystemAdmin);
        const count = await systemAdminRepo.count();
        console.log('SystemAdmin count:', count);
    } catch (e) {
        console.error('Error querying SystemAdmin:', e);
    } finally {
        await connection.close();
    }
}

debug();
