import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryCompaniesDto } from './dto/query-companies.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { Prisma } from '../../generated/prisma/client';

@Injectable()
export class AdminCompanyService {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(dto: CreateCompanyDto) {
    try {
      return await this.prisma.company.create({ data: this.toCreateData(dto) });
    } catch (error) {
      this.handleUniqueError(error);
    }
  }

  async update(id: number, dto: UpdateCompanyDto) {
    await this.ensureCompany(id);
    try {
      return await this.prisma.company.update({ where: { id }, data: this.toUpdateData(dto) });
    } catch (error) {
      this.handleUniqueError(error);
    }
  }

  async updateStatus(id: number, dto: UpdateCompanyStatusDto) {
    await this.ensureCompany(id);
    return this.prisma.company.update({ where: { id }, data: { status: dto.status } });
  }

  async createProduct(companyId: number, dto: CreateProductDto) {
    await this.ensureCompany(companyId);
    return this.prisma.product.create({ data: { ...dto, companyId } });
  }

  async updateProduct(companyId: number, productId: number, dto: UpdateProductDto) {
    await this.ensureProduct(companyId, productId);
    return this.prisma.product.update({ where: { id: productId }, data: dto });
  }

  async deleteProduct(companyId: number, productId: number) {
    await this.ensureProduct(companyId, productId);
    await this.prisma.product.delete({ where: { id: productId } });
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
