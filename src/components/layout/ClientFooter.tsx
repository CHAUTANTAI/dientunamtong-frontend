'use client';

import { Layout, Row, Col, Space, Typography } from 'antd';
import { PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';

const { Footer } = Layout;
const { Text, Link } = Typography;

export default function ClientFooter() {
  const t = useTranslations();
  const { data: systemInfo } = useGetSystemInfoQuery();

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
                {systemInfo?.company_name || 'Company Name'}
              </Text>
              {systemInfo?.address && (
                <Space>
                  <EnvironmentOutlined style={{ color: '#1890ff' }} />
                  <Text style={{ color: '#fff' }}>{systemInfo.address}</Text>
                </Space>
              )}
            </Space>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size="middle">
              <Text strong style={{ color: '#fff', fontSize: '16px' }}>
                {t('navigation.contact')}
              </Text>
              {systemInfo?.phone && (
                <Space>
                  <PhoneOutlined style={{ color: '#1890ff' }} />
                  <Link href={`tel:${systemInfo.phone}`} style={{ color: '#fff' }}>
                    {systemInfo.phone}
                  </Link>
                </Space>
              )}
              {systemInfo?.email && (
                <Space>
                  <MailOutlined style={{ color: '#1890ff' }} />
                  <Link href={`mailto:${systemInfo.email}`} style={{ color: '#fff' }}>
                    {systemInfo.email}
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
                © {new Date().getFullYear()} {systemInfo?.company_name || 'Company'}
              </Text>
            </Space>
          </Col>
        </Row>
      </div>
    </Footer>
  );
}
