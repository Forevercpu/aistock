import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  ApartmentOutlined,
  AppstoreOutlined,
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
} from '@ant-design/icons';
import { Avatar, Badge, Button, Flex, Layout, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

const { Header, Sider, Content } = Layout;

interface AppMenuItem {
  key: string;
  icon: ReactNode;
  label: string;
  subtitle: string;
}

const menuItems: AppMenuItem[] = [
  { key: '/dashboard', icon: <AppstoreOutlined />, label: '数据总览', subtitle: '构建可持续维护的上市公司知识库' },
  { key: '/companies', icon: <BankOutlined />, label: '上市公司', subtitle: '维护公司资料、上市信息和主营产品' },
  { key: '/sectors', icon: <ApartmentOutlined />, label: '板块与概念', subtitle: '管理行业板块、概念与公司归属' },
  { key: '/tags', icon: <TagsOutlined />, label: '标签管理', subtitle: '维护公司知识标签体系' },
  { key: '/chains', icon: <DatabaseOutlined />, label: '产业链图谱', subtitle: '构建产业链节点与上下游关系' },
  { key: '/announcements', icon: <FileSearchOutlined />, label: '公告文档', subtitle: '维护上市公司公告与来源' },
  { key: '/ai-reviews', icon: <RobotOutlined />, label: 'AI 解析审核', subtitle: '审核和修订 AI 生成内容' },
  { key: '/quizzes', icon: <BookOutlined />, label: '题库管理', subtitle: '维护用户端挑战题目' },
  { key: '/system', icon: <SettingOutlined />, label: '系统管理', subtitle: '管理账号与数据同步任务' },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const selectedKey = menuItems.find((item) => location.pathname.startsWith(item.key))?.key ?? '/dashboard';
  const activeItem = menuItems.find((item) => item.key === selectedKey) ?? menuItems[0];

  return (
    <Layout className="app-shell">
      <Sider width={232} collapsedWidth={76} collapsed={collapsed} className="sidebar">
        <div className="brand">
          <div className="brand-mark">AI</div>
          {!collapsed && <div><strong>AIStock</strong><span>知识图鉴管理台</span></div>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems.map(({ key, icon, label }) => ({ key, icon, label })) as MenuProps['items']}
          onClick={({ key }) => navigate(key)}
          className="nav-menu"
        />
        <div className="sidebar-footer">
          <Button type="text" icon={<LogoutOutlined />} block onClick={clearSession}>{collapsed ? '' : '退出登录'}</Button>
        </div>
      </Sider>
      <Layout className="app-main">
        <Header className="topbar">
          <Flex align="center" justify="space-between" className="topbar-inner">
            <Flex align="center" gap={14} className="topbar-heading">
              <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
              <div className="page-heading">
                <Typography.Title level={4}>{activeItem.label}</Typography.Title>
                <Typography.Text type="secondary">{activeItem.subtitle}</Typography.Text>
              </div>
            </Flex>
            <Flex align="center" gap={18} className="topbar-actions">
              <Badge dot><BellOutlined className="header-icon" /></Badge>
              <Avatar style={{ background: 'linear-gradient(135deg,#56d6ff,#6c5ce7)' }}>{user?.displayName.slice(0, 1) ?? '管'}</Avatar>
              <div className="admin-name"><strong>{user?.displayName ?? '管理员'}</strong><span>{user?.role === 'admin' ? '超级管理员' : user?.role}</span></div>
            </Flex>
          </Flex>
        </Header>
        <Content className="content"><Outlet /></Content>
      </Layout>
    </Layout>
  );
}
