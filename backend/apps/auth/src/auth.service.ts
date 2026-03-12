import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(token: string) {
    // In a real app, verify JWT. For now, find first user or mock.
    const user = await this.userRepository.findOne({ where: {} });
    if (!user) return { valid: false };
    return {
      valid: true,
      userId: user.id,
      tenantId: user.tenantId,
    };
  }

  async createUser(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async login(data: any) {
    const user = await this.userRepository.findOne({ where: { email: data.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, tenantId: user.tenantId };
    return {
      accessToken: this.jwtService.sign(payload),
      userId: user.id,
      tenantId: user.tenantId,
    };
  }

  async createTenant(data: any) {
    const tenant = this.tenantRepository.create(data);
    return this.tenantRepository.save(tenant);
  }
}
