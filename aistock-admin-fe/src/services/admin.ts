import { api } from '../api';
import type { AiContent, AiResult, Announcement, AuditLog, ChainDetail, ChainListItem, CompanyOption, Quiz, SectorItem, SyncTask, TagItem } from '../types/admin';

// 板块、概念与标签接口
/** 获取关联选择器使用的公司选项。 */
export const getCompanyOptions = async () => (await api.get<CompanyOption[]>('/admin/catalog/company-options')).data;
/** 查询板块与概念列表。 */
export const getSectors = async () => (await api.get<SectorItem[]>('/admin/catalog/sectors')).data;
/** 根据 id 是否存在新增或编辑板块。 */
export const saveSector = async (id: number | null, values: { name: string; type: string; parentId?: number | null }) => (await (id ? api.patch(`/admin/catalog/sectors/${id}`, values) : api.post('/admin/catalog/sectors', values))).data;
/** 删除指定板块。 */
export const deleteSector = async (id: number) => api.delete(`/admin/catalog/sectors/${id}`);
/** 整体更新板块关联的公司。 */
export const setSectorCompanies = async (id: number, companyIds: number[]) => api.put(`/admin/catalog/sectors/${id}/companies`, { companyIds });
/** 查询标签列表。 */
export const getTags = async () => (await api.get<TagItem[]>('/admin/catalog/tags')).data;
/** 根据 id 是否存在新增或编辑标签。 */
export const saveTag = async (id: number | null, values: { name: string; color?: string | null }) => (await (id ? api.patch(`/admin/catalog/tags/${id}`, values) : api.post('/admin/catalog/tags', values))).data;
/** 删除指定标签。 */
export const deleteTag = async (id: number) => api.delete(`/admin/catalog/tags/${id}`);
/** 整体更新标签关联的公司。 */
export const setTagCompanies = async (id: number, companyIds: number[]) => api.put(`/admin/catalog/tags/${id}/companies`, { companyIds });

// 产业链及图谱接口
/** 查询产业链列表。 */
export const getChains = async () => (await api.get<ChainListItem[]>('/admin/chains')).data;
/** 查询产业链图谱详情。 */
export const getChain = async (id: number) => (await api.get<ChainDetail>(`/admin/chains/${id}`)).data;
/** 根据 id 是否存在新增或编辑产业链。 */
export const saveChain = async (id: number | null, values: { name: string; description?: string | null; status?: string }) => (await (id ? api.patch(`/admin/chains/${id}`, values) : api.post('/admin/chains', values))).data;
/** 删除指定产业链。 */
export const deleteChain = async (id: number) => api.delete(`/admin/chains/${id}`);
/** 整体保存产业链节点和连线。 */
export const saveChainGraph = async (id: number, graph: unknown) => (await api.put<ChainDetail>(`/admin/chains/${id}/graph`, graph)).data;

/** 公告新建和编辑表单的数据结构。 */
export interface AnnouncementInput { companyId: number; title: string; sourceUrl?: string | null; sourceName?: string | null; category?: string | null; content?: string | null; publishedAt: string }
/** 分页查询公告。 */
export const getAnnouncements = async (params: Record<string, unknown>) => (await api.get<{ items: Announcement[]; pagination: { total: number } }>('/admin/announcements', { params })).data;
/** 根据 id 是否存在新增或编辑公告。 */
export const saveAnnouncement = async (id: number | null, values: AnnouncementInput) => (await (id ? api.patch(`/admin/announcements/${id}`, values) : api.post('/admin/announcements', values))).data;
/** 删除指定公告。 */
export const deleteAnnouncement = async (id: number) => api.delete(`/admin/announcements/${id}`);
/** 触发指定公告的模拟 AI 解析。 */
export const parseAnnouncement = async (id: number) => api.post(`/admin/announcements/${id}/parse`);
/** 按状态获取 AI 解析审核队列。 */
export const getAiResults = async (status?: string) => (await api.get<AiResult[]>('/admin/ai-results', { params: { status } })).data;
/** 提交 AI 解析结果的通过或驳回结论。 */
export const reviewAiResult = async (id: number, status: 'APPROVED' | 'REJECTED', editedResult?: AiContent) => (await api.patch(`/admin/ai-results/${id}/review`, { status, editedResult })).data;

/** 题目新建和编辑表单的数据结构。 */
export interface QuizInput { type: string; question: string; options?: string[] | null; answer: string; explanation?: string | null; difficulty: string; score: number; companyId?: number | null; chainId?: number | null; status: string }
/** 按筛选条件查询题库。 */
export const getQuizzes = async (params: Record<string, unknown>) => (await api.get<Quiz[]>('/admin/quizzes', { params })).data;
/** 根据 id 是否存在新增或编辑题目。 */
export const saveQuiz = async (id: number | null, values: QuizInput) => (await (id ? api.patch(`/admin/quizzes/${id}`, values) : api.post('/admin/quizzes', values))).data;
/** 删除指定题目。 */
export const deleteQuiz = async (id: number) => api.delete(`/admin/quizzes/${id}`);

// 系统设置、同步任务和账号接口
/** 查询同步任务列表。 */
export const getSyncTasks = async () => (await api.get<SyncTask[]>('/admin/system/sync-tasks')).data;
/** 立即执行指定同步任务。 */
export const runSyncTask = async (id: number) => (await api.post(`/admin/system/sync-tasks/${id}/run`)).data;
/** 查询最近的管理员审计日志。 */
export const getAuditLogs = async () => (await api.get<AuditLog[]>('/admin/system/audit-logs')).data;
/** 修改当前管理员显示名称。 */
export const updateProfile = async (displayName: string) => (await api.patch('/admin/auth/profile', { displayName })).data;
/** 修改当前管理员密码。 */
export const changePassword = async (currentPassword: string, newPassword: string) => (await api.post('/admin/auth/change-password', { currentPassword, newPassword })).data;
