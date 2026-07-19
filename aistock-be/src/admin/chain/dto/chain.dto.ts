import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

/** 产业链基础信息。 */
export class SaveChainDto {
  @IsString() @MaxLength(100) name: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']) status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

/** 图谱中的单个业务节点及其画布位置。 */
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

/** 图谱中一条从 source 指向 target 的有向连线。 */
export class ChainEdgeDto {
  @IsString() source: string;
  @IsString() target: string;
  @IsOptional() @IsString() @MaxLength(100) label?: string | null;
}

/** 前端一次性提交的完整产业链图谱。 */
export class SaveChainGraphDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => ChainNodeDto) nodes: ChainNodeDto[];
  @IsArray() @ValidateNested({ each: true }) @Type(() => ChainEdgeDto) edges: ChainEdgeDto[];
}
