'use client';

import { Row, Col, Card, Button, Typography, Spin, Empty, Tag } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useGetPublicProductsQuery } from '@/store/services/publicProductApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import { useViewTracker } from '@/hooks/useViewTracker';
import { ROUTES } from '@/constants/routes';

const { Title, Text } = Typography;

interface ProductCardProps {
  id: string;
  name: string;
  price: number | null;
  imageUrl?: string;
  inStock: boolean;
}

const ProductCard = ({ id, name, price, imageUrl, inStock }: ProductCardProps) => {
  const t = useTranslations('product.labels');
  const signedUrl = useSignedImageUrl(imageUrl || '');
  const { trackView } = useViewTracker();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleClick = () => {
    trackView(id, 'product');
  };

  return (
    <Link href={`${ROUTES.PRODUCTS}/${id}`} style={{ textDecoration: 'none' }} onClick={handleClick}>
      <Card
        hoverable
        style={{ height: '100%' }}
        bodyStyle={{ padding: '16px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {signedUrl ? (
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              paddingTop: '75%', // 4:3 aspect ratio
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: '#f5f5f5',
            }}>
              <Image
                src={signedUrl}
                alt={name}
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                paddingTop: '75%',
                position: 'relative',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
              }}
            >
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <Text type="secondary">No Image</Text>
              </div>
            </div>
          )}
          
          <div>
            <Title 
              level={5} 
              style={{ 
                margin: 0, 
                marginBottom: 4, 
                fontSize: 16,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: 44,
              }}
            >
              {name}
            </Title>
            <Text strong style={{ fontSize: 16, color: '#ff4d4f' }}>
              {price ? formatPrice(price) : t('contactForPrice')}
            </Text>
          </div>
        </div>
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
          {t('highlightProducts')}
        </Title>
        <Link href={ROUTES.PRODUCTS}>
          <Button type="link" icon={<RightOutlined />} iconPosition="end" style={{ padding: 0 }}>
            {t('seeAll')}
          </Button>
        </Link>
      </div>
      <Row gutter={[12, 12]}>
        {activeProducts.map((product) => {
          const firstImage = product.media?.find((m) => m.media_type === 'image');
          return (
            <Col key={product.id} xs={12} sm={12} md={8} lg={8}>
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
