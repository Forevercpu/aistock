import { api } from '../api';
import type { CompanyDetail, CompanyInput, CompanyListResponse, CompanyQuery, ProductInput, PublishStatus } from '../types/company';

export async function getCompanies(query: CompanyQuery) {
  const { data } = await api.get<CompanyListResponse>('/admin/companies', { params: query });
  return data;
}

export async function getCompany(id: number) {
  const { data } = await api.get<CompanyDetail>(`/admin/companies/${id}`);
  return data;
}

export async function createCompany(input: CompanyInput) {
  const { data } = await api.post('/admin/companies', input);
  return data;
}

export async function updateCompany(id: number, input: Partial<CompanyInput>) {
  const { data } = await api.patch(`/admin/companies/${id}`, input);
  return data;
}

export async function updateCompanyStatus(id: number, status: PublishStatus) {
  const { data } = await api.patch(`/admin/companies/${id}/status`, { status });
  return data;
}

export async function createProduct(companyId: number, input: ProductInput) {
  const { data } = await api.post(`/admin/companies/${companyId}/products`, input);
  return data;
}

export async function updateProduct(companyId: number, productId: number, input: Partial<ProductInput>) {
  const { data } = await api.patch(`/admin/companies/${companyId}/products/${productId}`, input);
  return data;
}

export async function deleteProduct(companyId: number, productId: number) {
  await api.delete(`/admin/companies/${companyId}/products/${productId}`);
}
