import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard, type AdminRequest } from './jwt-auth.guard';

@ApiTags('admin-auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  @Post('login')
  @ApiOperation({ summary: '管理员登录' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前管理员' })
  getCurrentAdmin(@Req() request: AdminRequest) {
    return this.authService.getCurrentAdmin(request.admin.sub);
  }
}

