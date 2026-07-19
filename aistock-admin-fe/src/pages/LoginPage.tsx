import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Typography, message } from 'antd';
import axios from 'axios';
import { loginAdmin } from '../api';
import { useAuthStore } from '../store/auth';

interface LoginFormValues {
  username: string;
  password: string;
}

/** 管理员账号密码登录页，登录成功后保存单 JWT 会话。 */
export function LoginPage() {
  const [form] = Form.useForm<LoginFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const setSession = useAuthStore((state) => state.setSession);

  /** 提交登录表单，并把后端返回的 Token 与账号资料写入状态仓库。 */
  const handleSubmit = async (values: LoginFormValues) => {
    try {
      const result = await loginAdmin(values.username.trim(), values.password);
      setSession(result.accessToken, result.user);
      messageApi.success('登录成功');
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message ?? '登录失败，请稍后重试'
        : '登录失败，请稍后重试';
      messageApi.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  };

  return (
    <main className="login-page">
      {contextHolder}
      <div className="login-decoration login-decoration-left" />
      <div className="login-decoration login-decoration-right" />
      <section className="login-panel">
        <div className="login-brand">
          <div className="login-brand-mark">AI</div>
          <div>
            <strong>AIStock</strong>
            <span>上市公司知识图鉴管理平台</span>
          </div>
        </div>
        <div className="login-heading">
          <Typography.Title level={2}>欢迎回来</Typography.Title>
          <Typography.Paragraph>登录管理后台，继续完善公司与产业链数据。</Typography.Paragraph>
        </div>
        <Form form={form} layout="vertical" requiredMark={false} initialValues={{ username: 'admin' }} onFinish={handleSubmit}>
          <Form.Item label="管理员账号" name="username" rules={[{ required: true, message: '请输入管理员账号' }]}>
            <Input size="large" prefix={<UserOutlined />} placeholder="请输入管理员账号" autoComplete="username" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少为 6 位' }]}>
            <Input.Password size="large" prefix={<LockOutlined />} placeholder="请输入密码" autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block className="login-submit">登录</Button>
        </Form>
      </section>
    </main>
  );
}
