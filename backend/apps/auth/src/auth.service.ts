import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Tenant } from './entities/tenant.entity';
import { SystemAdmin } from './entities/system-admin.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(SystemAdmin)
    private readonly systemAdminRepository: Repository<SystemAdmin>,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(data: { token: string }) {
    try {
      const payload = this.jwtService.verify(data.token);
      console.log('Validating user with payload:', JSON.stringify(payload));

      // Check if it's a System Admin
      const systemAdmin = await this.systemAdminRepository.findOne({ where: { id: payload.sub } });
      if (systemAdmin) {
        console.log('System Admin validated:', systemAdmin.email);
        return {
          valid: true,
          userId: systemAdmin.id,
          role: 'SUPER_ADMIN',
          isSystemAdmin: true
        };
      }

      // Otherwise check if it's a Tenant User
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        console.warn('User not found for ID:', payload.sub);
        return { valid: false };
      }

      // Check token version
      if (user.tokenVersion !== payload.version) {
        console.warn('Token version mismatch for user:', user.email, 'User version:', user.tokenVersion, 'Payload version:', payload.version);
        return { valid: false };
      }

      const tenant = await this.tenantRepository.findOne({ where: { id: user.tenantId } });
      if (!tenant || tenant.status !== 'active') {
        console.warn('Tenant not found or inactive for user:', user.email);
        return { valid: false };
      }

      return {
        valid: true,
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role,
        isDefaultAdmin: user.isDefaultAdmin,
        isSystemAdmin: false
      };
    } catch (err) {
      console.error('JWT Verification failed:', err.message);
      return { valid: false };
    }
  }

  async validateTenantSlug(data: { slug: string }) {
    const tenant = await this.tenantRepository.findOne({ where: { slug: data.slug } });
    if (!tenant) {
      return { valid: false };
    }
    return {
      valid: true,
      tenantId: tenant.id,
      name: tenant.name,
    };
  }

  private isUuid(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  async createUser(data: any) {
    if (!data.tenantId || !this.isUuid(data.tenantId)) {
      throw new RpcException({
        code: 3, // INVALID_ARGUMENT
        message: 'Invalid tenantId format. Must be a UUID.',
      });
    }

    const tenant = await this.tenantRepository.findOne({ where: { id: data.tenantId } });
    if (!tenant) {
      throw new RpcException({
        code: 5, // NOT_FOUND
        message: 'Tenant not found',
      });
    }

    const existingUser = await this.userRepository.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new RpcException({
        code: 6, // ALREADY_EXISTS
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async systemAdminLogin(data: any) {
    const admin = await this.systemAdminRepository.findOne({ where: { email: data.email } });
    if (!admin) {
      throw new RpcException({
        code: 16, // UNAUTHENTICATED
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(data.password, admin.password);
    if (!isPasswordValid) {
      throw new RpcException({
        code: 16, // UNAUTHENTICATED
        message: 'Invalid credentials',
      });
    }

    const payload = { sub: admin.id, email: admin.email, role: 'SUPER_ADMIN', isSystemAdmin: true };
    return {
      accessToken: this.jwtService.sign(payload),
      adminId: admin.id,
      isSuper: admin.isSuper,
    };
  }

  async tenantLogin(data: any) {
    let tenant;
    if (data.tenantName) {
      tenant = await this.tenantRepository.findOne({ where: { name: data.tenantName } });
    } else if (data.slug) {
      tenant = await this.tenantRepository.findOne({ where: { slug: data.slug } });
    }

    if (!tenant) {
      throw new RpcException({
        code: 5, // NOT_FOUND
        message: 'Tenant not found',
      });
    }

    if (tenant.status !== 'active') {
      throw new RpcException({
        code: 7, // PERMISSION_DENIED
        message: 'Tenant is deactivated',
      });
    }

    const user = await this.userRepository.findOne({
      where: { email: data.email, tenantId: tenant.id }
    });

    if (!user) {
      throw new RpcException({
        code: 16, // UNAUTHENTICATED
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new RpcException({
        code: 16, // UNAUTHENTICATED
        message: 'Invalid credentials',
      });
    }

    // Increment token version to invalidate all current sessions
    user.tokenVersion += 1;
    await this.userRepository.save(user);

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      isDefaultAdmin: user.isDefaultAdmin,
      isSystemAdmin: false,
      version: user.tokenVersion
    };

    return {
      accessToken: this.jwtService.sign(payload),
      userId: user.id,
      tenantId: tenant.id,
      slug: tenant.slug,
    };
  }

  async createTenant(data: any) {
    // Check for duplicate name or slug
    const existingName = await this.tenantRepository.findOne({ where: { name: data.name } });
    if (existingName) {
      throw new RpcException({ code: 6, message: 'Tenant with this name already exists' });
    }

    const existingSlug = await this.tenantRepository.findOne({ where: { slug: data.slug } });
    if (existingSlug) {
      throw new RpcException({ code: 6, message: 'Tenant with this slug already exists' });
    }

    // Check if admin email already exists (even in other tenants)
    const existingUser = await this.userRepository.findOne({ where: { email: data.adminEmail } });
    if (existingUser) {
      throw new RpcException({ code: 6, message: 'Admin email already in use' });
    }

    const queryRunner = this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create Tenant
      const tenant = this.tenantRepository.create({
        name: data.name,
        slug: data.slug,
        status: 'active',
        settings: { primaryColor: '#3b82f6' }
      });
      const savedTenant = await queryRunner.manager.save(Tenant, tenant);

      // 2. Create Default Admin User for this tenant
      const hashedPassword = await bcrypt.hash(data.adminPassword, 10);
      const adminUser = this.userRepository.create({
        email: data.adminEmail,
        password: hashedPassword,
        tenantId: savedTenant.id,
        role: 'ADMIN',
        isDefaultAdmin: true
      });
      await queryRunner.manager.save(User, adminUser);

      await queryRunner.commitTransaction();
      return savedTenant;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new RpcException({
        code: 13, // INTERNAL
        message: 'Failed to create tenant and default admin: ' + err.message,
      });
    } finally {
      await queryRunner.release();
    }
  }

  async getTenantSettings(tenantId: string) {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    return tenant ? tenant.settings : {};
  }

  async updateTenantSettings(tenantId: string, settings: any) {
    await this.tenantRepository.update(tenantId, { settings });
    return this.getTenantSettings(tenantId);
  }

  async listTenants() {
    return this.tenantRepository.find();
  }

  async updateTenant(id: string, data: { name?: string; status?: string }) {
    await this.tenantRepository.update(id, data);
    return this.tenantRepository.findOne({ where: { id } });
  }

  async deleteUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new RpcException({
        code: 5, // NOT_FOUND
        message: 'User not found',
      });
    }

    if (user.isDefaultAdmin) {
      throw new RpcException({
        code: 7, // PERMISSION_DENIED
        message: 'Default admin user cannot be deleted',
      });
    }

    await this.userRepository.delete(userId);
    return { success: true, message: 'User deleted successfully' };
  }

  async listUsersByTenant(tenantId: string) {
    return this.userRepository.find({ where: { tenantId } });
  }

  async logout(data: { userId: string }) {
    const user = await this.userRepository.findOne({ where: { id: data.userId } });
    if (user) {
      user.tokenVersion += 1;
      await this.userRepository.save(user);
    }
    return { success: true };
  }
}
