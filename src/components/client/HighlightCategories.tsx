'use client';

import { Row, Col, Card, Button, Typography, Spin, Empty } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useGetPublicCategoriesQuery } from '@/store/services/publicCategoryApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import { ROUTES } from '@/constants/routes';

const { Title, Text } = Typography;

interface CategoryCardProps {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
}

const CategoryCard = ({ id, name, imageUrl, description }: CategoryCardProps) => {
  const signedUrl = useSignedImageUrl(imageUrl || '');

  return (
    <Link href={`${ROUTES.CATEGORIES}/${id}`} style={{ textDecoration: 'none' }}>
      <Card
        hoverable
        cover={
          signedUrl ? (
            <div style={{ position: 'relative', width: '100%', height: 200 }}>
              <Image
                src={signedUrl}
                alt={name}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                height: 200,
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text type="secondary">No Image</Text>
            </div>
          )
        }
        style={{ height: '100%' }}
      >
        <Card.Meta
          title={name}
          description={description ? (description.length > 60 ? `${description.substring(0, 60)}...` : description) : ''}
        />
      </Card>
    </Link>
  );
};

export default function HighlightCategories() {
  const t = useTranslations('client.home');
  const { data: categories, isLoading } = useGetPublicCategoriesQuery();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2}>{t('highlightCategories')}</Title>
        </div>
        <Empty description="No categories available" />
      </div>
    );
  }

  // Filter active categories and take first 6
  const activeCategories = categories
    .filter((cat) => cat.is_active)
    .slice(0, 6);

  if (activeCategories.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: 48 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          {t('highlightCategories')}
        </Title>
        <Link href={ROUTES.CATEGORIES}>
          <Button type="link" icon={<RightOutlined />} iconPosition="end">
            {t('seeAll')}
          </Button>
        </Link>
      </div>
      <Row gutter={[16, 16]}>
        {activeCategories.map((category) => (
          <Col key={category.id} xs={24} sm={12} md={8}>
            <CategoryCard
              id={category.id}
              name={category.name}
              imageUrl={category.image_url}
              description={category.description}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
}
