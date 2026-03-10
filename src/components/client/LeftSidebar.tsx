'use client';

import { Card, Typography, Spin, Empty } from 'antd';
import { useGetActivePageSectionsQuery } from '@/store/api/pageSectionApi';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import type { LeftSidebarCategoriesContent } from '@/types/pageSection';
import Link from 'next/link';

const { Text } = Typography;

export default function LeftSidebar() {
  const { data: sections, isLoading: sectionsLoading } = useGetActivePageSectionsQuery('homepage');
  const { data: allCategories, isLoading: categoriesLoading } = useGetCategoriesQuery();

  const leftSidebarSection = sections?.find(s => s.section_identifier === 'left_sidebar_categories');
  const content = leftSidebarSection?.content as LeftSidebarCategoriesContent;

  if (sectionsLoading || categoriesLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Spin size="small" />
      </div>
    );
  }

  if (!content?.category_ids?.length) {
    return (
      <Card size="small" style={{ borderRadius: 8 }}>
        <Empty description="No categories configured" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  // Filter and order categories based on config
  const selectedCategories = content.category_ids
    .map(id => allCategories?.find((cat: any) => cat.id === id))
    .filter(Boolean)
    .slice(0, content.max_items || 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {selectedCategories.map((cat: any) => (
        <Link key={cat.id} href={`/categories/${cat.slug}`} style={{ textDecoration: 'none' }}>
          <Card
            hoverable
            size="small"
            style={{
              borderRadius: 8,
              cursor: 'pointer',
            }}
            styles={{ body: { padding: '12px' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {cat.icon_url && (
                <span style={{ fontSize: '20px' }}>{cat.icon_url}</span>
              )}
              <Text strong style={{ fontSize: '13px' }}>
                {cat.name}
              </Text>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
