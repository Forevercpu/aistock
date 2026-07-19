import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { QueryAnnouncementsDto, QueryQuizzesDto, ReviewAiDto, SaveAnnouncementDto, SaveQuizDto } from './dto/content.dto';

@Injectable()
export class AdminContentService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  /** 按公司、关键字及处理状态分页查询公告。 */
  async getAnnouncements(query: QueryAnnouncementsDto) {
    const where = { ...(query.keyword ? { title: { contains: query.keyword.trim() } } : {}), ...(query.companyId ? { companyId: query.companyId } : {}), ...(query.reviewStatus ? { reviewStatus: query.reviewStatus } : {}), ...(query.parseStatus ? { parseStatus: query.parseStatus } : {}) };
    const [items, total] = await Promise.all([
      this.prisma.announcement.findMany({ where, include: { company: { select: { id: true, stockCode: true, shortName: true, name: true } }, _count: { select: { aiResults: true } } }, orderBy: { publishedAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      this.prisma.announcement.count({ where }),
    ]);
    return { items, pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } };
  }

  /** 查询公告原文和历次 AI 解析结果。 */
  async getAnnouncement(id: number) {
    const item = await this.prisma.announcement.findUnique({ where: { id }, include: { company: true, aiResults: { orderBy: { createdAt: 'desc' }, include: { reviewer: { select: { id: true, displayName: true } } } } } });
    if (!item) throw new NotFoundException('公告不存在');
    return item;
  }

  /** 新增一条待解析公告。 */
  async createAnnouncement(dto: SaveAnnouncementDto, adminId: number) {
    const item = await this.prisma.announcement.create({ data: this.announcementData(dto) });
    await this.audit.log(adminId, 'announcement', 'create', `新增公告“${item.title}”`, 'Announcement', item.id);
    return item;
  }

  /** 更新公告来源、正文和发布时间等资料。 */
  async updateAnnouncement(id: number, dto: SaveAnnouncementDto, adminId: number) {
    await this.ensureAnnouncement(id);
    const item = await this.prisma.announcement.update({ where: { id }, data: this.announcementData(dto) });
    await this.audit.log(adminId, 'announcement', 'update', `更新公告“${item.title}”`, 'Announcement', item.id);
    return item;
  }

  /** 删除公告及由数据库级联管理的关联解析记录。 */
  async deleteAnnouncement(id: number, adminId: number) {
    const item = await this.ensureAnnouncement(id);
    await this.prisma.announcement.delete({ where: { id } });
    await this.audit.log(adminId, 'announcement', 'delete', `删除公告“${item.title}”`, 'Announcement', id);
    return { success: true };
  }

  /** 运行当前模拟解析器并生成一条待审核的结构化结果。 */
  async parseAnnouncement(id: number, adminId: number) {
    const item = await this.prisma.announcement.findUnique({ where: { id }, include: { company: true } });
    if (!item) throw new NotFoundException('公告不存在');
    await this.prisma.announcement.update({ where: { id }, data: { parseStatus: 'RUNNING' } });
    const companyName = item.company.shortName || item.company.name;
    const rawResult = {
      summary: `${companyName}发布《${item.title}》，模拟解析器已提取公告中的核心经营信息，具体结论需管理员结合原文复核。`,
      products: ['主营业务相关产品'],
      industryImpact: '公告内容可能影响公司所在产业链的市场预期。',
      suggestedTags: ['公告更新', '经营动态'],
      risks: ['模拟解析结果不构成投资建议'],
      opportunities: ['关注后续业务进展与正式披露数据'],
    };
    const result = await this.prisma.$transaction(async (tx) => {
      const created = await tx.aiParseResult.create({ data: { announcementId: id, rawResult, modelName: 'mock-provider-v1' } });
      await tx.announcement.update({ where: { id }, data: { parseStatus: 'SUCCESS', reviewStatus: 'PENDING', lastParsedAt: new Date(), aiSummary: rawResult.summary } });
      return created;
    });
    await this.audit.log(adminId, 'ai-review', 'parse', `解析公告“${item.title}”`, 'AiParseResult', result.id);
    return result;
  }

  /** 按审核状态查询 AI 解析结果队列。 */
  getAiResults(status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return this.prisma.aiParseResult.findMany({ where: status ? { status } : undefined, include: { announcement: { include: { company: { select: { id: true, stockCode: true, shortName: true, name: true } } } }, reviewer: { select: { id: true, displayName: true } } }, orderBy: { updatedAt: 'desc' } });
  }

  /** 查询单条 AI 结果及其公告和审核人信息。 */
  async getAiResult(id: number) {
    const item = await this.prisma.aiParseResult.findUnique({ where: { id }, include: { announcement: { include: { company: true } }, reviewer: { select: { id: true, displayName: true } } } });
    if (!item) throw new NotFoundException('AI 解析结果不存在');
    return item;
  }

  /** 保存人工修订结果，并同步公告的审核状态和最终摘要。 */
  async reviewAiResult(id: number, dto: ReviewAiDto, adminId: number) {
    const item = await this.getAiResult(id);
    const finalResult = dto.editedResult ?? (item.rawResult as Record<string, unknown>);
    const summary = typeof finalResult.summary === 'string' ? finalResult.summary : item.announcement.aiSummary;
    await this.prisma.$transaction([
      this.prisma.aiParseResult.update({ where: { id }, data: { status: dto.status, editedResult: dto.editedResult as Prisma.InputJsonValue | undefined, reviewerId: adminId, reviewedAt: new Date() } }),
      this.prisma.announcement.update({ where: { id: item.announcementId }, data: { reviewStatus: dto.status, aiSummary: summary } }),
    ]);
    await this.audit.log(adminId, 'ai-review', 'review', `${dto.status === 'APPROVED' ? '通过' : '驳回'}公告“${item.announcement.title}”的 AI 解析`, 'AiParseResult', id);
    return this.getAiResult(id);
  }

  /** 按题型、难度和发布状态筛选题库。 */
  getQuizzes(query: QueryQuizzesDto) {
    return this.prisma.quizQuestion.findMany({ where: { ...(query.keyword ? { question: { contains: query.keyword.trim() } } : {}), ...(query.type ? { type: query.type } : {}), ...(query.difficulty ? { difficulty: query.difficulty } : {}), ...(query.status ? { status: query.status } : {}) }, include: { company: { select: { id: true, shortName: true, name: true } }, chain: { select: { id: true, name: true } } }, orderBy: [{ weight: 'desc' }, { updatedAt: 'desc' }] });
  }

  /** 创建题目并写入审计日志。 */
  async createQuiz(dto: SaveQuizDto, adminId: number) {
    const item = await this.prisma.quizQuestion.create({ data: this.quizData(dto) });
    await this.audit.log(adminId, 'quiz', 'create', `新增题目“${item.question.slice(0, 30)}”`, 'QuizQuestion', item.id);
    return item;
  }

  /** 更新题目内容及关联公司或产业链。 */
  async updateQuiz(id: number, dto: SaveQuizDto, adminId: number) {
    await this.ensureQuiz(id);
    const item = await this.prisma.quizQuestion.update({ where: { id }, data: this.quizData(dto) });
    await this.audit.log(adminId, 'quiz', 'update', `更新题目“${item.question.slice(0, 30)}”`, 'QuizQuestion', item.id);
    return item;
  }

  /** 删除指定题目。 */
  async deleteQuiz(id: number, adminId: number) {
    const item = await this.ensureQuiz(id);
    await this.prisma.quizQuestion.delete({ where: { id } });
    await this.audit.log(adminId, 'quiz', 'delete', `删除题目“${item.question.slice(0, 30)}”`, 'QuizQuestion', id);
    return { success: true };
  }

  /** 规范化公告 DTO，统一处理空字符串和日期。 */
  private announcementData(dto: SaveAnnouncementDto) { return { companyId: dto.companyId, title: dto.title.trim(), sourceUrl: dto.sourceUrl?.trim() || null, sourceName: dto.sourceName?.trim() || null, category: dto.category?.trim() || null, content: dto.content?.trim() || null, publishedAt: new Date(dto.publishedAt) }; }
  /** 规范化题目 DTO，并转换 JSON 选项类型。 */
  private quizData(dto: SaveQuizDto): Prisma.QuizQuestionUncheckedCreateInput { return { type: dto.type, question: dto.question.trim(), options: (dto.options ?? undefined) as Prisma.InputJsonValue | undefined, answer: dto.answer.trim(), explanation: dto.explanation?.trim() || null, difficulty: dto.difficulty, score: dto.score, companyId: dto.companyId || null, chainId: dto.chainId || null, status: dto.status }; }
  /** 查询并确认公告存在。 */
  private async ensureAnnouncement(id: number) { const item = await this.prisma.announcement.findUnique({ where: { id } }); if (!item) throw new NotFoundException('公告不存在'); return item; }
  /** 查询并确认题目存在。 */
  private async ensureQuiz(id: number) { const item = await this.prisma.quizQuestion.findUnique({ where: { id } }); if (!item) throw new NotFoundException('题目不存在'); return item; }
}
