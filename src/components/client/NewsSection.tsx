'use client';

import { Row, Col, Card, Typography, Button } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

/**
 * NewsSection Component - Grid news items
 * Hiển thị tin tức trong grid layout
 * 
 * TODO: Kết nối API để lấy:
 * - News/posts từ CMS
 * - Filter by category
 * - Sort by date
 */
interface NewsSectionProps {
  title?: string;
  limit?: number;
}

export default function NewsSection({ title = 'Tin tức xe', limit = 6 }: NewsSectionProps) {
  // TODO: Replace with API data
  const newsItems = [
    {
      id: 1,
      title: 'ADV 160 nâng cấp màn hình Chigee AIO 5 Play - Combo tiện ích đáng tiền',
      image: '/placeholder-news-1.jpg',
      link: '#',
    },
    {
      id: 2,
      title: 'Tổng hợp phụ kiện đồ chơi trang trí xe GPX Demon',
      image: '/placeholder-news-2.jpg',
      link: '#',
    },
    {
      id: 3,
      title: 'PCX 160 nâng cấp 3 món cơ bản nhưng cực kỳ khác biệt',
      image: '/placeholder-news-3.jpg',
      link: '#',
    },
    {
      id: 4,
      title: 'Chỉ với 2 phụ kiện trang trí Stylo 160 đã trở nên khác biệt',
      image: '/placeholder-news-4.jpg',
      link: '#',
    },
    {
      id: 5,
      title: 'NVX V2 phong cách touring hầm hố với bộ 3 thùng Givi và trợ sáng mini F1 GT',
      image: '/placeholder-news-5.jpg',
      link: '#',
    },
    {
      id: 6,
      title: 'Khai trương đầu năm - Shop chính thức hoạt động trở lại',
      image: '/placeholder-news-6.jpg',
      link: '#',
    },
  ];

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
        <Link href="#">
          <Button type="link" icon={<RightOutlined />} iconPosition="end" style={{ padding: 0 }}>
            Xem tất cả
          </Button>
        </Link>
      </div>

      {/* News Grid */}
      <Row gutter={[16, 16]}>
        {newsItems.slice(0, limit).map((news) => (
          <Col key={news.id} xs={12} sm={12} md={8} lg={8}>
            <Link href={news.link} style={{ textDecoration: 'none' }}>
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
                {/* News Image */}
                <div
                  style={{
                    width: '100%',
                    paddingTop: '60%',
                    position: 'relative',
                    borderRadius: 6,
                    overflow: 'hidden',
                    backgroundColor: '#f5f5f5',
                    marginBottom: '12px',
                  }}
                >
                  {/* TODO: Replace with actual images from API */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 14 }}>News {news.id}</Text>
                  </div>
                </div>

                {/* News Title */}
                <Text
                  strong
                  style={{
                    fontSize: 14,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: 40,
                    color: '#262626',
                    lineHeight: 1.5,
                  }}
                >
                  {news.title}
                </Text>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
