'use client';

import { Layout, Row, Col, Space, Typography, Popover } from 'antd';
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, FacebookOutlined, YoutubeOutlined, RocketOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';
import { useGetPublicCategoriesQuery } from '@/store/services/publicCategoryApi';
import { ROUTES } from '@/constants/routes';

const { Footer } = Layout;
const { Text, Title } = Typography;

/**
 * ClientFooter - Multi-column footer layout
 * 
 * TODO: Kết nối API để lấy:
 * - Social media links từ system_info
 * - Additional footer sections từ page_sections
 */
export default function ClientFooter() {
  const { data: systemInfo } = useGetSystemInfoQuery();
  const { data: categories = [] } = useGetPublicCategoriesQuery();

  // Get top 5 categories for footer
  const topCategories = categories
    .filter(cat => !cat.parent_id) // Only parent categories
    .slice(0, 5);

  // "Về chúng tôi" - remove "Hướng dẫn mua hàng" và "Bảo hành"
  const companyLinks = [
    { label: 'Giới thiệu', href: ROUTES.ABOUT },
    { label: 'Liên hệ', href: ROUTES.CONTACT },
  ];

  // Coming Soon Popover
  const comingSoonContent = (
    <div style={{ padding: '8px 4px', maxWidth: 250 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 8 }}>
        <RocketOutlined style={{ fontSize: 18, color: '#ff4d4f' }} />
        <Text strong style={{ fontSize: 14, color: '#262626' }}>
          Sắp ra mắt!
        </Text>
      </div>
      <Text style={{ fontSize: 13, color: '#8c8c8c' }}>
        Tính năng này đang được phát triển 🚀
      </Text>
    </div>
  );

  // "Hỗ trợ" - all coming soon
  const supportLinks = [
    { label: 'Hướng dẫn sử dụng', href: '#' },
    { label: 'Dịch vụ', href: '#' },
    { label: 'Video', href: '#' },
    { label: 'Tin tức', href: '#' },
  ];

  return (
    <Footer
      style={{
        backgroundColor: '#001529',
        color: '#fff',
        marginTop: '40px',
        padding: '40px 0 20px',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        <Row gutter={[32, 32]}>
          {/* Column 1: Company Info */}
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                {systemInfo?.company_name || 'Company Name'}
              </Title>
              
              {systemInfo?.address && (
                <Space align="start">
                  <EnvironmentOutlined style={{ color: '#ff4d4f', fontSize: 16, marginTop: 4 }} />
                  <Text style={{ color: '#d9d9d9', fontSize: 13 }}>{systemInfo.address}</Text>
                </Space>
              )}
              
              {systemInfo?.phone && (
                <Space>
                  <PhoneOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
                  <a href={`tel:${systemInfo.phone}`} style={{ color: '#d9d9d9', fontSize: 13 }}>
                    {systemInfo.phone}
                  </a>
                </Space>
              )}
              
              {systemInfo?.email && (
                <Space>
                  <MailOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
                  <a href={`mailto:${systemInfo.email}`} style={{ color: '#d9d9d9', fontSize: 13 }}>
                    {systemInfo.email}
                  </a>
                </Space>
              )}

              {/* Social Media */}
              <Space size="middle" style={{ marginTop: 8 }}>
                <a href="#" style={{ color: '#ff4d4f', fontSize: 24 }}>
                  <FacebookOutlined />
                </a>
                <a href="#" style={{ color: '#ff4d4f', fontSize: 24 }}>
                  <YoutubeOutlined />
                </a>
              </Space>
            </Space>
          </Col>

          {/* Column 2: Company Links */}
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Về chúng tôi
              </Title>
              {companyLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  style={{
                    color: '#d9d9d9',
                    fontSize: 13,
                    textDecoration: 'none',
                    display: 'block',
                    transition: 'color 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ff4d4f';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#d9d9d9';
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Space>
          </Col>

          {/* Column 3: Product Categories */}
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Sản phẩm
              </Title>
              {topCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`${ROUTES.CATEGORIES}/${category.slug}`}
                  style={{
                    color: '#d9d9d9',
                    fontSize: 13,
                    textDecoration: 'none',
                    display: 'block',
                    transition: 'color 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ff4d4f';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#d9d9d9';
                  }}
                >
                  {category.name}
                </Link>
              ))}
              {topCategories.length === 0 && (
                <Text style={{ color: '#8c8c8c', fontSize: 13 }}>
                  Đang cập nhật...
                </Text>
              )}
            </Space>
          </Col>

          {/* Column 4: Support Links (Coming Soon) */}
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Hỗ trợ
              </Title>
              {supportLinks.map((link, index) => (
                <Popover key={index} content={comingSoonContent} trigger="hover" placement="top">
                  <div
                    style={{
                      color: '#d9d9d9',
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'color 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ff4d4f';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#d9d9d9';
                    }}
                  >
                    {link.label}
                  </div>
                </Popover>
              ))}
            </Space>
          </Col>
        </Row>

        {/* Copyright */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 20,
            borderTop: '1px solid #434343',
            textAlign: 'center',
          }}
        >
          <Text style={{ color: '#8c8c8c', fontSize: 13 }}>
            © {new Date().getFullYear()} {systemInfo?.company_name || 'Company'}. All rights reserved.
          </Text>
        </div>
      </div>
    </Footer>
  );
}

