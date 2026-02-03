/**
 * Header Component
 * Top header for admin layout
 */

'use client';

import { Layout, Button, Dropdown, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import type { MenuProps } from 'antd';

export const Header = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      disabled: true,
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
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingRight: '24px',
        position: 'sticky',
        top: 0,
        zIndex: 999,
      }}
    >
      {/* User Menu */}
      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Button type="text" icon={<Avatar size="large" icon={<UserOutlined />} />}>
          {user?.username && <span style={{ marginLeft: '8px' }}>{user.username}</span>}
        </Button>
      </Dropdown>
    </Layout.Header>
  );
};

Header.displayName = 'Header';
