import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import type { AdminTokenPayload, CurrentAdmin } from './auth.types';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { username: loginDto.username },
    });

    if (!admin || !admin.enabled || !(await compare(loginDto.password, admin.passwordHash))) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload: AdminTokenPayload = {
      sub: admin.id,
      username: admin.username,
      role: admin.role,
    };
    const user: CurrentAdmin = {
      id: admin.id,
      username: admin.username,
      displayName: admin.displayName,
      role: admin.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') ?? '7d',
      user,
    };
  }

  async getCurrentAdmin(adminId: number): Promise<CurrentAdmin> {
    const admin = await this.prisma.adminUser.findFirst({
      where: { id: adminId, enabled: true },
      select: { id: true, username: true, displayName: true, role: true },
    });

    if (!admin) {
      throw new UnauthorizedException('管理员账号不存在或已被禁用');
    }

    return admin;
  }
}

