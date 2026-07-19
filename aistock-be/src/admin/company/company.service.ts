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

  async create(dto: CreateCompanyDto, adminId: number) {
    try {
      const item = await this.prisma.company.create({ data: this.toCreateData(dto) });
      await this.audit.log(adminId, 'company', 'create', `新增公司“${item.shortName || item.name}”`, 'Company', item.id);
      return item;
    } catch (error) {
      this.handleUniqueError(error);
    }
  }

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

  async updateStatus(id: number, dto: UpdateCompanyStatusDto, adminId: number) {
    await this.ensureCompany(id);
    const item = await this.prisma.company.update({ where: { id }, data: { status: dto.status } });
    await this.audit.log(adminId, 'company', 'status', `调整公司“${item.shortName || item.name}”发布状态`, 'Company', item.id);
    return item;
  }

  async createProduct(companyId: number, dto: CreateProductDto, adminId: number) {
    await this.ensureCompany(companyId);
    const item = await this.prisma.product.create({ data: { ...dto, companyId } });
    await this.audit.log(adminId, 'company', 'product-create', `新增主营产品“${item.name}”`, 'Product', item.id);
    return item;
  }

  async updateProduct(companyId: number, productId: number, dto: UpdateProductDto, adminId: number) {
    await this.ensureProduct(companyId, productId);
    const item = await this.prisma.product.update({ where: { id: productId }, data: dto });
    await this.audit.log(adminId, 'company', 'product-update', `更新主营产品“${item.name}”`, 'Product', item.id);
    return item;
  }

  async deleteProduct(companyId: number, productId: number, adminId: number) {
    await this.ensureProduct(companyId, productId);
    const item = await this.prisma.product.delete({ where: { id: productId } });
    await this.audit.log(adminId, 'company', 'product-delete', `删除主营产品“${item.name}”`, 'Product', item.id);
    return { success: true };
  }

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

  private async ensureCompany(id: number) {
    const company = await this.prisma.company.findUnique({ where: { id }, select: { id: true } });
    if (!company) throw new NotFoundException('公司不存在');
  }

  private async ensureProduct(companyId: number, productId: number) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, companyId }, select: { id: true } });
    if (!product) throw new NotFoundException('主营产品不存在');
  }

  private handleUniqueError(error: unknown): never {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      throw new ConflictException('股票代码已存在');
    }
    throw error;
  }
}
