'use client';

import { Layout, Menu, Space, Typography, Avatar, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';

const { Header } = Layout;
const { Text } = Typography;

export default function ClientHeader() {
  const t = useTranslations('navigation');
  const pathname = usePathname();
  const { data: systemInfo } = useGetSystemInfoQuery();
  const logoUrl = useSignedImageUrl(systemInfo?.company_logo || '');

  const menuItems = [
    {
      key: ROUTES.HOME,
      label: <Link href={ROUTES.HOME}>{t('home')}</Link>,
    },
    {
      key: ROUTES.CATEGORIES,
      label: <Link href={ROUTES.CATEGORIES}>{t('categories')}</Link>,
    },
    {
      key: ROUTES.PRODUCTS,
      label: <Link href={ROUTES.PRODUCTS}>{t('products')}</Link>,
    },
    {
      key: ROUTES.CONTACT,
      label: <Link href={ROUTES.CONTACT}>{t('contact')}</Link>,
    },
    {
      key: ROUTES.ABOUT,
      label: <Link href={ROUTES.ABOUT}>{t('about')}</Link>,
    },
  ];

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        {/* Left: Logo + Company Name */}
        <Link href={ROUTES.HOME} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
          {logoUrl ? (
            <div style={{ position: 'relative', width: 40, height: 40 }}>
              <Image
                src={logoUrl}
                alt={systemInfo?.company_name || 'Logo'}
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          ) : (
            <Avatar size={40} icon={<UserOutlined />} />
          )}
          <Text strong style={{ fontSize: 16, color: '#1890ff', whiteSpace: 'nowrap' }}>
            {systemInfo?.company_name || 'Company'}
          </Text>
        </Link>

        {/* Center: Menu */}
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{
            flex: 1,
            border: 'none',
            backgroundColor: 'transparent',
            justifyContent: 'center',
            display: 'flex',
          }}
        />

        {/* Right: Language Switcher + User Icon */}
        <Space size="middle" style={{ flex: '0 0 auto' }}>
          <LanguageSwitcher />
          <Tooltip title="Coming soon">
            <Avatar 
              icon={<UserOutlined />} 
              style={{ cursor: 'not-allowed', opacity: 0.5 }}
            />
          </Tooltip>
        </Space>
      </div>
    </Header>
  );
}
