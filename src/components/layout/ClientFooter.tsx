'use client';

import { Layout, Row, Col, Space, Typography } from 'antd';
import { PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useGetProfileQuery } from '@/store/api/profileApi';

const { Footer } = Layout;
const { Text, Link } = Typography;

export default function ClientFooter() {
  const t = useTranslations();
  const { data: profile } = useGetProfileQuery();

  return (
    <Footer
      style={{
        backgroundColor: '#001529',
        color: '#fff',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px 0',
        }}
      >
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size="middle">
              <Text strong style={{ color: '#fff', fontSize: '16px' }}>
                {profile?.company_name || 'Company Name'}
              </Text>
              {profile?.address && (
                <Space>
                  <EnvironmentOutlined style={{ color: '#1890ff' }} />
                  <Text style={{ color: '#fff' }}>{profile.address}</Text>
                </Space>
              )}
            </Space>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size="middle">
              <Text strong style={{ color: '#fff', fontSize: '16px' }}>
                {t('navigation.contact')}
              </Text>
              {profile?.phone && (
                <Space>
                  <PhoneOutlined style={{ color: '#1890ff' }} />
                  <Link href={`tel:${profile.phone}`} style={{ color: '#fff' }}>
                    {profile.phone}
                  </Link>
                </Space>
              )}
              {profile?.email && (
                <Space>
                  <MailOutlined style={{ color: '#1890ff' }} />
                  <Link href={`mailto:${profile.email}`} style={{ color: '#fff' }}>
                    {profile.email}
                  </Link>
                </Space>
              )}
            </Space>
          </Col>

          <Col xs={24} sm={24} md={8}>
            <Space direction="vertical" size="middle">
              <Text strong style={{ color: '#fff', fontSize: '16px' }}>
                {t('navigation.about')}
              </Text>
              <Text style={{ color: '#fff' }}>
                © {new Date().getFullYear()} {profile?.company_name || 'Company'}
              </Text>
            </Space>
          </Col>
        </Row>
      </div>
    </Footer>
  );
}
