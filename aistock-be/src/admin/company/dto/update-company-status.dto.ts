import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

/** 公司发布状态快捷更新参数。 */
export class UpdateCompanyStatusDto {
  @ApiProperty({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
