import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AppstoreOutlined,
  ApartmentOutlined,
  BankOutlined,
  BellOutlined,
  BookOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RobotOutlined,
  SettingOutlined,
  TagsOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Card, Col, Flex, Layout, Menu, Progress, Row, Statistic, Table, Tag, Typography } from 'antd';
import type { MenuProps, TableProps } from 'antd';
import { getDashboardOverview } from './api';

const { Header, Sider, Content } = Layout;

interface AppMenuItem {
  key: string;
  icon: ReactNode;
  label: string;
}

const menuItems: AppMenuItem[] = [
  { key: 'dashboard', icon: <AppstoreOutlined />, label: '数据总览' },
  { key: 'company', icon: <BankOutlined />, label: '上市公司' },
  { key: 'sector', icon: <ApartmentOutlined />, label: '板块与概念' },
  { key: 'tag', icon: <TagsOutlined />, label: '标签管理' },
  { key: 'chain', icon: <DatabaseOutlined />, label: '产业链图谱' },
  { key: 'announcement', icon: <FileSearchOutlined />, label: '公告文档' },
  { key: 'ai', icon: <RobotOutlined />, label: 'AI 解析审核' },
  { key: 'quiz', icon: <BookOutlined />, label: '题库管理' },
  { key: 'system', icon: <SettingOutlined />, label: '系统管理' },
];

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

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const { data, isError } = useQuery({ queryKey: ['dashboard-overview'], queryFn: getDashboardOverview });

  const stats = useMemo(() => [
    { title: '上市公司', value: data?.companies ?? 0, suffix: '家', accent: '#56d6ff' },
    { title: '板块与概念', value: data?.sectors ?? 0, suffix: '个', accent: '#8f7cff' },
    { title: '公告文档', value: data?.announcements ?? 0, suffix: '份', accent: '#58e7ac' },
    { title: '待审核内容', value: data?.pendingReviews ?? 0, suffix: '条', accent: '#ffbd59' },
  ], [data]);

  const activeLabel = menuItems.find((item) => item.key === selectedKey)?.label ?? '数据总览';

  return (
    <Layout className="app-shell">
      <Sider width={232} collapsedWidth={76} collapsed={collapsed} className="sidebar">
        <div className="brand">
          <div className="brand-mark">AI</div>
          {!collapsed && <div><strong>AIStock</strong><span>知识图鉴管理台</span></div>}
        </div>
        <Menu mode="inline" selectedKeys={[selectedKey]} items={menuItems as MenuProps['items']} onClick={({ key }) => setSelectedKey(key)} className="nav-menu" />
        <div className="sidebar-footer">
          <Button type="text" icon={<LogoutOutlined />} block>{collapsed ? '' : '退出登录'}</Button>
        </div>
      </Sider>
      <Layout className="app-main">
        <Header className="topbar">
          <Flex align="center" justify="space-between" className="topbar-inner">
            <Flex align="center" gap={14} className="topbar-heading">
              <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
              <div className="page-heading">
                <Typography.Title level={4}>{activeLabel}</Typography.Title>
                <Typography.Text type="secondary">构建可持续维护的上市公司知识库</Typography.Text>
              </div>
            </Flex>
            <Flex align="center" gap={18} className="topbar-actions">
              <Badge dot><BellOutlined className="header-icon" /></Badge>
              <Avatar style={{ background: 'linear-gradient(135deg,#56d6ff,#6c5ce7)' }}>管</Avatar>
              <div className="admin-name"><strong>管理员</strong><span>超级管理员</span></div>
            </Flex>
          </Flex>
        </Header>
        <Content className="content">
          {selectedKey !== 'dashboard' ? (
            <Card className="empty-module"><div className="module-icon">{menuItems.find((item) => item.key === selectedKey)?.icon}</div><Typography.Title level={3}>{activeLabel}</Typography.Title><Typography.Paragraph type="secondary">模块骨架已就位，下一阶段将接入列表、筛选和编辑能力。</Typography.Paragraph></Card>
          ) : (
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
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
