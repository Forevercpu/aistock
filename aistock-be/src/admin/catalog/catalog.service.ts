import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SaveSectorDto, SaveTagDto } from './dto/catalog.dto';

@Injectable()
export class AdminCatalogService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  getCompanyOptions() {
    return this.prisma.company.findMany({ where: { status: { not: 'ARCHIVED' } }, select: { id: true, stockCode: true, name: true, shortName: true }, orderBy: { stockCode: 'asc' } });
  }

  async getSectors() {
    const items = await this.prisma.sector.findMany({ include: { parent: { select: { id: true, name: true } }, companies: { include: { company: { select: { id: true, stockCode: true, shortName: true, name: true } } } }, _count: { select: { children: true } } }, orderBy: [{ type: 'asc' }, { name: 'asc' }] });
    return items.map(({ companies, _count, ...item }) => ({ ...item, companies: companies.map((relation) => relation.company), companyCount: companies.length, childCount: _count.children }));
  }

  async createSector(dto: SaveSectorDto, adminId: number) {
    try {
      const item = await this.prisma.sector.create({ data: { name: dto.name.trim(), type: dto.type, parentId: dto.parentId || null } });
      await this.audit.log(adminId, 'sector', 'create', `新增板块“${item.name}”`, 'Sector', item.id);
      return item;
    } catch (error) { this.handleUnique(error, '板块名称已存在'); }
  }

  async updateSector(id: number, dto: SaveSectorDto, adminId: number) {
    await this.ensureSector(id);
    if (dto.parentId === id) throw new ConflictException('不能将自身设置为上级分类');
    try {
      const item = await this.prisma.sector.update({ where: { id }, data: { name: dto.name.trim(), type: dto.type, parentId: dto.parentId || null } });
      await this.audit.log(adminId, 'sector', 'update', `更新板块“${item.name}”`, 'Sector', item.id);
      return item;
    } catch (error) { this.handleUnique(error, '板块名称已存在'); }
  }

  async deleteSector(id: number, adminId: number) {
    const item = await this.prisma.sector.findUnique({ where: { id }, include: { _count: { select: { companies: true, children: true } } } });
    if (!item) throw new NotFoundException('板块不存在');
    if (item._count.companies || item._count.children) throw new ConflictException('请先移除关联公司和下级分类');
    await this.prisma.sector.delete({ where: { id } });
    await this.audit.log(adminId, 'sector', 'delete', `删除板块“${item.name}”`, 'Sector', id);
    return { success: true };
  }

  async setSectorCompanies(id: number, companyIds: number[], adminId: number) {
    await this.ensureSector(id);
    await this.prisma.$transaction(async (tx) => {
      await tx.companySector.deleteMany({ where: { sectorId: id } });
      if (companyIds.length) await tx.companySector.createMany({ data: [...new Set(companyIds)].map((companyId) => ({ sectorId: id, companyId })) });
    });
    await this.audit.log(adminId, 'sector', 'relate', `更新板块关联公司，共 ${companyIds.length} 家`, 'Sector', id);
    return { success: true };
  }

  async getTags() {
    const items = await this.prisma.tag.findMany({ include: { companies: { include: { company: { select: { id: true, stockCode: true, shortName: true, name: true } } } } }, orderBy: { name: 'asc' } });
    return items.map(({ companies, ...item }) => ({ ...item, companies: companies.map((relation) => relation.company), companyCount: companies.length }));
  }

  async createTag(dto: SaveTagDto, adminId: number) {
    try {
      const item = await this.prisma.tag.create({ data: { name: dto.name.trim(), color: dto.color || null } });
      await this.audit.log(adminId, 'tag', 'create', `新增标签“${item.name}”`, 'Tag', item.id);
      return item;
    } catch (error) { this.handleUnique(error, '标签名称已存在'); }
  }

  async updateTag(id: number, dto: SaveTagDto, adminId: number) {
    await this.ensureTag(id);
    try {
      const item = await this.prisma.tag.update({ where: { id }, data: { name: dto.name.trim(), color: dto.color || null } });
      await this.audit.log(adminId, 'tag', 'update', `更新标签“${item.name}”`, 'Tag', item.id);
      return item;
    } catch (error) { this.handleUnique(error, '标签名称已存在'); }
  }

  async deleteTag(id: number, adminId: number) {
    const item = await this.prisma.tag.findUnique({ where: { id }, include: { _count: { select: { companies: true } } } });
    if (!item) throw new NotFoundException('标签不存在');
    if (item._count.companies) throw new ConflictException('请先移除标签关联的公司');
    await this.prisma.tag.delete({ where: { id } });
    await this.audit.log(adminId, 'tag', 'delete', `删除标签“${item.name}”`, 'Tag', id);
    return { success: true };
  }

  async setTagCompanies(id: number, companyIds: number[], adminId: number) {
    await this.ensureTag(id);
    await this.prisma.$transaction(async (tx) => {
      await tx.companyTag.deleteMany({ where: { tagId: id } });
      if (companyIds.length) await tx.companyTag.createMany({ data: [...new Set(companyIds)].map((companyId) => ({ tagId: id, companyId })) });
    });
    await this.audit.log(adminId, 'tag', 'relate', `更新标签关联公司，共 ${companyIds.length} 家`, 'Tag', id);
    return { success: true };
  }

  private async ensureSector(id: number) { if (!await this.prisma.sector.findUnique({ where: { id }, select: { id: true } })) throw new NotFoundException('板块不存在'); }
  private async ensureTag(id: number) { if (!await this.prisma.tag.findUnique({ where: { id }, select: { id: true } })) throw new NotFoundException('标签不存在'); }
  private handleUnique(error: unknown, message: string): never { if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') throw new ConflictException(message); throw error; }
}
