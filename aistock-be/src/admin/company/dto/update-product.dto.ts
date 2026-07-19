import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

/** 主营产品编辑参数，所有创建字段均可选。 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
