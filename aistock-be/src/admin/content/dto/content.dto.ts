import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsInt, IsObject, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator';

/** 公告列表分页和筛选参数。 */
export class QueryAnnouncementsDto {
  @Type(() => Number) @IsInt() @Min(1) page = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 10;
  @IsOptional() @IsString() keyword?: string;
  @IsOptional() @Type(() => Number) @IsInt() companyId?: number;
  @IsOptional() @IsIn(['PENDING', 'APPROVED', 'REJECTED']) reviewStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  @IsOptional() @IsIn(['PENDING', 'RUNNING', 'SUCCESS', 'FAILED']) parseStatus?: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
}

/** 新增或编辑公告的完整业务字段。 */
export class SaveAnnouncementDto {
  @Type(() => Number) @IsInt() companyId: number;
  @IsString() @MaxLength(255) title: string;
  @IsOptional() @IsUrl({ require_protocol: true }) sourceUrl?: string | null;
  @IsOptional() @IsString() @MaxLength(100) sourceName?: string | null;
  @IsOptional() @IsString() @MaxLength(50) category?: string | null;
  @IsOptional() @IsString() content?: string | null;
  @IsDateString() publishedAt: string;
}

/** 人工审核 AI 结果时提交的状态和可选修订内容。 */
export class ReviewAiDto {
  @IsIn(['APPROVED', 'REJECTED']) status: 'APPROVED' | 'REJECTED';
  @IsOptional() @IsObject() editedResult?: Record<string, unknown>;
}

/** 题库列表筛选参数。 */
export class QueryQuizzesDto {
  @IsOptional() @IsString() keyword?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() difficulty?: string;
  @IsOptional() @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']) status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

/** 新增或编辑题目的完整业务字段。 */
export class SaveQuizDto {
  @IsString() @MaxLength(30) type: string;
  @IsString() question: string;
  @IsOptional() @IsArray() options?: unknown[] | null;
  @IsString() answer: string;
  @IsOptional() @IsString() explanation?: string | null;
  @IsIn(['easy', 'medium', 'hard']) difficulty: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) score: number;
  @IsOptional() @Type(() => Number) @IsInt() companyId?: number | null;
  @IsOptional() @Type(() => Number) @IsInt() chainId?: number | null;
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']) status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
