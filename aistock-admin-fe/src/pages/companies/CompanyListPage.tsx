import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Input, Select, Space, Table, Tag, Typography, message } from 'antd';
import type { TableProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getCompanies, updateCompanyStatus } from '../../services/company';
import type { Company, CompanyQuery, PublishStatus } from '../../types/company';
import { CompanyFormDrawer } from './CompanyFormDrawer';

const statusMeta: Record<PublishStatus, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'default' },
  PUBLISHED: { label: '已发布', color: 'cyan' },
  ARCHIVED: { label: '已归档', color: 'orange' },
};

export function CompanyListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState<CompanyQuery>({ page: 1, pageSize: 10 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ['companies', query], queryFn: () => getCompanies(query) });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: PublishStatus }) => updateCompanyStatus(id, status),
    onSuccess: () => {
      messageApi.success('发布状态已更新');
      void queryClient.invalidateQueries({ queryKey: ['companies'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    },
    onError: () => messageApi.error('状态更新失败'),
  });

  const columns: TableProps<Company>['columns'] = [
    { title: '股票代码', dataIndex: 'stockCode', width: 120, render: (value) => <Typography.Text code>{value}</Typography.Text> },
    { title: '公司', dataIndex: 'name', width: 220, render: (_, record) => <div className="company-name"><strong>{record.shortName || record.name}</strong><span>{record.name}</span></div> },
    { title: '交易所', dataIndex: 'exchange', width: 100 },
    { title: '所属板块', dataIndex: 'sectors', width: 180, render: (sectors: Company['sectors']) => sectors.length ? sectors.map((sector) => <Tag key={sector.id}>{sector.name}</Tag>) : <span className="muted-text">暂未关联</span> },
    { title: '主营产品', dataIndex: 'productCount', width: 100, render: (value) => `${value} 项` },
    { title: '发布状态', dataIndex: 'status', width: 130, render: (value: PublishStatus, record) => <Select size="small" value={value} loading={statusMutation.isPending && statusMutation.variables?.id === record.id} style={{ width: 100 }} onChange={(status) => statusMutation.mutate({ id: record.id, status })} options={Object.entries(statusMeta).map(([key, meta]) => ({ value: key, label: meta.label }))} /> },
    { title: '更新时间', dataIndex: 'updatedAt', width: 170, render: (value) => new Date(value).toLocaleString('zh-CN') },
    { title: '操作', key: 'actions', fixed: 'right', width: 150, render: (_, record) => <Space><Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/companies/${record.id}`)}>详情</Button><Button type="text" icon={<EditOutlined />} onClick={() => { setEditingCompany(record); setDrawerOpen(true); }}>编辑</Button></Space> },
  ];

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['companies'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
  };

  return (
    <>
      {contextHolder}
      <Card className="module-card">
        <Flex justify="space-between" align="center" gap={16} wrap="wrap" className="module-toolbar">
          <Space wrap>
            <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} onPressEnter={() => setQuery((prev) => ({ ...prev, page: 1, keyword: keyword.trim() || undefined }))} prefix={<SearchOutlined />} allowClear placeholder="公司名称或股票代码" style={{ width: 240 }} />
            <Select allowClear placeholder="交易所" style={{ width: 150 }} value={query.exchange} onChange={(exchange) => setQuery((prev) => ({ ...prev, page: 1, exchange }))} options={[{ value: 'SSE', label: '上海证券交易所' }, { value: 'SZSE', label: '深圳证券交易所' }, { value: 'BSE', label: '北京证券交易所' }]} />
            <Select allowClear placeholder="发布状态" style={{ width: 130 }} value={query.status} onChange={(status) => setQuery((prev) => ({ ...prev, page: 1, status }))} options={Object.entries(statusMeta).map(([value, meta]) => ({ value, label: meta.label }))} />
            <Button onClick={() => setQuery((prev) => ({ ...prev, page: 1, keyword: keyword.trim() || undefined }))}>查询</Button>
            <Button onClick={() => { setKeyword(''); setQuery({ page: 1, pageSize: 10 }); }}>重置</Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCompany(null); setDrawerOpen(true); }}>新增公司</Button>
        </Flex>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data?.items}
          loading={isLoading}
          scroll={{ x: 1250 }}
          pagination={{ current: query.page, pageSize: query.pageSize, total: data?.pagination.total, showSizeChanger: true, showTotal: (total) => `共 ${total} 家公司`, onChange: (page, pageSize) => setQuery((prev) => ({ ...prev, page, pageSize })) }}
        />
      </Card>
      <CompanyFormDrawer open={drawerOpen} company={editingCompany} onClose={() => setDrawerOpen(false)} onSaved={refresh} />
    </>
  );
}
