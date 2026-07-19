import { IsString, MaxLength, MinLength } from 'class-validator';

/** 修改当前管理员展示资料的请求参数。 */
export class UpdateProfileDto {
  @IsString()
  @MaxLength(50)
  displayName: string;
}

/** 修改密码时提交的原密码和新密码。 */
export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
