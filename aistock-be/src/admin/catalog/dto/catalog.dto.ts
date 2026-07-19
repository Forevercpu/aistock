import { IsArray, IsHexColor, IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

/** 新增或编辑板块、概念时使用的参数。 */
export class SaveSectorDto {
  @IsString()
  @MaxLength(80)
  name: string;

  @IsIn(['industry', 'concept', 'region', 'index'])
  type: string;

  @IsOptional()
  @IsInt()
  parentId?: number | null;
}

/** 新增或编辑公司标签时使用的参数。 */
export class SaveTagDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsHexColor()
  color?: string | null;
}

/** 整体替换分类关联公司时使用的公司编号集合。 */
export class SetCompaniesDto {
  @IsArray()
  @IsInt({ each: true })
  companyIds: number[];
}
