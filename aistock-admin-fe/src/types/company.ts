export type PublishStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface SectorSummary {
  id: number;
  name: string;
  type: string;
}

export interface TagSummary {
  id: number;
  name: string;
  color?: string | null;
}

export interface Product {
  id: number;
  companyId: number;
  name: string;
  description?: string | null;
  revenueRate?: string | number | null;
  createdAt: string;
}

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

export interface CompanyDetail extends Omit<Company, 'productCount'> {
  tags: TagSummary[];
  products: Product[];
}

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

export interface ProductInput {
  name: string;
  description?: string;
  revenueRate?: number;
}

export interface CompanyQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  exchange?: string;
  status?: PublishStatus;
}

export interface CompanyListResponse {
  items: Company[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}
