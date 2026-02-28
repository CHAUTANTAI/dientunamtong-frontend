'use client';

import {
  Row,
  Col,
  Card,
  Typography,
  Space,
  Timeline,
  Spin,
  Statistic,
} from 'antd';
import {
  TrophyOutlined,
  TeamOutlined,
  SafetyOutlined,
  RocketOutlined,
  HeartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';

const { Title, Paragraph } = Typography;

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
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Title level={3} style={{ margin: 0 }}>
                {systemInfo?.company_name || 'Our Company'}
              </Title>

              <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                Welcome to <strong>{systemInfo?.company_name}</strong> - your trusted partner in motorcycle
                electronics and accessories. We specialize in providing high-quality electronic components
                and accessories for motorcycles, ensuring safety, performance, and style for every rider.
              </Paragraph>

              <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                With years of experience in the industry, we have built a reputation for excellence,
                reliability, and customer satisfaction. Our team is dedicated to bringing you the latest
                technology and the best products at competitive prices.
              </Paragraph>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Years in Business" value={10} prefix={<TrophyOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Happy Customers" value={5000} prefix={<HeartOutlined />} suffix="+" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Products" value={500} prefix={<RocketOutlined />} suffix="+" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Warranty" value={100} prefix={<SafetyOutlined />} suffix="%" />
          </Card>
        </Col>
      </Row>

      {/* Our Mission & Vision */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card title={<Title level={4}>Our Mission</Title>} style={{ height: '100%' }}>
            <Space direction="vertical" size="middle">
              <Paragraph style={{ fontSize: 15 }}>
                To provide motorcycle enthusiasts with top-quality electronic products that enhance their
                riding experience, ensuring safety, performance, and satisfaction.
              </Paragraph>
              <Paragraph style={{ fontSize: 15 }}>
                We are committed to continuous innovation, exceptional customer service, and building
                long-term relationships with our customers and partners.
              </Paragraph>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title={<Title level={4}>Our Vision</Title>} style={{ height: '100%' }}>
            <Space direction="vertical" size="middle">
              <Paragraph style={{ fontSize: 15 }}>
                To become the leading provider of motorcycle electronics in Vietnam, recognized for our
                quality, innovation, and customer-first approach.
              </Paragraph>
              <Paragraph style={{ fontSize: 15 }}>
                We envision a future where every motorcycle rider has access to the best technology and
                products that make their journeys safer and more enjoyable.
              </Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Core Values */}
      <Card title={<Title level={3}>Our Core Values</Title>} style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" align="center" style={{ width: '100%', textAlign: 'center' }}>
              <SafetyOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              <Title level={4}>Quality First</Title>
              <Paragraph>
                We never compromise on quality. Every product we offer is carefully selected and tested to
                meet the highest standards.
              </Paragraph>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" align="center" style={{ width: '100%', textAlign: 'center' }}>
              <TeamOutlined style={{ fontSize: 48, color: '#52c41a' }} />
              <Title level={4}>Customer Focus</Title>
              <Paragraph>
                Our customers are at the heart of everything we do. We listen, understand, and deliver
                solutions that exceed expectations.
              </Paragraph>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" align="center" style={{ width: '100%', textAlign: 'center' }}>
              <ThunderboltOutlined style={{ fontSize: 48, color: '#faad14' }} />
              <Title level={4}>Innovation</Title>
              <Paragraph>
                We stay ahead of the curve by embracing new technologies and continuously improving our
                product offerings.
              </Paragraph>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Company Timeline */}
      <Card title={<Title level={3}>Our Journey</Title>}>
        <Timeline
          mode="alternate"
          items={[
            {
              children: (
                <>
                  <Title level={5}>Company Founded</Title>
                  <Paragraph>
                    Started our journey with a small shop, serving local motorcycle enthusiasts.
                  </Paragraph>
                </>
              ),
            },
            {
              children: (
                <>
                  <Title level={5}>Expansion</Title>
                  <Paragraph>
                    Expanded our product range and opened multiple service centers across the region.
                  </Paragraph>
                </>
              ),
            },
            {
              children: (
                <>
                  <Title level={5}>Online Platform Launch</Title>
                  <Paragraph>
                    Launched our e-commerce platform to serve customers nationwide, making quality products
                    accessible to everyone.
                  </Paragraph>
                </>
              ),
            },
            {
              children: (
                <>
                  <Title level={5}>Industry Recognition</Title>
                  <Paragraph>
                    Received awards for excellence in customer service and product quality, becoming a
                    trusted name in the industry.
                  </Paragraph>
                </>
              ),
            },
            {
              children: (
                <>
                  <Title level={5}>Looking Forward</Title>
                  <Paragraph>
                    Continuing to innovate and expand, bringing the latest technology to motorcycle riders
                    everywhere.
                  </Paragraph>
                </>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
