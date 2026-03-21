'use client';

import { Tag } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useGetPublicCategoriesQuery } from '@/store/services/publicCategoryApi';
import { useGetPublicProductsQuery } from '@/store/services/publicProductApi';
import type { TrendingKeywordsContent } from '@/types/pageSection';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';
import { useTranslations } from 'next-intl';

export interface KeywordItem {
  text: string;
  link: string;
}

/**
 * TrendingKeywords Component - Xu hướng tìm kiếm
 * Receives content from props.
 * 
 * Supports:
 * - Auto mode: Top 5 categories + Top 5 products by views
 * - Manual mode: Admin-selected categories/products
 */
export default function TrendingKeywords({ content }: { content?: TrendingKeywordsContent }) {
  const t = useTranslations('homepage.trendingKeywords');
  // Use content from props
  const keywordsContent = content;

  // Fetch categories and products for auto mode
  const { data: categories = [] } = useGetPublicCategoriesQuery();
  const { data: products = [] } = useGetPublicProductsQuery();

  const mode = keywordsContent?.mode || 'manual';
  
  let keywords: KeywordItem[] = [];

  if (mode === 'auto') {
    // Auto mode: Top 5 categories + Top 5 products by views
    const topCategories: Category[] = [...categories]
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 5);
    
    const categoryKeywords = topCategories.map(c => ({
      text: c.name,
      link: `/categories/${c.id}`,
    }));

    const topProducts: Product[] = [...products]
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 5);
    
    const productKeywords = topProducts.map(p => ({
      text: p.name,
      link: `/products/${p.id}`,
    }));

    keywords = [...categoryKeywords, ...productKeywords];
  } else {
    // Manual mode: Use admin-selected keywords from props
    keywords = keywordsContent?.keywords?.map(kw => ({
      text: kw.text,
      link: kw.link,
    })) || [];
  }

  // Fallback if no keywords
  if (keywords.length === 0) {
    keywords = [
      { text: 'Sơn xe cũ thành xe mới', link: '#' },
      { text: 'Tân trang xe máy', link: '#' },
      { text: 'PCX 160', link: '#' },
      { text: 'ADV 160', link: '#' },
      { text: 'Airblade 160', link: '#' },
    ];
  }

  const title = t('title');

  return (
    <div
      style={{
        backgroundColor: '#fff',
        padding: '16px 20px',
        borderRadius: 8,
        border: '1px solid #f0f0f0',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <FireOutlined style={{ fontSize: 18, color: '#ff4d4f' }} />
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#262626',
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        {keywords.map((keyword, index) => (
          <Link key={index} href={keyword.link} style={{ textDecoration: 'none' }}>
            <Tag
              style={{
                margin: 0,
                padding: '8px 16px',
                fontSize: 14,
                fontWeight: 500,
                borderRadius: 20,
                cursor: 'pointer',
                border: '2px solid #ff4d4f',
                backgroundColor: '#fff',
                color: '#ff4d4f',
                transition: 'all 0.3s',
                boxShadow: '0 2px 6px rgba(255,77,79,0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#ff4d4f';
                e.currentTarget.style.backgroundColor = '#ff4d4f';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,77,79,0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#ff4d4f';
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.color = '#ff4d4f';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(255,77,79,0.15)';
              }}
            >
              {keyword.text}
            </Tag>
          </Link>
        ))}
      </div>
    </div>
  );
}
