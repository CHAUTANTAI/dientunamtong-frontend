'use client';

import { Layout, Row, Col, Space, Typography } from 'antd';
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, FacebookOutlined, YoutubeOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';
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

  // TODO: Get from system_info or page_sections
  const footerLinks = {
    company: [
      { label: 'Giới thiệu', href: ROUTES.ABOUT },
      { label: 'Liên hệ', href: ROUTES.CONTACT },
      { label: 'Hướng dẫn mua hàng', href: '#' },
      { label: 'Chính sách bảo hành', href: '#' },
    ],
    products: [
      { label: 'Phụ tùng xe', href: ROUTES.PRODUCTS },
      { label: 'Đồ chơi xe', href: ROUTES.CATEGORIES },
      { label: 'Tem xe', href: '#' },
      { label: 'Bảng giá', href: '#' },
    ],
    support: [
      { label: 'Hướng dẫn sử dụng', href: '#' },
      { label: 'Dịch vụ', href: '#' },
      { label: 'Video', href: '#' },
      { label: 'Tin tức', href: '#' },
    ],
  };

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
              {footerLinks.company.map((link, index) => (
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

          {/* Column 3: Product Links */}
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Sản phẩm
              </Title>
              {footerLinks.products.map((link, index) => (
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

          {/* Column 4: Support Links */}
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Hỗ trợ
              </Title>
              {footerLinks.support.map((link, index) => (
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

