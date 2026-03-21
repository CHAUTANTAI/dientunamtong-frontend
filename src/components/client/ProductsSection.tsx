'use client';

import { Row, Col, Card, Typography, Button } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { useGetPublicProductsQuery } from '@/store/services/publicProductApi';
import { useGetPublicCategoriesQuery } from '@/store/services/publicCategoryApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import { useViewTracker } from '@/hooks/useViewTracker';
import type { ProductsSectionContent } from '@/types/pageSection';
import type { Product } from '@/types/product';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

// ... (ProductCard component remains the same)
/**
 * ProductCard Component - Single product card
 */
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price?: string | number | null;
    media?: Array<{
      media_type: string;
      file_url: string;
    }>;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const t = useTranslations('homepage.products');
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
                  e.currentTarget.style.borderColor = '#ff4d4f';
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
              <Text type="secondary">{t('noImage')}</Text>
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
            {product.price ? formatPrice(typeof product.price === 'string' ? parseFloat(product.price) : product.price) : t('contactForPrice')}
          </Text>
        </div>
      </Card>
    </Link>
  );
};


/**
 * ProductsSection Component - Grid products with multi-category support
 * Each category can be auto (top 6 by views) or manual (admin selected products)
 */
interface ProductsSectionProps {
  content?: ProductsSectionContent;
}

export default function ProductsSection({ content }: ProductsSectionProps) {
  const t = useTranslations('homepage.products');
  const { data } = useGetPublicProductsQuery();
  const { data: categoryData = [] } = useGetPublicCategoriesQuery();

  // Get products section config from props
  const config = content;

  // Fixed values
  const title = t('title');

  const categoryConfigs = config?.categories || [];

  // Helper: Get all descendant category IDs (including parent itself)
  const getAllDescendantCategoryIds = (categoryId: string): string[] => {
    const result: string[] = [categoryId];
    
    const findDescendants = (parentId: string) => {
      const children = categoryData.filter(cat => cat.parent_id === parentId);
      children.forEach(child => {
        result.push(child.id);
        findDescendants(child.id); // Recursive
      });
    };
    
    findDescendants(categoryId);
    return result;
  };

  // Get products based on category configs
  let products: Product[] = [];
  
  if (categoryConfigs.length > 0) {
    const allProducts: Product[] = [];
    
    categoryConfigs.forEach(categoryConfig => {
      let categoryProducts: Product[] = [];
      
      // Get all relevant category IDs (parent + descendants)
      const relevantCategoryIds = getAllDescendantCategoryIds(categoryConfig.category_id);
      
      if (categoryConfig.mode === 'auto') {
        // Auto mode: top 6 by view_count from this category and all descendants
        categoryProducts = data
          ?.filter((product) => 
            product.is_active && 
            product.categories?.some(cat => relevantCategoryIds.includes(cat.id))
          )
          .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, 6) || [];
      } else {
        // Manual mode: admin selected products
        const selectedIds = categoryConfig.product_ids || [];
        categoryProducts = data
          ?.filter((product) => 
            product.is_active && 
            selectedIds.includes(product.id)
          ) || [];
        
        // Sort by selection order
        categoryProducts.sort((a, b) => {
          const indexA = selectedIds.indexOf(a.id);
          const indexB = selectedIds.indexOf(b.id);
          return indexA - indexB;
        });
      }
      
      allProducts.push(...categoryProducts);
    });
    
    // Remove duplicates (keep first occurrence)
    const uniqueProducts = Array.from(
      new Map(allProducts.map(p => [p.id, p])).values()
    );
    
    products = uniqueProducts;
  } else {
    // No categories selected: show top 6 globally
    products = data
      ?.filter((product) => product.is_active)
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 6) || [];
  }

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
            {t('viewAll')}
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
