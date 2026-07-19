import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateCompanyStatusDto {
  @ApiProperty({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
