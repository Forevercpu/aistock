import { api } from '../api';
import type { CompanyDetail, CompanyInput, CompanyListResponse, CompanyQuery, ProductInput, PublishStatus } from '../types/company';

/** 分页查询上市公司列表。 */
export async function getCompanies(query: CompanyQuery) {
  const { data } = await api.get<CompanyListResponse>('/admin/companies', { params: query });
  return data;
}

/** 查询单家公司的完整资料和关联数据。 */
export async function getCompany(id: number) {
  const { data } = await api.get<CompanyDetail>(`/admin/companies/${id}`);
  return data;
}

/** 新增上市公司。 */
export async function createCompany(input: CompanyInput) {
  const { data } = await api.post('/admin/companies', input);
  return data;
}

/** 按传入字段编辑上市公司。 */
export async function updateCompany(id: number, input: Partial<CompanyInput>) {
  const { data } = await api.patch(`/admin/companies/${id}`, input);
  return data;
}

/** 快捷修改公司的草稿、发布或归档状态。 */
export async function updateCompanyStatus(id: number, status: PublishStatus) {
  const { data } = await api.patch(`/admin/companies/${id}/status`, { status });
  return data;
}

/** 为公司新增主营产品。 */
export async function createProduct(companyId: number, input: ProductInput) {
  const { data } = await api.post(`/admin/companies/${companyId}/products`, input);
  return data;
}

/** 编辑公司已有主营产品。 */
export async function updateProduct(companyId: number, productId: number, input: Partial<ProductInput>) {
  const { data } = await api.patch(`/admin/companies/${companyId}/products/${productId}`, input);
  return data;
}

/** 删除公司主营产品。 */
export async function deleteProduct(companyId: number, productId: number) {
  await api.delete(`/admin/companies/${companyId}/products/${productId}`);
}
