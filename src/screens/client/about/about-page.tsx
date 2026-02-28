'use client';

import dynamic from 'next/dynamic';
import {
  Row,
  Col,
  Card,
  Typography,
  Space,
  Spin,
} from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';

const MapEmbed = dynamic(() => import('@/components/map/MapEmbed'), {
  ssr: false,
  loading: () => <div style={{ height: 300, background: '#f0f0f0' }}>Loading map...</div>,
});

const { Title, Paragraph, Text } = Typography;

export default function AboutPage() {
  const t = useTranslations();
  const { data: systemInfo, isLoading } = useGetSystemInfoQuery();
  const logoUrl = useSignedImageUrl(systemInfo?.company_logo || '');

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        {t('client.about.title')}
      </Title>

      {/* Company Overview */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]} align="middle">
          {/* Company Logo */}
          {logoUrl && (
            <Col xs={24} md={8}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  src={logoUrl}
                  alt={systemInfo?.company_name || 'Company Logo'}
                  width={200}
                  height={200}
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </Col>
          )}

          {/* Company Description */}
          <Col xs={24} md={logoUrl ? 16 : 24}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Title level={3} style={{ margin: 0 }}>
                {systemInfo?.company_name || 'Our Company'}
              </Title>

              {systemInfo?.about_us && (
                <Paragraph 
                  style={{ 
                    fontSize: 16, 
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {systemInfo.about_us}
                </Paragraph>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Contact Information */}
      <Card title={<Title level={3} style={{ margin: 0 }}>{t('client.about.contactInfo')}</Title>}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {systemInfo?.phone && (
            <Space>
              <PhoneOutlined style={{ fontSize: 18, color: '#1890ff' }} />
              <Text strong>{t('client.about.phone')}:</Text>
              <Text>{systemInfo.phone}</Text>
            </Space>
          )}

          {systemInfo?.email && (
            <Space>
              <MailOutlined style={{ fontSize: 18, color: '#1890ff' }} />
              <Text strong>{t('client.about.email')}:</Text>
              <Text>{systemInfo.email}</Text>
            </Space>
          )}

          {systemInfo?.address && (
            <Space align="start">
              <EnvironmentOutlined style={{ fontSize: 18, color: '#1890ff', marginTop: 4 }} />
              <div>
                <Text strong>{t('client.about.address')}:</Text>
                <br />
                <Text>{systemInfo.address}</Text>
              </div>
            </Space>
          )}
        </Space>
      </Card>

      {/* Map */}
      {systemInfo?.google_maps_embed && (
        <Card 
          title={<Title level={3} style={{ margin: 0 }}>{t('client.contact.findUs')}</Title>} 
          style={{ marginTop: 24 }}
        >
          <MapEmbed embedCode={systemInfo.google_maps_embed} height={400} />
        </Card>
      )}
    </div>
  );
}
