import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export class SaveChainDto {
  @IsString() @MaxLength(100) name: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']) status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export class ChainNodeDto {
  @IsString() clientId: string;
  @IsString() @MaxLength(100) name: string;
  @IsIn(['stage', 'product', 'material', 'company']) type: string;
  @IsIn(['upstream', 'midstream', 'downstream']) stage: string;
  @IsOptional() @IsString() description?: string | null;
  @IsNumber() positionX: number;
  @IsNumber() positionY: number;
  @IsArray() @IsInt({ each: true }) companyIds: number[];
}

export class ChainEdgeDto {
  @IsString() source: string;
  @IsString() target: string;
  @IsOptional() @IsString() @MaxLength(100) label?: string | null;
}

export class SaveChainGraphDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => ChainNodeDto) nodes: ChainNodeDto[];
  @IsArray() @ValidateNested({ each: true }) @Type(() => ChainEdgeDto) edges: ChainEdgeDto[];
}
