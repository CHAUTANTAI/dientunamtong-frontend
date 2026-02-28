/**
 * Header Component
 * Top header for admin layout with mobile responsive
 */

'use client';

import { Layout, Button, Dropdown, Typography, Space, Badge, Tag } from 'antd';
import { LogoutOutlined, BellOutlined, SettingOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useGetProfileQuery } from '@/store/api/profileApi';
import { ROUTES } from '@/constants/routes';
import { getRoleDisplayName, getRoleColor } from '@/utils/rbac';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import type { MenuProps } from 'antd';

const { Text } = Typography;

interface HeaderProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
}

export const Header = ({ onMenuClick, isMobile = false }: HeaderProps) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Fetch profile data from API (will use cached data if available)
  const { data: profile } = useGetProfileQuery();

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'username',
      label: (
        <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
          <Space direction="vertical" size={4}>
            <Text strong>{user?.username}</Text>
            {user && (
              <Tag color={getRoleColor(user.role)} style={{ margin: 0 }}>
                {getRoleDisplayName(user.role)}
              </Tag>
            )}
          </Space>
        </div>
      ),
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => router.push(ROUTES.PROFILE),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Layout.Header
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '0 12px' : '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 999,
        height: '64px',
      }}
    >
      {/* Left Section */}
      <Space size={isMobile ? 'small' : 'large'}>
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: '20px', color: '#fff' }} />}
            onClick={onMenuClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        )}

        {/* Company Name - Hidden on small mobile */}
        <Text
          style={{
            color: '#fff',
            fontSize: isMobile ? '14px' : '18px',
            fontWeight: 600,
            letterSpacing: '0.3px',
            display: isMobile ? 'none' : 'block',
          }}
          className="company-name-header"
        >
          {profile?.company_name || 'Nam Tông'}
        </Text>
      </Space>

      {/* Right Section */}
      <Space size={isMobile ? 'small' : 'middle'} style={{ marginLeft: 'auto' }}>
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notifications - Hidden on small mobile */}
        {!isMobile && (
          <Badge count={0} showZero={false}>
            <Button
              type="text"
              icon={<BellOutlined style={{ fontSize: '18px' }} />}
              style={{
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </Badge>
        )}

        {/* Settings - Hidden on small mobile */}
        {!isMobile && (
          <Button
            type="text"
            icon={<SettingOutlined style={{ fontSize: '18px' }} />}
            style={{
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        )}

        {/* User Menu */}
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Button
            type="text"
            icon={isMobile ? <UserOutlined style={{ fontSize: '18px', color: '#fff' }} /> : undefined}
            style={{
              height: 'auto',
              padding: isMobile ? '8px' : '8px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: isMobile ? '50%' : '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!isMobile && (
              <Text
                style={{
                  color: '#fff',
                  fontWeight: 500,
                }}
              >
                Admin
              </Text>
            )}
          </Button>
        </Dropdown>
      </Space>

      <style jsx global>{`
        @media (min-width: 480px) {
          .company-name-header {
            display: block !important;
          }
        }
      `}</style>
    </Layout.Header>
  );
};

Header.displayName = 'Header';
