import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryCompaniesDto } from './dto/query-companies.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { Prisma } from '../../generated/prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AdminCompanyService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  /** 按关键字、交易所和状态分页查询上市公司。 */
  async findAll(query: QueryCompaniesDto) {
    const keyword = query.keyword?.trim();
    const where = {
      ...(keyword
        ? {
            OR: [
              { stockCode: { contains: keyword } },
              { name: { contains: keyword } },
              { shortName: { contains: keyword } },
            ],
          }
        : {}),
      ...(query.exchange ? { exchange: query.exchange } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: { updatedAt: 'desc' },
        include: {
          sectors: { include: { sector: true } },
          _count: { select: { products: true } },
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      items: items.map(({ sectors, _count, ...company }) => ({
        ...company,
        sectors: sectors.map((item) => item.sector),
        productCount: _count.products,
      })),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  /** 查询公司详情以及产品、板块、标签等关联数据。 */
  async findOne(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        sectors: { include: { sector: true } },
        tags: { include: { tag: true } },
        products: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!company) throw new NotFoundException('公司不存在');

    const { sectors, tags, ...detail } = company;
    return {
      ...detail,
      sectors: sectors.map((item) => item.sector),
      tags: tags.map((item) => item.tag),
    };
  }

  /** 创建上市公司并记录新增操作。 */
  async create(dto: CreateCompanyDto, adminId: number) {
    try {
      const item = await this.prisma.company.create({ data: this.toCreateData(dto) });
      await this.audit.log(adminId, 'company', 'create', `新增公司“${item.shortName || item.name}”`, 'Company', item.id);
      return item;
    } catch (error) {
      this.handleUniqueError(error);
    }
  }

  /** 按传入字段更新公司资料，未传字段保持不变。 */
  async update(id: number, dto: UpdateCompanyDto, adminId: number) {
    await this.ensureCompany(id);
    try {
      const item = await this.prisma.company.update({ where: { id }, data: this.toUpdateData(dto) });
      await this.audit.log(adminId, 'company', 'update', `更新公司“${item.shortName || item.name}”`, 'Company', item.id);
      return item;
    } catch (error) {
      this.handleUniqueError(error);
    }
  }

  /** 单独修改公司发布状态，供列表快捷操作使用。 */
  async updateStatus(id: number, dto: UpdateCompanyStatusDto, adminId: number) {
    await this.ensureCompany(id);
    const item = await this.prisma.company.update({ where: { id }, data: { status: dto.status } });
    await this.audit.log(adminId, 'company', 'status', `调整公司“${item.shortName || item.name}”发布状态`, 'Company', item.id);
    return item;
  }

  /** 为指定公司新增主营产品。 */
  async createProduct(companyId: number, dto: CreateProductDto, adminId: number) {
    await this.ensureCompany(companyId);
    const item = await this.prisma.product.create({ data: { ...dto, companyId } });
    await this.audit.log(adminId, 'company', 'product-create', `新增主营产品“${item.name}”`, 'Product', item.id);
    return item;
  }

  /** 编辑属于指定公司的主营产品。 */
  async updateProduct(companyId: number, productId: number, dto: UpdateProductDto, adminId: number) {
    await this.ensureProduct(companyId, productId);
    const item = await this.prisma.product.update({ where: { id: productId }, data: dto });
    await this.audit.log(adminId, 'company', 'product-update', `更新主营产品“${item.name}”`, 'Product', item.id);
    return item;
  }

  /** 删除属于指定公司的主营产品。 */
  async deleteProduct(companyId: number, productId: number, adminId: number) {
    await this.ensureProduct(companyId, productId);
    const item = await this.prisma.product.delete({ where: { id: productId } });
    await this.audit.log(adminId, 'company', 'product-delete', `删除主营产品“${item.name}”`, 'Product', item.id);
    return { success: true };
  }

  /** 把创建 DTO 规范化为 Prisma 公司写入结构。 */
  private toCreateData(dto: CreateCompanyDto): Prisma.CompanyCreateInput {
    return {
      stockCode: dto.stockCode.trim(),
      name: dto.name.trim(),
      shortName: dto.shortName?.trim() || null,
      exchange: dto.exchange.trim(),
      description: dto.description?.trim() || null,
      logoUrl: dto.logoUrl?.trim() || null,
      status: dto.status,
      foundedAt: dto.foundedAt ? new Date(dto.foundedAt) : null,
      listedAt: dto.listedAt ? new Date(dto.listedAt) : null,
    };
  }

  /** 仅提取更新 DTO 中实际传入的字段。 */
  private toUpdateData(dto: UpdateCompanyDto): Prisma.CompanyUpdateInput {
    return {
      ...(dto.stockCode !== undefined ? { stockCode: dto.stockCode.trim() } : {}),
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.shortName !== undefined ? { shortName: dto.shortName?.trim() || null } : {}),
      ...(dto.exchange !== undefined ? { exchange: dto.exchange.trim() } : {}),
      ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
      ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl?.trim() || null } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.foundedAt !== undefined ? { foundedAt: dto.foundedAt ? new Date(dto.foundedAt) : null } : {}),
      ...(dto.listedAt !== undefined ? { listedAt: dto.listedAt ? new Date(dto.listedAt) : null } : {}),
    };
  }

  /** 校验公司存在，避免后续写操作返回不清晰的数据库错误。 */
  private async ensureCompany(id: number) {
    const company = await this.prisma.company.findUnique({ where: { id }, select: { id: true } });
    if (!company) throw new NotFoundException('公司不存在');
  }

  /** 同时校验产品存在且确实属于目标公司。 */
  private async ensureProduct(companyId: number, productId: number) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, companyId }, select: { id: true } });
    if (!product) throw new NotFoundException('主营产品不存在');
  }

  /** 将股票代码唯一键冲突转换成业务异常。 */
  private handleUniqueError(error: unknown): never {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      throw new ConflictException('股票代码已存在');
    }
    throw error;
  }
}
