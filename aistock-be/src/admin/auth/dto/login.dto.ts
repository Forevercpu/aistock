import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

/** 管理员登录请求参数。 */
export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @Length(3, 50)
  username: string;

  @ApiProperty({ example: 'your-password' })
  @IsString()
  @Length(6, 100)
  password: string;
}
