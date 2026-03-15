'use client';

import { List, Typography, Spin } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Text, Title } = Typography;

/**
 * RightSidebar Component - Simple news list như source
 * Hiển thị danh sách tin tức đơn giản
 * 
 * TODO: Kết nối API để lấy:
 * - Latest news/posts từ CMS hoặc page_sections
 * - Hoặc trending products
 */
export default function RightSidebar() {
  // TODO: Replace with API data - Get latest news/posts
  const isLoading = false;
  const newsItems = [
    {
      id: 1,
      title: 'ADV 160 nâng cấp màn hình Chigee AIO 5 Play - Combo tiện ích đáng tiền',
      link: '#',
    },
    {
      id: 2,
      title: 'Tổng hợp phụ kiện đồ chơi trang trí xe GPX Demon',
      link: '#',
    },
    {
      id: 3,
      title: 'PCX 160 nâng cấp 3 món cơ bản nhưng cực kỳ khác biệt',
      link: '#',
    },
    {
      id: 4,
      title: 'Chỉ với 2 phụ kiện trang trí Stylo 160 đã trở nên khác biệt',
      link: '#',
    },
    {
      id: 5,
      title: 'NVX V2 phong cách touring hầm hố với bộ 3 thùng Givi',
      link: '#',
    },
    {
      id: 6,
      title: 'Khai trương đầu năm - Shop chính thức hoạt động trở lại',
      link: '#',
    },
    {
      id: 7,
      title: 'Hành trình 2025 chính thức khép lại tại Shop',
      link: '#',
    },
  ];

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: 8,
        border: '1px solid #f0f0f0',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#001529',
          padding: '12px 16px',
          borderBottom: '2px solid #1890ff',
        }}
      >
        <Title
          level={5}
          style={{
            margin: 0,
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Tin tức mới
        </Title>
      </div>

      {/* News List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      ) : (
        <List
          dataSource={newsItems}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '12px 16px',
                border: 'none',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Link
                href={item.link}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  width: '100%',
                }}
              >
                <RightOutlined
                  style={{
                    fontSize: 10,
                    color: '#1890ff',
                    marginTop: '4px',
                    flexShrink: 0,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: '#595959',
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.title}
                </Text>
              </Link>
            </List.Item>
          )}
        />
      )}

      {/* TODO: Add promotional banners at bottom like source */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#fafafa',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            style={{
              width: '100%',
              height: '100px',
              backgroundColor: '#e0e0e0',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Text type="secondary">Banner {index}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}
