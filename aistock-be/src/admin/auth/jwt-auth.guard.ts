import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AdminTokenPayload } from './auth.types';

export interface AdminRequest {
  headers: { authorization?: string };
  admin: AdminTokenPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  /** 从 Authorization Bearer 头解析并校验 JWT，再把载荷挂到当前请求。 */
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('请先登录');
    }

    try {
      request.admin = await this.jwtService.verifyAsync<AdminTokenPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException('登录状态已失效，请重新登录');
    }
  }
}
