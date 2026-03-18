'use client';

import { Tag } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useGetActivePageSectionsQuery } from '@/store/api/pageSectionApi';
import { useGetPublicCategoriesQuery } from '@/store/services/publicCategoryApi';
import { useGetPublicProductsQuery } from '@/store/services/publicProductApi';
import type { TrendingKeywordsContent } from '@/types/pageSection';

export interface KeywordItem {
  text: string;
  link: string;
}

/**
 * TrendingKeywords Component - Xu hướng tìm kiếm
 * Fixed title: "Xu hướng tìm kiếm:"
 * Icon: Always shown 🔥
 * 
 * Supports:
 * - Auto mode: Top 5 categories + Top 5 products by views
 * - Manual mode: Admin-selected categories/products
 */
export default function TrendingKeywords() {
  // Fetch trending keywords section from API
  const { data: sections } = useGetActivePageSectionsQuery('homepage');
  const keywordsSection = sections?.find(s => s.section_identifier === 'trending_keywords_section');
  const keywordsContent = keywordsSection?.content as unknown as TrendingKeywordsContent;

  // Fetch categories and products for auto mode
  const { data: categories = [] } = useGetPublicCategoriesQuery();
  const { data: products = [] } = useGetPublicProductsQuery();

  const mode = keywordsContent?.mode || 'manual';
  
  let keywords: KeywordItem[] = [];

  if (mode === 'auto') {
    // Auto mode: Top 5 categories + Top 5 products by views
    // Sort by view_count (if available in the data)
    const topCategories = [...categories]
      .sort((a, b) => ((b as any).view_count || 0) - ((a as any).view_count || 0))
      .slice(0, 5)
      .map(c => ({
        text: c.name,
        link: `/categories/${c.id}`,
      }));

    const topProducts = [...products]
      .sort((a, b) => ((b as any).view_count || 0) - ((a as any).view_count || 0))
      .slice(0, 5)
      .map(p => ({
        text: p.name,
        link: `/products/${p.id}`,
      }));

    keywords = [...topCategories, ...topProducts];
  } else {
    // Manual mode: Use admin-selected keywords
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
          Xu hướng tìm kiếm:
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
