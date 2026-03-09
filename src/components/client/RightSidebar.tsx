'use client';

import { Card, Typography, Spin, Space } from 'antd';
import { useGetActivePageSectionsQuery } from '@/store/api/pageSectionApi';
import type { RightContentBoxContent, RightSidebarItemsContent } from '@/types/pageSection';
import Link from 'next/link';

const { Text, Title, Paragraph } = Typography;

export default function RightSidebar() {
  const { data: sections, isLoading } = useGetActivePageSectionsQuery('homepage');

  const rightContentBox = sections?.find(s => s.section_identifier === 'right_content_box');
  const rightSidebarItems = sections?.find(s => s.section_identifier === 'right_sidebar_items');
  
  const contentBoxData = rightContentBox?.content as RightContentBoxContent;
  const sidebarItemsData = rightSidebarItems?.content as RightSidebarItemsContent;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Spin size="small" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {/* Right Content Box */}
      {contentBoxData?.text && (
        <Card
          size="small"
          style={{ borderRadius: 8 }}
          styles={{ body: { padding: '16px' } }}
        >
          {contentBoxData.title && (
            <Title level={5} style={{ marginTop: 0, marginBottom: 8, fontSize: '18px' }}>
              {contentBoxData.title}
            </Title>
          )}
          {contentBoxData.subtitle && (
            <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: '14px' }}>
              {contentBoxData.subtitle}
            </Text>
          )}
          <Paragraph
            style={{
              whiteSpace: 'pre-wrap',
              marginBottom: 0,
              fontSize: '14px',
              lineHeight: '1.6',
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: contentBoxData.text }} />
          </Paragraph>
        </Card>
      )}

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
      {!contentBoxData?.text && !sidebarItemsData?.items?.length && (
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
