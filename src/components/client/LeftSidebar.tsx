'use client';

import { Card, Typography } from 'antd';

const { Text } = Typography;

// Hard coded categories for layout testing
const MOCK_CATEGORIES = [
  { id: '1', name: 'Điện thoại', icon: '📱' },
  { id: '2', name: 'Laptop', icon: '💻' },
  { id: '3', name: 'Tablet', icon: '📲' },
  { id: '4', name: 'Tai nghe', icon: '🎧' },
  { id: '5', name: 'Đồng hồ', icon: '⌚' },
  { id: '6', name: 'Camera', icon: '📷' },
  { id: '7', name: 'Phụ kiện', icon: '🔌' },
  { id: '8', name: 'Gaming', icon: '🎮' },
];

export default function LeftSidebar() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {MOCK_CATEGORIES.map((cat) => (
        <Card
          key={cat.id}
          hoverable
          size="small"
          style={{
            borderRadius: 8,
            cursor: 'pointer',
          }}
          styles={{ body: { padding: '12px' } }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>{cat.icon}</span>
            <Text strong style={{ fontSize: '13px' }}>
              {cat.name}
            </Text>
          </div>
        </Card>
      ))}
    </div>
  );
}
