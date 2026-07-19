import type { PublishStatus } from './company';

export interface CompanyOption { id: number; stockCode: string; name: string; shortName?: string | null }
export interface SectorItem { id: number; name: string; type: string; parentId?: number | null; parent?: { id: number; name: string } | null; companies: CompanyOption[]; companyCount: number; childCount: number; createdAt: string }
export interface TagItem { id: number; name: string; color?: string | null; companies: CompanyOption[]; companyCount: number }

export interface ChainListItem { id: number; name: string; description?: string | null; status: PublishStatus; updatedAt: string; _count: { nodes: number; edges: number } }
export interface ChainNodeItem { id: number; name: string; type: string; stage: string; description?: string | null; positionX: number; positionY: number; companyIds: number[]; companies: CompanyOption[] }
export interface ChainEdgeItem { id: number; sourceNodeId: number; targetNodeId: number; label?: string | null }
export interface ChainDetail extends ChainListItem { nodes: ChainNodeItem[]; edges: ChainEdgeItem[] }

export interface Announcement { id: number; companyId: number; title: string; sourceUrl?: string | null; sourceName?: string | null; category?: string | null; content?: string | null; publishedAt: string; aiSummary?: string | null; parseStatus: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'; reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED'; company: CompanyOption; _count?: { aiResults: number } }
export interface AiContent { summary?: string; products?: string[]; industryImpact?: string; suggestedTags?: string[]; risks?: string[]; opportunities?: string[]; [key: string]: unknown }
export interface AiResult { id: number; announcementId: number; rawResult: AiContent; editedResult?: AiContent | null; modelName: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; reviewedAt?: string | null; reviewer?: { id: number; displayName: string } | null; announcement: Announcement }

export interface Quiz { id: number; type: string; question: string; options?: string[] | null; answer: string; explanation?: string | null; difficulty: string; score: number; companyId?: number | null; chainId?: number | null; status: PublishStatus; company?: { id: number; shortName?: string | null; name: string } | null; chain?: { id: number; name: string } | null; updatedAt: string }
export interface SyncTask { id: number; name: string; type: string; status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'; lastRunAt?: string | null; errorMessage?: string | null; runCount: number; lastResult?: unknown }
export interface AuditLog { id: number; module: string; action: string; targetType?: string | null; targetId?: string | null; summary: string; createdAt: string; admin?: { id: number; displayName: string; username: string } | null }
