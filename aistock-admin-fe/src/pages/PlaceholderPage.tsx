import { Card, Typography } from 'antd';

export function PlaceholderPage() {
  return (
    <Card className="empty-module">
      <Typography.Title level={3}>模块建设中</Typography.Title>
      <Typography.Paragraph type="secondary">当前模块将在后续开发批次中接入完整能力。</Typography.Paragraph>
    </Card>
  );
}
