'use client';

import { Row, Col, Card, Button, Typography, Spin, Empty, Tag } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useGetPublicProductsQuery } from '@/store/services/publicProductApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import { ROUTES } from '@/constants/routes';

const { Title, Text } = Typography;

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  inStock: boolean;
}

const ProductCard = ({ id, name, price, imageUrl, inStock }: ProductCardProps) => {
  const signedUrl = useSignedImageUrl(imageUrl || '');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Link href={`${ROUTES.PRODUCTS}/${id}`} style={{ textDecoration: 'none' }}>
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
              {!inStock && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                  }}
                >
                  <Tag color="red">Out of Stock</Tag>
                </div>
              )}
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
          description={
            <div>
              <Text strong style={{ fontSize: 16, color: '#ff4d4f' }}>
                {formatPrice(price)}
              </Text>
            </div>
          }
        />
      </Card>
    </Link>
  );
};

export default function HighlightProducts() {
  const t = useTranslations('client.home');
  const { data, isLoading } = useGetPublicProductsQuery();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data || !data.products || data.products.length === 0) {
    return (
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2}>{t('highlightProducts')}</Title>
        </div>
        <Empty description="No products available" />
      </div>
    );
  }

  // Filter active products and take first 6
  const activeProducts = data.products
    .filter((product) => product.is_active)
    .slice(0, 6);

  if (activeProducts.length === 0) {
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
          {t('highlightProducts')}
        </Title>
        <Link href={ROUTES.PRODUCTS}>
          <Button type="link" icon={<RightOutlined />} iconPosition="end">
            {t('seeAll')}
          </Button>
        </Link>
      </div>
      <Row gutter={[16, 16]}>
        {activeProducts.map((product) => {
          const firstImage = product.media?.find((m) => m.media_type === 'image');
          return (
            <Col key={product.id} xs={24} sm={12} md={8}>
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                imageUrl={firstImage?.file_url}
                inStock={product.in_stock}
              />
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
