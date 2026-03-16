'use client';

import { Tag } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { useGetActivePageSectionsQuery } from '@/store/api/pageSectionApi';
import type { TrendingKeywordsContent } from '@/types/pageSection';

export interface KeywordItem {
  text: string;
  link: string;
}

interface TrendingKeywordsProps {
  keywords?: KeywordItem[];
  title?: string;
  limit?: number;
  showIcon?: boolean;
}

/**
 * TrendingKeywords Component - Xu hướng tìm kiếm
 * Hiển thị các keywords/tags phổ biến
 * 
 * Fetches keywords from page_sections API (trending_keywords_section)
 */
export default function TrendingKeywords({
  keywords: propKeywords,
  title: propTitle,
  limit: propLimit,
  showIcon: propShowIcon,
}: TrendingKeywordsProps = {}) {
  // Fetch trending keywords section from API
  const { data: sections } = useGetActivePageSectionsQuery('homepage');
  const keywordsSection = sections?.find(s => s.section_identifier === 'trending_keywords_section');
  const keywordsContent = keywordsSection?.content as unknown as TrendingKeywordsContent;

  // Default fallback data
  const defaultKeywords: KeywordItem[] = [
    { text: 'Sơn xe cũ thành xe mới', link: '#' },
    { text: 'Tân trang xe máy', link: '#' },
    { text: 'PCX 160', link: `${ROUTES.PRODUCTS}?search=PCX+160` },
    { text: 'ADV 160', link: `${ROUTES.PRODUCTS}?search=ADV+160` },
    { text: 'Airblade 160', link: `${ROUTES.PRODUCTS}?search=Airblade+160` },
    { text: 'Khung bảo vệ ADV 160', link: '#' },
    { text: 'Chống trộm smartkey', link: '#' },
    { text: 'SH 2020', link: '#' },
    { text: 'Dán decal đổi màu xe', link: '#' },
    { text: 'Đồ chơi xe ADV 150', link: '#' },
    { text: 'Baga nhôm đúc ADV 150', link: '#' },
    { text: 'SH Mode 2020', link: '#' },
    { text: 'Vario 160', link: '#' },
    { text: 'LED Audi i8 PCX 160', link: '#' },
    { text: 'Wave độ', link: '#' },
  ];

  // Transform API data to component props format
  const apiKeywords: KeywordItem[] = keywordsContent?.keywords?.map(kw => ({
    text: kw.text,
    link: kw.link,
  })) || [];

  // Use props > API > defaults
  const keywords = propKeywords || (apiKeywords.length > 0 ? apiKeywords : defaultKeywords);
  const title = propTitle || keywordsContent?.title || 'Xu hướng tìm kiếm:';
  const showIcon = propShowIcon ?? keywordsContent?.show_icon ?? true;
  const limit = propLimit || keywordsContent?.limit;

  const displayKeywords = limit ? keywords.slice(0, limit) : keywords;

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
        {showIcon && <FireOutlined style={{ fontSize: 18, color: '#ff4d4f' }} />}
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
          {displayKeywords.map((keyword, index) => (
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
