import { PartialType } from '@nestjs/swagger';
import { CreateCompanyDto } from './create-company.dto';

/** 公司编辑参数，所有创建字段均可选。 */
export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}
