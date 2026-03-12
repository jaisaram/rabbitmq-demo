import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../apps/auth/src/entities/user.entity';
import { Tenant } from '../apps/auth/src/entities/tenant.entity';
import { SystemAdmin } from '../apps/auth/src/entities/system-admin.entity';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

config();
const configService = new ConfigService();

async function seed() {
    const dataSource = new DataSource({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: parseInt(configService.get<string>('DB_PORT') || '5432'),
        username: configService.get<string>('DB_USER') || 'postgres',
        password: configService.get<string>('DB_PASSWORD') || 'postgres',
        database: configService.get<string>('DB_NAME') || 'rabbitmq-demo',
        entities: [User, Tenant, SystemAdmin],
        synchronize: true,
    });

    try {
        await dataSource.initialize();
        console.log('Data Source has been initialized!');

        const tenantRepo = dataSource.getRepository(Tenant);
        const userRepo = dataSource.getRepository(User);
        const systemAdminRepo = dataSource.getRepository(SystemAdmin);

        // 1. Ensure all tenants have slugs
        const allTenants = await tenantRepo.find();
        for (const tenant of allTenants) {
            let updated = false;
            if (!tenant.slug) {
                tenant.slug = tenant.name.toLowerCase().replace(/\s+/g, '-');
                updated = true;
            }
            if (tenant.status !== 'active') {
                tenant.status = 'active';
                updated = true;
            }
            if (updated) {
                await tenantRepo.save(tenant);
                console.log(`Updated tenant '${tenant.name}': slug=${tenant.slug}, status=${tenant.status}`);
            }
        }

        // Specifically ensure 'Jaisa' exists (if new environment)
        let defaultTenant = await tenantRepo.findOne({ where: { name: 'Jaisa' } });
        if (!defaultTenant) {
            defaultTenant = tenantRepo.create({
                name: 'Jaisa',
                slug: 'jaisa',
                status: 'active',
                settings: { primaryColor: '#3b82f6' },
            });
            await tenantRepo.save(defaultTenant);
            console.log('Default tenant (Jaisa) created');
        }

        // 2. Create Super Admin (Global - SystemAdmin Table)
        const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@admin.com';
        const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

        let systemAdmin = await systemAdminRepo.findOne({ where: { email: adminEmail } });
        if (!systemAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            systemAdmin = systemAdminRepo.create({
                email: adminEmail,
                password: hashedPassword,
                isSuper: true,
            });
            await systemAdminRepo.save(systemAdmin);
            console.log('Global System Admin created:', adminEmail);
        } else {
            console.log('Global System Admin already exists:', adminEmail);
        }

        // 3. Create a Tenant Admin for 'Jaisa' (Local - User Table)
        const tenantAdminEmail = 'tenant@jaisa.com';
        let tenantAdmin = await userRepo.findOne({ where: { email: tenantAdminEmail } });
        if (!tenantAdmin) {
            const hashedPassword = await bcrypt.hash('tenant123', 10);
            tenantAdmin = userRepo.create({
                email: tenantAdminEmail,
                password: hashedPassword,
                tenantId: defaultTenant.id,
                role: 'ADMIN',
                isDefaultAdmin: true
            });
            await userRepo.save(tenantAdmin);
            console.log('Tenant Admin for Jaisa created:', tenantAdminEmail);
        }

        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        await dataSource.destroy();
    }
}

seed();
