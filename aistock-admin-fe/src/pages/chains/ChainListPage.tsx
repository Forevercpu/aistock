import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DeleteOutlined, EditOutlined, PlusOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Button, Card, Drawer, Form, Input, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { deleteChain, getChains, saveChain } from '../../services/admin';
import type { ChainListItem } from '../../types/admin';

export function ChainListPage() {
  const navigate = useNavigate(); const queryClient = useQueryClient(); const [messageApi, holder] = message.useMessage();
  const [form] = Form.useForm(); const [open, setOpen] = useState(false); const [editing, setEditing] = useState<ChainListItem | null>(null);
  const { data = [], isLoading } = useQuery({ queryKey: ['chains'], queryFn: getChains });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['chains'] });
  const saveMutation = useMutation({ mutationFn: (values: { name: string; description?: string; status: string }) => saveChain(editing?.id ?? null, values), onSuccess: () => { messageApi.success('产业链已保存'); setOpen(false); refresh(); }, onError: () => messageApi.error('保存失败，名称可能已存在') });
  const deleteMutation = useMutation({ mutationFn: deleteChain, onSuccess: () => { messageApi.success('产业链已删除'); refresh(); }, onError: () => messageApi.error('删除失败，请检查关联题目') });
  const edit = (item?: ChainListItem) => { setEditing(item ?? null); form.setFieldsValue(item ? { name: item.name, description: item.description, status: item.status } : { status: 'DRAFT' }); setOpen(true); };
  const statusLabels = { DRAFT: '草稿', PUBLISHED: '已发布', ARCHIVED: '已归档' };
  return <>{holder}<Card className="module-card" title="产业链图谱" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => edit()}>新建产业链</Button>}><Table rowKey="id" loading={isLoading} dataSource={data} columns={[
    { title: '产业链名称', dataIndex: 'name', render: (value) => <strong>{value}</strong> },
    { title: '说明', dataIndex: 'description', ellipsis: true },
    { title: '节点/连线', dataIndex: '_count', width: 130, render: (value: ChainListItem['_count']) => `${value.nodes} / ${value.edges}` },
    { title: '状态', dataIndex: 'status', width: 100, render: (value: keyof typeof statusLabels) => <Tag color={value === 'PUBLISHED' ? 'cyan' : 'default'}>{statusLabels[value]}</Tag> },
    { title: '更新时间', dataIndex: 'updatedAt', width: 170, render: (value) => new Date(value).toLocaleString('zh-CN') },
    { title: '操作', width: 280, render: (_, item: ChainListItem) => <Space><Button type="text" icon={<ShareAltOutlined />} onClick={() => navigate(`/chains/${item.id}`)}>编辑图谱</Button><Button type="text" icon={<EditOutlined />} onClick={() => edit(item)}>资料</Button><Popconfirm title="确认删除该产业链？" onConfirm={() => deleteMutation.mutate(item.id)}><Button type="text" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm></Space> },
  ]} /></Card><Drawer title={editing ? '编辑产业链' : '新建产业链'} open={open} onClose={() => setOpen(false)} width={500} extra={<Button type="primary" loading={saveMutation.isPending} onClick={() => form.submit()}>保存</Button>} destroyOnHidden><Form form={form} layout="vertical" onFinish={(values) => saveMutation.mutate(values)}><Form.Item label="产业链名称" name="name" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="产业链说明" name="description"><Input.TextArea rows={5} /></Form.Item><Form.Item label="状态" name="status"><Select options={[{ value: 'DRAFT', label: '草稿' }, { value: 'PUBLISHED', label: '已发布' }, { value: 'ARCHIVED', label: '已归档' }]} /></Form.Item></Form></Drawer></>;
}
