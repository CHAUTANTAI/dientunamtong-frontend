'use client';

import { Tag } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

/**
 * TrendingKeywords Component - Xu hướng tìm kiếm
 * Hiển thị các keywords/tags phổ biến
 * 
 * TODO: Kết nối API để lấy:
 * - Trending keywords từ search analytics hoặc page_sections
 * - Click count/popularity
 */
export default function TrendingKeywords() {
  // TODO: Replace with API data - Get from search analytics or page_sections
  const trendingKeywords = [
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
          gap: '8px',
        }}
      >
        {trendingKeywords.map((keyword, index) => (
          <Link key={index} href={keyword.link} style={{ textDecoration: 'none' }}>
            <Tag
              style={{
                margin: 0,
                padding: '4px 12px',
                fontSize: 13,
                borderRadius: 16,
                cursor: 'pointer',
                border: '1px solid #d9d9d9',
                backgroundColor: '#fafafa',
                color: '#595959',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1890ff';
                e.currentTarget.style.backgroundColor = '#e6f7ff';
                e.currentTarget.style.color = '#1890ff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(24,144,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d9d9d9';
                e.currentTarget.style.backgroundColor = '#fafafa';
                e.currentTarget.style.color = '#595959';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
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
