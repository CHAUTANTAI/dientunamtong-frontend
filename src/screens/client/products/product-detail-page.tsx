'use client';

import { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Spin,
  Empty,
  Button,
  Tag,
  Divider,
  Space,
  Breadcrumb,
  Descriptions,
} from 'antd';
import {
  HomeOutlined,
  ShoppingCartOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useGetPublicProductByIdQuery, useGetPublicProductsQuery } from '@/store/services/publicProductApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import { useViewTracker } from '@/hooks/useViewTracker';
import { ROUTES } from '@/constants/routes';

const { Title, Text, Paragraph } = Typography;

interface ProductDetailPageProps {
  productId: string;
}

interface RelatedProductCardProps {
  id: string;
  name: string;
  price: number | null;
  imageUrl?: string;
}

const RelatedProductCard = ({ id, name, price, imageUrl }: RelatedProductCardProps) => {
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
      <Card hoverable>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {signedUrl ? (
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 150,
                borderRadius: 8,
                overflow: 'hidden',
                backgroundColor: '#f5f5f5',
              }}
            >
              <Image src={signedUrl} alt={name} fill style={{ objectFit: 'contain' }} />
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                height: 150,
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
              }}
            >
              <Text type="secondary">No Image</Text>
            </div>
          )}

          <div>
            <Text strong ellipsis>
              {name}
            </Text>
            <br />
            <Text strong style={{ color: '#ff4d4f' }}>
              {price ? formatPrice(price) : t('contactForPrice')}
            </Text>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const t = useTranslations();
  const { data: product, isLoading, error } = useGetPublicProductByIdQuery(productId);
  const { data: allProductsData } = useGetPublicProductsQuery();
  const { trackView } = useViewTracker();

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    if (product) {
      trackView(productId, 'product');
    }
  }, [product, productId, trackView]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <Empty description="Product not found" />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Get media (images and videos)
  const mediaItems = product.media?.filter((m) => m.media_type === 'image' || m.media_type === 'video') || [];
  const sortedMedia = [...mediaItems].sort((a, b) => a.sort_order - b.sort_order);

  // Get related products (same categories, exclude current product)
  const relatedProducts =
    allProductsData?.products
      .filter(
        (p) =>
          p.id !== productId &&
          p.is_active &&
          p.categories?.some((cat) => product.categories?.some((pCat) => pCat.id === cat.id))
      )
      .slice(0, 4) || [];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          {
            href: ROUTES.HOME,
            title: (
              <>
                <HomeOutlined />
                <span>{t('navigation.home')}</span>
              </>
            ),
          },
          {
            href: ROUTES.PRODUCTS,
            title: t('navigation.products'),
          },
          {
            title: product.name,
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[24, 24]}>
        {/* Left: Product Gallery */}
        <Col xs={24} md={12}>
          <Card>
            {sortedMedia.length > 0 ? (
              <div>
                {/* Main Image/Video Display */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 400,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 8,
                    overflow: 'hidden',
                    marginBottom: 16,
                  }}
                >
                  {sortedMedia[currentMediaIndex]?.media_type === 'video' ? (
                    <video
                      src={sortedMedia[currentMediaIndex]?.file_url}
                      controls
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <MediaImage
                      fileUrl={sortedMedia[currentMediaIndex]?.file_url || ''}
                      alt={product.name}
                    />
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {sortedMedia.length > 1 && (
                  <Row gutter={[8, 8]}>
                    {sortedMedia.map((media, index) => (
                      <Col key={media.id} span={6}>
                        <div
                          onClick={() => setCurrentMediaIndex(index)}
                          style={{
                            cursor: 'pointer',
                            border: currentMediaIndex === index ? '2px solid #1890ff' : '1px solid #d9d9d9',
                            borderRadius: 8,
                            overflow: 'hidden',
                            height: 80,
                            position: 'relative',
                            backgroundColor: '#f5f5f5',
                          }}
                        >
                          {media.media_type === 'video' ? (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#000',
                                color: '#fff',
                              }}
                            >
                              Video
                            </div>
                          ) : (
                            <MediaImage fileUrl={media.file_url} alt={`${product.name} ${index + 1}`} />
                          )}
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            ) : (
              <div
                style={{
                  width: '100%',
                  height: 400,
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                }}
              >
                <Text type="secondary">No Media Available</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Right: Product Info */}
        <Col xs={24} md={12}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Product Name */}
              <div>
                <Title level={2} style={{ marginBottom: 8 }}>
                  {product.name}
                </Title>
                {product.sku && <Text type="secondary">SKU: {product.sku}</Text>}
              </div>

              {/* Status Tags */}
              <Space>
                {product.is_active && (
                  <Tag color="green">{t('product.labels.active')}</Tag>
                )}
                {!product.in_stock && <Tag color="red">Out of Stock</Tag>}
              </Space>

              {/* Price */}
              <div>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#ff4d4f' }}>
                  {product.price ? formatPrice(product.price) : t('product.labels.contactForPrice')}
                </Text>
              </div>

              <Divider />

              {/* Description */}
              {product.description && (
                <div>
                  <Title level={5}>{t('product.labels.description')}</Title>
                  <Paragraph>{product.description}</Paragraph>
                </div>
              )}

              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div>
                  <Title level={5}>{t('product.labels.categories')}</Title>
                  <Space wrap>
                    {product.categories.map((cat) => (
                      <Tag key={cat.id} color="blue">
                        <Link href={`${ROUTES.CATEGORIES}/${cat.id}`} style={{ color: 'inherit' }}>
                          {cat.name}
                        </Link>
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <Title level={5}>{t('product.labels.tags')}</Title>
                  <Space wrap>
                    {product.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Space>
                </div>
              )}

              <Divider />

              {/* Action Buttons */}
              <Space size="middle">
                <Button type="primary" size="large" icon={<ShoppingCartOutlined />} disabled={!product.in_stock}>
                  Add to Cart (Coming Soon)
                </Button>
                <Button size="large" icon={<PhoneOutlined />}>
                  <Link href={ROUTES.CONTACT}>{t('client.contact.title')}</Link>
                </Button>
              </Space>
            </Space>
          </Card>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <Card title={t('product.labels.specifications')} style={{ marginTop: 16 }}>
              <Descriptions column={1} bordered>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {String(value)}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>
          )}
        </Col>
      </Row>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <Title level={3} style={{ marginBottom: 24 }}>
            Related Products
          </Title>
          <Row gutter={[16, 16]}>
            {relatedProducts.map((product) => {
              const firstImage = product.media?.find((m) => m.media_type === 'image');
              return (
                <Col key={product.id} xs={24} sm={12} md={6}>
                  <RelatedProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    imageUrl={firstImage?.file_url}
                  />
                </Col>
              );
            })}
          </Row>
        </div>
      )}
    </div>
  );
}

// Helper component to handle signed URL for images
function MediaImage({ fileUrl, alt }: { fileUrl: string; alt: string }) {
  const signedUrl = useSignedImageUrl(fileUrl);

  if (!signedUrl) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
        }}
      >
        <Spin />
      </div>
    );
  }

  return <Image src={signedUrl} alt={alt} fill style={{ objectFit: 'contain' }} />;
}
