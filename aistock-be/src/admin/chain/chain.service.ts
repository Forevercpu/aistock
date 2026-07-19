import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SaveChainDto, SaveChainGraphDto } from './dto/chain.dto';

@Injectable()
export class AdminChainService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  /** 查询产业链列表，并附带节点和连线数量。 */
  async findAll() {
    return this.prisma.industryChain.findMany({ include: { _count: { select: { nodes: true, edges: true } } }, orderBy: { updatedAt: 'desc' } });
  }

  /** 查询产业链图谱详情，将节点公司关系整理成前端所需结构。 */
  async findOne(id: number) {
    const item = await this.prisma.industryChain.findUnique({ where: { id }, include: { nodes: { include: { companies: { include: { company: { select: { id: true, stockCode: true, shortName: true, name: true } } } } }, orderBy: { id: 'asc' } }, edges: { orderBy: { id: 'asc' } } } });
    if (!item) throw new NotFoundException('产业链不存在');
    return { ...item, nodes: item.nodes.map(({ companies, ...node }) => ({ ...node, companies: companies.map((relation) => relation.company), companyIds: companies.map((relation) => relation.companyId) })) };
  }

  /** 新增产业链基础信息。 */
  async create(dto: SaveChainDto, adminId: number) {
    try {
      const item = await this.prisma.industryChain.create({ data: { name: dto.name.trim(), description: dto.description?.trim() || null, status: dto.status } });
      await this.audit.log(adminId, 'chain', 'create', `新增产业链“${item.name}”`, 'IndustryChain', item.id);
      return item;
    } catch (error) { this.handleUnique(error); }
  }

  /** 更新产业链名称、说明和发布状态。 */
  async update(id: number, dto: SaveChainDto, adminId: number) {
    await this.ensure(id);
    try {
      const item = await this.prisma.industryChain.update({ where: { id }, data: { name: dto.name.trim(), description: dto.description?.trim() || null, status: dto.status } });
      await this.audit.log(adminId, 'chain', 'update', `更新产业链“${item.name}”`, 'IndustryChain', item.id);
      return item;
    } catch (error) { this.handleUnique(error); }
  }

  /** 删除未被题库引用的产业链。 */
  async remove(id: number, adminId: number) {
    const item = await this.prisma.industryChain.findUnique({ where: { id }, include: { _count: { select: { quizQuestions: true } } } });
    if (!item) throw new NotFoundException('产业链不存在');
    if (item._count.quizQuestions) throw new ConflictException('该产业链仍有关联题目，请先移除关联');
    await this.prisma.industryChain.delete({ where: { id } });
    await this.audit.log(adminId, 'chain', 'delete', `删除产业链“${item.name}”`, 'IndustryChain', id);
    return { success: true };
  }

  /** 整体保存图谱：重建节点、公司关系和连线，保证数据一致。 */
  async saveGraph(id: number, dto: SaveChainGraphDto, adminId: number) {
    const chain = await this.ensure(id);
    await this.prisma.$transaction(async (tx) => {
      await tx.industryChainEdge.deleteMany({ where: { chainId: id } });
      await tx.industryChainNode.deleteMany({ where: { chainId: id } });
      const nodeIds = new Map<string, number>();
      for (const node of dto.nodes) {
        const created = await tx.industryChainNode.create({ data: { chainId: id, name: node.name.trim(), type: node.type, stage: node.stage, description: node.description?.trim() || null, positionX: node.positionX, positionY: node.positionY, companies: { create: [...new Set(node.companyIds)].map((companyId) => ({ companyId })) } } });
        nodeIds.set(node.clientId, created.id);
      }
      const edges = dto.edges.map((edge) => ({ chainId: id, sourceNodeId: nodeIds.get(edge.source), targetNodeId: nodeIds.get(edge.target), label: edge.label?.trim() || null }));
      if (edges.some((edge) => !edge.sourceNodeId || !edge.targetNodeId)) throw new ConflictException('连线引用了不存在的节点');
      if (edges.length) await tx.industryChainEdge.createMany({ data: edges as Array<{ chainId: number; sourceNodeId: number; targetNodeId: number; label: string | null }> });
      await tx.industryChain.update({ where: { id }, data: { graphData: { nodeCount: dto.nodes.length, edgeCount: dto.edges.length } } });
    });
    await this.audit.log(adminId, 'chain', 'graph', `保存产业链“${chain.name}”图谱，共 ${dto.nodes.length} 个节点`, 'IndustryChain', id);
    return this.findOne(id);
  }

  /** 查询并确认产业链存在。 */
  private async ensure(id: number) { const item = await this.prisma.industryChain.findUnique({ where: { id } }); if (!item) throw new NotFoundException('产业链不存在'); return item; }
  /** 将产业链名称唯一键错误转换为业务异常。 */
  private handleUnique(error: unknown): never { if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') throw new ConflictException('产业链名称已存在'); throw error; }
}
