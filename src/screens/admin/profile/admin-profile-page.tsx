import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Spin, Image, Upload, App, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useTranslations } from 'next-intl';
import { Profile } from '@/types/profile';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/store/api/profileApi';
import { getErrorMessage } from '@/utils/api-interceptor';
import { uploadToPublicBucket, deleteFromPublicBucket } from '@/utils/objectStorage';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import { BusinessHoursEditor } from '@/components/business-hours/BusinessHoursEditor';

const AdminProfilePage = () => {
  const t = useTranslations();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const { data, isLoading, isError } = useGetProfileQuery();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const signedLogoUrl = useSignedImageUrl(data?.logo || '');

  // Populate form when data is loaded
  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        company_name: data.company_name,
        phone: data.phone || '',
        address: data.address || '',
        about_us: data.about_us || '',
        email: data.email || '',
        logo: data.logo || '',
        username: data.username,
        google_maps_embed: data.google_maps_embed || '',
        business_hours: data.business_hours || '',
        facebook_url: data.facebook_url || '',
        tiktok_url: data.tiktok_url || '',
      });
    }
  }, [data, form]);

  const onFinish = async (values: Partial<Profile>) => {
    try {
      // Only send fields that are in the form (exclude username, is_active)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { username, is_active, ...updateData } = values;

      // Step 1: Upload new logo if file is selected
      let logoUrl = updateData.logo;
      if (fileList.length > 0 && fileList[0].originFileObj) {
        setIsUploading(true);
        const file = fileList[0].originFileObj;

        try {
          // Upload to Supabase storage (public bucket for better performance)
          const fileExt = file.name.split('.').pop();
          const fileName = `profile_logo_${Date.now()}.${fileExt}`;
          const { path } = await uploadToPublicBucket(file, 'profile', {
            fileName,
          });

          // Delete old logo if exists
          if (data?.logo && data.logo.startsWith('/profile/')) {
            try {
              await deleteFromPublicBucket(data.logo);
            } catch (error) {
              console.warn('Failed to delete old logo:', error);
              // Continue even if delete fails
            }
          }

          // Update logo URL with relative path
          logoUrl = `/${path}`;
        } catch (error) {
          console.error('Upload error:', error);
          message.error(t('profile.messages.uploadError'));
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // Step 2: Update profile
      const finalData = {
        ...updateData,
        logo: logoUrl,
      };
      
      await updateProfile(finalData).unwrap();
      message.success(t('profile.messages.updateSuccess'));
      setFileList([]);
    } catch (err) {
      message.error(getErrorMessage(err));
      setIsUploading(false);
    }
  };

  const handleFileChange = (info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList.slice(-1)); // Only keep the last file
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error(t('profile.messages.onlyImageAllowed'));
      return false;
    }
    const isLt25M = file.size / 1024 / 1024 < 25;
    if (!isLt25M) {
      message.error(t('profile.messages.fileTooLarge'));
      return false;
    }
    return false; // Prevent auto upload
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>{t('profile.messages.errorLoadingProfile')}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card title={t('profile.title')} variant="borderless">
        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="company_name"
            label={t('profile.labels.companyName')}
            rules={[{ required: true, message: t('profile.validation.companyNameRequired') }]}
          >
            <Input placeholder={t('profile.placeholders.companyName')} size="large" />
          </Form.Item>

          <Form.Item
            name="phone"
            label={t('profile.labels.phone')}
            rules={[{ pattern: /^[0-9-+() ]*$/, message: t('profile.validation.phoneInvalid') }]}
          >
            <Input placeholder={t('profile.placeholders.phone')} size="large" />
          </Form.Item>

          <Form.Item name="address" label={t('profile.labels.address')}>
            <Input.TextArea placeholder={t('profile.placeholders.address')} rows={3} size="large" />
          </Form.Item>

          <Form.Item 
            name="about_us" 
            label={t('profile.labels.aboutUs')}
            tooltip={t('profile.messages.aboutUsTooltip')}
          >
            <Input.TextArea 
              placeholder={t('profile.placeholders.aboutUs')} 
              rows={6} 
              size="large"
              showCount
              maxLength={2000}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={t('profile.labels.email')}
            rules={[{ type: 'email', message: t('profile.validation.emailInvalid') }]}
          >
            <Input placeholder={t('profile.placeholders.email')} size="large" />
          </Form.Item>

          <Form.Item label={t('profile.labels.logo')}>
            <Upload
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={beforeUpload}
              maxCount={1}
              accept="image/*"
              listType="picture"
            >
              <Button icon={<UploadOutlined />} size="large">
                {t('profile.actions.selectLogo')}
              </Button>
            </Upload>
            <div style={{ marginTop: 8, color: '#999', fontSize: '12px' }}>
              {t('profile.messages.logoHelp')}
            </div>
          </Form.Item>

          {signedLogoUrl && !fileList.length && (
            <Form.Item label={t('profile.labels.currentLogo')}>
              <Image
                src={signedLogoUrl}
                alt="Company Logo"
                width={200}
                style={{
                  objectFit: 'contain',
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  padding: '8px',
                }}
                fallback="data:image/png;base64,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"
              />
            </Form.Item>
          )}

          <Form.Item name="username" label={t('profile.labels.username')} tooltip={t('profile.messages.usernameTooltip')}>
            <Input disabled size="large" />
          </Form.Item>

          <Divider />

          <Form.Item 
            name="google_maps_embed"
            label={t('profile.labels.googleMapsEmbed')}
            tooltip={t('profile.messages.googleMapsEmbedTooltip')}
          >
            <Input.TextArea 
              placeholder={t('profile.placeholders.googleMapsEmbed')} 
              rows={4} 
              size="large"
            />
          </Form.Item>

          <Form.Item 
            name="business_hours"
            label={t('profile.labels.businessHours')}
            tooltip={t('profile.messages.businessHoursTooltip')}
          >
            <BusinessHoursEditor />
          </Form.Item>

          <Divider orientation="left">{t('profile.labels.socialMedia')}</Divider>

          <Form.Item 
            name="facebook_url"
            label={t('profile.labels.facebookUrl')}
            tooltip={t('profile.messages.facebookUrlTooltip')}
            rules={[
              { 
                type: 'url', 
                message: t('profile.validation.urlInvalid') 
              },
              {
                pattern: /^https?:\/\/.+/,
                message: t('profile.validation.urlInvalid')
              }
            ]}
          >
            <Input 
              placeholder={t('profile.placeholders.facebookUrl')} 
              size="large"
            />
          </Form.Item>

          <Form.Item 
            name="tiktok_url"
            label={t('profile.labels.tiktokUrl')}
            tooltip={t('profile.messages.tiktokUrlTooltip')}
            rules={[
              { 
                type: 'url', 
                message: t('profile.validation.urlInvalid') 
              },
              {
                pattern: /^https?:\/\/.+/,
                message: t('profile.validation.urlInvalid')
              }
            ]}
          >
            <Input 
              placeholder={t('profile.placeholders.tiktokUrl')} 
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isUpdating || isUploading}
            >
              {t('profile.actions.saveChanges')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminProfilePage;
