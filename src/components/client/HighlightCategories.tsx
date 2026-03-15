'use client';

import { Row, Col, Card, Button, Typography, Spin, Empty, Image } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/constants/routes';
import { useGetActivePageSectionsQuery } from '@/store/api/pageSectionApi';
import { useGetPublicCategoriesQuery } from '@/store/services/publicCategoryApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import type { HighlightCategoriesContent } from '@/types/pageSection';

const { Title } = Typography;

interface SubCategoryItemProps {
  subCategory: {
    id: string;
    name: string;
    slug: string;
    media?: {
      file_url: string;
      alt_text?: string;
    };
  };
}

const SubCategoryItem = ({ subCategory }: SubCategoryItemProps) => {
  const signedUrl = useSignedImageUrl(subCategory.media?.file_url || '');

  return (
    <Link href={`/categories/${subCategory.slug}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          padding: '12px',
          borderRadius: 8,
          cursor: 'pointer',
          border: '1.5px solid #e0e0e0',
          backgroundColor: '#fafafa',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e6f7ff';
          e.currentTarget.style.borderColor = '#1890ff';
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(24,144,255,0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#fafafa';
          e.currentTarget.style.borderColor = '#e0e0e0';
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Image Container */}
        <div
          style={{
            width: '100%',
            height: '80px',
            backgroundColor: '#f5f5f5',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
            transition: 'all 0.3s ease',
          }}
        >
          {signedUrl ? (
            <Image
              src={signedUrl}
              alt={subCategory.media?.alt_text || subCategory.name}
              width="100%"
              height={80}
              style={{ 
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.3s ease',
              }}
              preview={false}
              onMouseEnter={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                img.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                img.style.transform = 'scale(1)';
              }}
            />
          ) : (
            <Spin size="small" />
          )}
        </div>
        
        {/* Category Name */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            textAlign: 'center',
            lineHeight: 1.3,
            color: '#333',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            transition: 'color 0.3s ease',
          }}
          title={subCategory.name}
        >
          {subCategory.name}
        </span>
      </div>
    </Link>
  );
};

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subCategories: Array<{
    id: string;
    name: string;
    slug: string;
    media?: {
      file_url: string;
      alt_text?: string;
    };
  }>;
}

const CategoryCard = ({ category, subCategories }: CategoryCardProps) => {
  const displaySubCategories = subCategories.slice(0, 5);
  const hasMore = subCategories.length > 5;

  return (
    <Card
      hoverable
      style={{
        height: '100%',
        borderRadius: 12,
        border: '2px solid #f0f0f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      styles={{ body: { padding: '24px' } }}
      onMouseEnter={(e) => {
        const card = e.currentTarget;
        card.style.transform = 'translateY(-8px) scale(1.02)';
        card.style.boxShadow = '0 12px 32px rgba(24, 144, 255, 0.2), 0 0 0 3px rgba(24, 144, 255, 0.1)';
        card.style.borderColor = '#1890ff';
      }}
      onMouseLeave={(e) => {
        const card = e.currentTarget;
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        card.style.borderColor = '#f0f0f0';
      }}
    >
      {/* Row 1: Category Title - Centered */}
      <Link href={`/categories/${category.slug}`} style={{ textDecoration: 'none' }}>
        <Title
          level={4}
          style={{
            margin: 0,
            marginBottom: 20,
            fontSize: 20,
            textAlign: 'center',
            fontWeight: 600,
            color: '#1890ff',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#0050b3';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#1890ff';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {category.name}
        </Title>
      </Link>

      {/* Row 2: Sub-Categories - Grid 3 rows x 2 columns (5 items + "See More") */}
      <Row gutter={[12, 12]}>
        {displaySubCategories.map((sub) => (
          <Col key={sub.id} span={12}>
            <SubCategoryItem subCategory={sub} />
          </Col>
        ))}
        
        {/* "See More" item if there are more than 5 sub-categories */}
        {hasMore && (
          <Col span={12}>
            <Link href={`/categories/${category.slug}`} style={{ textDecoration: 'none' }}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  borderRadius: 8,
                  border: '2px dashed #1890ff',
                  backgroundColor: '#f0f9ff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '100px',
                  transition: 'all 0.3s ease',
                }}
                styles={{ body: { padding: '12px', textAlign: 'center', width: '100%' } }}
                onMouseEnter={(e) => {
                  const card = e.currentTarget;
                  card.style.backgroundColor = '#e6f7ff';
                  card.style.borderColor = '#0050b3';
                  card.style.transform = 'scale(1.05)';
                  card.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  const card = e.currentTarget;
                  card.style.backgroundColor = '#f0f9ff';
                  card.style.borderColor = '#1890ff';
                  card.style.transform = 'scale(1)';
                  card.style.boxShadow = 'none';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ fontSize: '24px', color: '#1890ff', fontWeight: 'bold' }}>...</span>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: 600,
                    color: '#1890ff',
                  }}>
                    Xem thêm
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    fontWeight: 500,
                  }}>
                    +{subCategories.length - 5} danh mục
                  </span>
                </div>
              </Card>
            </Link>
          </Col>
        )}
      </Row>

      <style jsx>{`
        :hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
          transform: translateY(-4px);
        }
      `}</style>
    </Card>
  );
};

export default function HighlightCategories() {
  const t = useTranslations('client.home');
  const { data: sections, isLoading: sectionsLoading } = useGetActivePageSectionsQuery('homepage');
  const { data: allCategories, isLoading: categoriesLoading } = useGetPublicCategoriesQuery();

  const highlightSection = sections?.find(s => s.section_identifier === 'highlight_categories');
  const content = highlightSection?.content as unknown as HighlightCategoriesContent;

  if (sectionsLoading || categoriesLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!content?.categories?.length) {
    return (
      <div style={{ marginBottom: 40 }}>
        <Title level={2} style={{ marginBottom: 20, fontSize: 24 }}>
          {content?.title || t('highlightCategories')}
        </Title>
        <Card>
          <Empty description="No highlight categories configured" />
        </Card>
      </div>
    );
  }

  // Build category data with sub-categories
  const categoryData = content.categories.slice(0, content.limit || 3).map(catConfig => {
    const category = allCategories?.find((c: { id: string }) => c.id === catConfig.category_id);
    if (!category) return null;

    const subCategories = catConfig.sub_category_ids
      .map(subId => allCategories?.find((c: { id: string }) => c.id === subId))
      .filter(Boolean);

    return {
      category,
      subCategories,
    };
  }).filter(Boolean);

  return (
    <div style={{ marginBottom: 40 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <Title level={2} style={{ margin: 0, fontSize: 24 }}>
          {content.title || t('highlightCategories')}
        </Title>
        <Link href={ROUTES.CATEGORIES}>
          <Button type="link" icon={<AppstoreOutlined />} style={{ padding: 0 }}>
            {t('seeAll')}
          </Button>
        </Link>
      </div>
      
      {/* Category Cards */}
      <Row gutter={[16, 16]}>
        {categoryData.map((item, index) => (
          item && (
            <Col key={item.category.id || index} xs={24} sm={24} md={8}>
              <CategoryCard 
                category={item.category} 
                subCategories={item.subCategories
                  .filter((sub): sub is NonNullable<typeof sub> => sub !== undefined && sub !== null)
                  .map(sub => ({
                    id: sub.id,
                    name: sub.name,
                    slug: sub.slug,
                    media: sub.media ? {
                      file_url: sub.media.file_url,
                      alt_text: sub.media.alt_text ?? undefined
                    } : undefined
                  }))
                } 
              />
            </Col>
          )
        ))}
      </Row>
    </div>
  );
}
