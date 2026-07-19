import type { PublishStatus } from './company';

/** 下拉选择器使用的轻量公司信息。 */
export interface CompanyOption { id: number; stockCode: string; name: string; shortName?: string | null }
/** 板块/概念列表项及其关联统计。 */
export interface SectorItem { id: number; name: string; type: string; parentId?: number | null; parent?: { id: number; name: string } | null; companies: CompanyOption[]; companyCount: number; childCount: number; createdAt: string }
/** 标签列表项及其关联公司。 */
export interface TagItem { id: number; name: string; color?: string | null; companies: CompanyOption[]; companyCount: number }

/** 产业链列表展示所需的概要信息。 */
export interface ChainListItem { id: number; name: string; description?: string | null; status: PublishStatus; updatedAt: string; _count: { nodes: number; edges: number } }
/** 图谱节点及关联公司和画布坐标。 */
export interface ChainNodeItem { id: number; name: string; type: string; stage: string; description?: string | null; positionX: number; positionY: number; companyIds: number[]; companies: CompanyOption[] }
/** 图谱有向连线。 */
export interface ChainEdgeItem { id: number; sourceNodeId: number; targetNodeId: number; label?: string | null }
/** 产业链概要和完整图谱的组合结构。 */
export interface ChainDetail extends ChainListItem { nodes: ChainNodeItem[]; edges: ChainEdgeItem[] }

/** 公告列表和详情共用的数据结构。 */
export interface Announcement { id: number; companyId: number; title: string; sourceUrl?: string | null; sourceName?: string | null; category?: string | null; content?: string | null; publishedAt: string; aiSummary?: string | null; parseStatus: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'; reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED'; company: CompanyOption; _count?: { aiResults: number } }
/** AI 从公告中提取的可编辑结构化内容。 */
export interface AiContent { summary?: string; products?: string[]; industryImpact?: string; suggestedTags?: string[]; risks?: string[]; opportunities?: string[]; [key: string]: unknown }
/** AI 解析记录及其公告、审核人信息。 */
export interface AiResult { id: number; announcementId: number; rawResult: AiContent; editedResult?: AiContent | null; modelName: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; reviewedAt?: string | null; reviewer?: { id: number; displayName: string } | null; announcement: Announcement }

/** 题库列表和编辑表单共用的数据结构。 */
export interface Quiz { id: number; type: string; question: string; options?: string[] | null; answer: string; explanation?: string | null; difficulty: string; score: number; companyId?: number | null; chainId?: number | null; status: PublishStatus; company?: { id: number; shortName?: string | null; name: string } | null; chain?: { id: number; name: string } | null; updatedAt: string }
/** 后台数据同步任务及其最近执行结果。 */
export interface SyncTask { id: number; name: string; type: string; status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'; lastRunAt?: string | null; errorMessage?: string | null; runCount: number; lastResult?: unknown }
/** 管理员关键操作的审计记录。 */
export interface AuditLog { id: number; module: string; action: string; targetType?: string | null; targetId?: string | null; summary: string; createdAt: string; admin?: { id: number; displayName: string; username: string } | null }
