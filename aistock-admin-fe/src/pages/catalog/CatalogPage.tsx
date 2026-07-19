import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DeleteOutlined, EditOutlined, LinkOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Drawer, Form, Input, Modal, Popconfirm, Select, Space, Table, message } from 'antd';
import axios from 'axios';
import { deleteSector, deleteTag, getCompanyOptions, getSectors, getTags, saveSector, saveTag, setSectorCompanies, setTagCompanies } from '../../services/admin';
import type { SectorItem, TagItem } from '../../types/admin';

type CatalogItem = SectorItem | TagItem;
interface CatalogPageProps { kind: 'sector' | 'tag' }

const sectorTypes: Record<string, string> = { industry: '行业', concept: '概念', region: '地域', index: '指数成分' };
/** 从 Axios 或参数校验错误中提取第一条可读提示。 */
const getError = (error: unknown) => axios.isAxiosError(error) ? (Array.isArray(error.response?.data?.message) ? error.response?.data?.message[0] : error.response?.data?.message || '操作失败') : '操作失败';

/** 复用同一套界面管理板块/概念或标签。 */
export function CatalogPage({ kind }: CatalogPageProps) {
  const isSector = kind === 'sector';
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [relationItem, setRelationItem] = useState<CatalogItem | null>(null);
  const [companyIds, setCompanyIds] = useState<number[]>([]);
  const queryKey = isSector ? 'sectors' : 'tags';
  const { data = [], isLoading } = useQuery<CatalogItem[]>({ queryKey: [queryKey], queryFn: async () => isSector ? await getSectors() : await getTags() });
  const { data: companyOptions = [] } = useQuery({ queryKey: ['company-options'], queryFn: getCompanyOptions });
  /** 使当前分类列表缓存失效并自动重新请求。 */
  const refresh = () => void queryClient.invalidateQueries({ queryKey: [queryKey] });
  const saveMutation = useMutation({ mutationFn: (values: Record<string, unknown>) => isSector ? saveSector(editing?.id ?? null, values as { name: string; type: string; parentId?: number | null }) : saveTag(editing?.id ?? null, values as { name: string; color?: string | null }), onSuccess: () => { messageApi.success('保存成功'); setDrawerOpen(false); refresh(); }, onError: (error) => messageApi.error(getError(error)) });
  const deleteMutation = useMutation({ mutationFn: (id: number) => isSector ? deleteSector(id) : deleteTag(id), onSuccess: () => { messageApi.success('删除成功'); refresh(); }, onError: (error) => messageApi.error(getError(error)) });
  const relationMutation = useMutation({ mutationFn: async () => { if (!relationItem) return; if (isSector) await setSectorCompanies(relationItem.id, companyIds); else await setTagCompanies(relationItem.id, companyIds); }, onSuccess: () => { messageApi.success('关联公司已更新'); setRelationItem(null); refresh(); }, onError: (error) => messageApi.error(getError(error)) });
  /** 打开新增或编辑抽屉，并按当前分类类型回填表单。 */
  const openEditor = (item?: CatalogItem) => { setEditing(item ?? null); form.setFieldsValue(item ? { name: item.name, ...('type' in item ? { type: item.type, parentId: item.parentId } : { color: item.color }) } : isSector ? { type: 'industry' } : { color: '#56d6ff' }); setDrawerOpen(true); };
  /** 打开公司关联弹窗并回填已选公司编号。 */
  const openRelations = (item: CatalogItem) => { setRelationItem(item); setCompanyIds(item.companies.map((company) => company.id)); };

  const columns = [
    { title: isSector ? '板块名称' : '标签名称', dataIndex: 'name', render: (value: string, item: CatalogItem) => isSector ? <strong>{value}</strong> : <span className="catalog-tag"><i style={{ backgroundColor: (item as TagItem).color || '#56d6ff', color: (item as TagItem).color || '#56d6ff' }} />{value}</span> },
    ...(isSector ? [{ title: '类型', dataIndex: 'type', width: 120, render: (value: string) => sectorTypes[value] || value }, { title: '上级分类', dataIndex: 'parent', width: 150, render: (value: SectorItem['parent']) => value?.name || '-' }, { title: '下级分类', dataIndex: 'childCount', width: 100, render: (value: number) => `${value} 个` }] : []),
    { title: '关联公司', dataIndex: 'companyCount', width: 120, render: (value: number) => `${value} 家` },
    { title: '操作', width: 260, render: (_: unknown, item: CatalogItem) => <Space><Button type="text" icon={<LinkOutlined />} onClick={() => openRelations(item)}>关联公司</Button><Button type="text" icon={<EditOutlined />} onClick={() => openEditor(item)}>编辑</Button><Popconfirm title={`确认删除“${item.name}”？`} onConfirm={() => deleteMutation.mutate(item.id)}><Button type="text" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm></Space> },
  ];

  return <>
    {contextHolder}
    <Card className="module-card" title={isSector ? '板块与概念' : '公司标签'} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>{isSector ? '新增板块' : '新增标签'}</Button>}>
      <Table rowKey="id" loading={isLoading} dataSource={data as CatalogItem[]} columns={columns} pagination={{ pageSize: 12 }} scroll={{ x: 850 }} />
    </Card>
    <Drawer title={`${editing ? '编辑' : '新增'}${isSector ? '板块' : '标签'}`} open={drawerOpen} width={480} onClose={() => setDrawerOpen(false)} extra={<Button type="primary" loading={saveMutation.isPending} onClick={() => form.submit()}>保存</Button>} destroyOnHidden>
      <Form form={form} layout="vertical" onFinish={(values) => saveMutation.mutate(values)}>
        <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}><Input /></Form.Item>
        {isSector ? <><Form.Item label="分类类型" name="type" rules={[{ required: true }]}><Select options={Object.entries(sectorTypes).map(([value, label]) => ({ value, label }))} /></Form.Item><Form.Item label="上级分类" name="parentId"><Select allowClear showSearch optionFilterProp="label" options={(data as SectorItem[]).filter((item) => item.id !== editing?.id).map((item) => ({ value: item.id, label: item.name }))} /></Form.Item></> : <Form.Item label="标签颜色" name="color"><Input type="color" className="color-input" /></Form.Item>}
      </Form>
    </Drawer>
    <Modal title={`关联公司 · ${relationItem?.name ?? ''}`} open={Boolean(relationItem)} onCancel={() => setRelationItem(null)} onOk={() => relationMutation.mutate()} confirmLoading={relationMutation.isPending} destroyOnHidden>
      <Select mode="multiple" showSearch optionFilterProp="label" value={companyIds} onChange={setCompanyIds} placeholder="请选择关联公司" style={{ width: '100%' }} options={companyOptions.map((company) => ({ value: company.id, label: `${company.stockCode} ${company.shortName || company.name}` }))} />
    </Modal>
  </>;
}
