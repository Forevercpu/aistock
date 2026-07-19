import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

/** 创建上市公司所需的基础资料。 */
export class CreateCompanyDto {
  @ApiProperty({ example: '600000' })
  @IsString()
  @MaxLength(10)
  stockCode: string;

  @ApiProperty({ example: '示例股份' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  shortName?: string | null;

  @ApiProperty({ example: 'SSE' })
  @IsString()
  @MaxLength(20)
  exchange: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  logoUrl?: string | null;

  @ApiPropertyOptional({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' })
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  @ApiPropertyOptional({ example: '2010-01-01' })
  @IsOptional()
  @IsDateString()
  foundedAt?: string | null;

  @ApiPropertyOptional({ example: '2020-01-01' })
  @IsOptional()
  @IsDateString()
  listedAt?: string | null;
}
