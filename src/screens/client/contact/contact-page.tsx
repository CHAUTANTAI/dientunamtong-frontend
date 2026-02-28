'use client';

import { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Form,
  Input,
  Button,
  message,
  Space,
  Divider,
  Spin,
} from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';
import { Controller, useForm } from 'react-hook-form';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  product?: string;
  message: string;
}

export default function ContactPage() {
  const t = useTranslations();
  const { data: systemInfo, isLoading: systemInfoLoading } = useGetSystemInfoQuery();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      product: '',
      message: '',
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setSubmitting(true);
    try {
      console.log('Contact form submitted:', values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Message sent successfully! We will contact you soon.');
      reset();
    } catch {
      message.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (systemInfoLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        {t('client.contact.title')}
      </Title>

      <Row gutter={[24, 24]}>
        {/* Contact Form */}
        <Col xs={24} md={14}>
          <Card title={t('client.contact.getInTouch')}>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
              {/* Name */}
              <Form.Item
                label="Full Name"
                validateStatus={errors.name ? 'error' : ''}
                help={errors.name?.message}
                required
              >
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Name is required' }}
                  render={({ field }) => <Input {...field} size="large" placeholder="Enter your name" />}
                />
              </Form.Item>

              {/* Email */}
              <Form.Item
                label="Email"
                validateStatus={errors.email ? 'error' : ''}
                help={errors.email?.message}
                required
              >
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  }}
                  render={({ field }) => <Input {...field} size="large" placeholder="Enter your email" />}
                />
              </Form.Item>

              {/* Phone */}
              <Form.Item
                label="Phone Number"
                validateStatus={errors.phone ? 'error' : ''}
                help={errors.phone?.message}
                required
              >
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: 'Phone number is required' }}
                  render={({ field }) => (
                    <Input {...field} size="large" placeholder="Enter your phone number" />
                  )}
                />
              </Form.Item>

              {/* Product (Optional) */}
              <Form.Item label={t('client.contact.interestedProduct')}>
                <Controller
                  name="product"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} size="large" placeholder="Product name (optional)" />
                  )}
                />
              </Form.Item>

              {/* Message */}
              <Form.Item
                label="Message"
                validateStatus={errors.message ? 'error' : ''}
                help={errors.message?.message}
                required
              >
                <Controller
                  name="message"
                  control={control}
                  rules={{ required: 'Message is required' }}
                  render={({ field }) => (
                    <TextArea {...field} rows={6} placeholder="Tell us about your inquiry..." />
                  )}
                />
              </Form.Item>

              {/* Submit Button */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SendOutlined />}
                  loading={submitting}
                  block
                >
                  Send Message
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Company Info */}
        <Col xs={24} md={10}>
          <Card title="Contact Information">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Company Name */}
              {systemInfo?.company_name && (
                <div>
                  <Title level={4} style={{ marginBottom: 8 }}>
                    {systemInfo.company_name}
                  </Title>
                </div>
              )}

              {/* Phone */}
              {systemInfo?.phone && (
                <Space>
                  <PhoneOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                  <div>
                    <Text strong>Phone</Text>
                    <br />
                    <a href={`tel:${systemInfo.phone}`} style={{ fontSize: 16 }}>
                      {systemInfo.phone}
                    </a>
                  </div>
                </Space>
              )}

              {/* Email */}
              {systemInfo?.email && (
                <Space>
                  <MailOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                  <div>
                    <Text strong>Email</Text>
                    <br />
                    <a href={`mailto:${systemInfo.email}`} style={{ fontSize: 16 }}>
                      {systemInfo.email}
                    </a>
                  </div>
                </Space>
              )}

              {/* Address */}
              {systemInfo?.address && (
                <Space align="start">
                  <EnvironmentOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                  <div>
                    <Text strong>Address</Text>
                    <br />
                    <Text style={{ fontSize: 16 }}>{systemInfo.address}</Text>
                  </div>
                </Space>
              )}

              <Divider />

              {/* Business Hours */}
              <Space align="start">
                <ClockCircleOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                <div>
                  <Text strong>Business Hours</Text>
                  <br />
                  <Text>Monday - Friday: 8:00 AM - 6:00 PM</Text>
                  <br />
                  <Text>Saturday: 8:00 AM - 12:00 PM</Text>
                  <br />
                  <Text>Sunday: Closed</Text>
                </div>
              </Space>
            </Space>
          </Card>

          {/* Map or Additional Info Card */}
          <Card style={{ marginTop: 16 }} title="Find Us">
            <div
              style={{
                width: '100%',
                height: 200,
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
              }}
            >
              <Text type="secondary">Map integration coming soon</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
