import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TeamOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Progress, Row, Statistic, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import { getDashboardOverview } from '../api';

const activityData = [
  { key: '1', company: '东山精密', action: '更新主营产品与 AI 算力标签', operator: '系统同步', status: '已完成', time: '10 分钟前' },
  { key: '2', company: '光迅科技', action: '待审核 2026 半年度业绩预告', operator: 'AI 解析', status: '待审核', time: '32 分钟前' },
  { key: '3', company: '云南锗业', action: '补充锗产业链上游关系', operator: '管理员', status: '已完成', time: '1 小时前' },
];

const columns: TableProps<(typeof activityData)[number]>['columns'] = [
  { title: '公司', dataIndex: 'company', render: (value) => <Typography.Text strong>{value}</Typography.Text> },
  { title: '变更内容', dataIndex: 'action' },
  { title: '来源', dataIndex: 'operator' },
  { title: '状态', dataIndex: 'status', render: (value) => <Tag color={value === '已完成' ? 'cyan' : 'gold'}>{value}</Tag> },
  { title: '时间', dataIndex: 'time' },
];

export function DashboardPage() {
  const { data, isError } = useQuery({ queryKey: ['dashboard-overview'], queryFn: getDashboardOverview });
  const stats = useMemo(() => [
    { title: '上市公司', value: data?.companies ?? 0, suffix: '家', accent: '#56d6ff' },
    { title: '板块与概念', value: data?.sectors ?? 0, suffix: '个', accent: '#8f7cff' },
    { title: '公告文档', value: data?.announcements ?? 0, suffix: '份', accent: '#58e7ac' },
    { title: '待审核内容', value: data?.pendingReviews ?? 0, suffix: '条', accent: '#ffbd59' },
  ], [data]);

  return (
    <>
      <div className="hero-panel">
        <div><Tag color="cyan">SYSTEM ONLINE</Tag><Typography.Title>早上好，开始完善今天的知识图谱吧</Typography.Title><Typography.Paragraph>统一维护公司、板块、产业链和公告，让每一张公司卡牌都有可信的数据来源。</Typography.Paragraph></div>
        <div className="hero-orbit"><span>公司</span><i /><span>产业</span></div>
      </div>
      {(isError || data?.databaseConnected === false) && <div className="connection-tip">后端已启动，但数据库尚未连接；统计数据暂以 0 展示。</div>}
      <Row gutter={[16, 16]} className="stat-row">
        {stats.map((item) => <Col xs={24} sm={12} xl={6} key={item.title}><Card className="stat-card" style={{ '--accent': item.accent } as React.CSSProperties}><Statistic title={item.title} value={item.value} suffix={item.suffix} /><div className="stat-line" /></Card></Col>)}
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}><Card title="最近数据变更" extra={<Button type="link">查看全部</Button>} className="panel-card"><Table columns={columns} dataSource={activityData} pagination={false} scroll={{ x: 720 }} /></Card></Col>
        <Col xs={24} xl={8}><Card title="数据完善度" className="panel-card completeness"><div><Flex justify="space-between"><span>公司基础资料</span><strong>72%</strong></Flex><Progress percent={72} showInfo={false} strokeColor="#56d6ff" /></div><div><Flex justify="space-between"><span>产业链关系</span><strong>46%</strong></Flex><Progress percent={46} showInfo={false} strokeColor="#8f7cff" /></div><div><Flex justify="space-between"><span>公告 AI 解析</span><strong>61%</strong></Flex><Progress percent={61} showInfo={false} strokeColor="#58e7ac" /></div><div className="quality-note"><TeamOutlined /> 数据质量将直接影响用户端卡牌与题库体验</div></Card></Col>
      </Row>
    </>
  );
}
