import { IsArray, IsHexColor, IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

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

export class SaveTagDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsHexColor()
  color?: string | null;
}

export class SetCompaniesDto {
  @IsArray()
  @IsInt({ each: true })
  companyIds: number[];
}
