import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { AdminAuthController } from './auth.controller';
import { AdminAuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        // 不限制密钥长度；未配置时使用开发环境默认值，方便本地直接启动。
        const secret = configService.get<string>('JWT_SECRET') || 'aistock-dev-secret';
        return {
          secret,
          signOptions: {
            expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ?? '7d') as NonNullable<JwtModuleOptions['signOptions']>['expiresIn'],
          },
        };
      },
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
/** 装配管理员登录、JWT 签发与身份守卫。 */
export class AdminAuthModule {}
