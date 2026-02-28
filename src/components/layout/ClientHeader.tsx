'use client';

import { Layout, Menu, Space } from 'antd';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

const { Header } = Layout;

export default function ClientHeader() {
  const t = useTranslations('navigation');
  const pathname = usePathname();

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
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Space size="large">
          <Menu
            mode="horizontal"
            selectedKeys={[pathname]}
            items={menuItems}
            style={{
              flex: 1,
              border: 'none',
              backgroundColor: 'transparent',
            }}
          />
        </Space>
        <LanguageSwitcher />
      </div>
    </Header>
  );
}
