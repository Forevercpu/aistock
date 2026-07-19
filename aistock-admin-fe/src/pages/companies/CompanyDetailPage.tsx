import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Empty, Flex, Form, Input, InputNumber, Modal, Popconfirm, Space, Spin, Table, Tag, Typography, message } from 'antd';
import type { TableProps } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, deleteProduct, getCompany, updateProduct } from '../../services/company';
import type { Product, ProductInput, PublishStatus } from '../../types/company';
import { CompanyFormDrawer } from './CompanyFormDrawer';

const statusMeta: Record<PublishStatus, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'default' },
  PUBLISHED: { label: '已发布', color: 'cyan' },
  ARCHIVED: { label: '已归档', color: 'orange' },
};

/** 展示公司完整资料，并在同页维护主营产品。 */
export function CompanyDetailPage() {
  const { id } = useParams();
  // 路由参数统一转换为后端使用的数字主键。
  const companyId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [companyDrawerOpen, setCompanyDrawerOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm] = Form.useForm<ProductInput>();
  const { data: company, isLoading, isError } = useQuery({ queryKey: ['company', companyId], queryFn: () => getCompany(companyId), enabled: Number.isInteger(companyId) });
  /** 刷新当前公司的详情缓存。 */
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['company', companyId] });
    void queryClient.invalidateQueries({ queryKey: ['companies'] });
  };
  const saveProductMutation = useMutation({
    mutationFn: (values: ProductInput) => editingProduct ? updateProduct(companyId, editingProduct.id, values) : createProduct(companyId, values),
    onSuccess: () => { messageApi.success(editingProduct ? '主营产品已更新' : '主营产品已新增'); setProductModalOpen(false); refresh(); },
    onError: () => messageApi.error('主营产品保存失败'),
  });
  const deleteMutation = useMutation({
    mutationFn: (productId: number) => deleteProduct(companyId, productId),
    onSuccess: () => { messageApi.success('主营产品已删除'); refresh(); },
    onError: () => messageApi.error('主营产品删除失败'),
  });

  const productColumns: TableProps<Product>['columns'] = [
    { title: '产品名称', dataIndex: 'name', width: 180, render: (value) => <Typography.Text strong>{value}</Typography.Text> },
    { title: '产品说明', dataIndex: 'description', render: (value) => value || <span className="muted-text">暂未填写</span> },
    { title: '营收占比', dataIndex: 'revenueRate', width: 130, render: (value) => value === null || value === undefined ? '-' : `${Number(value).toFixed(2)}%` },
    { title: '操作', width: 150, render: (_, record) => <Space><Button type="text" icon={<EditOutlined />} onClick={() => { setEditingProduct(record); productForm.setFieldsValue({ name: record.name, description: record.description ?? undefined, revenueRate: record.revenueRate == null ? undefined : Number(record.revenueRate) }); setProductModalOpen(true); }}>编辑</Button><Popconfirm title="确认删除该主营产品？" onConfirm={() => deleteMutation.mutate(record.id)}><Button type="text" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm></Space> },
  ];

  if (isLoading) return <div className="page-loading"><Spin size="large" /></div>;
  if (isError || !company) return <Card className="module-card"><Empty description="公司不存在或加载失败"><Button onClick={() => navigate('/companies')}>返回公司列表</Button></Empty></Card>;

  /** 清空产品表单并进入新增模式。 */
  const openNewProduct = () => { setEditingProduct(null); productForm.resetFields(); setProductModalOpen(true); };

  return (
    <>
      {contextHolder}
      <Flex justify="space-between" align="center" className="detail-header">
        <Space><Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/companies')}>返回</Button><div><Typography.Title level={3}>{company.shortName || company.name}</Typography.Title><Typography.Text type="secondary">{company.stockCode} · {company.exchange}</Typography.Text></div></Space>
        <Button type="primary" icon={<EditOutlined />} onClick={() => setCompanyDrawerOpen(true)}>编辑资料</Button>
      </Flex>
      <Card title="基础资料" className="module-card detail-card">
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }}>
          <Descriptions.Item label="公司全称">{company.name}</Descriptions.Item>
          <Descriptions.Item label="公司简称">{company.shortName || '-'}</Descriptions.Item>
          <Descriptions.Item label="发布状态"><Tag color={statusMeta[company.status].color}>{statusMeta[company.status].label}</Tag></Descriptions.Item>
          <Descriptions.Item label="成立日期">{company.foundedAt?.slice(0, 10) || '-'}</Descriptions.Item>
          <Descriptions.Item label="上市日期">{company.listedAt?.slice(0, 10) || '-'}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{new Date(company.updatedAt).toLocaleString('zh-CN')}</Descriptions.Item>
          <Descriptions.Item label="公司简介" span={3}>{company.description || '暂未填写公司简介'}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="板块与标签" className="module-card detail-card">
        <div className="relation-row"><span>所属板块</span><Space wrap>{company.sectors.length ? company.sectors.map((sector) => <Tag color="blue" key={sector.id}>{sector.name}</Tag>) : <span className="muted-text">暂未关联板块</span>}</Space></div>
        <div className="relation-row"><span>公司标签</span><Space wrap>{company.tags.length ? company.tags.map((tag) => <Tag color={tag.color || 'cyan'} key={tag.id}>{tag.name}</Tag>) : <span className="muted-text">暂未关联标签</span>}</Space></div>
        <Typography.Paragraph type="secondary" className="relation-tip">板块和标签的关联维护将在对应模块完成后开放。</Typography.Paragraph>
      </Card>
      <Card title="主营产品" extra={<Button type="primary" icon={<PlusOutlined />} onClick={openNewProduct}>新增产品</Button>} className="module-card detail-card">
        <Table rowKey="id" columns={productColumns} dataSource={company.products} pagination={false} scroll={{ x: 720 }} />
      </Card>
      <CompanyFormDrawer open={companyDrawerOpen} company={{ ...company, productCount: company.products.length }} onClose={() => setCompanyDrawerOpen(false)} onSaved={refresh} />
      <Modal title={editingProduct ? '编辑主营产品' : '新增主营产品'} open={productModalOpen} onCancel={() => setProductModalOpen(false)} onOk={() => productForm.submit()} confirmLoading={saveProductMutation.isPending} destroyOnHidden>
        <Form form={productForm} layout="vertical" onFinish={(values) => saveProductMutation.mutate({ ...values, name: values.name.trim(), description: values.description?.trim() || undefined })}>
          <Form.Item label="产品名称" name="name" rules={[{ required: true, message: '请输入产品名称' }, { max: 100 }]}><Input placeholder="请输入主营产品名称" /></Form.Item>
          <Form.Item label="营收占比" name="revenueRate" rules={[{ type: 'number', min: 0, max: 100, message: '请输入 0 到 100 之间的数值' }]}><InputNumber min={0} max={100} precision={4} addonAfter="%" style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="产品说明" name="description"><Input.TextArea rows={4} placeholder="说明产品用途或业务范围" /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
