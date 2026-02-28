'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Row,
  Col,
  Card,
  Typography,
  Form,
  Input,
  Button,
  Space,
  Divider,
  Spin,
  App,
} from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';
import { useGetPublicProductByIdQuery } from '@/store/services/publicProductApi';
import { useSubmitContactMutation } from '@/store/services/contactApi';
import { Controller, useForm } from 'react-hook-form';
import { BusinessHoursDisplay } from '@/components/business-hours/BusinessHoursDisplay';

const MapEmbed = dynamic(() => import('@/components/map/MapEmbed'), {
  ssr: false,
  loading: () => <div style={{ height: 300, background: '#f0f0f0' }}>Loading map...</div>,
});

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ContactPage() {
  const t = useTranslations();
  const { message: messageApi } = App.useApp();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  
  const { data: systemInfo, isLoading: systemInfoLoading } = useGetSystemInfoQuery();
  const { data: productData, isLoading: productLoading } = useGetPublicProductByIdQuery(productId || '', {
    skip: !productId,
  });
  const [submitContact, { isLoading: submitting }] = useSubmitContactMutation();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormValues>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  // Debug logs
  useEffect(() => {
    console.log('🔍 Contact Page Debug:', {
      productId,
      hasProductData: !!productData,
      productName: productData?.name,
      isLoadingProduct: productLoading,
    });
  }, [productId, productData, productLoading]);

  // Set product name in message when coming from product page
  useEffect(() => {
    if (productData) {
      const productName = productData.name;
      setValue('message', `${t('client.contact.interestedInProduct')}: ${productName}\n\n`);
      console.log('✅ Set message with product:', productName);
    }
  }, [productData, setValue, t]);

  const onSubmit = async (values: ContactFormValues) => {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        message: values.message,
        product_id: productId || undefined,
      };
      
      console.log('📤 Submitting contact form:', payload);
      
      await submitContact(payload).unwrap();
      
      messageApi.success(t('client.contact.messageSentSuccess'));
      reset();
    } catch (error) {
      console.error('❌ Contact form error:', error);
      messageApi.error(t('client.contact.messageSentFailed'));
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
                label={t('client.contact.fullName')}
                validateStatus={errors.name ? 'error' : ''}
                help={errors.name?.message}
                required
              >
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: t('client.contact.nameRequired') }}
                  render={({ field }) => <Input {...field} size="large" placeholder={t('client.contact.enterName')} />}
                />
              </Form.Item>

              {/* Email */}
              <Form.Item
                label={t('client.contact.email')}
                validateStatus={errors.email ? 'error' : ''}
                help={errors.email?.message}
                required
              >
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: t('client.contact.emailRequired'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('client.contact.invalidEmail'),
                    },
                  }}
                  render={({ field }) => <Input {...field} size="large" placeholder={t('client.contact.enterEmail')} />}
                />
              </Form.Item>

              {/* Phone */}
              <Form.Item
                label={t('client.contact.phone')}
                validateStatus={errors.phone ? 'error' : ''}
                help={errors.phone?.message}
                required
              >
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: t('client.contact.phoneRequired') }}
                  render={({ field }) => (
                    <Input {...field} size="large" placeholder={t('client.contact.enterPhone')} />
                  )}
                />
              </Form.Item>

              {/* Product Info - Only show when coming from product page */}
              {productData && (
                <Form.Item label={t('client.contact.interestedProduct')}>
                  <Input 
                    value={productData.name} 
                    disabled 
                    size="large"
                    style={{ backgroundColor: '#f5f5f5' }}
                  />
                </Form.Item>
              )}

              {/* Message */}
              <Form.Item
                label={t('client.contact.message')}
                validateStatus={errors.message ? 'error' : ''}
                help={errors.message?.message}
                required
              >
                <Controller
                  name="message"
                  control={control}
                  rules={{ required: t('client.contact.messageRequired') }}
                  render={({ field }) => (
                    <TextArea {...field} rows={6} placeholder={t('client.contact.enterMessage')} />
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
                  {t('client.contact.sendMessage')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Company Info */}
        <Col xs={24} md={10}>
          <Card title={t('client.contact.contactInformation')}>
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
                    <Text strong>{t('client.about.phone')}</Text>
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
                    <Text strong>{t('client.about.email')}</Text>
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
                    <Text strong>{t('client.about.address')}</Text>
                    <br />
                    <Text style={{ fontSize: 16 }}>{systemInfo.address}</Text>
                  </div>
                </Space>
              )}

              <Divider />

              {/* Business Hours */}
              <BusinessHoursDisplay data={systemInfo?.business_hours} />
            </Space>
          </Card>

          {/* Map Card */}
          {systemInfo?.google_maps_embed && (
            <Card style={{ marginTop: 16 }} title={t('client.contact.findUs')}>
              <MapEmbed embedCode={systemInfo.google_maps_embed} height={400} />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
