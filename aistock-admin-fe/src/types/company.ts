/** 业务内容统一使用的发布生命周期。 */
export type PublishStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

/** 公司详情中展示的板块概要。 */
export interface SectorSummary {
  id: number;
  name: string;
  type: string;
}

/** 公司详情中展示的标签概要。 */
export interface TagSummary {
  id: number;
  name: string;
  color?: string | null;
}

/** 公司主营产品及可选营收占比。 */
export interface Product {
  id: number;
  companyId: number;
  name: string;
  description?: string | null;
  revenueRate?: string | number | null;
  createdAt: string;
}

/** 公司列表行数据。 */
export interface Company {
  id: number;
  stockCode: string;
  name: string;
  shortName?: string | null;
  exchange: string;
  description?: string | null;
  logoUrl?: string | null;
  status: PublishStatus;
  foundedAt?: string | null;
  listedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  sectors: SectorSummary[];
  productCount: number;
}

/** 公司基础信息、标签和主营产品组成的详情结构。 */
export interface CompanyDetail extends Omit<Company, 'productCount'> {
  tags: TagSummary[];
  products: Product[];
}

/** 公司新建/编辑表单提交结构。 */
export interface CompanyInput {
  stockCode: string;
  name: string;
  shortName?: string | null;
  exchange: string;
  description?: string | null;
  logoUrl?: string | null;
  status?: PublishStatus;
  foundedAt?: string | null;
  listedAt?: string | null;
}

/** 主营产品新建/编辑表单提交结构。 */
export interface ProductInput {
  name: string;
  description?: string;
  revenueRate?: number;
}

/** 公司分页与筛选查询参数。 */
export interface CompanyQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  exchange?: string;
  status?: PublishStatus;
}

/** 公司分页接口响应结构。 */
export interface CompanyListResponse {
  items: Company[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}
