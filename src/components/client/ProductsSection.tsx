'use client';

import { Row, Col, Card, Typography, Button } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { useGetPublicProductsQuery } from '@/store/services/publicProductApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import { useViewTracker } from '@/hooks/useViewTracker';
import Image from 'next/image';

const { Title, Text } = Typography;

/**
 * ProductCard Component - Single product card
 * Separated to avoid hook violations in map loop
 */
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number | null;
    media?: Array<{
      media_type: string;
      file_url: string;
    }>;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const firstImage = product.media?.find((m) => m.media_type === 'image');
  const signedUrl = useSignedImageUrl(firstImage?.file_url || '');
  const { trackView } = useViewTracker();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Link
      href={`${ROUTES.PRODUCTS}/${product.id}`}
      style={{ textDecoration: 'none' }}
      onClick={() => trackView(product.id, 'product')}
    >
      <Card
        hoverable
        style={{
          height: '100%',
          borderRadius: 8,
          border: '1px solid #f0f0f0',
          transition: 'all 0.3s',
        }}
        styles={{ body: { padding: '12px' } }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
          e.currentTarget.style.borderColor = '#1890ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = '#f0f0f0';
        }}
      >
        {/* Product Image */}
        <div
          style={{
            width: '100%',
            paddingTop: '75%',
            position: 'relative',
            borderRadius: 6,
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            marginBottom: '12px',
          }}
        >
          {signedUrl ? (
            <Image
              src={signedUrl}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text type="secondary">No Image</Text>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <Text
            strong
            style={{
              fontSize: 14,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 40,
              marginBottom: 8,
              color: '#262626',
            }}
          >
            {product.name}
          </Text>
          <Text
            strong
            style={{
              fontSize: 15,
              color: '#ff4d4f',
              display: 'block',
            }}
          >
            {product.price ? formatPrice(product.price) : 'Liên hệ'}
          </Text>
        </div>
      </Card>
    </Link>
  );
};

/**
 * ProductsSection Component - Grid products
 * Hiển thị products trong grid layout
 * 
 * TODO: Có thể customize:
 * - Filter products by category
 * - Sort order
 * - Limit items
 */
interface ProductsSectionProps {
  title?: string;
  limit?: number;
}

export default function ProductsSection({ title = 'Phụ tùng xe', limit = 6 }: ProductsSectionProps) {
  const { data, isLoading } = useGetPublicProductsQuery();

  // Filter active products
  const products = data?.products
    ?.filter((product) => product.is_active)
    .slice(0, limit) || [];

  return (
    <div
      style={{
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: 8,
        border: '1px solid #f0f0f0',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '2px solid #f0f0f0',
        }}
      >
        <Title level={3} style={{ margin: 0, fontSize: 20, color: '#262626' }}>
          {title}
        </Title>
        <Link href={ROUTES.PRODUCTS}>
          <Button type="link" icon={<RightOutlined />} iconPosition="end" style={{ padding: 0 }}>
            Xem tất cả
          </Button>
        </Link>
      </div>

      {/* Products Grid */}
      <Row gutter={[16, 16]}>
        {products.map((product) => (
          <Col key={product.id} xs={12} sm={12} md={8} lg={8}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    </div>
  );
}
