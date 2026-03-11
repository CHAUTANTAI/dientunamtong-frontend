'use client';

import { Card, Typography, Spin, Space } from 'antd';
import { useGetActivePageSectionsQuery } from '@/store/api/pageSectionApi';
import type { RightSidebarItemsContent } from '@/types/pageSection';

const { Text } = Typography;

export default function RightSidebar() {
  const { data: sections, isLoading } = useGetActivePageSectionsQuery('homepage');

  const rightSidebarItems = sections?.find(s => s.section_identifier === 'right_sidebar_items');
  
  const sidebarItemsData = rightSidebarItems?.content as unknown as RightSidebarItemsContent;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Spin size="small" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {/* Right Sidebar Items */}
      {sidebarItemsData?.items?.map((item) => (
        <Card
          key={item.id}
          size="small"
          hoverable={!!item.link}
          style={{ borderRadius: 8 }}
          styles={{ body: { padding: '16px' } }}
          onClick={() => item.link && window.open(item.link, '_self')}
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {item.icon && <span style={{ fontSize: '24px' }}>{item.icon}</span>}
            <Text strong style={{ fontSize: '16px' }}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text type="secondary" style={{ fontSize: '13px' }}>
                {item.subtitle}
              </Text>
            )}
          </Space>
        </Card>
      ))}

      {/* Empty state */}
      {!sidebarItemsData?.items?.length && (
        <Card
          size="small"
          style={{ borderRadius: 8 }}
          styles={{ body: { padding: '16px', textAlign: 'center' } }}
        >
          <Text type="secondary">Coming Soon</Text>
        </Card>
      )}
    </Space>
  );
}
