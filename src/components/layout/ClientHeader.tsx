'use client';

import { Layout, Menu, Space, Typography, Avatar, Tooltip, Drawer, Button } from 'antd';
import { UserOutlined, MenuOutlined } from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';

const { Header } = Layout;
const { Text } = Typography;

export default function ClientHeader() {
  const t = useTranslations('navigation');
  const tClient = useTranslations('client');
  const pathname = usePathname();
  const { data: systemInfo } = useGetSystemInfoQuery();
  const logoUrl = useSignedImageUrl(systemInfo?.company_logo || '');
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        height: 'auto',
        minHeight: 64,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Left: Logo + Company Name */}
        <Link href={ROUTES.HOME} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto', minWidth: 0 }}>
          {logoUrl ? (
            <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
              <Image
                src={logoUrl}
                alt={systemInfo?.company_name || 'Logo'}
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          ) : (
            <Avatar size={36} icon={<UserOutlined />} style={{ flexShrink: 0 }} />
          )}
          <Text 
            strong 
            style={{ 
              fontSize: 14, 
              color: '#1890ff', 
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            className="company-name-desktop"
          >
            {systemInfo?.company_name || 'Company'}
          </Text>
        </Link>

        {/* Desktop Menu - Hidden on mobile */}
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{
            flex: 1,
            border: 'none',
            backgroundColor: 'transparent',
            justifyContent: 'center',
            display: 'none',
          }}
          className="desktop-menu"
        />

        {/* Right: Actions */}
        <Space size="middle" style={{ flex: '0 0 auto' }}>
          <LanguageSwitcher />
          <Tooltip title={tClient('header.comingSoon')}>
            <Avatar 
              size={36}
              icon={<UserOutlined />} 
              style={{ cursor: 'not-allowed', opacity: 0.5 }}
            />
          </Tooltip>
          
          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
            className="mobile-menu-button"
            style={{ display: 'none' }}
          />
        </Space>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={systemInfo?.company_name || 'Menu'}
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={280}
      >
        <Menu
          mode="vertical"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={() => setDrawerOpen(false)}
          style={{ border: 'none' }}
        />
      </Drawer>

      <style jsx global>{`
        @media (min-width: 768px) {
          .desktop-menu {
            display: flex !important;
          }
          .mobile-menu-button {
            display: none !important;
          }
        }
        
        @media (max-width: 767px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-button {
            display: inline-flex !important;
          }
          .company-name-desktop {
            max-width: 120px;
          }
        }
        
        @media (max-width: 480px) {
          .company-name-desktop {
            max-width: 80px;
          }
        }
      `}</style>
    </Header>
  );
}
