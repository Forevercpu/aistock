import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard, type AdminRequest } from './jwt-auth.guard';
import { ChangePasswordDto, UpdateProfileDto } from './dto/update-profile.dto';

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

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改当前管理员资料' })
  updateProfile(@Req() request: AdminRequest, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(request.admin.sub, dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改当前管理员密码' })
  changePassword(@Req() request: AdminRequest, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(request.admin.sub, dto);
  }
}
