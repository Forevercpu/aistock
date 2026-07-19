import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Drawer, Form, Input, Select, Space, message } from 'antd';
import axios from 'axios';
import { createCompany, updateCompany } from '../../services/company';
import type { Company, CompanyInput } from '../../types/company';

interface CompanyFormDrawerProps {
  open: boolean;
  company?: Company | null;
  onClose: () => void;
  onSaved: () => void;
}

function getErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return '保存失败，请稍后重试';
  const value = error.response?.data?.message;
  return Array.isArray(value) ? value[0] : value ?? '保存失败，请稍后重试';
}

export function CompanyFormDrawer({ open, company, onClose, onSaved }: CompanyFormDrawerProps) {
  const [form] = Form.useForm<CompanyInput>();
  const [messageApi, contextHolder] = message.useMessage();
  const mutation = useMutation({
    mutationFn: (values: CompanyInput) => company ? updateCompany(company.id, values) : createCompany(values),
    onSuccess: () => {
      messageApi.success(company ? '公司资料已更新' : '公司已创建');
      onSaved();
      onClose();
    },
    onError: (error) => messageApi.error(getErrorMessage(error)),
  });

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(company ? {
      stockCode: company.stockCode,
      name: company.name,
      shortName: company.shortName,
      exchange: company.exchange,
      description: company.description,
      logoUrl: company.logoUrl,
      status: company.status,
      foundedAt: company.foundedAt?.slice(0, 10),
      listedAt: company.listedAt?.slice(0, 10),
    } : { status: 'DRAFT', exchange: 'SSE' });
  }, [company, form, open]);

  const submit = (values: CompanyInput) => mutation.mutate({
    ...values,
    stockCode: values.stockCode.trim(),
    name: values.name.trim(),
    shortName: values.shortName?.trim() || null,
    description: values.description?.trim() || null,
    logoUrl: values.logoUrl?.trim() || null,
    foundedAt: values.foundedAt || null,
    listedAt: values.listedAt || null,
  });

  return (
    <>
      {contextHolder}
      <Drawer
        title={company ? '编辑上市公司' : '新增上市公司'}
        width={560}
        open={open}
        onClose={onClose}
        destroyOnHidden
        extra={<Space><Button onClick={onClose}>取消</Button><Button type="primary" loading={mutation.isPending} onClick={() => form.submit()}>保存</Button></Space>}
      >
        <Form form={form} layout="vertical" requiredMark="optional" onFinish={submit}>
          <div className="form-grid">
            <Form.Item label="股票代码" name="stockCode" rules={[{ required: true, message: '请输入股票代码' }, { max: 10 }]}>
              <Input placeholder="例如：600000" disabled={Boolean(company)} />
            </Form.Item>
            <Form.Item label="交易所" name="exchange" rules={[{ required: true, message: '请选择交易所' }]}>
              <Select options={[{ value: 'SSE', label: '上海证券交易所' }, { value: 'SZSE', label: '深圳证券交易所' }, { value: 'BSE', label: '北京证券交易所' }]} />
            </Form.Item>
          </div>
          <div className="form-grid">
            <Form.Item label="公司名称" name="name" rules={[{ required: true, message: '请输入公司名称' }, { max: 100 }]}>
              <Input placeholder="请输入公司完整名称" />
            </Form.Item>
            <Form.Item label="公司简称" name="shortName" rules={[{ max: 50 }]}>
              <Input placeholder="请输入公司简称" />
            </Form.Item>
          </div>
          <div className="form-grid">
            <Form.Item label="成立日期" name="foundedAt"><Input type="date" /></Form.Item>
            <Form.Item label="上市日期" name="listedAt"><Input type="date" /></Form.Item>
          </div>
          <Form.Item label="Logo 地址" name="logoUrl" rules={[{ type: 'url', message: '请输入完整的 URL 地址' }]}>
            <Input placeholder="https://example.com/logo.png" />
          </Form.Item>
          <Form.Item label="公司简介" name="description">
            <Input.TextArea rows={5} maxLength={2000} showCount placeholder="简要说明公司的主营方向和核心能力" />
          </Form.Item>
          <Form.Item label="发布状态" name="status" rules={[{ required: true }]}>
            <Select options={[{ value: 'DRAFT', label: '草稿' }, { value: 'PUBLISHED', label: '已发布' }, { value: 'ARCHIVED', label: '已归档' }]} />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
