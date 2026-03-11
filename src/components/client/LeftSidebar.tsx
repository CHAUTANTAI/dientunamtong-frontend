'use client';

import { Card, Typography, Spin, Empty, Image } from 'antd';
import { useGetActivePageSectionsQuery } from '@/store/api/pageSectionApi';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import type { LeftSidebarCategoriesContent } from '@/types/pageSection';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import Link from 'next/link';

const { Text } = Typography;

interface CategoryItemProps {
  category: {
    id: string;
    name: string;
    slug: string;
    media?: {
      file_url: string;
      alt_text?: string;
    };
  };
}

const CategoryItem = ({ category }: CategoryItemProps) => {
  const signedUrl = useSignedImageUrl(category.media?.file_url || '');

  return (
    <Link href={`/categories/${category.slug}`} style={{ textDecoration: 'none' }}>
      <Card
        hoverable
        size="small"
        style={{
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        styles={{ body: { padding: '8px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Category Image */}
          <div 
            style={{ 
              width: '50px', 
              height: '50px', 
              flexShrink: 0,
              borderRadius: '6px',
              overflow: 'hidden',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {signedUrl ? (
              <Image
                src={signedUrl}
                alt={category.media?.alt_text || category.name}
                width={50}
                height={50}
                style={{ 
                  objectFit: 'cover',
                  display: 'block',
                }}
                preview={false}
              />
            ) : (
              <Spin size="small" />
            )}
          </div>

          {/* Category Name */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text 
              strong 
              style={{ 
                fontSize: '14px',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={category.name}
            >
              {category.name}
            </Text>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default function LeftSidebar() {
  const { data: sections, isLoading: sectionsLoading } = useGetActivePageSectionsQuery('homepage');
  const { data: allCategories, isLoading: categoriesLoading } = useGetCategoriesQuery();

  const leftSidebarSection = sections?.find(s => s.section_identifier === 'left_sidebar_categories');
  const content = leftSidebarSection?.content as unknown as LeftSidebarCategoriesContent;

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
    .map(id => allCategories?.find((cat: { id: string }) => cat.id === id))
    .filter(Boolean)
    .slice(0, content.max_items || 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {selectedCategories.map((cat) => (
        cat && <CategoryItem 
          key={cat.id} 
          category={{
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            media: cat.media ? {
              file_url: cat.media.file_url,
              alt_text: cat.media.alt_text ?? undefined
            } : undefined
          }} 
        />
      ))}
    </div>
  );
}
