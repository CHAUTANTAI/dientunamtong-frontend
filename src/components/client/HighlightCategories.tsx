'use client';

import { Row, Col, Card, Button, Typography, Spin, Empty } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/constants/routes';
import { useGetActivePageSectionsQuery } from '@/store/api/pageSectionApi';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import type { HighlightCategoriesContent } from '@/types/pageSection';

const { Title, Text } = Typography;

interface CategoryCardProps {
  category: any;
  subCategories: any[];
}

const CategoryCard = ({ category, subCategories }: CategoryCardProps) => {
  return (
    <Card
      hoverable
      style={{
        height: '100%',
        borderRadius: 12,
        border: '2px solid #f0f0f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
      }}
      styles={{ body: { padding: '24px' } }}
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
          }}
        >
          {category.name}
        </Title>
      </Link>

      {/* Row 2: Sub-Categories - Grid 3 rows x 2 columns */}
      <Row gutter={[12, 12]}>
        {subCategories.slice(0, 6).map((sub) => (
          <Col key={sub.id} span={12}>
            <Link href={`/categories/${sub.slug}`} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: '12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  border: '1.5px solid #e0e0e0',
                  backgroundColor: '#fafafa',
                  transition: 'all 0.2s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e6f7ff';
                  e.currentTarget.style.borderColor = '#1890ff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(24,144,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fafafa';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Image Container */}
                <div
                  style={{
                    width: '100%',
                    height: '80px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {sub.icon_url ? (
                    <span style={{ fontSize: 32 }}>{sub.icon_url}</span>
                  ) : (
                    <span style={{ fontSize: 32 }}>📦</span>
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
                  }}
                >
                  {sub.name}
                </span>
              </div>
            </Link>
          </Col>
        ))}
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
  const { data: allCategories, isLoading: categoriesLoading } = useGetCategoriesQuery({});

  const highlightSection = sections?.find(s => s.section_identifier === 'highlight_categories');
  const content = highlightSection?.content as HighlightCategoriesContent;

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
    const category = allCategories?.items?.find((c: any) => c.id === catConfig.category_id);
    if (!category) return null;

    const subCategories = catConfig.sub_category_ids
      .map(subId => allCategories?.items?.find((c: any) => c.id === subId))
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
        {categoryData.map((item: any, index) => (
          <Col key={item.category.id || index} xs={24} sm={24} md={8}>
            <CategoryCard category={item.category} subCategories={item.subCategories} />
          </Col>
        ))}
      </Row>
    </div>
  );
}
