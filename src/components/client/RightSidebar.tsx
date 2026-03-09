'use client';

import { Card, Typography } from 'antd';

const { Text } = Typography;

export default function RightSidebar() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Card
        size="small"
        style={{ borderRadius: 8 }}
        styles={{ body: { padding: '16px', textAlign: 'center' } }}
      >
        <Text type="secondary">Tin tức</Text>
      </Card>
      <Card
        size="small"
        style={{ borderRadius: 8 }}
        styles={{ body: { padding: '16px', textAlign: 'center' } }}
      >
        <Text type="secondary">Ưu đãi</Text>
      </Card>
      <Card
        size="small"
        style={{ borderRadius: 8 }}
        styles={{ body: { padding: '16px', textAlign: 'center' } }}
      >
        <Text type="secondary">Liên hệ</Text>
      </Card>
    </div>
  );
}
