import { api } from '../api';
import type { AiContent, AiResult, Announcement, AuditLog, ChainDetail, ChainListItem, CompanyOption, Quiz, SectorItem, SyncTask, TagItem } from '../types/admin';

export const getCompanyOptions = async () => (await api.get<CompanyOption[]>('/admin/catalog/company-options')).data;
export const getSectors = async () => (await api.get<SectorItem[]>('/admin/catalog/sectors')).data;
export const saveSector = async (id: number | null, values: { name: string; type: string; parentId?: number | null }) => (await (id ? api.patch(`/admin/catalog/sectors/${id}`, values) : api.post('/admin/catalog/sectors', values))).data;
export const deleteSector = async (id: number) => api.delete(`/admin/catalog/sectors/${id}`);
export const setSectorCompanies = async (id: number, companyIds: number[]) => api.put(`/admin/catalog/sectors/${id}/companies`, { companyIds });
export const getTags = async () => (await api.get<TagItem[]>('/admin/catalog/tags')).data;
export const saveTag = async (id: number | null, values: { name: string; color?: string | null }) => (await (id ? api.patch(`/admin/catalog/tags/${id}`, values) : api.post('/admin/catalog/tags', values))).data;
export const deleteTag = async (id: number) => api.delete(`/admin/catalog/tags/${id}`);
export const setTagCompanies = async (id: number, companyIds: number[]) => api.put(`/admin/catalog/tags/${id}/companies`, { companyIds });

export const getChains = async () => (await api.get<ChainListItem[]>('/admin/chains')).data;
export const getChain = async (id: number) => (await api.get<ChainDetail>(`/admin/chains/${id}`)).data;
export const saveChain = async (id: number | null, values: { name: string; description?: string | null; status?: string }) => (await (id ? api.patch(`/admin/chains/${id}`, values) : api.post('/admin/chains', values))).data;
export const deleteChain = async (id: number) => api.delete(`/admin/chains/${id}`);
export const saveChainGraph = async (id: number, graph: unknown) => (await api.put<ChainDetail>(`/admin/chains/${id}/graph`, graph)).data;

export interface AnnouncementInput { companyId: number; title: string; sourceUrl?: string | null; sourceName?: string | null; category?: string | null; content?: string | null; publishedAt: string }
export const getAnnouncements = async (params: Record<string, unknown>) => (await api.get<{ items: Announcement[]; pagination: { total: number } }>('/admin/announcements', { params })).data;
export const saveAnnouncement = async (id: number | null, values: AnnouncementInput) => (await (id ? api.patch(`/admin/announcements/${id}`, values) : api.post('/admin/announcements', values))).data;
export const deleteAnnouncement = async (id: number) => api.delete(`/admin/announcements/${id}`);
export const parseAnnouncement = async (id: number) => api.post(`/admin/announcements/${id}/parse`);
export const getAiResults = async (status?: string) => (await api.get<AiResult[]>('/admin/ai-results', { params: { status } })).data;
export const reviewAiResult = async (id: number, status: 'APPROVED' | 'REJECTED', editedResult?: AiContent) => (await api.patch(`/admin/ai-results/${id}/review`, { status, editedResult })).data;

export interface QuizInput { type: string; question: string; options?: string[] | null; answer: string; explanation?: string | null; difficulty: string; score: number; companyId?: number | null; chainId?: number | null; status: string }
export const getQuizzes = async (params: Record<string, unknown>) => (await api.get<Quiz[]>('/admin/quizzes', { params })).data;
export const saveQuiz = async (id: number | null, values: QuizInput) => (await (id ? api.patch(`/admin/quizzes/${id}`, values) : api.post('/admin/quizzes', values))).data;
export const deleteQuiz = async (id: number) => api.delete(`/admin/quizzes/${id}`);

export const getSyncTasks = async () => (await api.get<SyncTask[]>('/admin/system/sync-tasks')).data;
export const runSyncTask = async (id: number) => (await api.post(`/admin/system/sync-tasks/${id}/run`)).data;
export const getAuditLogs = async () => (await api.get<AuditLog[]>('/admin/system/audit-logs')).data;
export const updateProfile = async (displayName: string) => (await api.patch('/admin/auth/profile', { displayName })).data;
export const changePassword = async (currentPassword: string, newPassword: string) => (await api.post('/admin/auth/change-password', { currentPassword, newPassword })).data;
